# Auth Service

A **TypeScript authentication microservice** built with **Fastify**.

It provides:

- JWT authentication (RS256)
- Access tokens + refresh tokens
- Session tracking
- CSRF protection
- Password hashing with Argon2
- SQLite persistence
- Internal service authentication

This service is designed to be part of a **microservice architecture** and communicates with a **Profile Service**.

---

# Features

- User signup & login
- JWT access tokens (RS256)
- Refresh tokens stored in DB
- Session validation
- CSRF protection
- Password change
- Account deletion
- Internal service-to-service authentication
- Automatic session cleanup
- Automatic refresh token cleanup
- Docker-ready

---

# Technologies Used

## Backend

- **Node.js 20**
- **TypeScript**
- **Fastify**

## Authentication & Security

- **JWT (jsonwebtoken)** — token based authentication
- **RS256 (RSA 2048)** — asymmetric JWT signing
- **Argon2id** — password hashing
- **CSRF protection** using double submit cookie pattern

## Database

- **SQLite3**

Two separate databases are used:

- `auth.db` → users and sessions
- `tokens.db` → refresh tokens

## Validation

- **Zod** — runtime request validation

## Cryptography

- **Node.js crypto module**
- RSA key pair generation for JWT signing

## Infrastructure

- **Docker**
- **Docker multi-stage builds**
- **Docker entrypoint scripts**

## Internal Communication

- **node-fetch** — HTTP communication between services
- **Service token authentication**

## Utilities

- **Chalk** — colored logs

---

# Project Structure

```
.
├── Dockerfile
├── docker-entrypoint.sh
├── node_modules
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
│
├── scripts
│   └── generate-keys.cjs
│
├── src
│   ├── index.ts
│   ├── auth.ts
│   ├── keys.ts
│   ├── generateKeys.ts
│   │
│   ├── database
│   │   ├── db.ts
│   │   └── dbTokens.ts
│   │
│   ├── tokens
│   │   ├── token.ts
│   │   └── refresh.ts
│   │
│   ├── validation
│   │   ├── checkInput.ts
│   │   └── password.ts
│   │
│   ├── utils
│   │   └── helpers.ts
│   │
│   └── types
│       └── auth.interfaces.ts
```

---

# Architecture

The service uses **two SQLite databases**.

## Main Database

```
data/auth.db
```

Tables:

- `users`
- `user_sessions`

## Refresh Token Database

```
data/tokens.db
```

Tables:

- `refresh_tokens`

Separating refresh tokens improves **security and scalability**.

---

# Environment Variables

Required:

```
PROFILE_SERVICE_URL=http://profile-service:8080
SERVICE_TOKEN=internal_service_secret
```

Optional:

```
AUTH_DATA_DIR=/app/data
AUTH_DB_PATH=/app/data/auth.db
AUTH_TOKENS_DB_PATH=/app/data/tokens.db

JWT_PRIVATE_KEY_PATH=/app/jwt-private.pem
JWT_PUBLIC_KEY_PATH=/app/jwt-public.pem
```

---

# JWT Keys

The service uses **RSA 2048 keys** for signing tokens.

Required files:

```
jwt-private.pem
jwt-public.pem
```

Generate locally:

```bash
npm run generate-keys
```

---

# Docker Key Handling

During container startup `docker-entrypoint.sh`:

1. Checks `/app/keys`
2. If empty → copies `jwt-*.pem`
3. Sets ownership for `app:app`

This allows:

- persistent keys
- safe container restarts

---

# Docker Usage

## Build Image

```bash
docker build -t auth-service .
```

## Run Container

```bash
docker run -p 8081:8081 \
  -e PROFILE_SERVICE_URL=http://profile-service:8080 \
  -e SERVICE_TOKEN=my-secret \
  -v ./data:/app/data \
  -v ./keys:/app/keys \
  auth-service
```

---

# API Endpoints

## Public

```
POST /auth/signup
POST /auth/login
POST /auth/logout
GET  /auth/verify
```

## Authenticated

```
POST   /auth/password
DELETE /auth/deleteme
```

## Internal (service-to-service)

Requires header:

```
Authorization: Bearer SERVICE_TOKEN
```

Endpoints:

```
GET /internal/auth/session_state/:id
```

---

# Security

## Password Hashing

Passwords are hashed using:

```
argon2id
```

---

## JWT Tokens

Access Token:

```
Algorithm: RS256
Expiration: 1 hour
Stored in cookie: access_token
```

Refresh Token:

```
Expiration: 7 days
Stored in cookie: refresh_token
Stored in database
```

---

# CSRF Protection

CSRF token stored in cookie:

```
csrf_token
```

Client must send header:

```
X-CSRF-Token
```

Ignored routes:

```
/auth/signup
/auth/login
/auth/logout
```

---

# Session Management

Every login creates a session stored in:

```
user_sessions
```

Expired sessions are cleaned automatically every:

```
15 minutes
```

---

# Refresh Token Cleanup

Expired refresh tokens are revoked automatically every:

```
15 minutes
```

---

# Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build project:

```bash
npm run build
```

Start production build:

```bash
npm start
```

---

# Health Check

Endpoint:

```
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "auth-service"
}
```

---

# License

MIT
