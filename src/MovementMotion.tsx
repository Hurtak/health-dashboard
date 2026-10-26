import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { angleBetween } from "./movementPoses";
import type { Point } from "./movementPoses";

export interface Transform {
  point: Point;
  angle: number;
}

// The browser interpolates translations and joint rotations. Segment lengths never scale.
export default function MovementMotion({ transforms, children }: { transforms: Transform[]; children: ReactNode }) {
  const id = `motion-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  let angle = transforms[0].angle;
  const frames: string[] = [];
  for (const { point, angle: next } of transforms) {
    angle += angleBetween(angle, next);
    frames.push(`translate(${point[0].toFixed(4)}px,${point[1].toFixed(4)}px) rotate(${angle.toFixed(4)}deg)`);
  }
  const animated = frames.some((frame) => frame !== frames[0]);
  return (
    <g
      className="movement-part"
      style={{ transform: frames[0], "--motion-name": animated ? id : "none" } as CSSProperties}
    >
      {animated && (
        <style>{`@keyframes ${id}{${frames.map((transform, index) => `${((index / (frames.length - 1)) * 100).toFixed(4)}%{transform:${transform}}`).join("")}}`}</style>
      )}
      {children}
    </g>
  );
}
