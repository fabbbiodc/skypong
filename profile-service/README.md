# Player Service

Player Service is a **Node.js + TypeScript microservice** responsible for managing player profiles, statistics, social relationships, and profile data used by other services in the system.

The service exposes HTTP APIs for profile operations and communicates with other internal services (Auth and Stats) to synchronize session state and game results.

---

# Technologies

- Node.js
- TypeScript
- Fastify
- SQLite3
- Axios
- Zod (input validation)
- Sharp (avatar processing)
- ts-node-dev (development)
- Chalk (logging)

---

# Architecture

The service follows a **layered architecture**:

HTTP Routes → Service Layer → Repository Layer → SQLite Database

### Layer Responsibilities

**Routes**
- Handle HTTP requests
- Parse headers and parameters
- Validate input
- Call service logic

**Service Layer**
- Implements domain logic
- Validates user actions
- Coordinates repositories and external services

**Repository Layer**
- Executes SQL queries
- Works directly with SQLite
- Returns structured data

**Database Layer**
- Initializes database
- Creates tables and indexes
- Manages database connection

---

# Project Structure

```
src/
 ├── index.ts
 ├── dbPlayers.ts
 ├── player.ts
 ├── friend.ts
 ├── friendService.ts
 │
 ├── types/
 │   ├── profile.enums.ts
 │   ├── profile.interfaces.ts
 │   └── profile.types.ts
 │
 ├── utils/
 │   └── helpers.ts
 │
 ├── validation/
 │   └── checkInput.ts
 │
uploads/
 └── avatars/

dist/
```

---

# Database

The service uses **SQLite** for persistence.

## players

Stores base profile data.

```
user_id TEXT PRIMARY KEY
nickname TEXT
avatarUrl TEXT
winPhrase TEXT
localization TEXT
created_at TEXT
last_access_at TEXT
logged INTEGER
access_expires_at TEXT
deleted INTEGER
deleted_at TEXT
```

---

## player_stats

Stores competitive statistics.

```
user_id TEXT PRIMARY KEY
wins INTEGER
losses INTEGER
played INTEGER
winrate REAL
rate INTEGER
updated_at TEXT
```

---

## player_ai_stats

Stores statistics for matches against AI.

```
user_id TEXT PRIMARY KEY
wins INTEGER
losses INTEGER
rate INTEGER
```

---

## friends

Stores user relationships.

```
id INTEGER PRIMARY KEY
user1_id TEXT
user2_id TEXT
status TEXT
requester_id TEXT
blocked_by TEXT
created_at TEXT
```

status values:

- pending
- accepted
- blocked

---

# Core Features

## Profile Management

- Create player profile
- Update profile information
- Upload avatar
- Soft delete profile

## Social System

- Send friend requests
- Accept / reject requests
- Cancel outgoing requests
- Block / unblock users
- List friends
- Query relationship state

## Player Statistics

- Update rating after games
- Support PvP and AI matches
- Maintain leaderboard data
- Track winrate and rating

## Game History

Game history is fetched from the **Statistics Service** and enriched with player profile data.

---

# Authentication

The service supports two authentication modes.

## Client Requests

Client requests must include:

```
x-user-id: USER_ID
```

---

## Internal Service Requests

Internal services must use a service token:

```
Authorization: Bearer SERVICE_TOKEN
```

---

# API Endpoints

## Profile

```
GET /me
```

Returns private player profile.

```
PATCH /me
```

Update player profile.

```
POST /me/avatar
```

Upload avatar.

```
GET /users/:id
```

Get public profile.

```
POST /internal/profile/delete
```

Soft delete profile (internal use).

---

## Friends

```
POST /friends/:toId
```

Send friend request.

```
POST /friends/:requesterId/accept
```

Accept friend request.

```
POST /friends/:requesterId/reject
```

Reject friend request.

```
POST /friends/:requesterId/cancel
```

Cancel outgoing request.

```
DELETE /friends/:friendId
```

Remove friend.

```
POST /friends/:targetId/block
```

Block user.

```
POST /friends/:targetId/unblock
```

Unblock user.

```
GET /friends
```

Get friends list.

```
GET /friends/requests/incoming
```

Incoming friend requests.

```
GET /friends/requests/outgoing
```

Outgoing friend requests.

```
GET /friends/blocked
```

List blocked users.

```
GET /friends/:otherId/status
```

Get relationship status.

---

# Leaderboard Synchronization

Leaderboard data includes:

- played
- wins
- losses
- winrate
- rate
- updated_at

Leaderboard queries support **incremental synchronization** using `updated_at`.

---

# Game Result Processing

When a match result is received:

1. Game ID is reserved to prevent double processing
2. Player statistics are loaded
3. Rating changes are calculated
4. Stats are updated inside a transaction
5. Changes are committed

AI matches are processed using a separate rating calculation.

---

# Input Validation

Validation is implemented using **Zod**.

Example rules:

- nickname must be at least 4 characters
- winPhrase cannot be empty
- at least one field must be provided in update requests

---

# Error Handling

The service returns structured errors.

Example response:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

Common error codes:

```
UNAUTHORIZED
ALREADY_EXISTS
REQUEST_NOT_FOUND
ALREADY_FRIENDS
USER_BLOCKED
NOT_BLOCKED
NOT_FRIENDS
CANNOT_ADD_SELF
CANNOT_BLOCK_SELF
```

---

# Environment Variables

Create a `.env` file:

```
SERVICE_TOKEN=your_internal_service_token
AUTH_API=http://auth-service
STATS_API=http://stats-service
```

---

# Setup & Run

Clone repository:

```
git clone <repo-url>
cd profile
```

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

Build project:

```
npm run build
```

Run production build:

```
npm start
```

---

# Cleanup Script

Before pushing or shutting down:

```bash
./clean-up.sh
```

---

# Notes

- SQLite is used for simplicity and portability
- All relations use normalized user IDs
- One relation exists per user pair
- Soft delete preserves historical data
- Database operations use transactions for consistency

---

# License

ISC
