# 📦 Guayacan Project - ChipMarket

## 🎯 Descripción

Guayacan Project es una aplicación web full-stack de comercio electrónico especializada en productos tecnológicos. El sistema cuenta con una arquitectura de microservicios que incluye gestión de usuarios, productos, pedidos, pagos y búsqueda avanzada.

## 🏗️ Arquitectura

El proyecto utiliza una arquitectura de contenedores con Docker Compose que incluye:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + TypeScript + Express
- **Base de Datos Relacional**: PostgreSQL 15
- **Base de Datos NoSQL**: MongoDB 7
- **Herramientas de Administración**: PgAdmin y Mongo Express (opcionales)

## 🛠️ Tecnologías

### Backend
- **Runtime**: Node.js con TypeScript
- **Framework**: Express.js
- **ORMs**: Sequelize (PostgreSQL) y Mongoose (MongoDB)
- **Autenticación**: JWT (jsonwebtoken)
- **Seguridad**: bcryptjs para encriptación de contraseñas
- **Validación**: CORS configurado

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Routing**: React Router DOM
- **Gráficos**: Chart.js, Recharts, D3.js
- **Iconos**: Lucide React

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Git para clonar el repositorio
- Puertos disponibles: 5173 (frontend), 3000 (backend), 5432 (PostgreSQL), 27017 (MongoDB)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/Menderin/Guayacan-Proyect.git
cd Guayacan-Proyect
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# PostgreSQL
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_contraseña
POSTGRES_DB=guayacan_db

# MongoDB
MONGO_USER=tu_usuario
MONGO_PASSWORD=tu_contraseña
MONGO_DB=guayacan_db

# JWT
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=24h
``` 

### 3. Iniciar los servicios

```bash
# Iniciar todos los servicios
docker-compose up -d

# Iniciar con herramientas de administración (PgAdmin y Mongo Express)
docker-compose --profile tools up -d
```

### 4. Acceder a la aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PgAdmin** (opcional): http://localhost:5050
- **Mongo Express** (opcional): http://localhost:8081

## 📁 Estructura del Proyecto

```
Guayacan-Proyect/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuraciones
│   │   ├── controllers/     # Controladores de la API
│   │   ├── middlewares/     # Middlewares (auth, validación)
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Rutas de la API
│   │   ├── services/        # Lógica de negocio
│   │   ├── types/           # Tipos de TypeScript
│   │   └── utils/           # Utilidades
│   ├── database/
│   │   ├── postgres/        # Configuración e init de PostgreSQL
│   │   └── mongodb/         # Configuración de MongoDB
│   ├── test/
│   └── Readme.md            # Documentación de APIs
├── frontend/
│   └── ChipMarket/
│       └── src/             # Código fuente del frontend
└── docker-compose.yml       # Orquestación de servicios
```

## 🔌 APIs Disponibles

El backend ofrece las siguientes APIs RESTful:

### 🔐 API AUTH
- Autenticación y gestión de sesiones
- Registro y login de usuarios
- Obtención de información del usuario autenticado 

### 📦 API ORDER
- Gestión completa de pedidos
- Búsqueda avanzada con filtros
- Estadísticas y resúmenes
- Reembolsos completos y parciales

### 💳 API PAYMENT
- Gestión de pagos
- Búsqueda avanzada de transacciones
- Filtrado por estado y método de pago

### 🛍️ API PRODUCT
- CRUD de productos
- Búsqueda con filtros avanzados
- Gestión de inventario
- Alertas de bajo stock

### 🔍 API SEARCH
- Búsqueda principal con múltiples filtros
- Autocompletado y sugerencias
- Productos relacionados
- Filtros dinámicos por categoría

### 👥 API USER
- Gestión de usuarios
- Perfiles y roles (Admin/Cliente)
- Búsqueda y edición de usuarios

Para documentación detallada de cada endpoint, consultar el archivo de documentación del backend.

## 🔒 Autenticación

La mayoría de las rutas requieren autenticación mediante JWT. El token debe incluirse en el header de las peticiones:

```
Authorization: Bearer {token}
``` 

## 👥 Roles de Usuario

El sistema cuenta con dos roles principales:

- **Administrador**: Acceso completo al sistema
- **Cliente**: Acceso limitado a funcionalidades de usuario

## 🗄️ Base de Datos

### PostgreSQL
Se utiliza para datos estructurados como usuarios, pedidos y pagos. El script de inicialización se ejecuta automáticamente al levantar el contenedor. 

### MongoDB
Se utiliza para datos no estructurados como componentes de productos y configuraciones dinámicas.

## 🛠️ Comandos Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener los servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: elimina datos)
docker-compose down -v

# Reconstruir los contenedores
docker-compose up -d --build

# Ejecutar comandos en el contenedor del backend
docker-compose exec backend npm run dev
```

