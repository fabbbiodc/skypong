# Database Seed Service

A containerized service responsible for populating application databases with initial development data.

The seed service initializes multiple SQLite databases used by different application domains (authentication, profile management, and game statistics). It is intended to run once during environment startup and provide deterministic test data for development and integration testing.

---

# Purpose

The seed service provides:

- deterministic development data
- reproducible local environments
- automated database bootstrapping
- integration testing support

It ensures that developers and CI environments start with identical database states.

---

# System Context

The service is part of a larger backend ecosystem composed of multiple domain services.

```
                +--------------------+
                |   Database Seed    |
                |      Service       |
                +----------+---------+
                           |
         -----------------------------------------
         |                 |                     |
         ▼                 ▼                     ▼
   auth.db           profile.db           statistics.db
 (Auth Domain)      (Profile Domain)     (Game Domain)
```

Each database belongs to a different service or domain in the system.

---

# Architecture

The seeding logic is organized using a **domain-based modular structure**.

Each module is responsible for populating data for a specific domain.

```
seed.js
│
├── authSeed.js
│
├── profileSeed.js
│
└── statSeed.js
```

## Execution Flow

```
Application Start
      │
      ▼
Connect to databases
      │
      ▼
Seed authentication users
      │
      ▼
Seed player profiles and friendships
      │
      ▼
Seed game statistics
      │
      ▼
Exit
```

The output of the authentication seed (user IDs) is used by the profile and statistics seeds.

---

# Databases

The seed service populates three independent SQLite databases.

| Database      | Domain         | Responsibility                         |
| ------------- | -------------- | -------------------------------------- |
| auth.db       | Authentication | Stores user credentials                |
| profile.db    | Social/Profile | Stores player profiles and friendships |
| statistics.db | Gameplay       | Stores match history and results       |

This separation mirrors the architecture of the backend services that own these databases.

---

# Data Flow

```
authSeed
   │
   │ creates
   ▼
users
   │
   │ returned to seed.js
   ▼
profileSeed
   │
   ├── players
   ├── player_stats
   ├── player_ai_stats
   └── friends
   │
   ▼
statSeed
   │
   ▼
games_and_results
```

User IDs generated during authentication seeding are reused across the other domains to maintain referential consistency.

---

# Technologies

| Technology | Purpose                      |
| ---------- | ---------------------------- |
| Node.js 20 | Runtime environment          |
| SQLite3    | Embedded relational database |
| UUID       | Unique identifier generation |
| Argon2     | Secure password hashing      |
| Docker     | Containerized execution      |

---

# Security Considerations

Passwords are hashed using **Argon2 (argon2id)** before being stored in the database.

```
argon2.hash(password, { type: argon2.argon2id })
```

Argon2 provides strong resistance against:

- brute force attacks
- GPU cracking
- rainbow tables

---

# Idempotency

The seed process is designed to be **idempotent**.

Running the seed multiple times will not create duplicate records.

Techniques used:

### User existence checks

```
SELECT id FROM users WHERE email = ?
```

### Insert guards

```
INSERT OR IGNORE
```

### Deterministic friendship pairs

User IDs are sorted before inserting friendship records.

```
const [u1, u2] = [a, b].sort();
```

This guarantees unique relationships.

---

# Seeded Data

The seed generates a small but realistic dataset.

### Users

9 development users are created.

Example:

```
aliceCooper@test.com
bobTeylor@test.com
carolGemenez@test.com
```

Default password:

```
qwer1234!
```

### Profiles

Each user receives:

- player profile
- PvP statistics
- AI statistics

### Social Graph

A predefined friendship network is created including:

- accepted friendships
- pending requests
- blocked users

This enables testing of social features.

### Game Results

Seeded matches include:

- PvP matches
- AI matches

Example modes:

```
remote-pvp
ai
```

This supports development of:

- match history
- statistics calculations
- leaderboards

---

# Project Structure

```
seed/
│
├── Dockerfile
├── package.json
├── README.md
├── seed.js
│
└── helpers
    ├── authSeed.js
    ├── profileSeed.js
    └── statSeed.js
```

## seed.js

Main orchestration layer.

Responsibilities:

- connect to databases
- execute domain seed modules
- propagate generated users
- handle process lifecycle

---

## authSeed.js

Responsible for authentication data.

Creates records in:

```
users
```

Features:

- UUID identifiers
- Argon2 password hashing
- duplicate protection

---

## profileSeed.js

Responsible for profile and social data.

Tables populated:

```
players
player_stats
player_ai_stats
friends
```

Also generates a **predefined friendship graph**.

---

## statSeed.js

Responsible for match history.

Table populated:

```
games_and_results
```

Includes:

- PvP matches
- AI matches

---

# Docker

The seed service runs inside a lightweight container.

## Dockerfile

```Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "seed.js"]
```

---

# Running the Service

## Build container

```
docker build -t db-seed .
```

## Run seed process

```
docker run db-seed
```

---

# Expected Output

Example logs:

```
✅ Created user: aliceCooper@test.com
⚠️ User already exists, skipped: bobTeylor@test.com
✅ Record inserted
⚠️ Record exists, skipped
```

Final status:

```
✅ SEED COMPLETED
```

If an error occurs:

```
❌ SEED FAILED
```

---

# When This Service Runs

Typical execution scenarios:

- local development environment startup
- Docker Compose environment initialization
- integration testing pipelines
- CI environment preparation

The service is expected to run **once during environment bootstrap**.

---

# Future Improvements

Potential enhancements:

- configurable seed datasets
- environment-specific seeds
- randomized match generation
- bulk inserts for faster seeding
- migration-aware seeding
