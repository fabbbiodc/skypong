FROM node:20-alpine

WORKDIR /app

# Copiamos solo dependencias primero para cache
COPY package.json package-lock.json ./
RUN npm install

# En desarrollo, esto se sobrescribe con el volumen montado
# En producción, se copia el código
 COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]