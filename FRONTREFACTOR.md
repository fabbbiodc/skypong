# Frontend Refactoring Plan

## Overview

This document outlines the refactoring plan for the `front/` directory, focusing on design simplification and consolidation. It serves as the master prompt for this refactoring session and future sessions.

**Last Updated:** 2026-04-14

---

## Maintenance Note

**IMPORTANT:** This document must be updated after EVERY change to the codebase. Before ending a coding session, ensure all changes are documented here.

- New components created
- Changes to existing components
- New decisions made
- Bugs found and workarounds
- Anything deviating from the plan

---

## Goals

1. **Single Source of Truth** for design tokens/variables
2. **Full Design System** with consistent CVA patterns
3. **Consolidated Page Components** to reduce duplication

---

## Current State

### Architecture Issues Identified

- **1300-line globals.css** - Design tokens mixed with component-specific styles
- **Inconsistent CVA** - Only Button/Card use class-variance-authority; others have ad-hoc styling
- **No TypeScript tokens** - Colors/spacing scattered in CSS only
- **Duplication** - Similar patterns (hover, borders, shadows) repeated across components
- **Page component duplication** - GameHistory, FriendsSection, AchievementsSection have repeated patterns

### Current Design System

**Tailwind v4** with CSS variables in `globals.css`

