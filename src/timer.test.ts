import { expect, test } from "vitest";
import {
  advanceTimer,
  formatTime,
  initialTimer,
  remainingSeconds,
  tickTimer,
} from "./timer";
import { buildSteps, workouts } from "./workouts";
import type { TimerState } from "./timer";

const steps = buildSteps(workouts[0]);
const running: TimerState = {
  ...initialTimer,
  status: "running",
  lastTick: 1000,
};

test.each(workouts)(
  "$name preserves pairs, rounds, both sides, and rests",
  (workout) => {
    const plan = buildSteps(workout);
    expect(plan[0].seconds).toBe(5);
    expect(plan[1].seconds).toBe(180);
    expect(plan.filter((step) => step.kind === "rest")).toHaveLength(5);
    for (const exercise of workout.exercises) {
      const sets = plan.filter((step) => step.exercise === exercise);
      expect(sets).toHaveLength(exercise.sides ? 6 : 3);
      if (exercise.sides) {
        expect(sets.filter((step) => step.side === "Left")).toHaveLength(3);
        expect(sets.filter((step) => step.side === "Right")).toHaveLength(3);
      }
    }
    expect(plan.at(-1)?.exercise).toBe(workout.exercises[3]);
    expect(
      plan.filter((step) => step.kind === "exercise" && step.seconds),
    ).toHaveLength(workout.id === "b" ? 6 : 0);
  },
);

test("delayed ticks cross timed phases and stop in a rep-based set", () => {
  const after = tickTimer(running, steps, 191_000);
  expect(after.index).toBe(2);
  expect(after.elapsed).toBe(5);
  expect(after.totalElapsed).toBe(190);
  expect(after.status).toBe("running");
  expect(tickTimer(after, steps, 500_000).index).toBe(2);
});

test("pause and resume exclude the paused duration", () => {
  const current = tickTimer(running, steps, 3000);
  const paused: TimerState = { ...current, status: "paused" };
  expect(tickTimer(paused, steps, 100_000)).toBe(paused);
  const resumed = tickTimer(
    { ...paused, status: "running", lastTick: 100_000 },
    steps,
    101_000,
  );
  expect(resumed.elapsed).toBe(3);
  expect(resumed.totalElapsed).toBe(3);
});

test("completing a rep set resets its clock and preserves session time", () => {
  const inSet = { ...running, index: 2, elapsed: 20, totalElapsed: 205 };
  const next = advanceTimer(inSet, steps, 2000);
  expect(next.index).toBe(3);
  expect(steps[next.index].side).toBe("Left");
  expect(next.elapsed).toBe(0);
  expect(next.totalElapsed).toBe(206);
});

test("side plank changes sides and completes the final hold automatically", () => {
  const plan = buildSteps(workouts[1]);
  const state = { ...running, index: plan.length - 2 };
  const right = tickTimer(state, plan, 37_000);
  expect(plan[right.index].side).toBe("Right");
  expect(right.elapsed).toBe(1);
  const done = tickTimer(right, plan, 75_000);
  expect(done.status).toBe("complete");
  expect(done.index).toBe(plan.length);
  expect(done.totalElapsed).toBe(70);
});

test("manual completion works while paused and finishes without another rest", () => {
  const last: TimerState = {
    ...running,
    status: "paused",
    index: steps.length - 1,
  };
  expect(advanceTimer(last, steps, 10_000).status).toBe("complete");
  expect(advanceTimer(initialTimer, steps, 10_000)).toBe(initialTimer);
});

test("countdowns round up so the final second stays visible", () => {
  expect(remainingSeconds(steps[0], 2.01)).toBe(3);
  expect(remainingSeconds(steps[0], 4.99)).toBe(1);
  expect(remainingSeconds(steps[0], 6)).toBe(0);
  expect(formatTime(180)).toBe("03:00");
  expect(formatTime(35)).toBe("00:35");
});

test("a skip at an automatic transition advances only once", () => {
  const atBoundary = { ...running, elapsed: 4.95 };
  const next = advanceTimer(atBoundary, steps, 1100);
  expect(next.index).toBe(1);
  expect(next.elapsed).toBeCloseTo(0.05);
});

test("completed timers stay completed and elapsed time cannot go backward", () => {
  const done: TimerState = {
    ...running,
    status: "complete",
    index: steps.length,
  };
  expect(tickTimer(done, steps, 9000)).toBe(done);
  expect(advanceTimer(done, steps, 9000)).toBe(done);
  expect(tickTimer(running, steps, 500).elapsed).toBe(0);
  expect(formatTime(-1)).toBe("00:00");
  expect(formatTime(60.9)).toBe("01:00");
});
