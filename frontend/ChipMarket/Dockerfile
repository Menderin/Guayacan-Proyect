FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias (dev + prod)
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto de Vite
EXPOSE 5173

# Comando para ejecutar Vite en modo desarrollo con host accesible
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]