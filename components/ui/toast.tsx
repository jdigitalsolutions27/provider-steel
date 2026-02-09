"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: "success" | "error" | "info";
};

type ToastContextValue = {
  push: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3 px-2 sm:bottom-6 sm:right-6 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "glass animate-[toastIn_220ms_ease-out] rounded-2xl border border-white/10 px-4 py-3 text-sm shadow-soft",
              toast.variant === "success" && "border-brand-yellow/60",
              toast.variant === "error" && "border-brand-red/60"
            )}
          >
            <p className="text-sm font-semibold text-white">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-white/70">{toast.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
