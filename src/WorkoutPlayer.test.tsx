import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import WorkoutPlayer from "./WorkoutPlayer";
import { workouts } from "./workouts";
import type { Workout } from "./workouts";

function mount(workout: Workout = workouts[0]) {
  const props = {
    workout,
    visible: true,
    onBack: vi.fn(),
    onFocusChange: vi.fn(),
  };
  return { ...render(<WorkoutPlayer {...props} />), props };
}
const click = (name: string | RegExp) =>
  fireEvent.click(screen.getByRole("button", { name }));
const elapse = (seconds: number) =>
  act(() => vi.advanceTimersByTime(seconds * 1000));
function advanceTo(name: string) {
  for (let count = 0; count < 35; count++) {
    if (screen.getByRole("heading", { level: 1 }).textContent === name) return;
    click(/^(Set complete|Skip rest|Skip warm-up|Skip countdown|Skip hold)$/);
  }
  throw new Error(`Did not reach ${name}`);
}

test.each(workouts)(
  "previews every exercise and its form notes for $name",
  (workout) => {
    mount(workout);
    expect(
      screen.getByRole("heading", { name: `${workout.name}.` }),
    ).toBeTruthy();
    for (const exercise of workout.exercises) {
      click(new RegExp(exercise.name));
      const dialog = screen.getByRole("dialog", { name: exercise.name });
      expect(dialog.textContent).toContain(exercise.detail);
      fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    }
    click("Workout notes");
    expect(screen.getByRole("dialog").textContent).toContain("two rounds");
  },
);

test("preparation leads to warm-up, cycles the guide, and pauses while reading help", () => {
  const { props } = mount();
  click("Start workout");
  expect(props.onFocusChange).toHaveBeenLastCalledWith(true);
  expect(screen.getByRole("timer").textContent).toBe("00:05");
  elapse(5);
  expect(screen.getByRole("heading", { name: "Warm up" })).toBeTruthy();
  expect(screen.getByRole("timer").textContent).toBe("03:00");
  elapse(15);
  expect(
    screen.getByRole("img", { name: "hinge movement illustration" }),
  ).toBeTruthy();
  click("Guide");
  const dialog = screen.getByRole("dialog", { name: "Your warm-up" });
  expect(within(dialog).getAllByRole("listitem")).toHaveLength(4);
  elapse(10);
  expect(screen.getByRole("timer").textContent).toBe("02:45");
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  expect(screen.getByRole("button", { name: "Resume workout" })).toBeTruthy();
});

test("strength sets wait for completion, alternate sides, and rest before the next round", () => {
  mount();
  click("Start workout");
  advanceTo("Push-ups");
  elapse(40);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
    "Push-ups",
  );
  expect(screen.getByRole("timer").textContent).toBe("00:40");
  click("Set complete");
  expect(screen.getByText(/Left leg/)).toBeTruthy();
  click("Set complete");
  expect(screen.getByText(/Right leg/)).toBeTruthy();
  click("Set complete");
  expect(screen.getByRole("timer").textContent).toBe("01:00");
  elapse(60);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
    "Push-ups",
  );
  expect(screen.getByText(/ROUND 2 OF 3/)).toBeTruthy();
});

test("side plank holds automatically switch from left to right and then rest", () => {
  mount(workouts[1]);
  click("Start workout");
  advanceTo("Side plank");
  expect(
    screen.getByText(/Left side/, { selector: ".focus-heading p" }),
  ).toBeTruthy();
  elapse(35);
  expect(
    screen.getByText(/Right side/, { selector: ".focus-heading p" }),
  ).toBeTruthy();
  expect(screen.getByRole("timer").textContent).toBe("00:35");
  elapse(35);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
    "Take a breather",
  );
});

test("pause, resume, mute, and restart confirmation work without losing progress", () => {
  const { props } = mount();
  click("Start workout");
  elapse(2);
  click("Mute sounds");
  expect(
    screen
      .getByRole("button", { name: "Enable sounds" })
      .getAttribute("aria-pressed"),
  ).toBe("false");
  click("Enable sounds");
  click("Pause");
  elapse(10);
  expect(screen.getByRole("timer").textContent).toBe("00:03");
  click("Resume workout");
  elapse(1);
  expect(screen.getByRole("timer").textContent).toBe("00:02");
  click("Restart");
  const dialog = screen.getByRole("dialog", { name: "Restart this workout?" });
  fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
  expect(screen.getByRole("timer").textContent).toBe("00:02");
  click("Restart");
  click("Restart workout");
  expect(screen.getByRole("button", { name: "Start workout" })).toBeTruthy();
  expect(props.onFocusChange).toHaveBeenLastCalledWith(false);
});

test.each(workouts)(
  "$name finishes with the actual time and its correct set count",
  (workout) => {
    const { props } = mount(workout);
    click("Start workout");
    elapse(1);
    click("Pause");
    advanceTo("Well done.");
    expect(
      screen.getByText(workout.id === "a" ? "18" : "21", { exact: true }),
    ).toBeTruthy();
    expect(screen.getByText("00:01", { exact: true })).toBeTruthy();
    click("Continue");
    expect(props.onBack).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Start workout" })).toBeTruthy();
  },
);

test("hiding the player pauses it, and reopening preserves the exact step", () => {
  const { props, rerender } = mount();
  click("Start workout");
  advanceTo("Push-ups");
  elapse(3);
  rerender(<WorkoutPlayer {...props} visible={false} />);
  elapse(30);
  expect(screen.queryByRole("timer")).toBeNull();
  rerender(<WorkoutPlayer {...props} />);
  expect(screen.getByRole("timer").textContent).toBe("00:03");
  expect(screen.getByRole("button", { name: "Resume workout" })).toBeTruthy();
});

test("audio failure has a visible fallback while controls still work", () => {
  vi.stubGlobal(
    "AudioContext",
    class {
      constructor() {
        throw new Error("Unavailable");
      }
    },
  );
  mount();
  click("Start workout");
  expect(screen.getByRole("status").textContent).toContain(
    "Audio isn’t available",
  );
  click("Skip countdown");
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Warm up");
});
