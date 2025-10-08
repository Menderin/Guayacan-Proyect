# Etapa base
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Compila TypeScript
RUN npm run build

# Opcional: ejecuta el seeding si se desea durante build (solo si quieres que sea parte del build)
# RUN node dist/utils/init.js --seed

# Expone el puerto
EXPOSE 3000

# Comando por defecto (puedes cambiarlo si usas otro entrypoint)
CMD ["npm", "run", "dev"]