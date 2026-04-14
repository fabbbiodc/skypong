// ============================================
// SINGLE SOURCE OF TRUTH - Design Tokens
// ============================================
//
// This file is the single source of truth for ALL design values.
// It exports:
// - Exact values for TypeScript/IDE
// - TypeScript types for autocomplete
// - Documentation for developers
//
// For RUNTIME: Use standard Tailwind utilities (bg-primary, text-primary, etc.)
// which are powered by CSS variables in globals.css @theme
//
// ============================================

// COLORS
export const colors = {
  // Primary - Purple
  primary: {
    DEFAULT: "#9333ea",
    hover: "#7e22ce",
    pressed: "#D0BCFF",
    light: "#faf5ff",
  },
  // Secondary - Gray
  secondary: {
    DEFAULT: "#4b5563",
    hover: "#374151",
  },
  // Danger - Red
  danger: {
    DEFAULT: "#dc2626",
    hover: "#b91c1c",
  },
  // Ghost - Transparent
  ghost: {
    DEFAULT: "transparent",
    hover: "#f3f4f6",
  },

  // Semantic groupings
  background: {
    page: "transparent",
    card: "#ffffff",
    content: "#f9fafb",
  },
  border: {
    DEFAULT: "#d1d5db",
    hover: "#9ca3af",
    focus: "#a855f7",
    error: "#ef4444",
  },
  text: {
    primary: "#111827",
    secondary: "#6b7280",
    muted: "#64748b",
    link: "#9333ea",
  },

  // Chip colors
  chip: {
    default: { bg: "#f3f4f6", text: "#1f2937" },
    success: { bg: "#d1fae5", text: "#065f46" },
    warning: { bg: "#fef3c7", text: "#92400e" },
    error: { bg: "#fee2e2", text: "#991b1b" },
  },

  // Input backgrounds
  input: {
    filled: "#d4c2fc",
    filledHover: "#e5e7eb",
    filledFocus: "#ffffff",
  },

  // Focus ring
  focus: "#a855f7",
} as const;

// TYPOGRAPHY
export const typography = {
  fonts: {
    display: "var(--font-space-grotesk)",
    body: "var(--font-body)",
  },
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  weights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeights: {
    tight: "1.1",
    normal: "1.5",
    relaxed: "1.75",
  },
} as const;

// SPACING
// Based on 0.25rem (4px) increments
export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
} as const;

// BORDERS
export const borderRadius = {
  sm: "0.25rem",
  DEFAULT: "0.5rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  "3xl": "2rem",
  full: "9999px",
} as const;

// SHADOWS
export const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  DEFAULT: "0 1px 3px rgba(0,0,0,0.1)",
  md: "0 4px 6px rgba(0,0,0,0.1)",
  lg: "0 10px 15px rgba(0,0,0,0.1)",
  xl: "0 20px 25px rgba(0,0,0,0.15)",
} as const;

// ANIMATIONS
export const transitions = {
  durations: {
    fast: "150ms",
    DEFAULT: "200ms",
    slow: "300ms",
  },
  easings: {
    DEFAULT: "ease-in-out",
  },
} as const;

// CSS VARIABLE NAMES
// For runtime reference in components (optional usage)
export const cssVar = {
  color: {
    primary: "--color-primary",
    primaryHover: "--color-primary-hover",
    secondary: "--color-secondary",
    secondaryHover: "--color-secondary-hover",
    danger: "--color-danger",
    dangerHover: "--color-danger-hover",
    ghost: "--color-ghost",
    ghostHover: "--color-ghost-hover",
    focus: "--color-focus",
    border: "--color-border",
    borderHover: "--color-border-hover",
  },
} as const;

// TYPE EXPORTS
// Use these for TypeScript type annotations
export type ColorToken = typeof colors.primary.DEFAULT;
export type SpacingToken = keyof typeof spacing;
export type BorderRadiusToken = keyof typeof borderRadius;
export type FontSizeToken = keyof typeof typography.sizes;
export type FontWeightToken = keyof typeof typography.weights;

// VARIANT TYPES
// Reusable variant types for components
export const variants = {
  color: {
    primary: "primary",
    secondary: "secondary",
    danger: "danger",
    ghost: "ghost",
  } as const,
  size: {
    sm: "sm",
    md: "md",
    lg: "lg",
  } as const,
  chipState: {
    default: "default",
    success: "success",
    warning: "warning",
    error: "error",
  } as const,
};

export type ColorVariant = (typeof variants.color)[keyof typeof variants.color];
export type SizeVariant = (typeof variants.size)[keyof typeof variants.size];
export type ChipVariant =
  (typeof variants.chipState)[keyof typeof variants.chipState];
