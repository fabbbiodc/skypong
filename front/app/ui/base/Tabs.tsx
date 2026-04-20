"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const tabsContainerVariants = cva("flex gap-2 border-b border-slate-700", {
  variants: {
    variant: {
      underline: "border-b-2",
      pills: "border-none gap-1",
      boxed: "border rounded-lg p-1 bg-slate-800/30",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "underline",
    size: "md",
  },
});

const tabVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 text-slate-300",
  {
    variants: {
      variant: {
        underline: "border-b-2 pb-3 px-4",
        pills: "rounded-full px-4 py-2",
        boxed: "rounded-md px-4 py-2",
      },
      active: {
        true: "",
        false: "",
      },
      state: {
        default: "",
        disabled: "opacity-50 cursor-not-allowed pointer-events-none",
      },
    },
    compoundVariants: [
      {
        variant: "underline",
        active: true,
        className: "border-primary text-white font-semibold",
      },
      {
        variant: "underline",
        active: false,
        className:
          "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600",
      },
      {
        variant: "pills",
        active: true,
        className: "bg-primary text-white font-semibold",
      },
      {
        variant: "pills",
        active: false,
        className:
          "bg-transparent text-slate-400 hover:bg-slate-700/50 hover:text-slate-200",
      },
      {
        variant: "boxed",
        active: true,
        className: "bg-slate-800/50 shadow-sm text-white font-semibold",
      },
      {
        variant: "boxed",
        active: false,
        className: "bg-transparent text-slate-400 hover:text-slate-200",
      },
    ],
    defaultVariants: {
      variant: "underline",
      active: false,
      state: "default",
    },
  },
);

export interface Tab {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

type TabsVariant = VariantProps<typeof tabsContainerVariants>["variant"];
type TabsSize = VariantProps<typeof tabsContainerVariants>["size"];

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  size = "md",
  className,
}: TabsProps) {
  return (
    <div
      className={cn(
        tabsContainerVariants({ variant, size }),
        className,
        "overflow-x-auto",
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const state: "default" | "disabled" = tab.disabled
          ? "disabled"
          : "default";

        return (
          <button
            key={tab.key}
            onClick={() => !tab.disabled && onChange(tab.key)}
            disabled={tab.disabled}
            className={cn(
              tabVariants({ variant, active: isActive, state }),
              "whitespace-nowrap",
              tab.disabled && "opacity-50 cursor-not-allowed",
            )}
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled}
          >
            {tab.icon && <span className="text-lg">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold rounded-full",
                  isActive
                    ? "bg-primary text-white"
                    : "bg-slate-700 text-slate-300",
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
