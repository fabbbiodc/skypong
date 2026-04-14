"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const tabsContainerVariants = cva("flex gap-2 border-b border-gray-200", {
  variants: {
    variant: {
      underline: "border-b-2",
      pills: "border-none gap-1",
      boxed: "border rounded-lg p-1 bg-gray-50",
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
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2",
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
        className: "border-primary text-primary font-semibold",
      },
      {
        variant: "underline",
        active: false,
        className:
          "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300",
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
          "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      },
      {
        variant: "boxed",
        active: true,
        className: "bg-white shadow-sm text-primary font-semibold",
      },
      {
        variant: "boxed",
        active: false,
        className: "bg-transparent text-gray-600 hover:text-gray-900",
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
                    ? "bg-white text-primary"
                    : "bg-gray-200 text-gray-700",
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
