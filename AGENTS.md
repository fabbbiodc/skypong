# AGENTS.md - SkyPong Project

## Project Overview

This is a full-stack Pong game with multiple microservices:

- `front/` - Next.js frontend (React 19, TailwindCSS 4)
- `auth-service/` - Fastify authentication service (TypeScript)
- `profile-service/` - Fastify profile service (TypeScript)
- `statistics-service/` - Fastify statistics service (TypeScript)
- `game/` - Monorepo with client (Babylon.js), server (Colyseus), and shared code

## Build Commands

### Root Level

```bash
npm run format                          # Format all source files with Prettier
```

### Frontend (Next.js)

```bash
cd front
npm run dev                             # Start development server
npm run build                           # Production build
```

### Auth Service

```bash
cd auth-service
npm run dev                             # Start with ts-node-dev (hot reload)
npm run build                           # Compile TypeScript to dist/
npm run start                           # Run production build
npm run generate-keys                  # Generate RSA keys for JWT
```

### Profile Service

```bash
cd profile-service
npm run dev                             # Start with ts-node-dev
npm run build                           # Compile TypeScript
npm run start                           # Run production build
```

### Statistics Service

```bash
cd statistics-service
npm run dev                             # Start with ts-node-dev
npm run build                           # Compile TypeScript
npm run start                           # Run production build
```

### Game Monorepo

```bash
cd game
npm install                             # Install workspaces (common, client, server)
cd common && npm run build             # Build shared types
cd client && npm run dev                # Start Vite dev server
cd server && npm start                  # Start game server with nodemon
```

### Docker Commands

```bash
make up                                # Start all services (detached)
make down                              # Stop all services
make restart                           # Restart all services
make logs                              # Follow all logs
make build                             # Build Docker images
make rebuild                           # Build without cache and restart
make exec-<service>                    # Shell into service container
```

## Code Style Guidelines

### Formatting (Prettier)

The project uses Prettier with these settings (from `.prettierrc.json`):

- 2-space indentation, no tabs
- Double quotes for strings
- Trailing commas on all arguments
- Semicolons required
- 80 character line width
- LF line endings

Run `npm run format` before committing.

### TypeScript

- Use strict mode where possible (`strict: true` in tsconfig)
- Prefer explicit types over `any` - avoid `any` unless necessary
- Use type inference for simple cases (`const x = 5` is fine)
- Define interfaces for complex objects and API responses
- Use generics when appropriate for reusable components

### Imports

- Use named imports: `import { something } from "module"`
- Avoid default exports where possible
- Group imports: external first, then internal
- Use path aliases where configured (e.g., `@/*` in front)

### Naming Conventions

- Files: kebab-case (e.g., `auth-service.ts`) or camelCase (e.g., `gameState.ts`)
- Functions/variables: camelCase
- Types/Interfaces/Classes: PascalCase
- Constants: UPPER_SNAKE_CASE
- React components: PascalCase

### Error Handling

- Use try/catch for async operations
- Return typed error responses: `{ error: { code: "ERROR_CODE", message: "..." } }`
- Use appropriate HTTP status codes (400 for validation, 401 for auth, 404 for not found, 500 for server errors)
- Log errors with context using the service's logger (e.g., `req.log.error(err, "context")`)
- Never expose internal error details to clients

### Project Structure

```
auth-service/src/
  index.ts              # Entry point, routes, middleware
  auth.ts               # Auth logic (signup, login)
  keys.ts               # RSA key management
  database/
    db.ts               # SQLite user database
    dbTokens.ts         # SQLite token database
  tokens/
    token.ts            # Access token generation
    refresh.ts          # Refresh token management
  validation/
    password.ts         # Password hashing/verification
    checkInput.ts       # Zod schemas
  types/
    auth.interfaces.ts  # Type definitions

front/app/              # Next.js App Router
  page.tsx              # Routes
  components/           # React components
  lib/                  # Utilities

game/
  common/               # Shared types, physics constants
  client/               # Babylon.js game client
  server/               # Colyseus game server
```

### Service Communication

- Internal services use HTTP with Bearer token authentication
- Environment variable `SERVICE_TOKEN` for inter-service auth
- Profile service URL via `PROFILE_SERVICE_URL` env var
- Use axios for HTTP calls with timeout controller
- All services expose `/health` endpoint for health checks

### Environment Variables

Required environment variables (see `.env.example`):

- `PROFILE_SERVICE_URL` - Profile service URL
- `SERVICE_TOKEN` - Token for internal service communication
- JWT keys are generated via `npm run generate-keys`

### Database

- SQLite for each service (auth, profile, statistics)
- Use promises with callbacks for SQLite operations
- Wrap in `new Promise((resolve, reject) => ...)` pattern

### Testing

- No test framework currently configured
- Test scripts are placeholders: `echo "Error: no test specified" && exit 1`

## Docker Development

Each service has a Dockerfile. For local development:

1. Copy `.env.example` to `.env`
2. Run `make config` to generate docker-compose.yml
3. Run `make up` to start all services
4. Services are accessible at localhost ports defined in docker-compose

## Notes for Agents

- This codebase has no ESLint - rely on Prettier and TypeScript for code quality
- Be careful with `any` types - prefer proper typing
- When adding new routes, follow the existing patterns in each service
- CSRF protection is implemented in auth-service (check routes in exclude list)
- JWT uses RS256 algorithm with RSA keys
- Game state synchronization uses Colyseus schema system

### Frontend Design System

**Theme**: Modern minimalist dark theme with transparent containers

**Single Source of Truth:** `front/app/lib/design-tokens.ts`

All pages should use the design tokens for consistent styling:

```typescript
import { mainContainers } from "@/lib/design-tokens";

// For most pages
<main className={mainContainers.centeredLayout.wrapper}>
  <Navbar />
  <div className={mainContainers.centeredLayout.contentArea}>
    {/* page content */}
  </div>
</main>
```

**Layout Types:**
- `centeredLayout`: Vertically and horizontally centered (game-mode, terms, privacy)
- `topLayout`: Centered in available space (login, signup)
- `scrollableLayout`: Scrollable with items-start (profile pages)

**Key Tokens:**
- All include `pt-[120px]` to account for fixed navbar
- Navbar uses pill design: `fixed top-4 left-4 right-4 z-50 rounded-full`
- Dropdown has `z-[60]` to appear above navbar
- Background colors for dropdown: `bg-slate-800/20`

**Color System:**
- Primary: Slate (#475569) instead of purple
- Text: Bright (#f1f5f9) for contrast on dark backgrounds
- Interactive elements: Use subtle slate backgrounds (rgba(71, 85, 105, 0.3))
