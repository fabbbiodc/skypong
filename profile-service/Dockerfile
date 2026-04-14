# ──────────────────────────────────────────────
# STAGE 1: Build (Necesitamos TODO para compilar)
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Herramientas para módulos nativos (SQLite, etc.)
RUN apk add --no-cache python3 make g++ libc-dev

# Copiamos package.json y package-lock.json
COPY package.json package-lock.json ./

# Instalamos TODO (incluyendo devDependencies como typescript)
RUN npm install 

# Copiamos el código fuente y archivos estáticos
COPY src ./src
COPY static /app/static
COPY tsconfig.json ./tsconfig.json

# Compilamos TypeScript
RUN npx tsc

# ──────────────────────────────────────────────
# STAGE 2: Runner (Cambiamos Alpine por Slim)
# ──────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Herramientas de compilación en Debian (mucho más estables)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Creamos un usuario no-root para correr la app
RUN groupadd -r app && useradd -r -g app app

# Copiamos package.json y package-lock.json para instalar dependencias
COPY package.json package-lock.json ./

# Instalamos solo dependencias de producción
RUN npm ci --omit=dev

# Copiamos el build compilado desde el stage anterior
COPY --from=builder /app/dist ./dist

# ──────────────────────────────────────────────
# Directorios para uploads y permisos
# ──────────────────────────────────────────────
# Directorio de uploads (aquí se montará el volume desde host)
RUN mkdir -p /app/uploads/avatars && chown -R app:app /app

# Copiamos el avatar por defecto desde static y asignamos propietario
COPY --chown=app:app static/default-avatar.webp /app/static/

# Cambiamos a usuario no-root
USER app

# Exponemos puerto de la API
EXPOSE 5000

# Comando por defecto
CMD ["node", "dist/index.js"]
