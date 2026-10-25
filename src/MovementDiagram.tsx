import { useId } from "react";
import type { CSSProperties } from "react";
import type { Movement } from "./workouts";
import { anatomy, ground, movementDescriptions, poseFor } from "./movementPoses";
import type { Limb, Phase, Point, Pose } from "./movementPoses";

const points = (values: readonly Point[]) => values.map((point) => point.join(",")).join(" ");

function Arm({ limb, far = false }: { limb: Limb; far?: boolean }) {
  return (
    <g className={far ? "figure-arm figure-far" : "figure-arm"}>
      <polyline points={points(limb)} />
      <circle cx={limb[2][0]} cy={limb[2][1]} r="2.8" className="figure-hand" />
    </g>
  );
}
function Leg({ limb, toe, far = false }: { limb: Limb; toe: Point; far?: boolean }) {
  return (
    <g className={far ? "figure-leg figure-far" : "figure-leg"}>
      <polyline points={points(limb)} />
      <path className="figure-shoe" d={`M${limb[2].join(" ")} L${toe.join(" ")}`} />
    </g>
  );
}
function Kettlebell({ grip, rotation }: NonNullable<Pose["bell"]>) {
  return (
    <g className="kettlebell" transform={`translate(${grip.join(" ")}) rotate(${rotation})`}>
      <path className="kettlebell-handle" d="M-5.5 7V3a5.5 5.5 0 0 1 11 0v4" />
      <path className="kettlebell-body" d="M-6.5 6.5C-9 10-11 17-6 20Q0 23 6 20C11 17 9 10 6.5 6.5Z" />
      <path className="kettlebell-highlight" d="M-5 10q-2 3-1 6" />
    </g>
  );
}
function Figure({ pose }: { pose: Pose }) {
  const [shoulder, waist, hip] = pose.spine;
  return (
    <g className="figure" strokeLinecap="round" strokeLinejoin="round">
      {pose.support === "bench" && (
        <g className="figure-bench">
          <path d="M61 145H99M66 145v44m28-44v44" />
          <path d="M58 144h44" className="bench-seat" />
        </g>
      )}
      <Leg limb={pose.legs[0]} toe={pose.toes[0]} far />
      <Arm limb={pose.arms[0]} far />
      <Leg limb={pose.legs[1]} toe={pose.toes[1]} />
      <path className="figure-neck" d={`M${shoulder.join(" ")} L${pose.head.join(" ")}`} />
      <polyline className="figure-shoulders" points={points(pose.shoulders)} />
      <polyline className="figure-shirt" points={points([shoulder, waist, hip])} />
      <path className="figure-shorts" d={`M${waist.join(" ")} L${hip.join(" ")}`} />
      <Arm limb={pose.arms[1]} />
      <g className="figure-head" transform={`translate(${pose.head.join(" ")}) rotate(${pose.headAngle})`}>
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
      {pose.bell && (
        <>
          <Kettlebell {...pose.bell} />
          {pose.arms.map((limb, index) => (
            <circle
              key={index}
              className={`figure-grip ${index === 0 ? "figure-far" : ""}`}
              cx={limb[2][0]}
              cy={limb[2][1]}
              r="2.8"
            />
          ))}
        </>
      )}
    </g>
  );
}

export default function MovementDiagram({
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
  const fixed = phase !== undefined || movement === "plank";
  const cycle: Phase[] = fixed ? [phase ?? 0] : movement === "circles" ? [0, 1, 2] : [0, 1, 2, 1];
  return (
    <svg
      className={`movement movement--${movement} ${className} ${playing ? "" : "is-still"}`}
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
        {["pushup", "plank", "crunch"].includes(movement) && (
          <rect x="28" y={ground} width="204" height="4" rx="2" className="movement-mat" />
        )}
        {movement === "rest" ? (
          <g className="rest-drawing">
            <path d="M118 104v-8a12 12 0 0 1 24 0v8" />
            <path d="M115 104h30l6 69q1 12-10 12h-22q-11 0-10-12z" />
            <path d="M119 147q6-4 12 0t12 0m-25 10h24" className="bottle-water" />
          </g>
        ) : (
          cycle.map((poseIndex, frame) => (
            <g
              key={frame}
              className={`movement-frame frame-${frame} ${fixed ? "is-fixed" : ""}`}
              style={{ "--frame": frame } as CSSProperties}
            >
              <Figure pose={poseFor(movement, poseIndex)} />
            </g>
          ))
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
}
