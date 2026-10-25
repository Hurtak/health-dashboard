import type { Movement } from "./workouts";

export type Point = readonly [number, number];
export type Limb = readonly [Point, Point, Point];
export type Phase = 0 | 1 | 2;
export const anatomy = {
  upperArm: 29,
  forearm: 24,
  thigh: 36,
  shin: 32,
  upperBack: 28,
  lowerBack: 16,
  neckToHead: 15,
  headRadius: 9,
  foot: 10,
};
export const ground = 190;

interface Torso {
  spine: readonly [Point, Point, Point]; // shoulder centre, waist, pelvis
  shoulders: readonly [Point, Point];
  hips: readonly [Point, Point];
  head: Point;
  headAngle: number;
  front: boolean;
}
export interface Pose extends Torso {
  arms: readonly [Limb, Limb]; // far, near
  legs: readonly [Limb, Limb];
  toes: readonly [Point, Point];
  bell?: { grip: Point; rotation: number };
  support?: "bench" | "mat";
}

const radians = (degrees: number) => (degrees * Math.PI) / 180;
export const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const offset = (p: Point, x: number, y: number): Point => [p[0] + x, p[1] + y];
function along(p: Point, length: number, angle: number): Point {
  return offset(p, Math.cos(radians(angle)) * length, Math.sin(radians(angle)) * length);
}
function chain(start: Point, a: number, angleA: number, b: number, angleB: number): Limb {
  const joint = along(start, a, angleA);
  return [start, joint, along(joint, b, angleB)];
}
const arm = (start: Point, upper: number, lower: number) =>
  chain(start, anatomy.upperArm, upper, anatomy.forearm, lower);
const leg = (start: Point, angle: number) => chain(start, anatomy.thigh, angle, anatomy.shin, angle);

// Two fixed-length segments meeting an anchored hand or foot.
// Pose tests verify that every target remains within the limb's reach.
function bend(start: Point, end: Point, a: number, b: number, sign: number): Limb {
  const d = distance(start, end);
  const x = (a * a - b * b + d * d) / (2 * d);
  const y = Math.sqrt(Math.max(0, a * a - x * x)) * sign;
  const ux = (end[0] - start[0]) / d;
  const uy = (end[1] - start[1]) / d;
  return [start, offset(start, ux * x - uy * y, uy * x + ux * y), end];
}
const bendArm = (start: Point, end: Point, sign = -1) => bend(start, end, anatomy.upperArm, anatomy.forearm, sign);
const bendLeg = (start: Point, end: Point, sign = 1) => bend(start, end, anatomy.thigh, anatomy.shin, sign);

function torso(hip: Point, heading = -90, front = false): Torso {
  const waist = along(hip, anatomy.lowerBack, heading);
  const shoulder = along(waist, anatomy.upperBack, heading);
  const width = heading + 90;
  return {
    spine: [shoulder, waist, hip],
    shoulders: [along(shoulder, front ? -13 : -1, width), along(shoulder, front ? 13 : 1, width)],
    hips: [along(hip, front ? -8 : -1, width), along(hip, front ? 8 : 1, width)],
    head: along(shoulder, anatomy.neckToHead, heading),
    headAngle: heading + 90,
    front,
  };
}
const flatToe = (ankle: Point, direction = -1): Point => offset(ankle, Math.sqrt(anatomy.foot ** 2 - 1) * direction, 1);
function finish(
  body: Torso,
  arms: Pose["arms"],
  legs: Pose["legs"],
  options: Partial<Pick<Pose, "bell" | "support" | "toes">> = {},
): Pose {
  return {
    ...body,
    arms,
    legs,
    toes: [flatToe(legs[0][2], -1), flatToe(legs[1][2], body.front ? 1 : -1)],
    ...options,
  };
}
function standing(front = true) {
  const body = torso([130, 118.5], -90, front);
  const feet: readonly [Point, Point] = front
    ? [
        [116, 186],
        [144, 186],
      ]
    : [
        [128, 186],
        [136, 186],
      ];
  const legs: Pose["legs"] = [bendLeg(body.hips[0], feet[0]), bendLeg(body.hips[1], feet[1])];
  return { body, legs };
}

