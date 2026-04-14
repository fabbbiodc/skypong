# ──────────────────────────────────────────────
# STAGE 1: Build (We need everything to compile)
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Tools for native modules (SQLite, etc.)
RUN apk add --no-cache python3 make g++ libc-dev

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install everything (including devDependencies like typescript)
RUN npm install 

# Copy source code and static files
COPY src ./src
COPY static /app/static
COPY tsconfig.json ./tsconfig.json

# Compile TypeScript
RUN npx tsc

# ──────────────────────────────────────────────
# STAGE 2: Runner (Switching from Alpine to Slim)
# ──────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Debian build tools (much more stable)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user to run the app
RUN groupadd -r app && useradd -r -g app app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy compiled build from previous stage
COPY --from=builder /app/dist ./dist

# ──────────────────────────────────────────────
# Uploads directories and permissions
# ──────────────────────────────────────────────
# Uploads directory (volume will be mounted from host here)
RUN mkdir -p /app/uploads/avatars && chown -R app:app /app

# Copy default avatar from static and assign ownership
COPY --chown=app:app static/default-avatar.webp /app/static/

# Switch to non-root user
USER app

# Expose API port
EXPOSE 5000

# Default command
CMD ["node", "dist/index.js"]
