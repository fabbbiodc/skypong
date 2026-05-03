# SkyPong Frontend Simplification - Session Changes

## Overview
This document describes the changes made to simplify SkyPong from a server-authoritative multiplayer game with backend services to a static frontend-only game with local AI and PvP modes.

## Architecture Changes

### Removed Components
- **Backend Services Removed**: `auth-service/`, `profile-service/`, `statistics-service/`, `nginx-gateway/`, `prometheus/`, `grafana/`, `alertmanager/`, `seed/`, `sqlite-web/`
- **Old Play Route**: Deleted `front/app/play/` - had auth dependencies that no longer work
- **Room Service**: Deleted `front/app/lib/game/room-service.ts` - no longer needed

### Config System Changes
The configuration flows through these files:
1. `front/app/game-mode/page.js` → Selects mode, difficulty, colors, names
2. `front/app/lib/game/launch-config.ts` → `GameConfig` interface (mode, player1Color, player2Color, player1Name, player2Name, pointsToWin)
3. `front/app/lib/game/engine-launch-config.ts` → Maps to `EngineLaunchConfig` for game client
4. `front/app/ui/game-front/GameLauncher.tsx` → Validates and redirects
5. `front/app/ui/game-front/GameScreen.tsx` → Loads game in iframe from external URL
6. Game client at `localhost:5173` → Runs the actual game

### Build Configuration
- Added `front/next.config.mjs` with static export (`output: "export"`)
- Updated `front/package.json` with build/start scripts

## Files Modified

### Frontend (`front/`)

#### `app/game-mode/page.js`
- Mode selection: "Local 2P" and "vs AI"
- For AI: difficulty selection (Easy, Medium, Hard)
- Player name inputs for both players
- Color pickers: separate for Player 1 and Player 2 (or just P1 for AI mode)
- Winning score selector (3, 5, 7, 9, 11)
- Controls display: P1 uses A/D, P2 uses J/L

#### `app/lib/game/launch-config.ts`
- Changed from `ballColor` to `player1Color` and `player2Color`
- Added `player1Name` and `player2Name` fields

#### `app/lib/game/engine-launch-config.ts`
- Maps GameConfig to EngineLaunchConfig
- For AI mode: explicitly sets `player2Name: "AI"`
- For Local mode: passes both player names and colors
- AI opponent uses grey color (0.5, 0.5, 0.5)

#### `app/ui/game-front/GameScreen.tsx`
- Full-screen overlay (fixed inset-0)
- Loads game from external URL (`NEXT_PUBLIC_GAME_CLIENT_URL` or `localhost:5173`)
- Listens for `game-exit` postMessage to return to menu

#### `app/ui/base/InteractiveMarbleBall.tsx`
- Changed navigation from `/play` → `/game-mode`

### Game Client (`game/client/`)

#### `src_cli/game/GameLoop.ts`
Controls:
- Player 1: A/D keys (A=left, D=right)
- Player 2: J/L keys (J=left, L=right)
- Previously used W/S and Arrow keys

#### `src_cli/game/ClientEngine.ts`
- Creates paddles with colors from config
- AI opponent always gets grey color
- Shows correct names in HUD (uses config.gameMode to determine "AI" label)

#### `src_cli/entities/ClientBall.ts`
- Ball Y position: `GMCN.TABLE.Y_POSITION + GMCN.TABLE.SIZE.height/2 + GMCN.BALL.RADIUS`
- Fixed to sit on table surface (was 0.2, now 0.45)

#### `src_cli/game/LocalGameState.ts`
- Added 1-second delay before relaunching ball after each score (fixes game stopping after one point)
- AI name comes from config

#### `src_cli/components/pages/CanvasPage.tsx`
- Fixed `isPvPMode` to only check online modes (not local-2p)
- Local-2P starts immediately without "waiting for opponent"

#### `src_cli/game/LoadingManager.ts`
- Only waits for opponent in online multiplayer mode

### Common (`game/common/`)

#### `common/entities/BaseBall.ts`
- Ball spawns on table surface: `TABLE.Y_POSITION + TABLE.SIZE.height/2 + BALL.RADIUS`

## Key Fixes Applied

### 1. Controls Fixed
- **Before**: W/S and Arrow keys
- **After**: Player 1 = A/D, Player 2 = J/L

### 2. AI Name Fixed
- Now explicitly passes `player2Name: "AI"` in engine-launch-config.ts for AI mode

### 3. Paddle Colors Fixed
- Player 1 gets their selected color
- AI opponent always gets grey
- Local 2P: both players get their selected colors

### 4. Ball Position Fixed
- Ball now spawns correctly on table surface
- Previously was half-buried in table

### 5. Game Stops After Score Fixed
- Added relaunch after 1-second delay in _resetRally()

### 6. Local PvP Stuck Fix
- Removed local-2p from isPvPMode check
- Game starts immediately for local modes

### 7. Homepage Ball Navigation
- Click now goes to `/game-mode` instead of `/play`

## To Run

```bash
# Terminal 1: Game client
cd game/client && npm run dev

# Terminal 2: Frontend
cd front && npm run dev
```

Then visit `http://localhost:3000/`

## Known Issues (Remaining)
- Ball is still visible through game-over overlay (internal game rendering issue)
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
```