## 📊 Códigos de Estado HTTP 

## 📝 Formato de Respuesta

Todas las respuestas de la API siguen un formato estandarizado:

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a Menderin/Guayacan-Proyect.

---

## Notes

Este README ha sido generado basándose en la estructura actual del proyecto. El sistema utiliza una arquitectura moderna con Docker Compose para facilitar el desarrollo y despliegue. La documentación completa de las APIs se encuentra en el archivo `backend/Readme.md`, que incluye ejemplos detallados de solicitudes y respuestas para cada endpoint.

### Citations

**File:** docker-compose.yml
```yaml
services:
  # Frontend React + Vite (Modo Desarrollo)
  frontend:
    build:
      context: ./frontend/ChipMarket
      dockerfile: Dockerfile
    container_name: guayacan_frontend
    restart: unless-stopped
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=/api/auth
    volumes:
      - ./frontend/ChipMarket:/app
      - /app/node_modules  # ← Esto protege node_modules del contenedor
    depends_on:
      - backend
    networks:
      - guayacan_network

```

**File:** docker-compose.yml
```yaml
    ports:
      - "3000:3000"
```

**File:** docker-compose.yml
```yaml
    environment:
      NODE_ENV: development
      PORT: 3000
      # PostgreSQL
      POSTGRES_HOST: postgres
      POSTGRES_PORT: 5432
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      MONGO_HOST: mongodb
      MONGO_PORT: 27017
      MONGO_USER: ${MONGO_USER}
      MONGO_PASSWORD: ${MONGO_PASSWORD}
      MONGO_DB: ${MONGO_DB}
      MONGO_URL: mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017/${MONGO_DB}?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
```

**File:** docker-compose.yml
```yaml
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: guayacan_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/database/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - guayacan_network
```

**File:** docker-compose.yml
```yaml
  # MongoDB Database
  mongodb:
    image: mongo:7
    container_name: guayacan_mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_DB}
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s
    networks:
      - guayacan_network
```

**File:** backend/package.json
```json
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "mongodb": "^6.20.0",
    "mongoose": "^8.19.1",
    "mysql2": "^3.15.3",
    "path-to-regexp": "^0.1.7",
    "pg": "^8.16.3",
    "pg-hstore": "^2.3.4",
    "reflect-metadata": "^0.2.2",
    "sequelize": "^6.37.7",
    "typeorm": "^0.3.27"
```

**File:** frontend/ChipMarket/package.json
```json
  "dependencies": {
    "@types/d3": "^7.4.3",
    "chart.js": "^4.5.0",
    "chartjs-plugin-datalabels": "^2.2.0",
    "d3": "^7.9.0",
    "lucide-react": "^0.545.0",
    "react": "^19.1.1",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.4",
    "recharts": "^2.10.3"
```

**File:** backend/Readme.md
```markdown
# 🚀 Documentación de APIs

## 📑 Índice

- **API AUTH**
- **API ORDER**
- **API PAYMENT**
- **API PRODUCT**
- **API SEARCH**
- **API USER**

```

**File:** backend/Readme.md
```markdown
## 🔐 API AUTH

### 1. Obtener información de usuario
**Método:** `GET`  
**Endpoint:** `/api/auth/me`  
**Descripción:** Retorna la información del usuario autenticado
**Autenticación:** Requerida

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "id_role": 2
  }
}
```
```

**File:** backend/Readme.md
```markdown
## 📦 API ORDER

