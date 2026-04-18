# Front-End Structure Documentation

## Project Overview

This is a Next.js front-end application for the Transcendence project. The application includes game pages, user profiles, authentication, and real-time messaging.

## Directory Hierarchy

### Root Level

- `Dockerfile` - Development Docker configuration
- `Dockerfile-prod` - Production Docker configuration
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `postcss.config.mjs` - PostCSS configuration
- `next-env.d.ts` - Next.js type definitions

### `/app` - Main Application Structure

#### Pages & Routes

- `page.js` - Home page
- `layout.js` - Root layout component
- `route-test.ts` - Route testing utility

#### Core Pages

- `/login` - User login page
- `/signup` - User registration page
- `/me` - Current user profile page
- `/play` - Game play page
- `/game-mode` - Game mode selection page
- `/canvas` - Canvas rendering page
- `/launch` - Game launch page
- `/[id]` - Dynamic user profile page
- `/privacy` - Privacy policy page
- `/terms` - Terms of service page
- `/ui-test` - UI component testing page
- `/updateme` - User profile update page

#### API Routes

- `/api` - API integration layer

#### Context (State Management)

- `/context/auth-context.tsx` - Authentication context
- `/context/language-context.tsx` - Language/i18n context

#### Hooks (Custom Hooks)

- `/hooks/use-media-query.ts` - Media query utility hook
- `/hooks/use-translation.ts` - Translation hook

#### Utilities & Libraries

- `/lib`
  - `utils.ts` - General utilities
  - `/form-validation` - Form validation rules (auth, player-data)
  - `/game` - Game configuration and services
    - `engine-launch-config.ts`
    - `game-session-config.ts`
    - `launch-config.ts`
    - `room-service.ts`
    - `server-config.ts`
  - `/i18n` - Internationalization
  - `/players` - Player-related utilities

#### UI Components

- `/ui` - Reusable UI components
  - `global-chat-ui.tsx` - Global chat interface
  - `Leaderboard.tsx` - Leaderboard display
  - `/base` - Base UI components
  - `/error` - Error UI components
  - `/game-front` - Game-specific UI
  - `/patterns` - Reusable layout/pattern primitives
  - `/player-private-profile` - Private profile components
  - `/player-public-profile` - Public profile components

#### Styling

- `/styles`
  - `global-styles.js` - Global CSS styles
- `globals.css` - Global CSS file

### `/public` - Static Assets

- `/assets/achievements` - Achievement images
- `/avatar` - User avatar assets
- `/images` - General images
- `site.webmanifest` - Web manifest for PWA

### `/Design` - Design Documentation

- `README.md` - Design guidelines and specifications

### `/specs` - Project Specifications

- `screens.md` - Screen specifications and mockups

### `/.next` - Build Output (Auto-generated)

- Development and production build artifacts

## Key Features

- **Authentication** - Login and signup flows with context management
- **User Profiles** - Public and private profile pages
- **Game Engine** - Multi-page game configuration and launch system
- **Real-time Chat** - Global messaging interface
- **Leaderboard** - Player rankings and statistics
- **Internationalization** - Multi-language support
- **Responsive Design** - Mobile-first approach with mobile detection
- **Achievements** - Player achievements tracking and display
