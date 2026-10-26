import { memo, useId, useMemo } from "react";
import type { CSSProperties } from "react";
import type { Movement } from "./workouts";
import {
  anatomy,
  angleBetween,
  distance,
  ground,
  heading,
  motionPosesFor,
  movementDescriptions,
  poseFor,
} from "./movementPoses";
import type { Limb, Phase, Point, Pose } from "./movementPoses";
import MovementMotion from "./MovementMotion";
import type { Transform } from "./MovementMotion";

const segmentMotion = (segments: readonly (readonly [Point, Point])[]): Transform[] =>
  segments.map(([start, end]) => ({ point: start, angle: heading(start, end) }));

function limbMotion(limbs: readonly Limb[], length: number) {
  return {
    upper: segmentMotion(limbs.map(([start, joint]) => [start, joint])),
    lower: limbs.map(([start, joint, end]) => ({
      point: [length, 0] as Point,
      angle: angleBetween(heading(start, joint), heading(joint, end)),
    })),
  };
}

function Arm({ limbs, far = false }: { limbs: Limb[]; far?: boolean }) {
  const motion = limbMotion(limbs, anatomy.upperArm);
  return (
    <g className={far ? "figure-arm figure-far" : "figure-arm"}>
      <MovementMotion transforms={motion.upper}>
        <path className="limb-segment" d={`M0 0H${anatomy.upperArm}`} />
        <MovementMotion transforms={motion.lower}>
          <path className="limb-segment" d={`M0 0H${anatomy.forearm}`} />
          <circle cx={anatomy.forearm} r="2.8" className="figure-hand" />
        </MovementMotion>
      </MovementMotion>
    </g>
  );
}
function Leg({ limbs, toes, far = false }: { limbs: Limb[]; toes: Point[]; far?: boolean }) {
  const motion = limbMotion(limbs, anatomy.thigh);
  const feet = limbs.map(([, knee, ankle], index) => ({
    point: [anatomy.shin, 0] as Point,
    angle: angleBetween(heading(knee, ankle), heading(ankle, toes[index])),
  }));
  return (
    <g className={far ? "figure-leg figure-far" : "figure-leg"}>
      <MovementMotion transforms={motion.upper}>
        <path className="limb-segment" d={`M0 0H${anatomy.thigh}`} />
        <MovementMotion transforms={motion.lower}>
          <path className="limb-segment" d={`M0 0H${anatomy.shin}`} />
          <MovementMotion transforms={feet}>
            <path className="figure-shoe" d={`M0 0H${anatomy.foot}`} />
          </MovementMotion>
        </MovementMotion>
      </MovementMotion>
    </g>
  );
}
function Kettlebell({ poses }: { poses: Pose[] }) {
  return (
    <MovementMotion transforms={poses.map(({ bell }) => ({ point: bell!.grip, angle: bell!.rotation }))}>
      <g className="kettlebell">
        <path className="kettlebell-handle" d="M-5.5 7V3a5.5 5.5 0 0 1 11 0v4" />
        <path className="kettlebell-body" d="M-6.5 6.5C-9 10-11 17-6 20Q0 23 6 20C11 17 9 10 6.5 6.5Z" />
        <path className="kettlebell-highlight" d="M-5 10q-2 3-1 6" />
      </g>
    </MovementMotion>
  );
}
function Figure({ poses }: { poses: Pose[] }) {
  const pose = poses[0];
  const spine = limbMotion(
    poses.map(({ spine }) => spine),
    anatomy.upperBack,
  );
  return (
    <g className="figure" strokeLinecap="round" strokeLinejoin="round">
      {pose.support === "bench" && (
        <g className="figure-bench">
          <path d="M61 145H99M66 145v44m28-44v44" />
          <path d="M58 144h44" className="bench-seat" />
        </g>
      )}
      <Leg limbs={poses.map(({ legs }) => legs[0])} toes={poses.map(({ toes }) => toes[0])} far />
      <Arm limbs={poses.map(({ arms }) => arms[0])} far />
      <Leg limbs={poses.map(({ legs }) => legs[1])} toes={poses.map(({ toes }) => toes[1])} />
      <MovementMotion transforms={segmentMotion(poses.map(({ spine, head }) => [spine[0], head]))}>
        <path className="figure-neck" d={`M0 0H${anatomy.neckToHead}`} />
      </MovementMotion>
      <MovementMotion transforms={segmentMotion(poses.map(({ shoulders }) => shoulders))}>
        <path className="figure-shoulders" d={`M0 0H${distance(...pose.shoulders)}`} />
      </MovementMotion>
      <MovementMotion transforms={spine.upper}>
        <path className="figure-shirt" d={`M0 0H${anatomy.upperBack}`} />
        <MovementMotion transforms={spine.lower}>
          <circle r="10" className="figure-waist" />
          <path className="figure-shirt" d={`M0 0H${anatomy.lowerBack}`} />
          <path className="figure-shorts" d={`M0 0H${anatomy.lowerBack}`} />
        </MovementMotion>
      </MovementMotion>
      <Arm limbs={poses.map(({ arms }) => arms[1])} />
      <MovementMotion transforms={poses.map(({ head, headAngle }) => ({ point: head, angle: headAngle }))}>
        <g className="figure-head">
          <circle r={anatomy.headRadius} />
          {pose.front ? (
            <>
              <path className="figure-hair" d="M-8-3q1-8 9-6l7 4" />
              <path className="figure-face" d="M-3.5 0h.1m6.8 0h.1" />
            </>
          ) : (
            <>
              <path className="figure-hair" d="M-7-4q2-8 10-4l5 5" />
              <path className="figure-nose" d="M-8-1l-3 3h3" />
            </>
          )}
        </g>
      </MovementMotion>
      {pose.bell && (
        <>
          <Kettlebell poses={poses} />
          {[0, 1].map((index) => (
            <MovementMotion key={index} transforms={poses.map(({ arms }) => ({ point: arms[index][2], angle: 0 }))}>
              <circle className={`figure-grip ${index === 0 ? "figure-far" : ""}`} r="2.8" />
            </MovementMotion>
          ))}
        </>
      )}
    </g>
  );
}

