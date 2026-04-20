# SkyPong

A production-style microservices platform for a multiplayer Pong experience, user identity, social features, and game statistics.

---

## 1) Project Overview

`SkyPong` is a containerized distributed system that combines:

- A **Next.js web application** for product UI and account flows.
- A **real-time game engine** (SkyPong) powered by Colyseus and WebSockets.
- A set of backend **Node.js/TypeScript microservices** for auth, profile/social data, and statistics.
- A complete **observability stack** (Prometheus, Alertmanager, Grafana, exporters).

### What problem it solves

The project solves the typical challenges of multiplayer web products:

- Secure user identity and session management.
- Separation of concerns between domains (auth, profile, stats, game).
- Real-time gameplay and chat over WebSockets.
- Operational visibility and reliability through metrics + alerts.

### High-level system description

A TLS-enabled NGINX gateway receives all external traffic, routes REST/WebSocket calls to domain services, and exposes a unified entrypoint (`https://localhost:8443`). Services communicate internally via Docker networking and shared service-to-service authentication, while SQLite-backed storage keeps each domain isolated.

---

## 2) Architecture

### Architecture style

The project uses a **microservices architecture** behind an **API gateway**:

- **Edge layer:** `nginx-gateway` terminates TLS and routes traffic.
- **Application layer:** frontend apps + domain microservices.
- **Data layer:** per-service SQLite persistence (mounted Docker volumes).
- **Observability layer:** Prometheus, Alertmanager, Grafana, cAdvisor, and nginx-exporter.

### Why this architecture

This architecture is a good fit for a multiplayer platform because it enables:

- **Independent evolution per domain** (auth/profile/stats/game).
- **Fault isolation**: one service can fail without collapsing the full stack.
- **Operational clarity**: health checks, exporters, and dashboards per component.
- **Gateway control**: centralized security, routing, and protocol upgrades (HTTP/WebSocket).

### Component interaction (conceptual)

1. Client requests enter through NGINX over HTTPS.
2. NGINX routes `/api/auth/*`, `/api/profile/*`, `/api/statistics/*`, `/api/game/*`, `/ws/*`, and `/api/chat/ws` to the appropriate upstream service.
3. Auth validation is delegated to the auth service (`/_internal/auth_verify`) for protected routes.
4. Services handle their own domain logic and persistence.
5. Metrics are scraped and visualized through the monitoring stack.

---

## 3) Microservices

### `auth-service`

- **Responsibility:** account lifecycle, login/signup, JWT issuance/verification, refresh tokens, optional 2FA, password operations.
- **Technology:** Node.js, TypeScript, Fastify, SQLite, JWT, Argon2/Bcrypt.
- **Main components:**
  - Route handlers and HTTP bootstrap (`src/index.ts`)
  - Authentication/token logic (`src/auth.ts`, `src/token.ts`, `src/refresh.ts`)
  - Credential and helper modules (`src/password.ts`, `src/helpers.ts`, `src/keys.ts`)
  - SQLite access layers (`src/db.ts`, `src/dbTokens.ts`)
- **Role in the system:** source of truth for identity and access control; gateway uses it for auth checks.

### `profile-service`

- **Responsibility:** user profiles, avatars/media, friendship graph, relationship states, global chat endpoint.
- **Technology:** Node.js, TypeScript, Fastify, SQLite, Sharp, multipart/static plugins.
- **Main components:**
  - HTTP entrypoint (`src/index.ts`)
  - Profile/friend domain modules (`src/player.ts`, `src/friend.ts`, `src/friendService.ts`)
  - Database + utilities (`src/dbPlayers.ts`, `src/helpers.ts`, `src/keys.ts`)
- **Role in the system:** social layer and profile data provider for frontend and other services.

### `statistics-service`

- **Responsibility:** game result ingestion, stat aggregation, leaderboard and derived metrics.
- **Technology:** Node.js, TypeScript, Fastify, SQLite.
- **Main components:**
  - API server (`src/index.ts`)
  - Data access (`src/dbStats.ts`, `src/dbLeaderboard.ts`)
  - Processing workers (`src/statsWorker.ts`, `src/leaderboardWorker.ts`)
  - Domain contracts (`src/stats.types.ts`, `src/stats.enums.ts`, `src/stats.const.ts`)
- **Role in the system:** analytical backend for rankings and performance insights.

