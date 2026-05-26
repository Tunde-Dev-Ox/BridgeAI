import { FiAlertTriangle } from "react-icons/fi";
import { useEffect, useRef, useCallback } from "react";

export default function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  const modalRef = useRef(null);
  const confirmBtnRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      onCancel();
      return;
    }
    if (e.key === "Tab" && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, [onCancel]);

  useEffect(() => {
    if (!open) return;
    confirmBtnRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Confirm"}
        className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6 animate-fade-in"
      >
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-zinc-900">
              {title || "Confirm"}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              {message || "Are you sure?"}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
          >
            {confirmLabel || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
