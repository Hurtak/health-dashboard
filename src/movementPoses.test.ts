import { expect, test } from "vitest";
import { anatomy, distance, ground, poseFor } from "./movementPoses";
import type { Limb, Phase, Point } from "./movementPoses";
import type { Movement } from "./workouts";

const movements: Exclude<Movement, "rest">[] = [
  "squat",
  "hinge",
  "circles",
  "pushup",
  "lunge",
  "press",
  "crunch",
  "row",
  "deadlift",
  "curl",
  "plank",
];
const phases: Phase[] = [0, 1, 2];
function angle([a, b, c]: Limb) {
  const dot = (a[0] - b[0]) * (c[0] - b[0]) + (a[1] - b[1]) * (c[1] - b[1]);
  return (
    (Math.acos(
      Math.max(-1, Math.min(1, dot / (distance(a, b) * distance(b, c)))),
    ) *
      180) /
    Math.PI
  );
}
function parallel(a: Point, b: Point, c: Point, d: Point) {
  return (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]);
}

test.each(movements)(
  "%s keeps the same adult proportions in every pose",
  (movement) => {
    for (const phase of phases) {
      const pose = poseFor(movement, phase);
      for (const limb of pose.arms) {
        expect(distance(limb[0], limb[1])).toBeCloseTo(anatomy.upperArm, 8);
        expect(distance(limb[1], limb[2])).toBeCloseTo(anatomy.forearm, 8);
      }
      for (const [index, limb] of pose.legs.entries()) {
        expect(distance(limb[0], limb[1])).toBeCloseTo(anatomy.thigh, 8);
        expect(distance(limb[1], limb[2])).toBeCloseTo(anatomy.shin, 8);
        expect(distance(limb[2], pose.toes[index])).toBeCloseTo(
          anatomy.foot,
          8,
        );
      }
      expect(distance(pose.spine[0], pose.spine[1])).toBeCloseTo(
        anatomy.upperBack,
        8,
      );
      expect(distance(pose.spine[1], pose.spine[2])).toBeCloseTo(
        anatomy.lowerBack,
        8,
      );
      expect(distance(pose.spine[0], pose.head)).toBeCloseTo(
        anatomy.neckToHead,
        8,
      );
      for (const point of [
        pose.head,
        ...pose.spine,
        ...pose.arms.flat(),
        ...pose.legs.flat(),
        ...pose.toes,
      ]) {
        expect(Number.isFinite(point[0]) && Number.isFinite(point[1])).toBe(
          true,
        );
        expect(point[0]).toBeGreaterThan(20);
        expect(point[0]).toBeLessThan(240);
        expect(point[1]).toBeGreaterThan(12);
        expect(point[1]).toBeLessThanOrEqual(ground);
      }
      if (pose.bell) expect(pose.bell.grip[1] + 23).toBeLessThan(ground);
    }
  },
);

test("push-ups keep a straight body, planted hands and toes, and bend at the elbows", () => {
  const start = poseFor("pushup", 0);
  const bottom = poseFor("pushup", 2);
  for (const phase of phases) {
    const pose = poseFor("pushup", phase);
    expect(pose.toes).toEqual(start.toes);
    expect(pose.arms.map((limb) => limb[2])).toEqual(
      start.arms.map((limb) => limb[2]),
    );
    expect(
      parallel(pose.spine[0], pose.spine[2], pose.legs[1][0], pose.legs[1][2]),
    ).toBeCloseTo(0, 8);
    expect(angle(pose.legs[1])).toBeCloseTo(180, 5);
  }
  expect(angle(start.arms[1])).toBeGreaterThan(155);
  expect(angle(bottom.arms[1])).toBeGreaterThan(75);
  expect(angle(bottom.arms[1])).toBeLessThan(100);
});

test("reverse lunges return to standing while the working foot stays planted", () => {
  const start = poseFor("lunge", 0);
  const bottom = poseFor("lunge", 2);
  for (const phase of phases)
    expect(poseFor("lunge", phase).toes[1]).toEqual(start.toes[1]);
  expect(bottom.toes[0][0] - start.toes[0][0]).toBeGreaterThan(50);
  expect(bottom.legs[0][1][1]).toBeGreaterThan(180); // rear knee just above the floor
  expect(bottom.legs[0][1][1]).toBeLessThan(ground - 3);
  expect(bottom.legs[0][2][1]).toBeLessThan(start.legs[0][2][1]); // rear heel rises
  expect(angle(bottom.legs[1])).toBeGreaterThan(75);
  expect(angle(bottom.legs[1])).toBeLessThan(105);
  for (const hand of bottom.arms.map((limb) => limb[2]))
    expect(distance(hand, bottom.bell!.grip)).toBeLessThanOrEqual(5);
});

test.each(["hinge", "deadlift"] as const)(
  "%s moves the hips back with a neutral spine and soft knees",
  (movement) => {
    const start = poseFor(movement, 0);
    const bottom = poseFor(movement, 2);
    expect(bottom.spine[2][0]).toBeGreaterThan(start.spine[2][0] + 12);
    for (const phase of phases) {
      const pose = poseFor(movement, phase);
      expect(pose.toes).toEqual(start.toes);
      expect(
        parallel(pose.spine[0], pose.spine[1], pose.spine[1], pose.spine[2]),
      ).toBeCloseTo(0, 8);
      for (const limb of pose.legs) expect(angle(limb)).toBeGreaterThan(140);
    }
    if (bottom.bell) {
      expect(bottom.bell.grip[0]).toBeCloseTo(bottom.spine[0][0], 8);
      expect(Math.abs(bottom.bell.grip[0] - bottom.legs[1][1][0])).toBeLessThan(
        18,
      );
    }
  },
);

