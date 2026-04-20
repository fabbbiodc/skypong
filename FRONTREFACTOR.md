# Frontend Refactoring Plan

## Scope

**This document applies ONLY to the `front/` directory.**

All paths and references in this document are relative to `front/`. The project root is `../` from the perspective of this document.

**Last Updated:** 2026-04-20 (updated with UI refinements and theme changes)

---

## Maintenance Note

**IMPORTANT:** This document must be updated after EVERY change to the codebase. Before ending a coding session, ensure all changes are documented here.

- New components created
- Changes to existing components
- New decisions made
- Bugs found and workarounds
- Anything deviating from the plan

**Related:** See `CLEANUP.md` for cleanup tasks separate from the main refactoring plan.

## Goals

1. **Single Source of Truth** for design tokens/variables
2. **Full Design System** with consistent CVA patterns
3. **Consolidated Page Components** to reduce duplication
4. **Background tokens** - Unified background system for containers
5. **Shadow tokens** - Unified shadow system for containers

---

## Current State

### Architecture Issues Identified

- **1300-line globals.css** - Design tokens mixed with component-specific styles
- **Inconsistent CVA** - Only Button/Card use class-variance-authority; others have ad-hoc styling
- **No TypeScript tokens** - Colors/spacing scattered in CSS only
- **Duplication** - Similar patterns (hover, borders, shadows) repeated across components
- **Page component duplication** - GameHistory, FriendsSection, AchievementsSection have repeated patterns
- **Hardcoded backgrounds** - Container components use hardcoded bg-white instead of tokens

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

| Phase                         | Status     | Notes                                |
| ----------------------------- | ---------- | ------------------------------------ |
| Phase 1: Design Tokens        | ✅ Done    | Created design-tokens.ts             |
| Phase 2: Base Components      | ✅ Done    | All 9 components migrated            |
| Phase 3: Simplify globals.css | ✅ Done    | Reduced from 1300 to ~250 lines      |
| Phase 4: Page Components      | ✅ Done    | Created patterns/                    |
| Phase 5: Documentation        | ✅ Done    | Updated ui-test page                 |
| Phase 6: Background Tokens    | ✅ Done    | Added backgrounds, CVA use           |
| Phase 7: Shadow Tokens        | ⏳ Pending | Add shadow tokens, update components |

---

## Background Token System

### Decision 4: Background Variants

**Status:** ✅ Decided

**Choice:** Unified background system using design-tokens

- All container components use `backgrounds` from `design-tokens.ts`
- Available variants: `main` (white), `transparent`, `primary`
- Components can be used with different backgrounds via prop

**Implementation:**

```typescript
// design-tokens.ts
export const backgrounds = {
  main: "bg-white",
  transparent: "bg-transparent",
  primary: "bg-primary",
} as const;

export type BackgroundToken = keyof typeof backgrounds;
```

**Components updated:**

| Component | Status  |
| --------- | ------- |
| Navbar    | ✅ Done |
| Card      | Pending |
| Section   | Pending |
| Footer    | Pending |
| Hero      | Pending |

---

## Shadow Token System

### Decision 5: Shadow Variants

**Status:** ⏳ In Progress

**Choice:** Unified shadow system using design-tokens

- Components use `shadows` from design-tokens.ts (CVA-compatible classes)
- Available variants: sm, md, lg, xl, none
- Note: Separate from CSS variable shadows (for box-shadow property)

**Implementation:**

```typescript
// design-tokens.ts - CVA shadow tokens
export const shadowClasses = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  none: "shadow-none",
} as const;

export type ShadowClassToken = keyof typeof shadowClasses;
```

**Files using hardcoded shadows:**

| File                 | Line | Current Value                          |
| -------------------- | ---- | -------------------------------------- |
| `Card.tsx`           | 9    | `shadow-md hover:shadow-lg` (elevated) |
| `Navbar.tsx`         | 143  | `shadow-lg` (dropdown)                 |
| `StatCard.tsx`       | 24   | `shadow-lg` (featured)                 |
| `Tabs.tsx`           | 70   | `shadow-sm`                            |
| `Section.tsx`        | 10   | `shadow-md` (elevated)                 |
| `ListRow.tsx`        | 23   | `hover:shadow-md`                      |
| `global-chat-ui.tsx` | 154  | `shadow-lg hover:shadow-xl`            |
| `global-chat-ui.tsx` | 166  | `shadow-2xl`                           |