- Colors: Primary purple (#9333ea), Secondary, Danger, Ghost
- Typography: Space Grotesk (display), Funnel Sans (body)
- Components: Partial CVA on Button/Card only

---

## Architecture

### Target Architecture

```
front/app/lib/design-tokens.ts    ← SINGLE SOURCE OF TRUTH
        ↓                             ↓
        ├── TypeScript components      globals.css
        │   (import for types)            (CSS variables)
        │                                │
        └── Documentation            Runtime (Tailwind utilities)
```

### Principle: Single Source of Truth

1. **TypeScript file** (`design-tokens.ts`) - Has exact values, exports types
2. **CSS variables** in `globals.css` - References same values via @theme
3. **Components** - Use standard Tailwind utilities (bg-primary, text-primary)

This is industry standard (Chakra UI, Shadcn/ui, Radix UI).

---

## Implementation Plan

### Phase 1: Create Design Tokens File

**File:** `front/app/lib/design-tokens.ts`

This file serves as:

- Single source of truth for ALL design values
- TypeScript type exports for autocomplete
- Documentation for developers

**Structure:**

```typescript
// ============================================
// SINGLE SOURCE OF TRUTH - Design Tokens
// ============================================

// COLORS
export const colors = {
  // Primary - Purple
  primary: {
    DEFAULT: "#9333ea", // bg-primary, text-primary
    hover: "#7e22ce", // bg-primary-hover
    pressed: "#D0BCFF", // active state
    light: "#faf5ff", // backgrounds
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
    page: "transparent", // Grainient background
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
export type ColorToken = typeof colors.primary.DEFAULT;
export type SpacingToken = keyof typeof spacing;
export type BorderRadiusToken = keyof typeof borderRadius;
export type FontSizeToken = keyof typeof typography.sizes;
export type FontWeightToken = keyof typeof typography.weights;
```

**Keep globals.css @theme as-is** - It already defines CSS variables matching these values. The tokens file serves as:

- TypeScript exports for type safety
- Documentation source for developers
- Validation point (can add runtime check)

---

### Phase 2: Migrate Base Components to Full CVA

**Goal:** All components in `front/app/ui/base/` follow consistent CVA pattern.

**Target Pattern:**

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { colors, borderRadius, transitions } from "@/lib/design-tokens";

const componentVariants = cva(
  "inline-flex items-center justify-center transition-colors duration-200",
  {
    variants: {
      variant: {
        primary: "bg-primary hover:bg-primary-hover",
        secondary: "bg-secondary hover:bg-secondary-hover",
        danger: "bg-danger hover:bg-danger-hover",
        ghost: "bg-transparent hover:bg-ghost-hover",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
      state: {
        default: "",
        hover: "hover:scale-105",
        active: "active:scale-95",
        disabled: "opacity-50 cursor-not-allowed",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      state: "default",
    },
  }
);

interface ComponentProps extends VariantProps<typeof componentVariants> {
  className?: string;
  children: React.ReactNode;
  // ... other props
}

export function Component({ variant, size, state, className, children, ...props }: ComponentProps) {
  return (
    <div className={cn(componentVariants({ variant, size, state }), className)} {...props}>
      {children}
    </div>
  );
}
```

**Components to migrate:**

| Component   | Current State | Target                |
| ----------- | ------------- | --------------------- |
| Button      | CVA ✓         | Full variants + state |
| Card        | CVA ✓         | Full variants         |
| TextField   | Ad-hoc        | Full CVA              |
| Chip        | Ad-hoc        | Full CVA              |
| Avatar      | Ad-hoc        | Full CVA              |
| Badge       | Ad-hoc        | Full CVA              |
| StatCard    | Ad-hoc        | Full CVA              |
| ProgressBar | Ad-hoc        | Full CVA              |
| Tabs        | Basic         | Full CVA              |

**New base components to create:**

| Component    | Purpose        |
| ------------ | -------------- |
| Modal/Dialog | Modal overlays |
| Dropdown     | Dropdown menus |
| Tooltip      | Hover tooltips |
| Toast/Alert  | Notifications  |

---

### Phase 3: Simplify globals.css

**Goal:** Move component-specific styles out, keep only design system + global styles.

**Keep in globals.css:**

- @theme CSS variables (colors, fonts, animations)
- Font definitions (.font-display, .font-sans)
- Global animations (@keyframes)
- Grainient background component
- Tailwind @apply utilities for animations

**Move out:**

- Component-specific utilities (.game-row, .leaderboard-row, .friend-row, etc.)
- Page layout utilities (can be in new tokens or components)
- Duplicated patterns

---

### Phase 4: Page Component Consolidation

**Goal:** Reduce duplication in feature components.

**Current duplicated patterns:**

- List rows (game history, friends, leaderboard)
- Section containers
- Empty states
- Loading states

**Solution:** Create reusable patterns in `front/app/ui/patterns/`

```
front/app/ui/patterns/
  Section.tsx       # Reusable section container
  ListRow.tsx       # Reusable list row with hover/border
  EmptyState.tsx   # Empty state component
  LoadingState.tsx # Loading spinner/skeleton
```

---

### Phase 5: Documentation

- Update `/ui-test/` page with new components
- Document token usage in design-tokens.ts
- Create examples page

---

## Decisions Log

### Decision 1: Token Architecture

**Status:** ✅ Decided

**Choice:** Hybrid approach

- TypeScript file (`design-tokens.ts`) - Exact values + types
- CSS variables in globals.css - Runtime source
- Components use standard Tailwind utilities

**Rationale:**

- Industry standard (Chakra, Shadcn, Radix)
- Single source of truth for values + types
- Tailwind purging works correctly
- Runtime theming possible

### Decision 2: CVA Pattern

**Status:** ✅ Decided

**Choice:** Three-variant CVA with state

- variant: { primary, secondary, danger, ghost }
- size: { sm, md, lg }
- state: { default, hover, active, disabled }

**Rationale:**

- Matches current Button/Card pattern
- Scalable for future variants
- Clear naming convention

### Decision 3: Component Organization

**Status:** ✅ Decided

**Choice:**

- Base components: `front/app/ui/base/`
- Pattern components: `front/app/ui/patterns/`
- Feature components: `front/app/ui/feature-name/`

---

## Implementation Progress

| Phase                         | Status  | Notes                           |
| ----------------------------- | ------- | ------------------------------- |
| Phase 1: Design Tokens        | ✅ Done | Created design-tokens.ts        |
| Phase 2: Base Components      | ✅ Done | All 9 components migrated       |
| Phase 3: Simplify globals.css | ✅ Done | Reduced from 1300 to ~250 lines |
| Phase 4: Page Components      | ✅ Done | Created patterns/               |
| Phase 5: Documentation        | ✅ Done | Updated ui-test page            |

---

## Usage Guide

### Using Design Tokens

```typescript
// Import specific tokens for type safety / autocomplete
import { colors, spacing, typography } from "@/lib/design-tokens";

// Or use standard Tailwind utilities
className = "bg-primary hover:bg-primary-hover";
```

### Creating New Components

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const myComponentVariants = cva("base classes", {
  variants: { ... },
  defaultVariants: { ... },
});

// Export component with proper types
```

---

## Notes for Future Sessions

- Current design: Purple (#9333ea) primary color
- Fonts: Space Grotesk (display), Funnel Sans (body)
- All CVA components use class-variance-authority
- Keep globals.css @theme - it powers Tailwind utilities
- Tokens file is documentation + types, NOT runtime

---

## Change Log

### 2026-04-14

**Phase 1: Design Tokens - Complete**

- Created `front/app/lib/design-tokens.ts`
- Exports: colors, typography, spacing, borderRadius, shadows, transitions, cssVar
- Type exports: ColorToken, SpacingToken, BorderRadiusToken, FontSizeToken, FontWeightToken
- Variant types: ColorVariant, SizeVariant, ChipVariant

**Phase 2: Base Components - Complete**

- Migrated all 9 components to full CVA pattern:
  - Button: Added state variant, inlined sizes, enhanced TypeScript
  - Card: Added state, proper types
  - TextField: Refactored state, added props (type, required, id)
  - Chip: Added size, state variants
  - Avatar: Added variant, state, proper types
  - Badge: Added state variant
  - StatCard: Added size, state variants
  - ProgressBar: Added size, state variants
  - Tabs: Added size, state variants

- All components now use consistent pattern:
  - variant: colors (primary, secondary, danger, ghost)
  - size: sm, md, lg
  - state: default, hover, active, disabled
- Updated `front/app/ui/base/index.ts` to re-export from design-tokens

**Phase 3: Simplify globals.css - Complete**

- Simplified globals.css from 1300 lines to ~250 lines
- Kept only: @theme variables, fonts, animations, grainient background, error utilities
- Moved component-specific styles to pattern components

**Phase 4: Page Component Patterns - Complete**

- Created `front/app/ui/patterns/` directory
- Created reusable pattern components:
  - Section.tsx: Reusable section container with variants
  - ListRow.tsx: Reusable list row with hover/border states
  - EmptyState.tsx: Empty state display
  - LoadingState.tsx: Loading states (spinner, skeleton, dots)

**Phase 5: Documentation - Complete**

- Updated `front/app/ui-test/page.tsx` with:
  - Added imports for pattern components
  - Fixed Button usage (removed font prop)
  - Added tests for Section, ListRow, EmptyState, LoadingState
- All components now tested and documented
