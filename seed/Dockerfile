# seed/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN apk add --no-cache sqlite

COPY . .

CMD ["node", "seed.js"]
