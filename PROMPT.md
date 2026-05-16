# SkyPong - Static Frontend + GitHub Pages Deployment

## Overview
SkyPong has been simplified from a server-authoritative multiplayer game with backend microservices to a **static frontend-only game** with local AI and Local 2P modes, deployable to **GitHub Pages**.

---

## Architecture

```
Browser
┌─────────────────────────────────────────────┐
│                                             │
│  ┌──────────────┐    ┌────────────────────┐ │
│  │  Next.js     │    │  Game Client       │ │
│  │  (iframe)    │───►│  (Babylon.js 3D)   │ │
│  │              │    │                    │ │
│  │  - Homepage  │    │  - Physics         │ │
│  │  - Mode sel  │    │  - AI              │ │
│  │  - Config    │    │  - Rendering       │ │
│  └──────────────┘    └────────────────────┘ │
└─────────────────────────────────────────────┘
```

- **No backend servers** — all game logic runs client-side
- **Game embedded in iframe** — frontend passes config via URL-encoded base64 payload
- **Static export** — Next.js `output: "export"` produces plain HTML/CSS/JS
- **Single deployment** — game client is built and copied into frontend's `public/game/` before Next.js build

---

## Removed Components

### Deleted Directories
- `auth-service/`, `profile-service/`, `statistics-service/`
- `nginx-gateway/`, `prometheus/`, `grafana/`, `alertmanager/`, `seed/`, `sqlite-web/`
- `volumes/`, `uploads/`, `static/`, `docs/`, `assets/`
- `game/server/` — Colyseus game server (entire directory)

### Deleted Files
- `docker-compose.yml`, `docker-compose-template.yml`, `Makefile`, `config_docker_path.sh`
- `.env`, `.env.example`
- `game/Dockerfile.client`, `game/Dockerfile.server`, `game/nginx.conf`, `game/statistic-object.md`, `game/README.md`
- `game/common/GameState.ts` + all `.d.ts` files
- `front/app/lib/game/server-config.ts`, `front/app/lib/game/game-session-config.ts`
- `front/app/lib/form-validation/auth.ts`, `front/app/lib/form-validation/player-data.ts`
- `front/app/lib/players/check-player-status.ts`, `front/app/lib/players/whois.ts`
- `front/app/ui/game-front/CreateRoom.tsx`, `front/app/ui/game-front/JoinRoom.tsx`, `front/app/ui/game-front/GameModeSelection.tsx`
- `front/app/ui/patterns/ProfileLayout.tsx`, `front/app/ui/patterns/PageContainerScrollable.tsx`
- `front/app/ui/GrainientBackground.jsx`, `front/app/ui/base/Grainient.jsx`, `front/app/ui/error/error-ui.jsx`
- `front/Dockerfile`, `front/Dockerfile-prod`

### Removed Dependencies
- `colyseus.js` from `front/package.json`
- `@hookform/resolvers` from `front/package.json`
- Duplicate `react`/`react-dom` from root `package.json`

---

## Project Structure

```
skypong/
├── front/                      # Next.js web application
│   ├── app/
│   │   ├── page.js             # Homepage with Hero + marble ball CTA
│   │   ├── game-mode/page.js   # Mode selection (AI/Local 2P) with i18n
│   │   ├── launch/page.tsx     # Config validation route
│   │   ├── canvas/page.tsx     # Game screen (iframe)
│   │   ├── privacy/page.js     # Privacy policy
│   │   ├── terms/page.js       # Terms of service
│   │   ├── context/            # Language provider
│   │   ├── hooks/              # useTranslation, useMediaQuery
│   │   ├── lib/                # Config encoding, i18n, design tokens
│   │   └── ui/                 # Components (Navbar, Footer, Hero, etc.)
│   ├── public/
│   │   ├── environment/        # EXR skybox texture
│   │   ├── textures/marble/    # Marble ball PBR textures
│   │   └── game/               # Built game client (copied during build)
│   └── next.config.mjs         # Static export + basePath support
│
├── game/
│   ├── client/                 # Vite game client (Babylon.js 3D)
│   │   ├── src_cli/
│   │   │   ├── game/           # Game loop, local state, engine
│   │   │   ├── entities/       # Ball, paddle, table
│   │   │   ├── ui/             # HUD, pause overlay, touch controls
│   │   │   ├── components/     # React UI overlays (StartPage, CanvasPage)
│   │   │   └── config/         # GUI styles, UI texts
│   │   ├── public/
│   │   │   ├── icons/          # SVG icons (pause, left/right buttons)
│   │   │   └── environment/    # EXR sky texture
│   │   └── index.html
│   └── common/                 # Shared constants and base entities
│       ├── constants/          # GMCN, PHYSICS, AI_DIFFICULTY, TIMING
│       └── entities/           # BaseBall, BasePaddle, BaseTable
│
├── scripts/
│   └── build.sh                # Production build script
│
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions CI/CD
│
├── package.json                # Root: dev/build scripts + concurrently
├── README.md
└── PROMPT.md
```

---

## Development

### Setup
```bash
npm run install:all
```
Installs dependencies for root, frontend, and game client in one command.

### Run
```bash
npm run dev
```
Starts both servers concurrently:
- **Frontend:** `http://localhost:3000`
- **Game client:** `http://localhost:5173`

The frontend iframe loads the game from `localhost:5173` during development.

---