**Components to update:**

| Component         | Status  |
| ----------------- | ------- |
| Card              | Pending |
| Navbar (dropdown) | Pending |
| StatCard          | Pending |
| Tabs              | Pending |
| Section           | Pending |
| ListRow           | Pending |
| global-chat-ui    | Pending |

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
- Homepage now uses new base components: Navbar, Footer, Hero, LanguageSelector
- Navbar has built-in auth state handling and dropdown menu
- Hero uses rainbowtext class for animated gradient title
- Background tokens added: `backgrounds.main`, `backgrounds.transparent`, `backgrounds.primary`
- Shadow tokens added: `shadowClasses.sm`, `shadowClasses.md`, `shadowClasses.lg`, `shadowClasses.xl`, `shadowClasses.none`

### Next Session TODO

1. **Page Token Migration**: Completed. All pages now use `mainContainers` tokens with proper navbar offset.

2. **Navbar**: Simplified to fix desktop dropdown. Keep as-is for now (working).

3. **Import path**: Use `@/lib/design-tokens` (not `@lib/design-tokens`)

4. **Frontend Cleanup**: See `CLEANUP.md` for detailed cleanup tasks:
   - Convert remaining JS pages to TSX
   - Fix any remaining TypeScript errors

**See also:** `CLEANUP.md` for detailed cleanup instructions

---

## Change Log

### 2026-04-20

**Design Token System + Page Unification**

- Added `mainContainers` token object to `design-tokens.ts` with navbar-aware layouts:
  - `centeredLayout`: For pages with vertically centered content
  - `topLayout`: For pages with centered content starting below navbar
  - `scrollableLayout`: For pages with scrollable content (profiles, settings)
  - All layouts include `pt-[70px]` padding to account for fixed navbar

- Added new component tokens:
  - `authPages`: Login/signup page styling tokens
  - `profilePages`: Profile page styling tokens  
  - `gameModePages`: Game mode page styling tokens
  - `settingsPages`: Settings/update page styling tokens
  - `legalPages`: Privacy/terms page styling tokens
  - Type exports: `MainContainersToken`, `AuthPagesToken`, etc.

- Migrated pages to unified token-based layout:
  - `/login/page.js` - Uses `mainContainers.topLayout`
  - `/signup/page.js` - Uses `mainContainers.topLayout`
  - `/me/page.js` - Uses `mainContainers.scrollableLayout`
  - `/[id]/page.js` - Uses `mainContainers.scrollableLayout`
  - `/updateme/page.js` - Uses `mainContainers.scrollableLayout`
  - `/game-mode/page.js` - Uses `mainContainers.centeredLayout`
  - `/privacy/page.js` - Uses `mainContainers.centeredLayout`
  - `/terms/page.js` - Uses `mainContainers.centeredLayout`

- Navbar dropdown fix:
  - Reverted to simplified design (mobile menu removed) to fix desktop dropdown button behavior
  - Kept pill styling: `fixed top-4 left-4 right-4 rounded-full shadow-lg`
  - Added `z-[60]` to dropdown for proper stacking above navbar

- All pages now consistent:
  - Content starts below navbar (no overlap)
  - Uses unified token imports
  - Single source of truth for layout/spacing

### 2026-04-17

**Cleanup integration + page container patterns**

- Added new pattern components:
  - `front/app/ui/patterns/PageContainer.tsx`
  - `front/app/ui/patterns/PageContainerScrollable.tsx`
- Updated `front/app/ui/patterns/index.ts` to export both new patterns.

- Migrated pages to the base `Navbar` and removed `NavigationAppUI` usage:
  - `front/app/privacy/page.js`
  - `front/app/terms/page.js`
  - `front/app/updateme/page.js`
  - `front/app/[id]/page.js`
  - `front/app/game-mode/page.js`
  - `front/app/me/page.js`
  - `front/app/play/page.js`

- Updated `front/app/ui/base/Navbar.tsx` to render logo link directly and removed
  dependency on `ui/skypong-logo.js`.

- Removed legacy, unused frontend files:
  - `front/app/ui/navigation-app-ui.js`
  - `front/app/ui/skypong-logo.js`
  - `front/app/ui/hero-ui.js`
  - `front/app/ui/modal-mode-selector.js`
  - `front/app/ui/player-achievements-public-ui.js`
  - `front/app/ui/player-public-profile/player-achievements-ui.js`
  - `front/app/ui/player-public-profile/player-single-achievement-ui.js`
  - `front/app/lib/achivements/achivements.ts`

