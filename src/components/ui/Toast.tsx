"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...toast, id }]);

      const duration = toast.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastRegion toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

const variantConfig: Record<
  ToastVariant,
  { icon: React.ReactNode; classes: string }
> = {
  success: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    classes: "bg-green-600/10 border-green-500/30 text-green-700 dark:text-green-400",
  },
  error: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6M9 9l6 6" />
      </svg>
    ),
    classes: "bg-red-600/10 border-red-500/30 text-red-700 dark:text-red-400",
  },
  warning: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
    classes:
      "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400",
  },
  info: {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    classes: "bg-blue-600/10 border-blue-500/30 text-blue-700 dark:text-blue-400",
  },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const variant = toast.variant ?? "info";
  const { icon, classes } = variantConfig[variant];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="alert"
      aria-live="assertive"
      className={[
        "flex items-start gap-3 w-full max-w-sm px-4 py-3 rounded-xl border shadow-lg text-sm font-medium pointer-events-auto",
        classes,
      ].join(" ")}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onRemove(toast.id)}
        className="shrink-0 mt-0.5 opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </motion.li>
  );
}

function ToastRegion({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    >
      <ul className="flex flex-col gap-2 list-none m-0 p-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
