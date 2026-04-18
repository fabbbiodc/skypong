"use client";

import { useEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "fixed bottom-6 right-6 z-[9999] rounded-lg px-4 py-2 text-xs font-bold tracking-wide shadow-lg",
  {
    variants: {
      variant: {
        success: "bg-chip-success text-chip-success-text",
        error: "bg-chip-error text-chip-error-text",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  },
);

type ToastVariant = VariantProps<typeof toastVariants>["variant"];

interface ToastProps {
  msg: string;
  type?: "ok" | "err";
  clear: () => void;
  className?: string;
}

function mapTypeToVariant(type: ToastProps["type"]): ToastVariant {
  return type === "err" ? "error" : "success";
}

export function Toast({ msg, type = "ok", clear, className }: ToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(clear, 2800);
    return () => window.clearTimeout(timeoutId);
  }, [msg, clear]);

  return (
    <div
      className={cn(
        toastVariants({ variant: mapTypeToVariant(type) }),
        className,
      )}
    >
      {msg}
    </div>
  );
}
