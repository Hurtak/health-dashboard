import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import Food from "./Food";

test("shows the fixed target, four meals, and daily protein total", () => {
  render(<Food />);
  expect(
    screen.getByRole("region", { name: "Daily protein target" }).textContent,
  ).toContain("140g");
  const meals = screen.getByRole("region", { name: "Daily meals" });
  expect(within(meals).getAllByRole("heading", { level: 3 })).toHaveLength(4);
  expect(
    within(meals).getAllByRole("heading", { name: "250 g plain skyr" }),
  ).toHaveLength(2);
  expect(meals.textContent).toContain("~140 g protein");
});

test("keeps the complete nutrition notes in a dismissible dialog", () => {
  render(<Food />);
  fireEvent.click(
    screen.getByRole("button", { name: /Food notes & skyr portions/ }),
  );
  const dialog = screen.getByRole("dialog");
  expect(dialog.textContent).toContain("12 g protein per 100 g");
  expect(dialog.textContent).toContain("15.6 g");
  expect(dialog.textContent).toContain("~675 g");
  expect(dialog.textContent).toContain("~350 g");
  fireEvent(dialog, new Event("cancel", { cancelable: true }));
  expect(screen.queryByRole("dialog")).toBeNull();
});