**Validation notes (updated):**

- `npm exec tsc -- --noEmit` now passes.
- `npm exec next build -- --webpack` now passes.

**Follow-up cleanup + typing fixes (same session):**

- Removed duplicate/legacy public profile files and kept TS implementation:
  - `front/app/ui/player-public-profile/FriendsSection.jsx`
  - `front/app/ui/player-public-profile/friend-list.ui.jsx`

- Replaced old style detection hook with typed media-query hook:
  - Added `front/app/hooks/use-media-query.ts`
  - Updated `front/app/play/page.js` to use `useMediaQuery`
  - Removed `front/app/hooks/use-styles.ts`
  - Removed `front/app/lib/mobiledetection/detectMobile.ts`

- Migrated loader/toast toward base design system:
  - Added `front/app/ui/base/Toast.tsx`
  - Exported toast from `front/app/ui/base/index.ts`
  - Updated `front/app/ui/messaging/toast.js` to re-export base `Toast`
  - Updated `front/app/ui/loader/loader-ui.tsx` to wrap `LoadingState`

- Fixed the previously reported TS blockers:
  - `front/app/lib/game/launch-config.ts` (schema parse usage)
  - `front/app/ui/patterns/LoadingState.tsx` (skeleton color type narrowing)
  - `front/app/ui-test/page.tsx` (required `Tabs.onChange`, `EmptyState.action`)
  - `front/app/canvas/page.tsx` and `front/app/play/page.js`
    (`useSearchParams` pre-render build constraints)
  - `front/app/ui/game-front/GameLauncher.tsx`
    (`useSearchParams` pre-render build constraints)

**Maintainability architecture pass (clear/readable foundation):**

- Fixed utility-layer hook misuse:
  - `front/app/lib/game/engine-launch-config.ts` no longer uses hooks
  - `toEngineLaunchConfig` now accepts label overrides from UI layer
  - `front/app/ui/game-front/GameScreen.tsx` passes translated labels

- Consolidated translation access pattern:
  - `front/app/context/language-context.tsx` now provides typed locale context
  - `front/app/hooks/use-translation.ts` now re-exports context hook
  - Removed duplicated polling behavior from hook implementation

- Expanded reusable UI patterns for page composition:
  - Added `ContentContainer`, `LegalContent`, `FormCard`, and `ProfileLayout`
    patterns under `front/app/ui/patterns/`
  - Updated `front/app/ui/patterns/index.ts` exports

- Replaced legacy class-coupled page layouts with pattern components:
  - Updated auth, profile, legal, and game-mode/play pages to use pattern primitives
  - Updated profile feature components (`player-info`, `GameHistory`, `FriendsSection`,
    `AddFriendButton`, `Leaderboard`) to use explicit utility/pattern structure

- Removed additional dead/legacy files:
  - `front/app/ui/navigation-language-ui.js`
  - `front/app/ui/play-button-ui.js`
  - `front/app/ui/player-profile-public-ui.js`
  - `front/app/ui/player-stats-public-ui.js`
  - `front/app/ui/footer-terms-policy.js`
  - `front/app/ui/loader/loader-ui.tsx`
  - `front/app/ui/messaging/toast.js`
  - `front/app/ui/base/GrainientBackground.tsx`

**Strict typing hardening pass:**

- Added shared translation type export module:
  - `front/app/lib/types/translation.ts`

- Typed translation context exports and consumers:
  - `front/app/context/language-context.tsx`

- Updated schema utilities to typed translation input:
  - `front/app/lib/form-validation/auth.ts`
  - `front/app/lib/form-validation/player-data.ts`
  - `front/app/lib/game/launch-config.ts`

- Reworked `TextField` register typing to generic `react-hook-form` types:
  - `front/app/ui/base/TextField.tsx`

- Added explicit domain typing in profile feature modules:
  - `front/app/ui/player-public-profile/AchievementsSection.tsx`
  - `front/app/ui/player-public-profile/FriendsSection.tsx`
  - `front/app/lib/players/check-player-status.ts`

- Updated demo/test page typing:
  - `front/app/ui-test/page.tsx`

- Validation: `npm exec tsc -- --noEmit` and
  `npm exec next build -- --webpack` both pass after strict typing updates.

