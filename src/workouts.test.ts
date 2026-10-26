import { expect, test } from "vite-plus/test";
import { buildSteps, warmupAt, warmupFor, workouts } from "./workouts";

test("the revised plans prioritize push-ups / abs and biceps, with no deadlifts", () => {
  expect(workouts[0].exercises.map(({ movement, reps }) => [movement, reps])).toEqual([
    ["pushup", "8–20 reps"],
    ["crunch", "10–20 reps"],
    ["lunge", "8–12 reps"],
    ["press", "6–12 reps"],
  ]);
  expect(workouts[1].exercises.map(({ movement, reps }) => [movement, reps])).toEqual([
    ["curl", "6–15 reps"],
    ["plank", "20–40 sec"],
    ["row", "10–20 reps"],
    ["bridge", "10–15 reps"],
  ]);
  expect(workouts[1].exercises[1].seconds).toBe(30);
});

test.each(workouts)("$name finishes all three priority rounds before the two secondary rounds", (workout) => {
  const plan = buildSteps(workout);
  const rounds = plan.filter((step) => step.kind === "rest").map(({ block, round }) => [block, round]);
  expect(rounds).toEqual([
    [1, 1],
    [1, 2],
    [1, 3],
    [2, 1],
  ]);
  const pair2 = plan.findIndex((step) => step.block === 2);
  expect(plan.slice(2, pair2).every((step) => step.block === 1)).toBe(true);
  expect(plan.slice(pair2).every((step) => step.block === 2)).toBe(true);
  expect(plan.at(-1)).toMatchObject({ kind: "exercise", round: 2, block: 2, side: "Right" });
  expect(plan.filter((step) => step.kind === "exercise")).toHaveLength(workout.id === "a" ? 14 : 20);
});

test.each(workouts)("$name warms up for exactly three minutes and rehearses its own exercises", (workout) => {
  const moves = warmupFor(workout);
  expect(moves.reduce((seconds, move) => seconds + move.seconds, 0)).toBe(180);
  expect(moves.map((move) => move.movement)).toEqual([
    "march",
    "squat",
    "circles",
    ...workout.exercises.map((exercise) => exercise.movement),
  ]);
  expect(warmupAt(moves, 0).movement).toBe("march");
  expect(warmupAt(moves, 44.99).movement).toBe("march");
  expect(warmupAt(moves, 45).movement).toBe("squat");
  expect(warmupAt(moves, 75).movement).toBe("circles");
  expect(warmupAt(moves, 120).movement).toBe(workout.exercises[0].movement);
  expect(warmupAt(moves, 135).movement).toBe(workout.exercises[1].movement);
  expect(warmupAt(moves, 150).movement).toBe(workout.exercises[2].movement);
  expect(warmupAt(moves, 165).movement).toBe(workout.exercises[3].movement);
  expect(warmupAt(moves, 180).movement).toBe(workout.exercises[3].movement);
});
