# Stage 1: dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++ libc-dev
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: build
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++ libc-dev
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run generate-keys
RUN npm run build
#RUN mkdir -p /app/keys \
#&& if ls /app/jwt-*.pem >/dev/null 2>&1; then cp /app/jwt-*.pem /app/keys/; fi

# Stage 3: run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache sqlite
RUN apk add --no-cache sqlite
ARG UID=1000
ARG GID=1000
# RUN addgroup -g ${GID} app && adduser -u ${UID} -G app -S app
RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app ./
RUN mkdir -p /app/data
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER app
EXPOSE 8081

ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["node", "dist/index.js"]
