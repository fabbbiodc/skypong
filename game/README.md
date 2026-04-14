# SkyPong

A real-time 3D multiplayer pong game built with Babylon.js and Colyseus, featuring PBR rendering, server-authoritative physics, and multiple game modes.

## Features

- **Multiple game modes** -- AI opponents (easy / medium / hard), local 2-player split-screen, and online PvP with room-based matchmaking
- **PBR rendering** -- Physically Based Rendering pipeline with EXR environment maps, real-time shadows, refractive glass paddles, and PBR material system (albedo, normal, ORM maps). Significant research went into achieving realistic material rendering within Babylon.js, including environment-based lighting, refraction/transmission for glass materials, and proper metallic-roughness workflows
- **Server-authoritative architecture** -- All physics and game logic run on the server using Babylon.js NullEngine (headless), preventing cheating and ensuring fairness
- **Real-time state synchronization** -- Colyseus Schema-based state sync with client-side interpolation for smooth gameplay
- **Touch & mobile support** -- On-screen touch controls with automatic detection
- **Internationalization** -- UI available in English, Spanish, and Italian
- **Configurable matches** -- Selectable winning score (3, 5, 7, 9, 11) and camera views (angled, top-down)
- **Dockerized deployment** -- Multi-stage Docker builds for both client and server, with Cloudflare Tunnel support for NAT-restricted environments

## Tech Stack

| Layer              | Technologies                                                                       |
| ------------------ | ---------------------------------------------------------------------------------- |
| **Client**         | Babylon.js 8, React 18, Vite 5, TypeScript, Colyseus.js                            |
| **Server**         | Colyseus 0.15, Babylon.js NullEngine (headless physics), Express, Node.js          |
| **Shared**         | `@skypong/common` -- Colyseus Schema definitions, physics constants, base entities |
| **Infrastructure** | Docker (multi-stage builds), nginx, Cloudflare Tunnel                              |

## Project Structure

```
game/
├── client/                     # Browser client (Vite + React + Babylon.js)
│   ├── public/                 # Static assets
│   │   ├── environment/        # EXR skybox / environment map
│   │   ├── textures/           # PBR texture sets (albedo, normal, ORM)
│   │   └── icons/              # UI icons (touch controls, pause)
│   └── src_cli/
│       ├── components/         # React pages (Canvas, Start, Loading)
│       ├── config/             # Rendering, materials, camera, UI, server connection
│       ├── entities/           # Client-side ball, paddle, table (visual meshes)
│       ├── factories/          # PBR material factory (dynamic texture loading)
│       ├── game/               # Game orchestration, loop, countdown, room management
│       ├── input/              # Keyboard input controller
│       ├── physics/            # Client-side interpolation engine
│       ├── rendering/          # Engine setup, scene lights, cloud objects
│       ├── types/              # Game session config, loading state types
│       ├── ui/                 # HUD, pause overlay, game over overlay, touch controls
│       └── utils/              # Camera utilities, config decoder, touch detection
│
├── server/                     # Authoritative game server (Colyseus + Babylon.js NullEngine)
│   └── src_serv/
│       ├── ai/                 # AI paddle controller with 3 difficulty levels
│       ├── config/             # Server, room, and timing configuration
│       ├── data/               # Game statistics reporting
│       ├── entities/           # Server-side ball, paddle, table (physics bodies)
│       ├── input/              # Input aggregation from connected clients
│       ├── physics/            # Server-side physics engine (collisions, movement)
│       └── rooms/              # Room types: GameRoom, AIGameRoom, PvpRoom
│
├── common/                     # Shared package (@skypong/common)
│   ├── GameState.ts            # Colyseus Schema (ball, paddles, scores, game state)
│   ├── constants/              # Game, physics, AI, network, scoring, timing constants
│   └── entities/               # Base entity classes (BaseBall, BasePaddle, BaseTable)
│
├── docker-compose.yml          # Orchestrates client + server containers
├── Dockerfile.client           # Multi-stage build: Vite → nginx
├── Dockerfile.server           # Multi-stage build: TypeScript → Node.js
└── nginx.conf                  # SPA routing for the client
```

## Architecture

