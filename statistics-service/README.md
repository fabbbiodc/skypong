# Stat Service

TypeScript-based statistics and leaderboard service built with **Fastify**.
Tracks game results between players, updates a leaderboard, and synchronizes with a Profile Service.

---

## Features

- Tracks game results between **exactly 2 players**
- Stores statistics in **SQLite**
- Leaderboard with multiple indexes: `rate`, `winrate`, `wins`, `played`
- Synchronization workers for statistics and leaderboard
- REST API for submitting game results and fetching leaderboard
- Token-based internal authentication

---

## Prerequisites

- Node.js 20+
- npm
- Docker
- Git

---

## Project Structure

```
.
├── Dockerfile
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── database
│   │   ├── dbLeaderboard.ts
│   │   └── dbStats.ts
│   ├── gameresults.ts
│   ├── index.ts
│   ├── types
│   │   ├── stats.const.ts
│   │   ├── stats.enums.ts
│   │   └── stats.types.ts
│   ├── utils
│   │   └── helpers.ts
│   └── workers
│       ├── leaderboardWorker.ts
│       └── statsWorker.ts
└── tsconfig.json

```

---

## NPM Scripts

- `npm run dev` — Run in development mode with hot reload (`ts-node-dev`)
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run compiled JS from `dist/`

---

## Configuration & Security

- **Service token** for internal API access: Set via `SERVICE_TOKEN` environment variable.
- **SQLite databases** (created automatically in project root or `./data`):
  - `statistics.db` — Stores game results
  - `leaderboard.db` — Stores cached leaderboard data

---

## Docker

- Container exposes **port 6000**
- Volume `./data` persists SQLite databases
- Set `SERVICE_TOKEN` in container environment for security

---

## API Endpoints

### Add Game Result

- **POST** `/internal/statistics/gameresult/update`
- **Headers**: `Authorization: Bearer <SERVICE_TOKEN>`
- **Body schema**:

```
{
  "game_id": "string",
  "start_at": "ISO string",
  "end_at": "ISO string",
  "players": [
    {
      "user_id": "string",
      "user_score": 0,
      "user_result": "win|loss"
    },
    {
      "user_id": "string",
      "user_score": 0,
      "user_result": "win|loss"
    }
  ]
}
```

- Must have exactly 2 players.

### Get Leaderboard

- **GET** `/statistics/leaderboard`
- **Query params**:
  - `by` — leaderboard index (`rate`, `winrate`, `wins`, `played`)
  - `limit` — number of results (default 50)
  - `offset` — offset for pagination (default 0)

- **Response**:

```
{
  "leaderboard": [
    {
      "user_id": "string",
      "played": 10,
      "wins": 6,
      "losses": 4,
      "winrate": 0.6,
      "rate": 1500,
      "updated_at": "ISO string",
      "nickname": "string",
      "avatarUrl": "string"
    }
  ]
}
```

### Get Games History by User

- **GET** `/internal/statistics/games/history/:id`
- **Headers**: `Authorization: Bearer <SERVICE_TOKEN>`
- Returns all games where user participated.

---

## Database Structure

### Statistics DB (`statistics.db`)

- Table `games_and_results`:
  - `game_id`, `user1_id`, `user2_id`, `user1_score`, `user2_score`
  - `user1_result`, `user2_result`, `start_at`, `end_at`
  - `processed`, `processing`, `processed_at`, `created_at`
  - `game_mode` (`ai` | `remote-pvp`)

### Leaderboard DB (`leaderboard.db`)

- Table `leaderboard_cache`:
  - `user_id`, `played`, `wins`, `losses`, `winrate`, `rate`, `updated_at`

- Indexes: `rate`, `winrate`, `played`, `wins`

---

## Workers

### Statistics Worker

- Fetches unprocessed games from `games_and_results`
- Sends updates to **Profile Service API**
- Marks games as processed
- Runs in a loop with exponential backoff

### Leaderboard Worker

- Fetches leaderboard updates from Profile Service API
- Updates `leaderboard_cache`
- Runs in a loop with exponential backoff

---

## Setup & Run

1. Clone the repository:

```
git clone <repo-url>
cd stat-service
```

2. Install dependencies:

```
npm install
```

3. Run in development mode:

```
npm run dev
```

4. Or build and run production:

```
npm run build
npm start
```

5. Ensure `SERVICE_TOKEN` is set in environment for internal APIs.

---

## Shutdown

- Handles `SIGINT` and `SIGTERM`
- Stops Fastify server
- Closes SQLite databases
- Stops statistics and leaderboard workers

---

## Notes

- Requires **Profile Service** for leaderboard synchronization
- Ensure both `statistics.db` and `leaderboard.db` are writable
- Default internal token is `"secret"` for local development; change in production
