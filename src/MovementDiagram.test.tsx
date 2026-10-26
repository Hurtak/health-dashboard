import { render, screen } from "@testing-library/react";
import { expect, test } from "vite-plus/test";
import MovementDiagram from "./MovementDiagram";
import type { Movement } from "./workouts";

test.each<Movement>([
  "squat",
  "march",
  "circles",
  "pushup",
  "lunge",
  "press",
  "crunch",
  "row",
  "bridge",
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

test("one articulated figure moves continuously while the side plank stays still", () => {
  const { container, rerender } = render(<MovementDiagram movement="plank" />);
  expect(container.querySelectorAll(".figure")).toHaveLength(1);
  expect(container.querySelector("style")).toBeNull();
  rerender(<MovementDiagram movement="curl" />);
  expect(container.querySelectorAll(".figure")).toHaveLength(1);
  expect(container.querySelector("style")?.textContent).toContain("@keyframes");
  expect(container.querySelectorAll(".movement-frame")).toHaveLength(0);
  rerender(<MovementDiagram movement="circles" />);
  expect(container.querySelectorAll(".figure")).toHaveLength(1);
  expect(container.querySelector("style")?.textContent).toContain("@keyframes");
});

test("pausing and resuming preserve the figure and its animation timelines", () => {
  const { container, rerender } = render(<MovementDiagram movement="curl" />);
  const figure = container.querySelector(".figure");
  const timelines = [...container.querySelectorAll("style")].map((style) => style.textContent);
  rerender(<MovementDiagram movement="curl" playing={false} />);
  expect(container.querySelector(".figure")).toBe(figure);
  expect(container.querySelector(".movement.is-still")).toBeTruthy();
  expect([...container.querySelectorAll("style")].map((style) => style.textContent)).toEqual(timelines);
  rerender(<MovementDiagram movement="curl" />);
  expect(container.querySelector(".figure")).toBe(figure);
  expect(container.querySelector(".is-still")).toBeNull();
});

test("right-side steps mirror the diagram and describe the active side", () => {
  const { container } = render(<MovementDiagram movement="row" side="Right" />);
  expect(container.querySelector(".movement-scene")?.getAttribute("transform")).toBe("translate(260 0) scale(-1 1)");
  expect(container.querySelector("desc")?.textContent).toContain("Right side.");
  expect(container.querySelector(".figure-bench")).toBeTruthy();
});

test("static review poses render without an animation loop", () => {
  const { container } = render(<MovementDiagram movement="press" phase={2} />);
  expect(container.querySelectorAll(".figure")).toHaveLength(1);
  expect(container.querySelector("style")).toBeNull();
});
