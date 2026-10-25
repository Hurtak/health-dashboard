import { useLayoutEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

export default function InfoDialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useLayoutEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="info-dialog"
      aria-labelledby={titleId}
      onCancel={onClose}
    >
      <header className="dialog-header">
        <h2 id={titleId}>{title}</h2>
        <button className="text-button" onClick={onClose} autoFocus>
          Close
        </button>
      </header>
      <div className="dialog-content">{children}</div>
    </dialog>
  );
}