export default memo(function MovementDiagram({
  movement,
  playing = true,
  className = "",
  side,
  phase,
}: {
  movement: Movement;
  playing?: boolean;
  className?: string;
  side?: "Left" | "Right";
  phase?: Phase;
}) {
  const descriptionId = useId();
  const arrowId = useId();
  const poses = useMemo(
    () =>
      movement === "rest"
        ? []
        : phase !== undefined || movement === "plank"
          ? [poseFor(movement, phase ?? 0)]
          : motionPosesFor(movement),
    [movement, phase],
  );
  return (
    <svg
      className={`movement movement--${movement} ${className} ${playing ? "" : "is-still"}`}
      style={{ "--movement-duration": movement === "march" ? "1.2s" : "4.8s" } as CSSProperties}
      viewBox="0 0 260 210"
      role="img"
      aria-label={`${movement} movement illustration`}
      aria-describedby={descriptionId}
    >
      <desc id={descriptionId}>
        {side ? `${side} side. ` : ""}
        {movementDescriptions[movement]}
      </desc>
      <defs>
        <marker
          id={arrowId}
          viewBox="0 0 8 8"
          markerWidth="5"
          markerHeight="5"
          refX="6"
          refY="4"
          orient="auto-start-reverse"
        >
          <path d="m1 1 5 3-5 3" className="movement-arrowhead" />
        </marker>
      </defs>
      <ellipse cx="130" cy="194" rx="86" ry="3" className="movement-shadow" />
      <path d={`M24 ${ground}H236`} className="movement-ground" />
      <g className="movement-scene" transform={side === "Right" ? "translate(260 0) scale(-1 1)" : undefined}>
        {["pushup", "plank", "crunch", "bridge"].includes(movement) && (
          <rect x="28" y={ground} width="204" height="4" rx="2" className="movement-mat" />
        )}
        {movement === "rest" ? (
          <g className="rest-drawing">
            <path d="M118 104v-8a12 12 0 0 1 24 0v8" />
            <path d="M115 104h30l6 69q1 12-10 12h-22q-11 0-10-12z" />
            <path d="M119 147q6-4 12 0t12 0m-25 10h24" className="bottle-water" />
          </g>
        ) : (
          <Figure key={`${movement}-${side ?? ""}`} poses={poses} />
        )}
        {movement === "circles" && (
          <path d="M181 75a51 51 0 1 0-51 51" className="movement-cue" markerEnd={`url(#${arrowId})`} />
        )}
        {movement === "crunch" && (
          <path d="M119 174q-7-17-19-17" className="movement-cue" markerEnd={`url(#${arrowId})`} />
        )}
      </g>
    </svg>
  );
});
