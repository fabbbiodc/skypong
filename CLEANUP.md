# Frontend Cleanup Plan

**Scope:** `front/` directory only
**Last Updated:** 2026-04-18

---

## Overview

This document tracks frontend cleanup work that is separate from token/CVA
refactoring.

**See also:** `FRONTREFACTOR.md` for the main refactoring roadmap.

---

## Completed Cleanup (2026-04-17)

### Phase A: Navigation Consolidation

- Migrated pages from legacy `NavigationAppUI` to `Navbar`:
  - `front/app/privacy/page.js`
  - `front/app/terms/page.js`
  - `front/app/updateme/page.js`
  - `front/app/[id]/page.js`
  - `front/app/game-mode/page.js`
  - `front/app/me/page.js`
  - `front/app/play/page.js`
- Removed legacy navigation component:
  - `front/app/ui/navigation-app-ui.js`
- Removed old logo wrapper component and inlined logo link in `Navbar`:
  - Removed `front/app/ui/skypong-logo.js`
  - Updated `front/app/ui/base/Navbar.tsx`

### Phase B: Page Container Patterns

- Added reusable page container patterns:
  - `front/app/ui/patterns/PageContainer.tsx`
  - `front/app/ui/patterns/PageContainerScrollable.tsx`
- Exported both patterns from:
  - `front/app/ui/patterns/index.ts`
- Replaced direct page container wrappers in migrated pages with new patterns.

### Phase C: Unused File Removal

Removed files with no remaining imports/usages:

- `front/app/ui/hero-ui.js`
- `front/app/ui/modal-mode-selector.js`
- `front/app/ui/player-achievements-public-ui.js`
- `front/app/ui/player-public-profile/player-achievements-ui.js`
- `front/app/ui/player-public-profile/player-single-achievement-ui.js`
- `front/app/lib/achivements/achivements.ts`

### Phase D: Legacy Duplicate Cleanup + Hook Cleanup

- Consolidated friend section implementation to TypeScript source and removed
  duplicate legacy files:
  - Removed `front/app/ui/player-public-profile/FriendsSection.jsx`
  - Removed `front/app/ui/player-public-profile/friend-list.ui.jsx`

- Replaced `use-styles` usage in play flow with a typed media-query hook:
  - Added `front/app/hooks/use-media-query.ts`
  - Updated `front/app/play/page.js` to use `useMediaQuery`
  - Removed `front/app/hooks/use-styles.ts`
  - Removed now-unused `front/app/lib/mobiledetection/detectMobile.ts`

### Phase E: Loader/Toast Migration

- Added a base toast component:
  - Added `front/app/ui/base/Toast.tsx`
  - Exported from `front/app/ui/base/index.ts`
- Migrated legacy toast entrypoint to re-export base toast:
  - Updated `front/app/ui/messaging/toast.js`
- Upgraded loader component to typed wrapper over `LoadingState`:
  - Updated `front/app/ui/loader/loader-ui.tsx`
- Fixed `LoadingState` skeleton color typing mismatch:
  - Updated `front/app/ui/patterns/LoadingState.tsx`

### Phase F: Build-Blocking TS Fixes

- Fixed schema usage in launch config:
  - Updated `front/app/lib/game/launch-config.ts`
  - Replaced incorrect `gameConfigSchema.parse(...)` calls with a concrete schema
    instance created via `createGameConfigSchema()`

- Fixed `ui-test` type errors:
  - Updated `front/app/ui-test/page.tsx`
  - Added required `onChange` handlers to static `Tabs` examples
  - Switched `EmptyState` children usage to `action` prop

### Phase G: Maintainability Pass (Architecture + Patterns)

- Fixed hook-rule violation in engine launch mapping:
  - Updated `front/app/lib/game/engine-launch-config.ts`
  - Removed hook usage from utility layer
  - `toEngineLaunchConfig` now accepts optional labels from callers
  - Updated caller in `front/app/ui/game-front/GameScreen.tsx`

- Consolidated translation access and removed polling duplication:
  - Updated `front/app/context/language-context.tsx` with typed locale and
    dictionary handling
  - Updated `front/app/hooks/use-translation.ts` to re-export context hook
  - Removed per-hook interval polling behavior

- Removed unused legacy UI files:
  - `front/app/ui/navigation-language-ui.js`
  - `front/app/ui/play-button-ui.js`
  - `front/app/ui/player-profile-public-ui.js`
  - `front/app/ui/player-stats-public-ui.js`

- Completed wrapper deprecation for loader/toast:
  - Updated remaining imports to base/pattern components directly
  - Removed `front/app/ui/loader/loader-ui.tsx`
  - Removed `front/app/ui/messaging/toast.js`

- Added reusable layout/pattern components to replace ad-hoc class dependencies:
  - Added `front/app/ui/patterns/ContentContainer.tsx`
  - Added `front/app/ui/patterns/LegalContent.tsx`
  - Added `front/app/ui/patterns/FormCard.tsx`
  - Added `front/app/ui/patterns/ProfileLayout.tsx`
  - Exported all from `front/app/ui/patterns/index.ts`

- Migrated pages/components to new readable patterns and removed legacy class-name coupling:
  - Updated `front/app/privacy/page.js`
  - Updated `front/app/terms/page.js`
  - Updated `front/app/game-mode/page.js`
  - Updated `front/app/updateme/page.js`
  - Updated `front/app/me/page.js`
  - Updated `front/app/[id]/page.js`
  - Updated `front/app/login/page.js`
  - Updated `front/app/signup/page.js`
  - Updated `front/app/play/page.js`
  - Updated `front/app/ui/player-public-profile/player-info-ui.tsx`
  - Updated `front/app/ui/player-public-profile/GameHistory.tsx`
  - Updated `front/app/ui/player-public-profile/FriendsSection.tsx`
  - Updated `front/app/ui/player-public-profile/AddFriendButton.jsx`
  - Updated `front/app/ui/Leaderboard.tsx`

- Consolidated footer usage to base component and removed legacy footer file:
  - Updated pages to use `Footer` from `front/app/ui/base/Footer.tsx`
  - Removed `front/app/ui/footer-terms-policy.js`

- Removed unused alternative background implementation:
  - Removed `front/app/ui/base/GrainientBackground.tsx`

---

## Remaining Cleanup Tasks

1. **Optional TypeScript hardening**
   - Replace remaining `any` usage in feature modules and i18n schema builders

2. **Optional i18n parity hardening**
   - Align locale dictionary shape (`en`, `es`, `it`) for strict typed translation keys

3. **Optional page refactor**
   - Convert remaining JS pages/components to TS for consistency in typed UI layer

---

## CSS Cleanup Notes

Do **not** remove these classes yet; they are in active use:

- `.game-row`
- `.leaderboard-row`
- `.friend-row`
- `.btn-sm`, `.btn-md`, `.btn-lg`
- `.page-content-container`

`PageContainerScrollable` now composes existing container behavior with
`overflow-y-auto` and does not require a separate
`.page-content-container-scrollable` CSS class.

---

## Verification Commands

```bash
# Ensure deleted legacy components are no longer imported
grep -R "navigation-app-ui\|hero-ui\|modal-mode-selector\|player-achievements-public-ui" front/app --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"

# Ensure new pattern components are used
grep -R "PageContainer\|PageContainerScrollable" front/app --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"

# Build validation (frontend)
cd front && npm exec next build -- --webpack
```

---

## Current Build Status

- `npm exec tsc -- --noEmit` passes.
- `npm exec next build -- --webpack` passes.
