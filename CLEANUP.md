# Frontend Cleanup Plan

**Scope:** `front/` directory only
**Last Updated:** 2026-04-20 (comprehensive updates)

---

## Overview

This document tracks frontend cleanup work that is separate from token/CVA
refactoring.

**See also:** `FRONTREFACTOR.md` for the main refactoring roadmap.

---

## Completed Cleanup

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

### Phase H: Strict Typing Pass (2026-04-18)

- Removed remaining `any` usage from TypeScript files in active frontend code paths.

- Added shared translation type export:
  - Added `front/app/lib/types/translation.ts`
  - Updated context exports in `front/app/context/language-context.tsx`

- Typed validation schema builders with `TranslationDictionary`:
  - Updated `front/app/lib/form-validation/auth.ts`
  - Updated `front/app/lib/form-validation/player-data.ts`
  - Updated `front/app/lib/game/launch-config.ts`

- Improved form component typing:
  - Updated `front/app/ui/base/TextField.tsx`
  - Replaced untyped `register` prop with generic `react-hook-form` types

- Added explicit achievement and stats typing:
  - Updated `front/app/ui/player-public-profile/AchievementsSection.tsx`

- Removed `any` from friends service flow and added typed helper wrappers:
  - Updated `front/app/ui/player-public-profile/FriendsSection.tsx`

- Hardened player status helper against unknown input shape:
  - Updated `front/app/lib/players/check-player-status.ts`

- Updated UI test form typing:
  - Updated `front/app/ui-test/page.tsx`

### Phase I: i18n Parity + Locale Typing Hardening (2026-04-18)

- Verified full key-shape parity across locale dictionaries:
  - Audited `front/app/lib/i18n/locales/en.ts`
  - Audited `front/app/lib/i18n/locales/es.ts`
  - Audited `front/app/lib/i18n/locales/it.ts`
  - Added missing key in Spanish dictionary:
    - `front/app/lib/i18n/locales/es.ts` (`profile.leaderboard.player`)

- Centralized locale typing to remove stringly-typed language plumbing:
  - Added `front/app/lib/i18n/types.ts`
    - `SUPPORTED_LOCALES`
    - `Locale`
    - `DEFAULT_LOCALE`
    - `isLocale`

- Hardened locale manager API to typed locale I/O:
  - Updated `front/app/lib/i18n/locale-manager.ts`
  - `getCurrentLocale()` now returns `Locale` with cookie validation fallback
  - `setCurrentLocale()` now accepts `Locale`

- Removed translation dictionary cast fallbacks from context:
  - Updated `front/app/context/language-context.tsx`
  - Dictionaries now use `satisfies Record<Locale, TranslationDictionary>`

- Decoupled shared translation types from React context module:
  - Updated `front/app/lib/types/translation.ts`
  - `TranslationDictionary` now derives from `locales/en.ts`
  - `Locale` now re-exported from `lib/i18n/types.ts`

- Tightened direct translation key usage in JS pages/components:
  - Updated `front/app/login/page.js`
    - `t.form.userNotRegistered` -> `t.form.errors.userNotRegistered`
    - `t?.loading?.loading` -> `t.common.loading`
  - Updated `front/app/signup/page.js`
    - `t?.loading?.loading` -> `t.common.loading`
  - Updated `front/app/ui/player-private-profile/avatar-ui.js`
    - `invalidFormat` -> `invalidImageFormat`
    - removed optional-chain fallback access for known keys
  - Updated `front/app/ui/player-private-profile/player-ui.js`
    - `conectionError` -> `connectionError`
    - removed optional-chain fallback access for known keys
  - Updated `front/app/ui/player-private-profile/player-credentials-ui.js`
    - `conectionError` -> `connectionError`
    - removed optional-chain fallback access for known keys

- Removed unnecessary locale cast in language selector:
  - Updated `front/app/ui/base/LanguageSelector.tsx`
  - Typed language list with `Locale` and removed inline union assertion

### Phase J: Private Profile TS Migration + i18n Guardrails (2026-04-20)

