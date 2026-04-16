# Frontend Cleanup Plan

**Scope:** `front/` directory only
**Last Updated:** 2026-04-16

---

## Overview

This document outlines unused files, duplicate components, and broken code that should be cleaned up to improve maintainability and reduce confusion.

**See also:** `FRONTREFACTOR.md` for the main refactoring plan.

---

## Phase 1: Remove Unused Files

### Files Confirmed Unused (Safe to Delete)

| File                                                                 | Reason                                                   |
| -------------------------------------------------------------------- | -------------------------------------------------------- |
| `front/app/hooks/use-styles.ts`                                      | Only imported by 2 components that are themselves unused |
| `front/app/ui/player-public-profile/player-achievements-ui.js`       | Never imported anywhere in codebase                      |
| `front/app/ui/player-public-profile/player-single-achievement-ui.js` | Never imported anywhere in codebase                      |
| `front/app/lib/achivements/achivements.ts`                           | No imports found anywhere                                |

### Verification

```bash
# Verify use-styles is unused before deleting
grep -r "use-styles" front/app --include="*.tsx" --include="*.js" | grep -v "node_modules"

# Verify player-achievements-ui is unused before deleting
grep -r "player-achievements-ui\|player-single-achievement" front/app --include="*.tsx" --include="*.js" | grep -v "node_modules"
```

---

## Phase 2: Consolidate Duplicate Components

### Old Components to Remove (Replace with new CVA versions)

| Old File                  | New Replacement           | Pages to Update                                     |
| ------------------------- | ------------------------- | --------------------------------------------------- |
| `ui/navigation-app-ui.js` | `ui/base/Navbar.tsx`      | privacy, terms, updateme, [id], game-mode, me, play |
| `ui/hero-ui.js`           | `ui/base/Hero.tsx`        | page.js                                             |
| `ui/skypong-logo.js`      | Use Navbar with logo prop | (absorbed into Navbar)                              |

### Pages Currently Using Old Components

These pages import from `../ui/navigation-app-ui` and need updates:

```javascript
// Current import (to remove)
import NavigationAppUI from "../ui/navigation-app-ui";

// New import (to use)
import { Navbar } from "../ui/base";
```

**Pages needing import updates:**

- `front/app/privacy/page.js`
- `front/app/terms/page.js`
- `front/app/updateme/page.js`
- `front/app/[id]/page.js`
- `front/app/game-mode/page.js`
- `front/app/me/page.js`
- `front/app/play/page.js`

---

## Phase 3: Fix Broken/Missing Code

### Components with Issues

| File                                  | Issue                                                                | Fix                                       |
| ------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| `ui/player-achievements-public-ui.js` | References `element.placeholderUrl` (undefined property)             | Change to `element.logoURL`               |
| `ui/modal-mode-selector.js`           | Dead imports: `l` from `../lib/i18n/localizer`, `format` from "path" | Remove unused imports                     |
| `ui/messaging/toast.js`               | Inline styles, no CVA                                                | Convert to CVA in `ui/base/`              |
| `ui/loader/loader-ui.tsx`             | Very basic component                                                 | Replace with `LoadingState` from patterns |

### Broken Property Reference

In `player-achievements-public-ui.js` line 34:

```javascript
// Current (broken)
src={element.placeholderUrl}

// Fixed
src={element.logoURL}
```

---

## Phase 4: CSS Cleanup

### Unused CSS Classes

These classes appear unused after checking with grep. Verify before deleting:

| Class                           | Defined In          | Notes                         |
| ------------------------------- | ------------------- | ----------------------------- |
| `.game-row`                     | globals.css:298     | No imports found              |
| `.leaderboard-row`              | globals.css:327     | No imports found              |
| `.friend-row`                   | globals.css:358     | No imports found              |
| `.btn-sm`, `.btn-md`, `.btn-lg` | globals.css:236-249 | Legacy - use Button component |

### Verification

```bash
grep -r "\.game-row" front/app --include="*.tsx" --include="*.js"
grep -r "\.leaderboard-row" front/app --include="*.tsx" --include="*.js"
grep -r "\.friend-row" front/app --include="*.tsx" --include="*.js"
```

---

## Phase 5: Create Missing Pattern Components

### Page Container Components Needed

Create these to replace CSS utilities:

| New File                                  | Purpose            | Replaces                             |
| ----------------------------------------- | ------------------ | ------------------------------------ |
| `ui/patterns/PageContainer.tsx`           | Main page wrapper  | `.page-content-container`            |
| `ui/patterns/PageContainerScrollable.tsx` | Scrollable variant | `.page-content-container-scrollable` |

**Usage:**

```typescript
import { PageContainer } from "../ui/patterns";

// In pages...
<PageContainer>
  {/* page content */}
</PageContainer>
```

---

## Implementation Order

1. **Phase 1**: Delete unused files (verify first)
2. **Phase 4**: Clean unused CSS classes
3. **Phase 3**: Fix broken code in existing components
4. **Phase 5**: Create missing pattern components
5. **Phase 2**: Update imports in pages (last step)

---

## Notes

- `page-content-container` and `page-content-container-scrollable` are still in use - do NOT remove CSS
- Check all grep results before deleting files
- Run `npm run build` after changes to verify no build errors

---

## Related Documents

- `FRONTREFACTOR.md` - Main refactoring plan
- `front/app/lib/design-tokens.ts` - Single source of truth
- `front/app/ui/base/` - CVA components
- `front/app/ui/patterns/` - Pattern components