test("the curl keeps its elbow and torso fixed instead of swinging the weight", () => {
  const start = poseFor("curl", 0);
  for (const phase of phases) {
    const pose = poseFor("curl", phase);
    expect(pose.spine).toEqual(start.spine);
    expect(pose.legs).toEqual(start.legs);
    expect(pose.arms[1].slice(0, 2)).toEqual(start.arms[1].slice(0, 2));
    expect(pose.bell!.grip).toEqual(pose.arms[1][2]);
  }
  expect(angle(poseFor("curl", 2).arms[1])).toBeLessThan(45);
});

test("the press finishes stacked overhead without leaning back or lifting the feet", () => {
  const start = poseFor("press", 0);
  const lockout = poseFor("press", 2);
  for (const phase of phases) {
    const pose = poseFor("press", phase);
    expect(pose.spine).toEqual(start.spine);
    expect(pose.toes).toEqual(start.toes);
    expect(pose.arms[1][1][0]).toBeCloseTo(pose.arms[1][2][0], 8);
    expect(pose.bell!.grip).toEqual(pose.arms[1][2]);
    expect(pose.bell!.rotation).toBeLessThan(0); // normal rack, not a bottoms-up press
  }
  expect(angle(lockout.arms[1])).toBeCloseTo(180, 5);
  expect(lockout.arms[1][2][0]).toBeCloseTo(lockout.shoulders[1][0], 8);
});

test("the row braces the free hand on a support and moves only the loaded arm", () => {
  const start = poseFor("row", 0);
  const finish = poseFor("row", 2);
  for (const phase of phases) {
    const pose = poseFor("row", phase);
    expect(pose.support).toBe("bench");
    expect(pose.spine).toEqual(start.spine);
    expect(pose.arms[0]).toEqual(start.arms[0]);
    expect(pose.toes).toEqual(start.toes);
    expect(pose.bell!.grip).toEqual(pose.arms[1][2]);
  }
  expect(finish.arms[1][1][0]).toBeGreaterThan(start.arms[1][1][0] + 20);
  expect(finish.bell!.grip[1]).toBeLessThan(start.bell!.grip[1] - 20);
});

test("reverse crunches lift the pelvis while the head, shoulders, and knee bend stay fixed", () => {
  const start = poseFor("crunch", 0);
  const finish = poseFor("crunch", 2);
  for (const phase of phases) {
    const pose = poseFor("crunch", phase);
    expect(pose.head).toEqual(start.head);
    expect(pose.spine[0]).toEqual(start.spine[0]);
    expect(pose.arms).toEqual(start.arms);
    for (const limb of pose.legs) expect(angle(limb)).toBeCloseTo(90, 6);
  }
  expect(finish.spine[2][1]).toBeLessThan(start.spine[2][1] - 10);
  expect(distance(finish.spine[0], finish.spine[2])).toBeLessThan(
    distance(start.spine[0], start.spine[2]),
  );
});

test("side plank is an isometric forearm hold with the elbow directly under the shoulder", () => {
  const pose = poseFor("plank", 0);
  expect(poseFor("plank", 1)).toEqual(pose);
  expect(poseFor("plank", 2)).toEqual(pose);
  const [shoulder, elbow, wrist] = pose.arms[0];
  expect(shoulder[0]).toBeCloseTo(elbow[0], 8);
  expect(elbow[1]).toBeCloseTo(wrist[1], 8);
  expect(elbow[1]).toBeCloseTo(186, 8);
  expect(angle(pose.arms[0])).toBeCloseTo(90, 8);
  for (const limb of pose.legs) expect(angle(limb)).toBeCloseTo(180, 5);
  expect(pose.legs[0][2][1] - pose.legs[1][2][1]).toBeCloseTo(6, 8);
});

test("squats keep the feet grounded and reach approximately parallel thighs", () => {
  const start = poseFor("squat", 0);
  const bottom = poseFor("squat", 2);
  for (const phase of phases)
    expect(poseFor("squat", phase).toes).toEqual(start.toes);
  expect(bottom.spine[2][1] - start.spine[2][1]).toBeGreaterThan(30);
  expect(Math.abs(bottom.legs[1][0][1] - bottom.legs[1][1][1])).toBeLessThan(6);
});

test("arm circles rotate straight arms around fixed shoulders without moving the torso", () => {
  const start = poseFor("circles", 0);
  for (const phase of phases) {
    const pose = poseFor("circles", phase);
    expect(pose.spine).toEqual(start.spine);
    expect(pose.legs).toEqual(start.legs);
    for (const limb of pose.arms) {
      expect(angle(limb)).toBeCloseTo(180, 5);
      expect(distance(limb[0], limb[2])).toBeCloseTo(
        anatomy.upperArm + anatomy.forearm,
        8,
      );
    }
  }
  const hands = phases.map((phase) => poseFor("circles", phase).arms[1][2]);
  expect(
    Math.abs(parallel(hands[0], hands[1], hands[1], hands[2])),
  ).toBeGreaterThan(1000);
});
