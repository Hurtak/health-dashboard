import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import Home from "./Home";

test.each([
  ["Workout 1: Push & core", "a"],
  ["Workout 2: Pull & stability", "b"],
  ["Food: daily protein plan", "food"],
] as const)("the home button %s opens the correct screen", (name, view) => {
  const navigate = vi.fn();
  render(<Home onNavigate={navigate} />);
  fireEvent.click(screen.getByRole("button", { name }));
  expect(navigate).toHaveBeenCalledWith(view);
});

test("shows the complete weekly rhythm and opens plan notes", () => {
  render(<Home onNavigate={vi.fn()} />);
  const week = screen.getByRole("region", { name: "Weekly schedule" });
  expect(within(week).getAllByLabelText("Workout 1")).toHaveLength(3);
  expect(within(week).getAllByLabelText("Workout 2")).toHaveLength(3);
  expect(within(week).getByLabelText("Rest or walking")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Plan notes" }));
  const dialog = screen.getByRole("dialog", { name: "Your weekly plan" });
  expect(dialog.textContent).toContain(
    "climbing session takes the place of Workout 2",
  );
  expect(dialog.textContent).toContain("two rounds in week one");
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("dialog")).toBeNull();
});