### 1. Resumen y estadísticas de pedidos
**Método:** `GET`  
**Endpoint:** `/api/orders/summary`  
**Descripción:** Obtiene un resumen completo con estadísticas de pedidos
**Autenticación:** Requerida (Admin)

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `startDate` | string (YYYY-MM-DD) | No | Fecha de inicio del filtro |
| `endDate`  | string (YYYY-MM-DD) | No | Fecha de fin del filtro |
| `userId`  | string | No | ID del usuario específico |
| `status`  | string | No | Estado del pedido |

```

**File:** backend/Readme.md
```markdown
## 💳 API PAYMENT

### 1. Búsqueda avanzada de pagos
**Método:** `GET`  
**Endpoint:** `/api/orders/search`  
**Descripción:** Búsqueda avanzada de pagos con filtros múltiples
**Autenticación:** Requerida (Admin)

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `orderId` | number | No | ID del pedido |
| `userId`  | number | No | ID del usuario |
| `status`  | string | No | Estado del pago|
| `paymentMethod`  | string | No | Método de pago |
| `startDate`  | string | No | Fecha de inicio (YYYY-MM-DD) |
| `endDate`  | string | No | Fecha de fin (YYYY-MM-DD) |
| `minAmount`  | string | No | Monto mínimo |
| `maxAmount`  | number | No | Monto máximo |
| `page`  | number | No | Número de página (default: 1) |
| `limit`  | number | No | Resultados por página (default: 10, max: 100) |

```

**File:** backend/Readme.md
```markdown
### 🛍️ API PRODUCT

### 1. Buscar productos
**Método:** `GET`  
**Endpoint:** `/api/productos/search`  
**Descripción:** Busca productos con filtros avanzados
**Autenticación:** No requerida

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `q` | string | No | Término de búsqueda |
| `category`  | string | No | Categoría del producto |
| `minPrice`  | number | No | Precio mínimo|
| `maxPrice`  | number | No | Precio máximo |
| `inStock`  | number | No | Solo productos en stock |

```

**File:** backend/Readme.md
```markdown
## 🔍 API SEARCH

### 1. Búsqueda principal
**Método:** `GET`  
**Endpoint:** `/api/search`  
**Descripción:** Búsqueda principal de productos con filtros avanzados
**Autenticación:** No requerida

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `q` | stirng | No | Término de búsqueda |
| `category`  | number | No | Categoría |
| `minPrice`  | string | No | Precio mínimo |
| `maxPrice`  | string | No | Precio máximo |
| `inStock`  | string | No | Solo en stock |
| `garantee`  | string | No | Tipo de garantía |
| `procesator`  | string | No | Procesador |
| `gpu`  | number | No | Tarjeta gráfica |
| `ram`  | number | No | Memoria RAM |
| `page`  | number | No | Número de página (default: 1) |
| `limit`  | number | No | Resultados por página (default: 10, max: 100) |
| `sortBy`  | number | No | Campo para ordenar (price, name, date) |
| `sortOrder`  | number | No | Orden (asc, desc) |

```

**File:** backend/Readme.md
```markdown
## 👥 API USER

### 1. Obtener perfil
**Método:** `GET`  
**Endpoint:** `/api/users/profile`  
**Descripción:** Obtiene el perfil del usuario autenticado
**Autenticación:** Requerida

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "id_role": 2,
    "created_at": "2025-01-15T10:00:00.000Z"
  }
}
```
```

**File:** backend/Readme.md
```markdown
#### Autenticación
La mayoría de las rutas requieren autenticación mediante JWT. El token debe incluirse en el header:

```Authorization: Bearer {token}```
```

**File:** backend/Readme.md
```markdown

- `200` - OK: Solicitud exitosa
- `201` - Created: Recurso creado exitosamente
- `400` - Bad Request: Datos inválidos
- `401` - Unauthorized: No autenticado
- `403` - Forbidden: Sin permisos
- `404` - Not Found: Recurso no encontrado
- `500` - Internal Server Error: Error del servidor
```

**File:** backend/Readme.md
#### Formato de Respuesta
Todas las respuestas siguen el formato:
```json
{
  "success": true/false,
  "data": { ... },
  "message": "Mensaje descriptivo"
}
```


**File:** backend/Readme.md
``` markdown
#### Roles de Usuario

- Administrador (acceso completo)
- Cliente (acceso limitado)
```