- Migrated remaining private profile JS modules to TSX:
  - `front/app/ui/player-private-profile/avatar-ui.tsx`
  - `front/app/ui/player-private-profile/player-ui.tsx`
  - `front/app/ui/player-private-profile/player-credentials-ui.tsx`
  - `front/app/ui/player-private-profile/player-delete-account-ui.tsx`

- Removed legacy JS counterparts:
  - `front/app/ui/player-private-profile/avatar-ui.js`
  - `front/app/ui/player-private-profile/player-ui.js`
  - `front/app/ui/player-private-profile/player-credentials-ui.js`
  - `front/app/ui/player-private-profile/player-delete-account-ui.js`

- Typed key private-profile flows:
  - Added explicit form/request/response interfaces for profile update and
    password update flows
  - Normalized auth context usage in private profile flows
  - Fixed avatar upload error mapping with status-based handling and improved
    upload error fallback

- Normalized translation hook import path usage:
  - Replaced direct `context/language-context` imports with
    `hooks/use-translation` in active UI/page modules
  - Remaining direct context imports are intentional (`layout.js` provider +
    `hooks/use-translation.ts` re-export)

- Added automated locale parity verification command:
  - Added `front/specs/check-locales-parity.mjs`
  - Added npm script `check:locales` in `front/package.json`
  - Verified script output:
    - `[ok] Locale dictionaries are in parity (en, es, it)`

### Phase K: Auth Context Typing Hardening (2026-04-20)

- Refactored auth context to explicit typed API:
  - Updated `front/app/context/auth-context.tsx`
  - Added exported `AuthUser` and `AuthContextValue` interfaces
  - Typed context as `AuthContextValue | undefined`
  - `useAuth()` now throws if used outside `AuthProvider`

- Hardened current-user extraction from profile API response:
  - Added object/type guards and `extractAuthUser` to normalize
    `/api/profile/me` responses
  - Supports both direct user payload and nested `{ user: ... }` payload

- Consolidated auth utility internals:
  - Added shared `getCsrfToken()` helper in context
  - Replaced route arrays with `SIGN_ROUTES` / `PRIVATE_ROUTES` sets

- Updated logout behavior in provider:
  - Clears auth state and refreshes router cache in context
  - Route navigation after logout is now handled by calling components

- Removed temporary auth-context casts from private profile TSX modules:
  - Updated `front/app/ui/player-private-profile/avatar-ui.tsx`
  - Updated `front/app/ui/player-private-profile/player-ui.tsx`
  - Updated `front/app/ui/player-private-profile/player-credentials-ui.tsx`
  - Updated `front/app/ui/player-private-profile/player-delete-account-ui.tsx`

### Phase L: Design Token System + Page Unification (2026-04-20)

- Added `mainContainers` token object with 3 layout variants:
  - `centeredLayout`: Vertically centered content
  - `topLayout`: Centered content in available space 
  - `scrollableLayout`: Scrollable content with items-start
  - All include `pt-[70px]` for navbar offset

- Added page-specific tokens:
  - `authPages`, `profilePages`, `gameModePages`, `settingsPages`, `legalPages`

- Migrated all pages to use unified `mainContainers` tokens:
  - `/login/page.js`
  - `/signup/page.js` 
  - `/me/page.js`
  - `/[id]/page.js`
  - `/updateme/page.js`
  - `/game-mode/page.js`
  - `/privacy/page.js`
  - `/terms/page.js`

- Fixed Navbar:
  - Reverted to simplified design (desktop-only dropdown)
  - Kept pill styling
  - Added `z-[60]` to dropdown container
  - Dropdown buttons now work consistently

- Validation: TypeScript passes, all pages use `mainContainers` tokens

---

## Phase M: Game Scene Background Integration (2026-04-20)

- Replaced animated gradient background with game scene skybox:
  - Created `GameSceneBackground.tsx` component using Babylon.js
  - Created `GameSceneBackgroundConfig.ts` with rotation settings
  - Symlinked EXR cubemap from `game/client/public/` for asset sharing
  - Updated `layout.js` to render new background component
  - Added CSS styling for `.game-scene-bg-wrapper` and `.game-scene-bg-container`

