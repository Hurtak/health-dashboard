import type { Step } from "./workouts.ts";

export type TimerStatus = "ready" | "running" | "paused" | "complete";
export interface TimerState {
  status: TimerStatus;
  index: number;
  elapsed: number;
  totalElapsed: number;
  lastTick: number;
}

export const initialTimer: TimerState = {
  status: "ready",
  index: 0,
  elapsed: 0,
  totalElapsed: 0,
  lastTick: 0,
};

// Consume elapsed wall time, including delayed browser ticks, without accumulating drift.
export function tickTimer(state: TimerState, steps: Step[], now: number): TimerState {
  if (state.status !== "running") return state;
  const delta = Math.max(0, (now - state.lastTick) / 1000);
  let elapsed = state.elapsed + delta;
  let index = state.index;
  while (steps[index]?.seconds !== undefined && elapsed >= steps[index].seconds!) {
    elapsed -= steps[index].seconds!;
    index++;
  }
  const complete = index >= steps.length;
  return {
    status: complete ? "complete" : "running",
    index,
    elapsed: complete ? 0 : elapsed,
    totalElapsed: state.totalElapsed + delta - (complete ? elapsed : 0),
    lastTick: now,
  };
}

export function advanceTimer(state: TimerState, steps: Step[], now: number): TimerState {
  const current = tickTimer(state, steps, now);
  if (current.status === "complete" || current.status === "ready") return current;
  // A timed step may have finished since the button was rendered.
  if (current.index !== state.index) return current;
  const index = current.index + 1;
  return {
    ...current,
    index,
    elapsed: 0,
    lastTick: now,
    status: index >= steps.length ? "complete" : current.status,
  };
}

export function remainingSeconds(step: Step, elapsed: number): number {
  return Math.max(0, Math.ceil((step.seconds ?? 0) - elapsed));
}

export function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)
    .toString()
    .padStart(2, "0")}:${(whole % 60).toString().padStart(2, "0")}`;
}
