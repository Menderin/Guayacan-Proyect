FROM node:18-alpine AS dev

WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala todas las deps (incluyendo dev)
RUN npm install

# Instala ts-node-dev globalmente (para live reload)
RUN npm install -g ts-node-dev

# Copia todo el código
COPY . .

EXPOSE 3000

# CMD para desarrollo
CMD ["ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]