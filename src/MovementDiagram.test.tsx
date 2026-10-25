import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import MovementDiagram from "./MovementDiagram";
import type { Movement } from "./workouts";

test.each<Movement>([
  "squat",
  "hinge",
  "circles",
  "pushup",
  "lunge",
  "press",
  "crunch",
  "row",
  "deadlift",
  "curl",
  "plank",
  "rest",
])("renders a valid accessible %s guide", (movement) => {
  const { rerender } = render(<MovementDiagram movement={movement} />);
  const illustration = screen.getByRole("img", {
    name: `${movement} movement illustration`,
  });
  expect(illustration.querySelector("path")).toBeTruthy();
  expect(illustration.outerHTML).not.toMatch(/NaN|Infinity|undefined/);
  rerender(<MovementDiagram movement={movement} playing={false} />);
  expect(illustration.classList.contains("is-still")).toBe(true);
});

test("the side-plank guide holds a single pose while other strength movements show a controlled return", () => {
  const { container, rerender } = render(<MovementDiagram movement="plank" />);
  expect(container.querySelectorAll(".movement-frame")).toHaveLength(1);
  expect(container.querySelector(".movement-frame")?.classList.contains("is-fixed")).toBe(true);
  rerender(<MovementDiagram movement="curl" />);
  expect(container.querySelectorAll(".movement-frame")).toHaveLength(4);
  rerender(<MovementDiagram movement="circles" />);
  expect(container.querySelectorAll(".movement-frame")).toHaveLength(3);
});

test("right-side steps mirror the diagram and describe the active side", () => {
  const { container } = render(<MovementDiagram movement="row" side="Right" />);
  expect(container.querySelector(".movement-scene")?.getAttribute("transform")).toBe("translate(260 0) scale(-1 1)");
  expect(container.querySelector("desc")?.textContent).toContain("Right side.");
  expect(container.querySelector(".figure-bench")).toBeTruthy();
});

test("static review poses render without an animation loop", () => {
  const { container } = render(<MovementDiagram movement="press" phase={2} />);
  expect(container.querySelectorAll(".movement-frame")).toHaveLength(1);
  expect(container.querySelector(".is-fixed")).toBeTruthy();
});
