import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vite-plus/test";
import App from "./App";

const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));

test("all navigation screens and the home button work", () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("A little stronger.");
  click("Workout A");
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Push-ups & abs.");
  expect(screen.getByRole("button", { name: "Workout A" }).getAttribute("aria-current")).toBe("page");
  click("Workout B");
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Biceps first.");
  click("Food");
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Eat well.");
  click("Daily home");
  expect(screen.getByRole("button", { name: "Workout A: Push-ups & abs" })).toBeTruthy();
});

test("back pauses a workout while the other workout and food remain usable", () => {
  render(<App />);
  click("Workout A");
  click("Start workout");
  click("Skip countdown");
  click("Skip warm-up");
  act(() => {
    vi.advanceTimersByTime(3000);
  });
  click("Back to overview");
  click("Food");
  act(() => {
    vi.advanceTimersByTime(20000);
  });
  click("Workout B");
  expect(screen.getByRole("button", { name: "Start workout" })).toBeTruthy();
  click("Workout A");
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Push-ups");
  expect(screen.getByRole("timer").textContent).toBe("00:03");
  expect(screen.getByRole("button", { name: "Resume workout" })).toBeTruthy();
});