export function poseFor(movement: Exclude<Movement, "rest">, phase: Phase): Pose {
  switch (movement) {
    case "squat": {
      const hips: Point[] = [
        [140, 118.5],
        [149, 137],
        [160, 153],
      ];
      const body = torso(hips[phase], [-90, -105, -120][phase]);
      return finish(
        body,
        [arm(body.shoulders[0], -165, -175), arm(body.shoulders[1], -165, -175)],
        [bendLeg(body.hips[0], [132, 186]), bendLeg(body.hips[1], [140, 186])],
      );
    }
    case "hinge":
    case "deadlift": {
      const hips: Point[] = [
        [140, 118.5],
        [149, 120.5],
        [157, 124],
      ];
      const body = torso(hips[phase], [-90, -112.5, -135][phase]);
      const arms: Pose["arms"] = [arm(body.shoulders[0], 90, 90), arm(body.shoulders[1], 90, 90)];
      const grip: Point = [(arms[0][2][0] + arms[1][2][0]) / 2, (arms[0][2][1] + arms[1][2][1]) / 2];
      return finish(
        body,
        arms,
        [bendLeg(body.hips[0], [132, 186]), bendLeg(body.hips[1], [140, 186])],
        movement === "deadlift" ? { bell: { grip, rotation: 0 } } : {},
      );
    }
    case "pushup": {
      const heading = [203, 198.5, 194][phase];
      const toe: Point = [201, 187];
      const ankle = along(toe, anatomy.foot, -60);
      const hip = along(ankle, anatomy.thigh + anatomy.shin, heading);
      const body: Torso = { ...torso(hip, heading), hips: [hip, hip] };
      // Both legs remain straight and parallel to the neutral trunk.
      const legs: Pose["legs"] = [leg(body.hips[0], heading - 180), leg(body.hips[1], heading - 180)];
      return finish(body, [bendArm(body.shoulders[0], [115, 186]), bendArm(body.shoulders[1], [106, 186])], legs, {
        support: "mat",
        toes: [toe, toe],
      });
    }
    case "lunge": {
      const hips: Point[] = [
        [130, 118.5],
        [145, 132],
        [160, 152],
      ];
      const body = torso(hips[phase], -95);
      const rearToe: Point = [phase === 1 ? 170 : 195, 187];
      const rearAnkle: Point = phase === 0 ? [136, 186] : along(rearToe, anatomy.foot, -60);
      const grip = offset(body.spine[0], -14, 10);
      return finish(
        body,
        [bendArm(body.shoulders[0], offset(grip, -4, 0)), bendArm(body.shoulders[1], offset(grip, 4, 0))],
        [bendLeg(body.hips[0], rearAnkle), bendLeg(body.hips[1], [130, 186])],
        {
          bell: { grip, rotation: 0 },
          toes: [phase === 0 ? flatToe(rearAnkle) : rearToe, flatToe([130, 186])],
        },
      );
    }
    case "press": {
      const { body, legs } = standing();
      const arms: Pose["arms"] = [arm(body.shoulders[0], 96, 86), arm(body.shoulders[1], [80, -30, -90][phase], -90)];
      // A normal rack/press: the bell rests behind the wrist, not bottoms-up.
      return finish(body, arms, legs, {
        bell: { grip: arms[1][2], rotation: -45 },
      });
    }
    case "curl": {
      const { body, legs } = standing();
      const arms: Pose["arms"] = [arm(body.shoulders[0], 96, 86), arm(body.shoulders[1], 83, [90, 5, -65][phase])];
      return finish(body, arms, legs, {
        bell: { grip: arms[1][2], rotation: 0 },
      });
    }
    case "row": {
      const body = torso([158, 122], -155);
      const upper = [90, 45, -5][phase];
      const arms: Pose["arms"] = [
        bendArm(body.shoulders[0], [82, 141], 1),
        arm(body.shoulders[1], upper, [90, 100, 115][phase]),
      ];
      return finish(body, arms, [bendLeg(body.hips[0], [143, 186]), bendLeg(body.hips[1], [174, 186])], {
        bell: { grip: arms[1][2], rotation: 0 },
        support: "bench",
      });
    }
    case "crunch": {
      const shoulder: Point = [63, 181];
      const waist = along(shoulder, anatomy.upperBack, 0);
      const hip = along(waist, anatomy.lowerBack, [0, -28, -55][phase]);
      const body: Torso = {
        spine: [shoulder, waist, hip],
        shoulders: [
          [63, 185],
          [63, 186],
        ],
        hips: [offset(hip, 0, -1), offset(hip, 0, 1)],
        head: [48, 181],
        headAngle: 90,
        front: false,
      };
      const thigh = [-90, -110, -125][phase];
      const legs: Pose["legs"] = [
        chain(body.hips[0], anatomy.thigh, thigh, anatomy.shin, thigh + 90),
        chain(body.hips[1], anatomy.thigh, thigh, anatomy.shin, thigh + 90),
      ];
      return finish(body, [arm(body.shoulders[0], 0, 0), arm(body.shoulders[1], 0, 0)], legs, {
        support: "mat",
        toes: [along(legs[0][2], anatomy.foot, thigh), along(legs[1][2], anatomy.foot, thigh)],
      });
    }
    case "plank": {
      // Solve the body's incline so the upper arm reaches the mat vertically.
      const legLength = anatomy.thigh + anatomy.shin;
      const bodyLength = legLength + anatomy.upperBack + anatomy.lowerBack;
      const angle =
        ((Math.atan2(5, bodyLength) + Math.asin(anatomy.upperArm / Math.hypot(bodyLength, 5))) * 180) / Math.PI;
      const hip: Point = [145, 186 - legLength * Math.sin(radians(angle)) - 8 * Math.cos(radians(angle))];
      // Front view shows stacked shoulders and hips rather than a high plank.
      const body = torso(hip, angle + 180, true);
      const topLegAngle = (Math.asin((180 - body.hips[1][1]) / legLength) * 180) / Math.PI;
      const legs: Pose["legs"] = [leg(body.hips[0], angle), leg(body.hips[1], topLegAngle)];
      const supportShoulder = body.shoulders[0];
      const elbow = offset(supportShoulder, 0, anatomy.upperArm);
      const supporting: Limb = [supportShoulder, elbow, offset(elbow, -anatomy.forearm, 0)];
      const free = bendArm(body.shoulders[1], body.hips[1], -1);
      return finish(body, [supporting, free], legs, {
        support: "mat",
        toes: [flatToe(legs[0][2]), flatToe(legs[1][2])],
      });
    }
    case "circles": {
      const { body, legs } = standing(false);
      const angle = [-30, -150, 90][phase];
      return finish(body, [arm(body.shoulders[0], angle, angle), arm(body.shoulders[1], angle, angle)], legs);
    }
  }
}

