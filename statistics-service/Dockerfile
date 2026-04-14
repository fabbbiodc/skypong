# Stage 1: deps
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++ libc-dev
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Stage 2: build
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++ libc-dev
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 3: runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache sqlite

RUN apk add --no-cache sqlite

RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

RUN mkdir -p /app/data && chown -R app:app /app
USER app

EXPOSE 6000
CMD ["node", "dist/index.js"]