- Component features:
  - Slowly rotating skybox (very subtle, ~100 seconds per rotation)
  - Async EXR texture loading with fallback
  - Proper Babylon.js resource cleanup on unmount
  - Responsive canvas sizing with ResizeObserver
  - Full TypeScript support

- Validation:
  - `npm exec tsc -- --noEmit` passes
  - `npm exec next build -- --webpack` passes

---

## Phase N: Theme Updates - Dark Mode (2026-04-20)

- Updated all design tokens to dark theme with slate colors:
  - Primary color: `#475569` (slate) instead of purple
  - Text colors brightened throughout
  - Container backgrounds: transparent
  - Subtle slate backgrounds for interactive elements

- Updated `design-tokens.ts`:
  - `text.secondary`: `#e2e8f0` → `#f1f5f9`
  - `text.muted`: `#cbd5e1` → `#e2e8f0`
  - `text.link`: `#94a3b8` → `#cbd5e1`
  - Border colors brightened
  - Chip backgrounds: `#334155` → `#475569`
  - Input backgrounds updated for visibility

- Updated `globals.css`:
  - Increased row background opacity: `0.15` → `0.3`
  - Increased hover opacity: `0.25` → `0.45`
  - Text color updated: `#e2e8f0` → `#f1f5f9`

---

## Phase O: Navbar & Dropdown Fixes (2026-04-20)

- Added `bg-slate-800/20` background to dropdown container
- Changed button text centering: `justify-start` → `justify-center`
- Increased dropdown sizing: `w-48` → `w-52`, `py-2` → `py-3`
- Increased button gap: `gap-1` → `gap-2`

---

## Phase P: Content Clipping Fix (2026-04-20)

- Removed `overflow-y-auto` from `PageContainerScrollable`
- Updated `.page-content-container` CSS:
  - Changed `height: 70vh` → `height: auto`
  - Changed `justify-content: center` → `justify-content: flex-start`
  - Changed `overflow-y: auto` → `overflow-y: visible`

- Updated `design-tokens.ts`:
  - Changed `scrollableLayout` to use `flex-col` instead of `flex-1`
  - Increased contentArea padding: `pt-[70px]` → `pt-[120px]`

---

## Phase Q: Winphrase Removal (2026-04-20)

- Removed from all frontend components and validation:
  - `player-ui.tsx`: Form field, interface, submission
  - `player-info-ui.tsx`: Profile display
  - `auth-context.tsx`: User interface
  - `player-data.ts`: Validation schema
  - Translation files (en.ts, es.ts, it.ts)

---

## Phase R: Auth Pages Navbar (2026-04-20)

- Added Navbar to `/login/page.js`
- Added Navbar to `/signup/page.js`
- Removed duplicate logo sections from both pages

---

## Phase S: Game Client UI Update (2026-04-20)

- Updated `game/client/src_cli/config/GUIStyles.ts`:
  - Changed button background: `#9333ea` → `#475569`

---

## Phase T: Branding Updates (2026-04-20)

- Updated page title in `layout.js`: "Transcendence" → "SkyPong"
- Updated favicon colors in both front/ and game/client/:
  - Changed: `#9333ea` → `#475569`

---

## Phase U: Hero Section Update (2026-04-20)

- Removed `rainbowtext` animated gradient effect from Hero.tsx
- Changed to `text-white opacity-50` for transparency

---

## Phase V: Match History Link Styling (2026-04-20)

- Updated `GameHistory.tsx`:
  - Changed link color: `text-primary` → `text-slate-200`
  - Added underline for clickability

---

## Remaining Cleanup Tasks

1. **Optional page refactor**
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

# Locale dictionary parity
cd front && npm run check:locales
```

---

## Current Build Status

- `npm exec tsc -- --noEmit` passes.
- `npm exec next build -- --webpack` passes.
