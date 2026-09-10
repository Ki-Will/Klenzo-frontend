"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog for destructive actions.
 * Traps focus and handles keyboard navigation.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmBtnRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onCancel();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onCancel]);

  if (!open) return null;

  const variantStyles = {
    danger: "bg-error/20 text-error",
    warning: "bg-warning/20 text-warning",
    info: "bg-primary/20 text-primary",
  };

  const buttonStyles = {
    danger: "bg-error hover:bg-error/90 text-white",
    warning: "bg-warning hover:bg-warning/90 text-white",
    info: "glass-btn-primary text-white",
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center glass-overlay px-4">
      <div
        ref={dialogRef}
        className="glass-heavy rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        role="alertdialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <div
          className={`w-12 h-12 rounded-full ${variantStyles[variant]} flex items-center justify-center mx-auto mb-4`}
        >
          <span className="material-symbols-outlined text-xl">
            {variant === "danger"
              ? "warning"
              : variant === "warning"
                ? "info"
                : "help"}
          </span>
        </div>

        <h2
          id="dialog-title"
          className="text-lg font-headline font-bold text-primary-text text-center mb-2"
        >
          {title}
        </h2>
        <p
          id="dialog-message"
          className="text-sm text-secondary-text text-center mb-6"
        >
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="glass-btn-ghost flex-1 py-3 text-sm font-semibold cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all cursor-pointer ${buttonStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