```
┌─────────────────────────┐         WebSocket (Colyseus)         ┌──────────────────────────┐
│        CLIENT            │ ◄─────────────────────────────────► │         SERVER            │
│                          │                                      │                           │
│  Babylon.js renderer     │   Input messages (keyboard/touch)    │  Babylon.js NullEngine    │
│  PBR materials & lights  │ ────────────────────────────────►    │  (headless physics)       │
│  Interpolation engine    │                                      │                           │
│  React UI (HUD, menus)   │   State diffs (ball, paddles,       │  Collision detection      │
│  Touch controls          │   scores, game events)               │  Ball/paddle movement     │
│                          │ ◄────────────────────────────────    │  Scoring & game logic     │
│                          │                                      │  AI paddle controller     │
└─────────────────────────┘                                      └──────────────────────────┘
                                          │
                                 @skypong/common
                              (shared state schema,
                            constants, base entities)
```

The server is fully authoritative: clients send input, the server runs physics and game logic, then broadcasts state diffs. The client interpolates between server snapshots for smooth rendering.

---

## Backend Architecture

### Server Entry Point

[`server/src_serv/index.ts`](server/src_serv/index.ts):

```ts
const app = express();
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: createServer(app),
  }),
});
// Register rooms
gameServer.define("game_room", GameRoom);
gameServer.define("ai_game_room", AIGameRoom);
gameServer.define("pvp_room", PvpRoom).enableRealtimeListing();
gameServer.listen(SERVER_CONFIG.PORT, "0.0.0.0");
```

### Room-based Multiplayer Architecture

The server organizes gameplay into _rooms_ (Colyseus concept), each governing its own match with associated state and logic. Main room types:

- **GameRoom**: Local 1v1
- **AIGameRoom**: Single-player vs AI
- **PvpRoom**: Online PvP

Room setup example ([`server/src_serv/rooms/GameRoom.ts`](server/src_serv/rooms/GameRoom.ts)):

```ts
export class GameRoom extends Room<MyGameState> {
    onCreate(options: any): void {
        this.setState(new MyGameState());
        this.engine = new NullEngine();
        this.scene = new Scene(this.engine);
        this.physicsEngine = new PhysicsEngine(this.scene);
        this.serverTable = new ServerTable(this.scene);
        this.serverBall = new ServerBall(this.scene, this.physicsEngine);
        this.serverPaddle = new ServerPaddle(this.scene, this.physicsEngine, false);
        this.serverPaddle2 = new ServerPaddle(this.scene, this.physicsEngine, true);
        this.inputManager = new InputManager();
        this.onMessage("input", (client, data) => { ... });
        this.onMessage("launch", (client, data) => { ... });
        this.setSimulationInterval((dt) => { this.update(dt); }, SERVER_CONFIG.SIMULATION_INTERVAL_MS);
    }
}
```

### State Synchronization

