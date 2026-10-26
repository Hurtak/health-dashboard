import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vite-plus/test";
import InfoDialog from "./InfoDialog";

test("labels the native modal and handles close and Escape", () => {
  const onClose = vi.fn();
  render(
    <InfoDialog title="Exercise guide" onClose={onClose}>
      <p>Keep your spine long.</p>
    </InfoDialog>,
  );
  const dialog = screen.getByRole("dialog", { name: "Exercise guide" });
  expect(dialog.getAttribute("open")).not.toBeNull();
  expect(dialog.textContent).toContain("Keep your spine long.");
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(onClose).toHaveBeenCalledOnce();
  fireEvent(dialog, new Event("cancel", { cancelable: true }));
  expect(onClose).toHaveBeenCalledTimes(2);
});