### `game-service` (SkyPong backend)

- **Responsibility:** real-time multiplayer game orchestration and match sessions.
- **Technology:** Node.js, TypeScript, Colyseus, Express/WebSocket stack.
- **Main components:** server runtime in `game/server` + shared game contracts in `game/common`.
- **Role in the system:** authoritative game state and multiplayer synchronization.

### `game-frontend` (SkyPong client)

- **Responsibility:** game-specific client UI rendered under `/game-engine/`.
- **Technology:** React + Vite + TypeScript + Babylon.js + Colyseus client.
- **Main components:** source in `game/client`, built and served as a dedicated frontend container.
- **Role in the system:** specialized game interface decoupled from the main Next.js app.

---

## 4) Communication Between Services

### External communication

- **HTTPS (TLS):** all user traffic enters via `https://localhost:8443`.
- **REST-style HTTP:** domain APIs exposed under `/api/*` prefixes.
- **WebSocket:**
  - `/ws/*` for game real-time channels.
  - `/api/chat/ws` for authenticated global chat.

### Internal communication

- Services communicate over Docker bridge networks (`backend`, `internal`).
- Internal service URLs are configured via environment variables:
  - `AUTH_SERVICE_URL`
  - `PROFILE_SERVICE_URL`
  - `STATS_SERVICE_URL`
- A shared `SERVICE_TOKEN` is used for trusted service-to-service calls.

### Data flow examples

- **Login flow:** Frontend → NGINX `/api/auth/*` → auth-service → token/session returned.
- **Protected profile flow:** Frontend → NGINX `/api/profile/*` → NGINX auth subrequest → auth-service verify → profile-service response.
- **Game flow:** Frontend/Game client → `/api/game/*` and `/ws/*` → game-service.
- **Stats flow:** game outcomes → statistics-service ingestion/aggregation → frontend leaderboard queries.

---

## 5) Features

- Secure authentication with token lifecycle and optional 2FA.
- Profile management with avatar upload/static delivery.
- Friendship operations (requests, accept/reject, block/unblock).
- Real-time multiplayer game engine integration.
- Real-time authenticated global chat.
- Statistics aggregation and leaderboard capabilities.
- Unified HTTPS gateway with reverse-proxy routing.
- Built-in monitoring dashboards and alerting pipeline.
- Containerized development/deployment workflow.

---

## 6) Project Structure

```text
.
├── auth-service/          # Identity, auth, tokens, 2FA
├── profile-service/       # Profiles, friendships, avatars, chat
├── statistics-service/    # Stats ingestion, aggregation, leaderboard
├── game/                  # SkyPong backend/client/common packages
├── front/                 # Main Next.js application
├── nginx-gateway/         # TLS termination + API/WebSocket routing
├── prometheus/            # Scrape config + alert rules
├── grafana/               # Provisioning + dashboards
├── alertmanager/          # Alert routing configuration
├── seed/                  # One-shot data initialization
├── sqlite-web/            # Optional SQLite inspection tooling
├── docs/                  # API and architecture notes
├── docker-compose-template.yml
├── config_docker_path.sh
└── Makefile
```

---

## 7) Installation

### Prerequisites

- Docker + Docker Compose plugin
- GNU Make
- Git

> Optional for local service-only development: Node.js 20+ and npm.

### Dependencies

The full system dependencies are containerized. For local non-Docker runs, install per-service dependencies with `npm install` in each service directory.

### Setup

```bash
git clone <your-repo-url>
cd 42-transcendence
make config
```

`make config` will:

- create `.env` from `.env.example` if missing,
- sync missing environment variables,
- generate `docker-compose.yml` from `docker-compose-template.yml`,
- replace host path placeholders with local `./volumes/*` paths.

---

## 8) Running the Application

### Start full system

```bash
make up
```

### Common URLs

- Main app: `https://localhost:8443`
- Grafana: `https://localhost:3001`

### Stop / inspect

```bash
make ps
make logs
make down
```

### Run individual services (local dev mode)

Examples:

```bash
# Auth service
cd auth-service
npm install
npm run dev

# Profile service
cd profile-service
npm install
npm run dev

# Statistics service
cd statistics-service
npm install
npm run dev

# Main frontend
cd front
npm install
npm run dev
```

---

## 9) Development

### Recommended workflow