**i18n parity + locale typing hardening (continuation):**

- Verified locale dictionary key parity across:
  - `front/app/lib/i18n/locales/en.ts`
  - `front/app/lib/i18n/locales/es.ts`
  - `front/app/lib/i18n/locales/it.ts`

- Fixed missing locale key mismatch discovered by strict dictionary check:
  - Added `profile.leaderboard.player` to `front/app/lib/i18n/locales/es.ts`

- Centralized locale definitions in new module:
  - Added `front/app/lib/i18n/types.ts`
  - Exports `SUPPORTED_LOCALES`, `Locale`, `DEFAULT_LOCALE`, `isLocale`

- Hardened locale manager typing and validation:
  - Updated `front/app/lib/i18n/locale-manager.ts`
  - `getCurrentLocale()` returns validated `Locale`
  - `setCurrentLocale()` accepts `Locale`

- Removed dictionary cast fallbacks from context by using structural validation:
  - Updated `front/app/context/language-context.tsx`
  - Dictionaries now use `satisfies Record<Locale, TranslationDictionary>`

- Decoupled translation type exports from context module:
  - Updated `front/app/lib/types/translation.ts`
  - `TranslationDictionary` now derives from `locales/en.ts`
  - `Locale` re-exported from `lib/i18n/types.ts`

- Cleaned known invalid/legacy translation key usage patterns:
  - `front/app/login/page.js`
    - `t.form.userNotRegistered` -> `t.form.errors.userNotRegistered`
    - `t?.loading?.loading` -> `t.common.loading`
  - `front/app/signup/page.js`
    - `t?.loading?.loading` -> `t.common.loading`
  - `front/app/ui/player-private-profile/avatar-ui.js`
    - `invalidFormat` -> `invalidImageFormat`
  - `front/app/ui/player-private-profile/player-ui.js`
    - `conectionError` -> `connectionError`
  - `front/app/ui/player-private-profile/player-credentials-ui.js`
    - `conectionError` -> `connectionError`

- Removed locale cast in language selector with typed language options:
  - Updated `front/app/ui/base/LanguageSelector.tsx`

- Validation rerun:
  - `npm exec tsc -- --noEmit` passes
  - `npm exec next build -- --webpack` passes

**Private profile TS migration + import consistency (continuation):**

- Migrated remaining private-profile UI modules from JS to TSX:
  - `front/app/ui/player-private-profile/avatar-ui.tsx`
  - `front/app/ui/player-private-profile/player-ui.tsx`
  - `front/app/ui/player-private-profile/player-credentials-ui.tsx`
  - `front/app/ui/player-private-profile/player-delete-account-ui.tsx`

- Removed replaced JS modules:
  - `front/app/ui/player-private-profile/avatar-ui.js`
  - `front/app/ui/player-private-profile/player-ui.js`
  - `front/app/ui/player-private-profile/player-credentials-ui.js`
  - `front/app/ui/player-private-profile/player-delete-account-ui.js`

- Added typed interfaces for private profile data flow:
  - profile fetch/update payload typing in `player-ui.tsx`
  - password form + error payload typing in `player-credentials-ui.tsx`
  - migrated components now consume typed `useAuth()` without local casts

- Normalized translation hook import paths across UI/pages:
  - switched remaining direct `context/language-context` consumers to
    `hooks/use-translation` (except intentional provider/re-export modules)

- Added locale parity guardrail script:
  - Added `front/specs/check-locales-parity.mjs`
  - Added npm script in `front/package.json`:
    - `check:locales`
  - Script verifies key-path existence and type-kind parity across
    `en/es/it` dictionaries and exits non-zero on mismatch

- Validation rerun after migration:
  - `npm run check:locales` passes
  - `npm exec tsc -- --noEmit` passes
  - `npm exec next build -- --webpack` passes

**Auth context typing hardening (continuation):**

- Refactored `front/app/context/auth-context.tsx` to explicit context typing:
  - Added `AuthUser` and `AuthContextValue` exports
  - Typed `AuthContext` as `AuthContextValue | undefined`
  - `useAuth()` now throws outside provider scope

- Added response-shape guards for profile identity extraction:
  - Added `isObject`, `isAuthUser`, and `extractAuthUser`
  - Handles `/api/profile/me` payloads robustly (direct user or nested `user`)

