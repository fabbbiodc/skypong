# SkyPong

[![TypeScript](https://img.shields.io/badge/typescript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Babylon.js](https://img.shields.io/badge/babylon.js-351961?style=flat&logo=html5)](https://www.babylonjs.com)
[![Next.js](https://img.shields.io/badge/next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)

A 3D Pong game with a modern web frontend. Play against AI or a friend on the same keyboard.

## Demo

![Screen Recording](assets/screenrecording_01.gif)

## Features

- **Game modes** — AI (3 difficulties) and local 2-player
- **PBR rendering** — Babylon.js 3D engine with environment-based lighting, refractive glass paddles, marble materials
- **Design system** — TypeScript tokens, CVA components, responsive mobile layout
- **i18n** — Full UI in English, Spanish, and Italian

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Web App** | Next.js, React 19, TypeScript, Tailwind v4, CVA |
| **Game Client** | Babylon.js 8, React 18, Vite 5 |
| **Build** | Static export, deployed to GitHub Pages |

## Project Structure

```
skypong/
├── front/                      # Next.js web application
│   └── app/
│       ├── game-mode/          # Game mode selection (AI/Local 2P)
│       ├── launch/             # Config validation route
│       ├── canvas/             # Game screen (iframe)
│       ├── lib/                # Config encoding, i18n, design tokens
│       └── ui/                 # Components and patterns
│
├── game/
│   ├── client/                 # Vite game client (Babylon.js 3D)
│   │   └── src_cli/
│   │       ├── game/           # Game loop, local state, engine
│   │       ├── entities/       # Ball, paddle, table
│   │       └── components/     # React UI overlays
│   └── common/                 # Shared constants and base entities
│
└── scripts/
    └── build.sh                # Production build script
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm run install:all
```

This installs dependencies for the root, frontend, and game client in one command.

### Development

```bash
npm run dev
```

This starts both the Next.js frontend (port 3000) and the Vite game client (port 5173) concurrently. Visit `http://localhost:3000/` to play.

### Production Build

```bash
BASE_PATH=/skypong npm run build
```

The static output is in `front/out/` and can be deployed to any static host.

## Deployment

### GitHub Pages

This project is configured for GitHub Pages deployment via GitHub Actions. Push to the `deployB` branch to trigger an automatic build and deploy.

The deployed site will be available at `https://fabbbiodc.github.io/skypong/`.

### Other Static Hosts

The `front/out/` directory contains a fully static site that can be deployed to:
- **Vercel** — Connect repo, set build command to `npm run build`
- **Netlify** — Set publish directory to `front/out`
- **Cloudflare Pages** — Set output directory to `front/out`
- **Any static host** — Upload `front/out/` contents

## Architecture

SkyPong is a static frontend-only application. The game runs entirely in the browser using Babylon.js for 3D rendering. There is no backend server — all game logic (physics, AI, scoring) runs client-side.

The frontend (Next.js) handles the homepage, game mode selection, and configuration. It embeds the game client in an iframe, passing game settings via URL-encoded configuration.

```
┌─────────────────────────────────────────────┐
│                 Browser                      │
│                                              │
│  ┌──────────────┐    ┌────────────────────┐  │
│  │  Next.js     │    │  Game Client       │  │
│  │  (iframe)    │───►│  (Babylon.js 3D)   │  │
│  │              │    │                    │  │
│  │  - Homepage  │    │  - Physics         │  │
│  │  - Mode sel  │    │  - AI              │  │
│  │  - Config    │    │  - Rendering       │  │
│  └──────────────┘    └────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Original Project

This is a simplified version of a larger multiplayer Pong platform. The original project included authentication, profiles, social features, and server-authoritative multiplayer.

- [Original Project](https://github.com/Gugor/42-transcendence)

## Collaborators

- [Gugor](https://github.com/Gugor)
- [ilropd](https://github.com/ilropd)
- [MartiMarsa](https://github.com/MartiMarsa)