1. Create/update `.env` and compose config via `make config`.
2. Run `make up` for integrated development.
3. Iterate inside the service folder you are modifying.
4. Validate via gateway routes and logs.

### Useful commands

```bash
make build        # Build images
make rebuild      # Build without cache + start
make restart      # Restart stack
make clean        # Stop + remove compose file/orphans
make clean-hard   # Destructive cleanup (volumes)
make exec-nginx   # Shell in gateway container
make exec-auth    # Shell in auth container
make exec-game    # Shell in game-service container
```

### Contribution guidance

- Keep domain logic within its owning service.
- Prefer backward-compatible API changes.
- Update environment variables and documentation with any contract change.
- Preserve health checks and observability when adding endpoints/services.

---

## 10) Design Decisions

### 1) API Gateway first

Using NGINX as a single entrypoint centralizes TLS, route mapping, and WebSocket proxying. This reduces duplication and enforces consistent security behavior.

### 2) Domain isolation with per-service storage

Each core domain persists its own SQLite data. This simplifies ownership boundaries and avoids tight coupling at the persistence layer.

### 3) Mixed frontend strategy

The repository intentionally contains:

- a product-focused Next.js app (`front/`), and
- a specialized game frontend (`game/client`) served separately.

This supports independent release cadence for gameplay UX and broader platform UX.

### 4) Observability as a built-in concern

Prometheus/Grafana/Alertmanager are part of the default stack, enabling performance and reliability checks from day one instead of post-hoc instrumentation.

### Trade-offs

- SQLite keeps local setup simple but is less suitable for horizontal scale.
- Multiple services improve modularity but increase orchestration complexity.
- Gateway-centered routing is operationally clean but adds a single critical edge component.

---

# ft_transcendence Module Compliance Audit

## 1. Executive Summary

Total Major modules fulfilled: **10**
Total Minor modules fulfilled: **4**
Estimated total points: **24**

## 2. Fulfilled Modules

### 2.1 Major: Framework for both frontend and backend

- Frontend stack is based on **Next.js + React**.
- Backend stack uses **Fastify** services and **Express/Colyseus** for game realtime server.

### 2.2 Major: Real-time features using WebSockets

- Realtime game server uses Colyseus websocket transport.
- Chat websocket is handled in profile-service and proxied via nginx.

### 2.3 Major: Allow users to interact with other users

- Friends system includes send/accept/reject/cancel/remove/block/unblock.
- Global chat is available in frontend and backend websocket handling.

### 2.4 Minor: Multiple languages (>=3)

- Languages implemented: English, Spanish, Italian.
- Language switcher present in navigation UI.

### 2.5 Minor: Additional browsers support

- Frontend implementation uses standard web technologies; no browser-locked APIs.
- Should be defended by showing live run on at least two browsers beyond Chrome during evaluation.

### 2.6 Major: Standard user management and authentication

- Endpoints for signup/login/verify/logout/password change/account deletion.
- Access/refresh token flow with JWT verification and session checks.

### 2.7 Minor: Game statistics and match history

- Statistics service stores game results and exposes leaderboard/history.
- Profile/statistics integration supports retrieving per-user match history.

### 2.8 Major: AI Opponent

- AI room (`ai_game_room`) and AI controller (`AIPaddleController`) are implemented in game server.

### 2.9 Major: Implement a complete web-based game where users can play against each other.

- The game can be real-time multiplayer.
- Players must be able to play live matches.
- The game must have clear rules and win/loss conditions.
- The game can be 2D or 3D.

### 2.10 Major: Remote players (2 separate computers)

- PvP Colyseus room supports 2 real-time players connected remotely.
- Room listing/join flow and game-state sync are implemented.

### 2.11 Major: Advanced 3D graphics with Babylon.js

- Game backend simulation uses Babylon.js engine primitives and 2D scene entities.
- Game client/server architecture is designed around Babylon.js-compatible 2D gameplay.

### 2.12 Minor: Gamification system

- Achievements section and progression rules are implemented in the profile UI layer.

### 2.13 Major: Monitoring with Prometheus and Grafana

- Compose stack includes Prometheus, Grafana, cAdvisor, nginx exporter and dashboards.

### 2.14 Major: Backend as microservices

- Service decomposition is present (auth/profile/statistics/game/gateway/front/observability).