## Production Build

```bash
BASE_PATH=/skypong npm run build
```

**Build process (`scripts/build.sh`):**
1. Builds game client with `VITE_BASE_PATH=/skypong/game/`
2. Copies `game/client/dist/` → `front/public/game/`
3. Builds Next.js with `NEXT_PUBLIC_BASE_PATH=/skypong`
4. Copies `index.html` → `404.html` in both frontend and game output (SPA routing for GitHub Pages)

Output: `front/out/` — fully static site ready for deployment.

---

## Deployment: GitHub Pages

### Workflow (`.github/workflows/deploy.yml`)
- Triggers on push to `deployB` branch or manual dispatch
- Installs all dependencies
- Builds with `BASE_PATH=/skypong`
- Deploys `front/out/` via `actions/deploy-pages`

### Setup on GitHub
1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Deployed URL: `https://fabbbiodc.github.io/skypong/`

### Key Configuration for GitHub Pages
- **`basePath: /skypong`** — All asset paths prefixed with repo name
- **Hash-based routing** in game client (`HashRouter`) — avoids 404s on SPA routes
- **`404.html`** copies — GitHub Pages fallback for SPA routing

---

## Config Flow

1. `front/app/game-mode/page.js` → User selects mode, difficulty, colors, names
2. `front/app/lib/game/launch-config.ts` → `GameConfig` interface (mode, player1Color, player2Color, player1Name, player2Name, pointsToWin)
3. `front/app/lib/game/engine-launch-config.ts` → Maps to `EngineLaunchConfig` for game client
4. `front/app/ui/game-front/GameLauncher.tsx` → Validates config, redirects to `/canvas`
5. `front/app/ui/game-front/GameScreen.tsx` → Loads game in iframe
   - **Dev:** `http://localhost:5173/canvas?config=...`
   - **Production:** `/skypong/game/#/canvas?config=...`
6. Game client (Babylon.js) → Runs the actual game

---

## Key Fixes Applied

### 1. Controls Fixed
- **Before:** W/S and Arrow keys
- **After:** Player 1 = A/D, Player 2 = J/L

### 2. AI Name Fixed
- Explicitly passes `player2Name: "AI"` in engine-launch-config.ts for AI mode

### 3. Paddle Colors Fixed
- Player 1 gets selected color, AI gets grey, Local 2P both get selected colors

### 4. Ball Position Fixed
- Ball spawns on table surface (was half-buried)

### 5. Game Restart After Score Fixed
- Added 1-second delay in `_resetRally()`

### 6. Local PvP Stuck Fix
- Removed local-2p from `isPvPMode` check — starts immediately

### 7. Homepage Ball Navigation
- Click navigates to `/game-mode` instead of old `/play`

### 8. Physics Simplification (Interpolation Removal)
- Removed `InterpolationEngine`, extrapolation logic, `_targetPosition`, `_lastServerUpdateTime`
- Ball position follows physics directly (no network smoothing needed)
- Rolling rotation preserved using velocity

### 9. Online Mode Removal
- Deleted `RoomManager.ts`, removed `colyseus.js`/`@colyseus/schema` dependencies
- Simplified `Game.ts`, `GameLoop.ts`, `GameReadyManager.ts`, `LoadingManager.ts`

### 10. Game Client StartPage → Redirect
- Replaced full menu with redirect to `/canvas` (frontend handles all mode selection)

### 11. GitHub Pages Compatibility
- **`BrowserRouter` → `HashRouter`** in game client — avoids 404s on SPA routes
- **Icon paths** use `import.meta.env.BASE_URL` prefix — pause button and touch controls now visible
- **Texture paths** use `NEXT_PUBLIC_BASE_PATH` prefix — marble ball renders correctly
- **EXR texture timeout** increased from 3s to 10s — background skybox loads reliably
- **GameScreen iframe** uses hash routing (`#/canvas`) — game loads correctly in production

### 12. i18n on Game Mode Page
- Replaced all hardcoded English strings with `t.gameMode.*` lookups
- Added 20 new translation keys to `en.ts`, `es.ts`, `it.ts`

---

## Game Client Routing

The game client uses `HashRouter` (react-router-dom):
- `/#/` → StartPage (redirects to canvas)
- `/#/canvas?config=...` → CanvasPage (runs the game)

This ensures GitHub Pages always serves `index.html` and React Router handles routing client-side.

---

## To Run

```bash
# Install all dependencies
npm run install:all

# Development
npm run dev
# Visit http://localhost:3000/

# Production build
BASE_PATH=/skypong npm run build
# Output in front/out/
```

## Known Issues
- Ball may be visible through game-over overlay (internal game rendering)
- May need additional testing for edge cases

## Testing Checklist

```
[ ] AI Easy Mode - controls work
[ ] AI Medium Mode - controls work
[ ] AI Hard Mode - controls work
[ ] Local 2P Mode - both paddles work, P2 uses J/L
[ ] Physics - ball bounces correctly
[ ] Ball spawns on table surface
[ ] Score updates after each point
[ ] Game restarts after score
[ ] AI name shows as "AI"
[ ] Paddle colors apply correctly
[ ] Homepage ball navigates to game-mode
[ ] Pause button visible in game
[ ] Mobile touch controls visible
[ ] Background skybox renders on homepage
[ ] Language selector works on all pages
[ ] Deployed site works on GitHub Pages
```
