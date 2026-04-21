# Frontend Architecture Documentation

## Project Overview

This is a Next.js web application for the SkyPong platform, featuring a complete design system with design tokens, CVA components, and Babylon.js integrations.

## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18
- **Styling**: Tailwind v4 with CSS variables
- **Components**: class-variance-authority (CVA)
- **3D/Game**: Babylon.js 8, React integration
- **Types**: TypeScript (strict mode)
- **i18n**: Custom context-based (EN/ES/IT)

---

## Architecture

### Single Source of Truth

```
front/app/lib/design-tokens.ts    ← SINGLE SOURCE OF TRUTH
        ↓                             ↓
        ├── TypeScript exports         globals.css
        │   (types + values)             (CSS variables)
        │                                │
        └── Components use           Runtime utilities
```

**Design Tokens File** (`design-tokens.ts`):
- Exports exact values + TypeScript types
- Includes: colors, typography, spacing, borderRadius, shadows, backgrounds
- Powers Tailwind via CSS variables in `globals.css`

---

## Directory Structure

### Core Application

```
front/app/
├── lib/
│   ├── design-tokens.ts        ← Design system source of truth
│   ├── utils.ts               ← cn() utility, formatters
│   ├── types/                 ← Shared type exports
│   ├── form-validation/       ← React-hook-form rules
│   ├── game/                 ← Game launch config, room service
│   ├── i18n/                 ← Locale manager, dictionaries
│   └── players/              ← Player utilities
│
├── ui/
│   ├── base/                 ← CVA component library
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── TextField.tsx
│   │   ├── Chip.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── StatCard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Tabs.tsx
│   │   ├── Navbar.tsx         ← Auth-aware navigation
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── InteractiveMarbleBall.tsx  ← PBR marble CTA
│   │   └── BallCTA.tsx
│   │
│   ├── patterns/              ← Reusable page patterns
│   │   ├── Section.tsx
│   │   ├── ListRow.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   ├── PageContainer.tsx
│   │   └── FormCard.tsx
│   │
│   ├── GameSceneBackground.tsx  ← Babylon.js rotating EXR skybox
│   └── GameSceneBackgroundConfig.ts
│
├── context/
│   ├── auth-context.tsx       ← Auth state + JWT handling
│   └── language-context.tsx  ← i18n context
│
├── hooks/
│   ├── use-translation.ts    ← Translation hook
│   └── use-media-query.ts   ← Media query hook
│
└── [pages]/
    ├── page.js              ← Homepage (Hero, Footer, BallCTA)
    ├── login/
    ├── signup/
    ├── me/                  ← Private profile
    ├── [id]/               ← Public profile
    ├── play/               ← Game mode selection
    ├── game-mode/
    ├── ui-test/            ← Component testing
    └── updateme/           ← Profile settings
```

### Styling

```
front/app/
├── globals.css              ← ~250 lines (was 1300)
│                          ← @theme CSS variables
│                          ← Animations (rainbowtext)
│
└── styles/
    └── global-styles.js     ← Legacy (mostly unused)
```

### Public Assets

```
front/public/
├── avatar/                 ← User avatars
├── assets/achievements/    ← Achievement images
├── environment/           ← EXR skybox textures
├── images/
└── marble/               ← Marble ball textures (PBR)
```

---

## Design System

### Color Palette (Slate - Modern Dark Theme)

```typescript
// primary = slate-600 (#475569)
// background.surface = slate-900 (#0f172a)
// background.card = slate-800 (#1e293b)
```

- **Primary**: Slate-based (#475569) — replaced purple
- **Background**: Dark theme with frosted glass effects
- **Typography**: Space Grotesk (display), Funnel Sans (body)

### Component Pattern (CVA)

All base components follow consistent CVA pattern:

```typescript
const componentVariants = cva("base classes", {
  variants: {
    variant: { primary, secondary, danger, ghost },
    size: { sm, md, lg },
    state: { default, hover, active, disabled },
  },
  defaultVariants: { variant: "primary", size: "md" },
});
```

---

## Key Features

### Design Tokens System

- Single source of truth in `design-tokens.ts`
- TypeScript type exports for autocomplete
- Tailwind v4 powered by `globals.css` @theme

### Base Components (9 + 5)

| Component | Features |
| --------- | -------- |
| Button | CVA: variant, size, state |
| Card | CVA: variant, size, elevated |
| TextField | CVA: variant, state, type, required |
| Chip | CVA: size, state, chip variants |
| Avatar | CVA: size, state, status |
| Badge | CVA: size, state |
| StatCard | CVA: size, featured |
| ProgressBar | CVA: size, state, animated |
| Tabs | CVA: size, state |

**New Components:**
| Navbar | Auth-aware, dropdown, scroll behavior |
| Footer | Customizable links |
| Hero | Title + CTA |
| LanguageSelector | Locale switcher (EN/ES/IT) |
| InteractiveMarbleBall | PBR spinning marble CTA |

### Pattern Components

| Component | Purpose |
| --------- | -------- |
| Section | Reusable section container |
| ListRow | List items with hover states |
| EmptyState | Empty display |
| LoadingState | Spinner/skeleton/dots |
| PageContainer | Navbar-aware layouts |
| FormCard | Form wrapper |

### Babylon.js Integrations

- **GameSceneBackground**: Rotating EXR skybox (~1 rotation/100s)
- **InteractiveMarbleBall**: PBR marble with textures (~20s rotation)

### i18n System

- Custom context-based (no react-i18next)
- 477 translation keys (verified parity EN/ES/IT)
- Type-safe translation hook

### Authentication

- JWT with access/refresh tokens
- Auth context with strict typing
- CSRF protection

---

## Page Structure

### Public Pages

| Route | Component |
| ----- | -------- |
| `/` | Homepage (Hero, Footer, BallCTA) |
| `/login` | Login form |
| `/signup` | Registration form |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

### Private Pages (Auth Required)

| Route | Component |
| ----- | -------- |
| `/me` | Private profile |
| `/[id]` | Public profile |
| `/play` | Game mode selection |
| `/game-mode` | Game configuration |
| `/updateme` | Profile settings |
| `/ui-test` | Component testing |

---

## Validation

```bash
npm run check:locales   # Verify i18n key parity
npm exec tsc -- --noEmit   # TypeScript check
npm exec next build -- --webpack   # Build check
```

---

## Related Documentation

- [Design System README](Design/README.md) — Detailed design tokens, component specs, refactoring notes
- [Main README](../README.md) — Full project overview