- Cleaned auth context internals:
  - Centralized CSRF token read with `getCsrfToken()` helper
  - Replaced route arrays with `SIGN_ROUTES` / `PRIVATE_ROUTES` sets

- Updated logout behavior contract:
  - Provider clears auth state and refreshes router cache
  - Navigation after logout is handled by caller components

- Removed temporary `useAuth` casting from private-profile TSX modules:
  - `front/app/ui/player-private-profile/avatar-ui.tsx`
  - `front/app/ui/player-private-profile/player-ui.tsx`
  - `front/app/ui/player-private-profile/player-credentials-ui.tsx`
  - `front/app/ui/player-private-profile/player-delete-account-ui.tsx`

- Validation rerun after auth-context hardening:
  - `npm exec tsc -- --noEmit` passes
  - `npm exec next build -- --webpack` passes

---

### 2026-04-16 (continued)

**Phase 6: Background Token System**

- Added `backgrounds` export to `design-tokens.ts`:
  - `main`: "bg-white" (main container background)
  - `transparent`: "bg-transparent"
  - `primary`: "bg-primary"
  - Added `BackgroundToken` type export

- Updated Navbar.tsx to use design-tokens:
  - Import `backgrounds` from `@lib/design-tokens`
  - Add `background` variant to CVA
  - Props accept `background?: "main" | "transparent"`
  - Default to `"main"`

**Bug fixes:**

- Fixed Navbar props type (was `white | transparent`, should be `"main" | "transparent"`)
- Fixed hardcoded `"white"` in CVA usage (now uses prop)

**Phase 7: Shadow Tokens (In Progress)**

- Added CVA-compatible shadow classes to design-tokens.ts:
  - `sm`: "shadow-sm"
  - `md`: "shadow-md"
  - `lg`: "shadow-lg"
  - `xl`: "shadow-xl"
  - `none`: "shadow-none"
  - Added `ShadowClassToken` type export

- Components using hardcoded shadows identified (see Shadow Token System section)

### 2026-04-16

**Phase 1b: Fix Broken CSS**

- Added missing CSS classes to globals.css:
  - `.rainbowtext` - Animated gradient title (migrated from main)
  - `.skypong-logo` - Logo component styles (migrated from main)
  - `@keyframes rainbow-shift` - Animation for rainbow text

**Phase 2b: New Base Components - Complete**

- Created 5 new CVA-based components in `front/app/ui/base/`:
  - `Navbar.tsx`: Navigation with auth state, scroll behavior, dropdown menu
  - `Footer.tsx`: Reusable footer with customizable links
  - `Hero.tsx`: Hero section with title and play button
  - `LanguageSelector.tsx`: Language switcher with active state

- All new components follow CVA pattern with:
  - variant/size props for flexibility
  - TypeScript types for autocomplete
  - Proper accessibility attributes

**Phase 4b: Homepage Redesign - Complete**

- Refactored `front/app/page.js`:
  - Replaced old components with new CVA-based ones
  - Simplified layout, uses new Navbar, Footer, Hero, LanguageSelector
  - Added responsive styling inline

- New imports in base/index.ts:
  - Navbar, Footer, Hero, LanguageSelector

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

### 2026-04-20 (continuation)

**Game Scene Background Integration**

- Replaced animated gradient background with rotating Babylon.js skybox:
  - Created `front/app/ui/GameSceneBackground.tsx` - Main component with EXR cubemap rendering
  - Created `front/app/ui/GameSceneBackgroundConfig.ts` - Configuration constants
  - Symlinked `front/public/environment/dramatic-sky1.exr` → `game/client/public/environment/dramatic-sky1.exr`
  - Updated `front/app/layout.js` to import and render `GameSceneBackground`
  - Updated `front/app/globals.css` with new `.game-scene-bg-wrapper` and `.game-scene-bg-container` styling

- Features implemented:
  - Slowly rotating skybox (~1 full rotation per 100 seconds)
  - Babylon.js NullEngine equivalent rendering (minimal setup)
  - Async EXR texture loading with 3-second timeout
  - Proper resource disposal on component unmount
  - Fallback color (#191919) if texture fails
  - Responsive to window resize via ResizeObserver
  - Full TypeScript support with proper types

- Dependencies added:
  - `@babylonjs/core@^8.48.0` (already used in game client)

- Validation:
  - `npm exec tsc -- --noEmit` passes
  - `npm exec next build -- --webpack` passes
  - No bundle size impact increase (Babylon.js already compiled)