Game state is synchronized between all clients and the server using [Colyseus "Schema" objects](https://docs.colyseus.io/state/schema/).

Schema example ([`common/GameState.ts`](common/GameState.ts)):

```ts
export class MyGameState extends Schema {
  @type(BallState) ball = new BallState();
  @type(PaddleState) paddle = new PaddleState();
  @type(PaddleState) paddle2 = new PaddleState();
  @type("number") player1Score: number = 0;
  @type("number") player2Score: number = 0;
  @type("boolean") gameOver: boolean = false;
  @type("boolean") gameStarted: boolean = false;
}
```

Server mutates `MyGameState`, which Colyseus broadcasts efficiently as diffs to all clients.

### Server-side Physics & Entities

Physics computations are performed using Babylon.js's NullEngine (headless, no rendering). Each entity is represented by a class:

- Ball: [`entities/ServerBall.ts`](server/src_serv/entities/ServerBall.ts)
- Paddle: [`entities/ServerPaddle.ts`](server/src_serv/entities/ServerPaddle.ts)
- Table: [`entities/ServerTable.ts`](server/src_serv/entities/ServerTable.ts)
- Physics core: [`physics/PhysicsEngine.ts`](server/src_serv/physics/PhysicsEngine.ts)

Physics tick sample ([`PhysicsEngine.ts`](server/src_serv/physics/PhysicsEngine.ts)):

```ts
public updateBall(body: BallBody, deltaTimeMs: number): void {
    body.mesh.position.addInPlace(body.velocity);
    if (body.isInFall) body.velocity.addInPlace(this.gravity);
    if (!body.isInFall && Math.abs(body.mesh.position.z) > ROOM_CONFIG.FALL_THRESHOLD_Z) body.isInFall = true;
    if (body.isInFall && body.mesh.position.y <= body.fallThreshold) this.disableBody(body);
}
```

### Input Aggregation

Player inputs are received as messages and aggregated per-frame. InputManager example ([`server/src_serv/input/InputManager.ts`](server/src_serv/input/InputManager.ts)):

```ts
setInput(sessionId: string, data: any): void {
    this.inputMap[sessionId] = data;
}
getMovementVector(): Vector3 {
    this.moveDirection.set(0, 0, 0);
    for (let sessionId in this.inputMap) {
        const inputs = this.inputMap[sessionId];
        if (inputs["w"]) this.moveDirection.z += 1;
        // ...
    }
    return this.moveDirection;
}
```

### AI Paddle Controller

The AI paddle for single-player is computed fully server-side:

- [`ai/AIPaddleController.ts`](server/src_serv/ai/AIPaddleController.ts)
- Difficulty settings: [`common/constants/AIConstants.ts`](common/constants/AIConstants.ts)

Sample ([`AIPaddleController.ts`](server/src_serv/ai/AIPaddleController.ts)):

```ts
export class AIPaddleController {
  constructor(paddle, ball, physics, difficulty) {
    this.settings = DIFFICULTY_SETTINGS[difficulty];
  }
  update() {
    // Decide new paddle target based on ball and difficulty
  }
}
```

### Room Lifecycle & Disposal

Automatic room disposal and cleanup are configured to avoid resource leaks:

```ts
this.autoDispose = true; // Dispose room when all players disconnect
```

PvP Room starts expiration timer for lobbies ([`PvpRoom.ts`](server/src_serv/rooms/PvpRoom.ts)):

```ts
this.expirationTimer = setTimeout(() => {
  if (!this.player2Client) {
    // ...expire room
  }
}, 120000); // 2 minutes
```

### Configuration & Constants

Centralized, shared constants ensure consistency:

- ServerConfig: [`server/src_serv/config/ServerConfig.ts`](server/src_serv/config/ServerConfig.ts)
- RoomConfig: [`server/src_serv/config/RoomConfig.ts`](server/src_serv/config/RoomConfig.ts)
- GameConstants: [`common/constants/GameConstants.ts`](common/constants/GameConstants.ts)
- NetworkConstants: [`common/constants/NetworkConstants.ts`](common/constants/NetworkConstants.ts)
- TimingConfig: [`server/src_serv/config/TimingConfig.ts`](server/src_serv/config/TimingConfig.ts)

Sample ([`ServerConfig.ts`](server/src_serv/config/ServerConfig.ts)):

```ts
export const SERVER_CONFIG = {
  PORT: 2567,
  SIMULATION_FPS: 60,
  SIMULATION_INTERVAL_MS: 16.66,
  DEBUG_MODE: false,
};
```

---

## Client-to-Server Communication

SkyPong uses Colyseus WebSockets for real-time messaging and state sync.

### Session Establishment

- Client initializes Colyseus client:
  ```ts
  const client = new Colyseus.Client(SERVER_CONNECTION.WS_URL); // client/src_cli/game/Game.ts
  ```
- Connects to server ws://localhost:2567 (or as configured).

### Room Joining/Creation

- Client joins or creates a room (local, AI, PvP):
  ```ts
  room = await client.create<GameState>(SERVER_CONNECTION.ROOMS.PVP_ROOM, {
    playerName,
    playerColor,
  });
  room = await client.joinOrCreate<GameState>(
    SERVER_CONNECTION.ROOMS.GAME_ROOM,
    { playerName, playerColor },
  );
  ```
- Server creates room instance and invokes `onCreate()`:
  ```ts
  gameServer.define("pvp_room", PvpRoom)
  export class PvpRoom extends Room<MyGameState> { onCreate(options) { this.setState(new MyGameState()); ... } }
  ```

### State Synchronization & Listeners

- Room state is Colyseus Schema (`MyGameState`). All changes propagate automatically:
  ```ts
  room.state.ball.onChange(() => { ... });
  room.state.paddle.onChange(() => { ... });
  room.state.listen('player1Score', cb);
  room.state.listen('gameStarted', cb);
  room.state.listen('player2Id', cb);
  ```
- Server-side:
  ```ts
  this.state.ball.x = ...;
  this.state.gameOver = true;
  ```

### Input & Actions

- Client sends input every few frames via message:
  ```ts
  room.send("input", { w: pressedW, a: pressedA, ... });
  // server/src_serv/rooms/GameRoom.ts:
  this.onMessage("input", (client, data) => { this.inputManager.setInput(client.sessionId, data); });
  ```
- Other message types:
  - `launch`: triggers ball launch
  - `client_ready`: for PvP game sync
  - `pause` / `resume`: game pause control

### Game Events & Feedback

- Server processes input and emits events:
  ```ts
  client.send("room_expired", { message: "No opponent joined..." }); // server/src_serv/rooms/PvpRoom.ts
  room.onMessage('room_expired', ...); // client/src_cli/game/Game.ts
  ```

### State Update Example

- Client receives ball, paddle, score updates via Schema listeners:
  ```ts
  room.state.ball.listen("collisionCount", ...);
  room.state.ball.onChange(() => { ... });
  room.state.paddle.onChange(() => { ... });
  room.state.paddle2.onChange(() => { ... });
  room.state.listen('player1Score', ...);
  room.state.listen('player2Score', ...);
  room.state.listen('winner', ...);
  room.state.listen('gameOver', ...);
  room.state.listen('gameStarted', ...);
  ```

### Game Start & Synchronization (PvP)

- PvP room: clients signal ready with `client_ready`.
- Server tracks readiness; when `gameStarted` is set true, clients start countdown and gameplay.
- Code references:
  - `client_ready` & `gameStarted`: client/src_cli/game/Game.ts, server/src_serv/rooms/PvpRoom.ts, common/GameState.ts

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Local Development

Install dependencies from the workspace root:

```bash
cd game
npm install
```

Then run the server and client in two separate terminals:

**Terminal 1 -- Server:**

```bash
cd game/server
npm start
```

The server starts on `ws://localhost:2567` with hot-reload via nodemon.

**Terminal 2 -- Client:**

```bash
cd game/client
npm run dev
```

The client starts on `http://localhost:5173` with Vite HMR.

This dev mode setup lets you iterate quickly -- the server reloads on file changes and the client hot-reloads in the browser.

### Docker Deployment

```bash
cd game
docker compose up -d
```

This builds and starts both containers:

- **skypong-client** -- nginx serving the built React app on port 80
- **skypong-server** -- Colyseus WebSocket server on port 2567

#### Container Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                       │
│  ┌──────────────────┐      ┌──────────────────────┐    │
│  │   skypong-client  │      │   skypong-server      │    │
│  │   (nginx)        │      │   (Node.js)          │    │
│  │   Port 80        │      │   Port 2567          │    │
│  │  Static React    │      │   WebSocket Server   │    │
│  └──────────────────┘      └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         ↑                         ↑
   cloudflared               cloudflared
   tunnel :80                tunnel :2567
         ↑                         ↑
   Cloudflare                Cloudflare
   Edge                      Edge
         ↑                         ↑
         Internet Access For Clients
```

#### Dockerfile.server Highlights

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY common/package.json ./common/
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm install
COPY common/ ./common/
COPY server/ ./server/
WORKDIR /app/common
RUN npx tsc --skipLibCheck
WORKDIR /app/server
RUN npx tsc --skipLibCheck
FROM node:20-alpine AS production
WORKDIR /app
COPY package.json package-lock.json* ./
COPY common/package.json ./common/
COPY server/package.json ./server/
RUN npm install --omit=dev --workspace=server --workspace=common
COPY --from=builder /app/common/ ./common/
COPY --from=builder /app/server/dist/ ./dist/
EXPOSE 2567
CMD ["node", "dist/server/src_serv/index.js"]
```

#### docker-compose Server Section (excerpt)

```yaml
skypong-server:
  build:
    context: .
    dockerfile: Dockerfile.server
  container_name: skypong-server
  ports:
    - "2567:2567" # Colyseus backend
  environment:
    - PORT=2567
    - DEBUG_MODE=false
  restart: unless-stopped
  networks:
    - skypong-network
```

#### Cloudflare Tunnel Setup (NAT-restricted environments)

1. **SSH into your server**

   ```bash
   ssh username@your-server-ip
   ```

2. **Build & launch containers**

   ```bash
   cd ~/skypong
   sudo docker compose up -d
   ```

3. **Start Cloudflare tunnels** (two SSH sessions):
   - **Session 1:**
     ```bash
     cloudflared tunnel --url http://localhost:2567
     ```
   - **Session 2:**
     ```bash
     cloudflared tunnel --url http://localhost:80
     ```
     You'll get two `https://…trycloudflare.com` URLs. Each session must remain open.

4. **Update docker-compose for correct WebSocket URL**
   ```yaml
   args:
     VITE_SERVER_HOST: your-websocket-tunnel.trycloudflare.com # no scheme
     VITE_SERVER_PORT: "443"
     VITE_WS_PROTOCOL: wss
   ```
   Rebuild client after updating:
   ```bash
   sudo docker compose build --no-cache skypong-client
   sudo docker compose up -d skypong-client
   ```

#### Cloudflared Installation (Ubuntu/Debian amd64)

```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
cloudflared --version
```

See the [official guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) for more OSes.

#### Docker Command Cheat Sheet

```bash
# Start containers
docker compose up -d
# Stop containers
docker compose down
# Rebuild after code changes
git pull
docker compose up -d --build
# Status
docker compose ps
# Logs
docker compose logs -f
# Backend logs only
docker compose logs skypong-server
# Remove Docker cache (if errors)
docker system prune -af
docker volume prune -f
```

---

## Configuration

### Environment Variables (Client Build)

| Variable           | Default     | Description                        |
| ------------------ | ----------- | ---------------------------------- |
| `VITE_SERVER_HOST` | `localhost` | Game server hostname               |
| `VITE_SERVER_PORT` | `2567`      | Game server port                   |
| `VITE_WS_PROTOCOL` | `ws`        | WebSocket protocol (`ws` or `wss`) |
| `VITE_SERVER_PATH` | `/`         | WebSocket path                     |
| `VITE_BASE_PATH`   | `/`         | Base URL path for the client       |

### Game Session Options

| Option         | Values                                                                        | Description          |
| -------------- | ----------------------------------------------------------------------------- | -------------------- |
| `gameMode`     | `ai-easy`, `ai-medium`, `ai-hard`, `local-2p`, `online-create`, `online-join` | Game mode            |
| `winningScore` | `3`, `5`, `7`, `9`, `11`                                                      | Points needed to win |
| `cameraView`   | `angled`, `top-down`                                                          | Camera perspective   |
| `language`     | `en`, `es`, `it`                                                              | UI language          |

## Game Modes

| Mode                      | Room Type      | Description                                                                             |
| ------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| **AI (Easy/Medium/Hard)** | `ai_game_room` | Single player vs server-side AI with progressive difficulty degradation                 |
| **Local 2P**              | `game_room`    | Two players on the same device, top-down camera, split keyboard controls (A/D and J/L)  |
| **Online PvP**            | `pvp_room`     | Two remote players, room-based matchmaking with lobby listing, 2-minute room expiration |

## PBR Rendering

The rendering pipeline uses Babylon.js's PBR material system with careful attention to physically accurate results. A significant amount of research and iteration went into tuning the rendering to achieve a visually convincing result:

- **Environment lighting** -- EXR cubemap (`dramatic-sky1.exr`) for image-based lighting and skybox reflections. Multiple HDRIs and environment formats were evaluated before settling on the final skybox
- **Material system** -- A `MaterialFactory` dynamically loads PBR texture sets (albedo, normal, ORM) with configurable UV scaling, metallic/roughness values, and ambient occlusion. The ORM (Occlusion-Roughness-Metallic) packed texture workflow was chosen for efficiency after testing individual channel approaches
- **Glass paddles** -- Refractive PBR materials with configurable index of refraction, tint color, and transparency. Getting physically plausible glass with proper refraction required experimenting with Babylon.js's sub-surface scattering and transmission parameters
- **Lighting rig** -- Hemispheric ambient + directional light with blur exponential shadow maps + point light for specular highlights. The multi-light setup was carefully balanced to complement the environment-based lighting without washing out material details
- **Cloud particles** -- Sprite-based volumetric cloud layer beneath the play field, adding depth to the scene

---

## Troubleshooting

- **Backend not reachable**: Ensure `skypong-server` is running; check with `docker compose logs skypong-server`.
- **WebSocket connection fails**: Double-check `VITE_SERVER_HOST` in the web client args uses the correct tunnel URL (no `https://` prefix).
- **Firewall or NAT issues**: Use Cloudflare tunnel; port forwarding may not work with CGNAT.
- **Build errors** ("parent snapshot does not exist", etc):
  ```bash
  docker compose down
  docker system prune -af
  docker volume prune -f
  docker compose build --no-cache
  docker compose up -d
  ```
- **Client or server URLs change on every restart**: Obtain new tunnel URLs, update build args, and rebuild client.
- For permanent, custom URLs: Set up named tunnels and domains in Cloudflare (see Cloudflare documentation).