export const movementDescriptions: Record<Movement, string> = {
  squat: "Sit back and down with both feet planted. Keep a neutral spine as the knees and hips bend together.",
  hinge: "Push the hips back with soft knees and a neutral spine, then stand tall.",
  circles:
    "Keep the elbows straight and circle the arms from the shoulders. The curved arrow indicates the circular path.",
  pushup: "Keep the head, trunk, and legs in one line. Bend the elbows while the hands and toes stay planted.",
  lunge:
    "Keep the working foot forward and planted. Step the other foot back, lower the rear knee, then return to standing.",
  press: "Press one kettlebell from the rack to a straight arm overhead. Keep the wrist stacked and the torso still.",
  crunch:
    "Keep the head and shoulders on the mat and the knees bent. Curl the pelvis toward the ribs, then lower with control.",
  row: "Brace the free hand on a sturdy support. Keep the trunk still while pulling the kettlebell toward the hip.",
  deadlift:
    "Hinge from the hips with soft knees. Keep the kettlebell close to the legs and stand tall without leaning back.",
  curl: "Keep the upper arm by the ribs and the torso still. Bend only the elbow to raise and lower the kettlebell.",
  plank:
    "Hold still on the forearm with the supporting elbow below the shoulder. Keep the hips lifted and the body aligned.",
  rest: "Rest and let your breathing settle.",
};
