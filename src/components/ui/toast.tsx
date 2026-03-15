"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all animate-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "border-brand-sage/30 bg-white/95 text-brand-sage-dark"
                : t.type === "error"
                  ? "border-brand-coral/30 bg-white/95 text-brand-coral"
                  : "border-brand-indigo/30 bg-white/95 text-brand-indigo"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            ) : t.type === "error" ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            ) : (
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{t.message}</span>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss"
              className="ml-2 flex-shrink-0 text-brand-text-light hover:text-brand-text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
