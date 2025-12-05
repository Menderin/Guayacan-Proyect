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
