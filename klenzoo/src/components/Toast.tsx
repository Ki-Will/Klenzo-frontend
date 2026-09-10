"use client";

import { useState, useCallback, createContext, useContext, useEffect } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_ICONS: Record<ToastType, string> = {
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
};

const TOAST_COLORS: Record<ToastType, string> = {
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
  info: "text-primary",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-24 right-4 z-[200] space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className="glass-heavy rounded-xl p-4 flex items-start gap-3 animate-slide-up shadow-lg cursor-pointer"
      onClick={() => onRemove(toast.id)}
    >
      <span
        className={`material-symbols-outlined text-xl ${TOAST_COLORS[toast.type]}`}
      >
        {TOAST_ICONS[toast.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary-text">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-secondary-text mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        className="text-muted hover:text-primary-text transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(toast.id);
        }}
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}
