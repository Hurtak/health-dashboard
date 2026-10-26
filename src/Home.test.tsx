import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vite-plus/test";
import Home from "./Home";

test.each([
  ["Workout A: Push-ups & abs", "a"],
  ["Workout B: Biceps first", "b"],
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
  expect(within(week).getAllByLabelText("Workout A")).toHaveLength(3);
  expect(within(week).getAllByLabelText("Workout B")).toHaveLength(3);
  expect(within(week).getByLabelText("Rest or walking")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Plan notes" }));
  const dialog = screen.getByRole("dialog", { name: "Your weekly plan" });
  expect(dialog.textContent).toContain("On climbing days, skip curls and rows");
  expect(dialog.textContent).toContain("two rounds of both pairs in week one");
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("dialog")).toBeNull();
});
