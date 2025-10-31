# 🚀 Documentación de APIs

## 📑 Índice

- **API AUTH**
- **API ORDER**
- **API PAYMENT**
- **API PRODUCT**
- **API SEARCH**
- **API USER**

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

### 2. Registrar nuevo usuario
**Método:** `POST`  
**Endpoint:** `/api/auth/register`  
**Descripción:** Registra un nuevo usuario en el sistema
**Autenticación:** No requerida

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `name` | string | Sí | Nombre del usuario |
| `email`  | string | Sí | Email del usuario (único) |
| `password`  | string | Sí | Contraseña del usuario |


### 3. Inicio de sesión de usuario
**Método:** `POST`  
**Endpoint:** `/api/auth/login`  
**Descripción:** Inicia sesión un usuario en el sistema
**Autenticación:** No requerida

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `email`  | string | Sí | Email del usuario |
| `password`  | string | Sí | Contraseña del usuario |


### 4. Cierre de sesión de usuario
**Método:** `POST`  
**Endpoint:** `/api/auth/logout`  
**Descripción:** Cierra la sesión del usuario
**Autenticación:** Requerida

---

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

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "totalRevenue": 45678.90,
    "averageOrderValue": 304.53,
    "statusBreakdown": {
      "Completed": 120,
      "Pending": 20,
      "Cancelled": 10
    },
    "topProducts": [
      {
        "sku": "PC-GAMING-001",
        "name": "Laptop Gaming RTX 3060",
        "totalQuantity": 25,
        "totalRevenue": 35000.00
      }
    ],
    "topCustomers": [
      {
        "userId": 5,
        "name": "María García",
        "email": "maria@example.com",
        "totalOrders": 8,
        "totalSpent": 5400.00
      }
    ]
  }
}
```

### 2. Búsqueda avanzada de pedidos
**Método:** `GET`  
**Endpoint:** `/api/orders/search`  
**Descripción:** Búsqueda avanzada con múltiples filtros
**Autenticación:** Requerida (Admin)

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `startDate` | string | No | Fecha de inicio (YYYY-MM-DD) |
| `endDate`  | string | No | Fecha de fin (YYYY-MM-DD) |
| `userId`  | number | No | ID del usuario |
| `userEmail`  | string | No | Email del usuario (búsqueda parcial) |
| `productSku`  | string | No | SKU del producto (búsqueda parcial) |
| `status`  | string | No | Estado del pedido |
| `page`  | number | No | Número de página (default: 1) |
| `limit`  | number | No | Resultados por página (default: 10, max: 100) |

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id_order": 123,
        "user_id": 5,
        "order_date": "2025-10-20T10:30:00.000Z",
        "status": "Completed",
        "total_amount": 1250.00,
        "user": {
          "id": 5,
          "name": "María García",
          "email": "maria@example.com"
        },
        "details": [
          {
            "id_detail_order": 456,
            "product_sku": "PC-GAMING-001",
            "quantity": 1,
            "price": 1250.00,
            "subtotal": 1250.00,
            "product": {
              "sku": "PC-GAMING-001",
              "name": "Laptop Gaming RTX 3060",
              "category": "Laptops",
              "stock": 15
            }
          }
        ]
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 10,
      "totalPages": 15
    }
  }
}
```

### 3. Obtener todos los pedidos del cliente
**Método:** `GET`  
**Endpoint:** `/api/orders/my-orders`  
**Descripción:** Obtiene todos los pedidos del cliente autenticado
**Autenticación:** Requerida (Cliente)

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "name": "María García",
      "email": "maria@example.com"
    },
    "totalOrders": 8,
    "orders": [...]
  }
}
```

### 4. Obtener pedidos del cliente por estado
**Método:** `GET`  
**Endpoint:** `/api/orders/my-orders/status/:status`  
**Descripción:** Obtiene pedidos del cliente filtrados por estado
**Autenticación:** Requerida (Cliente)

**Parámetros:**
| Nombre | Tipo | Descripción |
|---------|------|------------|
| `status` | string | Estado del pedido (Pending, Completed, Cancelled, Processing) |

**Ejemplo:** /api/orders/my-orders/status/Completed


### 5. Obtener pedidos del cliente por estado
**Método:** `GET`  
**Endpoint:** `/api/orders/my-orders/:orderId`  
**Descripción:** Obtiene el detalle completo de un pedido específico del cliente
**Autenticación:** Requerida (Cliente)

**Parámetros:**
| Nombre | Tipo | Descripción |
|---------|------|------------|
| `orderId` | number | ID del Pedido |

### 6. Obtener pagos del cliente
**Método:** `GET`  
**Endpoint:** `/api/orders/my-orders/my-payments`  
**Descripción:** Obtiene todos los pagos del cliente autenticado
**Autenticación:** Requerida (Cliente)

### 7. Obtener todos los pedidos del sistema
**Método:** `GET`  
**Endpoint:** `/api/orders/all`  
**Descripción:** Obtiene todos los pedidos del sistema
**Autenticación:** Requerida (Admin)

### 8. Obtener pedidos por estado
**Método:** `GET`  
**Endpoint:** `/api/orders/status/:status`  
**Descripción:** Obtiene todos los pedidos filtrados por estado
**Autenticación:** Requerida (Admin)

**Parámetros:**
| Nombre | Tipo | Descripción |
|---------|------|------------|
| `status` | string | Estado del pedido (Pending, Completed, Cancelled, Processing) |

**Ejemplo:** /api/orders/status/Pending

### 9. Obtener pedidos de un usuario
**Método:** `GET`  
**Endpoint:** `/api/orders/users/:userId`  
**Descripción:** Obtiene todos los pedidos de un usuario específico
**Autenticación:** Requerida (Admin)

**Parámetros:**
| Nombre | Tipo | Descripción |
|---------|------|------------|
| `userId` | number | ID del usuario |

### 10. Obtener pagos de un pedido
**Método:** `GET`  
**Endpoint:** `/api/orders/payments/:orderId`  
**Descripción:** Obtiene todos los pagos de un pedido específico
**Autenticación:** Requerida (Admin)

### 11. Obtener detalles de un pedido
**Método:** `GET`  
**Endpoint:** `/api/orders/:orderId`  
**Descripción:** Obtiene los detalles completos de un pedido
**Autenticación:** Requerida (Admin)

### 12. Historial de reembolsos
**Método:** `GET`  
**Endpoint:** `/api/orders/refunds/history`  
**Descripción:** Obtiene el historial de reembolsos
**Autenticación:** Requerida (Admin)

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|-----|------------|
| `orderId` | number | No | ID del pedido específico |

### 13. Verificar elegibilidad de reembolso
**Método:** `GET`  
**Endpoint:** `/api/orders/:orderId/can-refund`  
**Descripción:** Verifica si un pedido puede ser reembolsado
**Autenticación:** Requerida (Admin)

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": {
    "canRefund": true,
    "order": {
      "id": 123,
      "status": "Completed",
      "total_amount": 1250.00,
      "order_date": "2025-10-20T10:30:00.000Z"
    }
  }
}
```

### 14. Verificar elegibilidad de reembolso
**Método:** `POST`  
**Endpoint:** `/api/orders/:orderId/refund`  
**Descripción:** Procesa un reembolso completo de un pedido
**Autenticación:** Requerida (Admin)

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|-----|------------|
| `reason` | string | Sí | Razón del reembolso |
| `refoundAmoont` | number | No | Monto específico a reembolsar |

**Ejemplo de solicitud:**
```json
{
  "reason": "Cliente solicitó cancelación por demora en envío"
}
```

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "message": "Reembolso procesado exitosamente",
  "data": {
    "orderId": 123,
    "previousStatus": "Completed",
    "newStatus": "Cancelled",
    "refundedAmount": 1250.00,
    "productsRestocked": [
      {
        "sku": "PC-GAMING-001",
        "name": "Laptop Gaming RTX 3060",
        "quantityRestored": 1,
        "newStock": 16
      }
    ],
    "paymentsUpdated": 1
  }
}
```

### 15. Procesar reembolso parcial
**Método:** `POST`  
**Endpoint:** `/api/orders/:orderId/partial-refund`  
**Descripción:** Procesa un reembolso parcial de productos específicos
**Autenticación:** Requerida (Admin)

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|-----|------------|
| `productSkus` | string[] | Sí | Array de SKUs a reembolsar |
| `reason` | number | Sí | Razón del reembolso |

**Ejemplo de solicitud:**
```json
{
  "productSkus": ["PC-GAMING-001", "MONITOR-LG-001"],
  "reason": "Productos no disponibles en stock"
}
```

---

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

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id_payment": 789,
        "order_id": 123,
        "amount": 1250.00,
        "payment_method": "Tarjeta de Crédito",
        "status": "Completed",
        "payment_date": "2025-10-20T10:35:00.000Z",
        "order": {
          "id_order": 123,
          "order_date": "2025-10-20T10:30:00.000Z",
          "status": "Completed",
          "total_amount": 1250.00
        }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### 2. Obtener todos los pagos
**Método:** `GET`  
**Endpoint:** `/api/payments/all`  
**Descripción:** Obtiene todos los pagos del sistema
**Autenticación:** Requerida (Admin)

### 3. Obtener todos los pagos
**Método:** `GET`  
**Endpoint:** `/api/payments/status/:status`  
**Descripción:** Obtiene todos los pagos filtrados por estado
**Autenticación:** Requerida (Admin)

| Nombre | Tipo |  Descripción |
|---------|------|--------------|
| `status` | string | Estado del pago (Pending, Completed, Failed, Refunded) |

**Ejemplo:** /api/payments/status/Completed

---

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

### 2. Obtener productos con poco stock
**Método:** `GET`  
**Endpoint:** `/api/products/poco-stock`  
**Descripción:** Obtiene productos con inventario bajo
**Autenticación:** Requerida (Admin)

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|-----|------------|
| `treshhold` | number | No | Umbral de stock (default: 10) |

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "sku": "LAPTOP-HP-001",
      "name": "Laptop HP Pavilion",
      "stock": 5,
      "category": "Laptops",
      "price": 799.99
    }
  ]
}
```

### 3. Crear producto
**Método:** `POST`  
**Endpoint:** `/api/products`  
**Descripción:** Crea un nuevo producto
**Autenticación:** Requerida (Admin)

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|-----|------------|
| `sku` | string | Sí | Código único del producto |
| `name` | string | Sí | Nombre del producto |
| `category` | string | Sí | Categoría del producto |
| `price` | number | Sí | Precio del producto |
| `stock` | number | Sí | Cantidad en inventario |
| `components` | object | No | Componentes del producto |

### 4. Listar todos los productos
**Método:** `GET`  
**Endpoint:** `/api/products`  
**Descripción:** Lista todos los productos
**Autenticación:** No requerida

### 5. Obtener un producto
**Método:** `GET`  
**Endpoint:** `/api/products/:id`  
**Descripción:** Obtiene los detalles de un producto específico
**Autenticación:** No requerida

### 6. Actualizar un producto
**Método:** `PUT`  
**Endpoint:** `/api/products/:id`  
**Descripción:** Actualiza la información de un producto
**Autenticación:** Requerida (Admin)

### 77. Eliminar producto
**Método:** `DELETE`  
**Endpoint:** `/api/products/:id`  
**Descripción:** Elimina un producto del sistema
**Autenticación:** Requerida (Admin)

---

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

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

### 2. Sugerencias de autocompletado
**Método:** `GET`  
**Endpoint:** `/api/search/suggestions`  
**Descripción:** Obtiene sugerencias para autocompletar búsquedas
**Autenticación:** No requerida

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `q` | stirng | Sí | Término de búsqueda |
| `limit`  | number | No | Número de sugerencias (default: 5) |

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": [
    "Laptop Gaming",
    "Laptop HP",
    "Laptop Dell"
  ]
}
```

### 3. Filtros disponibles
**Método:** `GET`  
**Endpoint:** `/api/search/filters`  
**Descripción:** Obtiene los filtros disponibles para la búsqueda
**Autenticación:** No requerida

**Parámetros:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `q` | stirng | No | Término de búsqueda |

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": {
    "categories": ["Laptops", "Desktops", "Monitores"],
    "garantees": ["1 año", "2 años", "3 años"],
    "priceRange": {
      "min": 299.99,
      "max": 2999.99
    }
  }
}
```

### 4. Productos relacionados
**Método:** `GET`  
**Endpoint:** `/api/search/related/:productId`  
**Descripción:** Obtiene productos relacionados a uno específico
**Autenticación:** No requerida

**Parámetros de la URL:**
| Nombre | Tipo | Descripción |
|---------|------|--------------|
| `productId` | number | ID del producto |

**Parámetros de query:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `limit`  | number | No | Número de sugerencias (default: 5) |

### 5. Buscar por categoría
**Método:** `GET`  
**Endpoint:** `/api/search/category/:category`  
**Descripción:** Busca productos de una categoría específica
**Autenticación:** No requerida

**Parámetros de la URL:**
| Nombre | Tipo | Descripción |
|---------|------|--------------|
| `category` | string | Nombre de la categoría|

**Parámetros de query:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `page`  | number | No | Número de página |
| `limit`  | number | No | Número de sugerencias (default: 5) |
| `sortBy`  | string | No | Campo para ordenar |
| `sortOrder`  | string | No | Orden (asc, desc) |


---

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

### 2. Obtener todos los usuarios
**Método:** `GET`  
**Endpoint:** `/api/users/all-users`  
**Descripción:** Obtiene la lista de todos los usuarios
**Autenticación:** Requerida (Admin)

### 3. Buscar usuarios por nombre
**Método:** `GET`  
**Endpoint:** `/api/users/search`  
**Descripción:** Busca usuarios por nombre
**Autenticación:** Requerida (Admin)

**Parámetros de query:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|----|--------------|
| `name` | string | Sí |Nombre o parte del nombre|

**Ejemplo:** /api/users/search?name=Juan

### 4. Editar usuario
**Método:** `PUT`  
**Endpoint:** `/api/users/edit-user/:id`  
**Descripción:** Edita la información de un usuario
**Autenticación:** Requerida (Admin)

**Parámetros de la URL:**
| Nombre | Tipo | Descripción |
|---------|------|--------------|
| `id` | id | ID del usuario |

**Parámetros de query:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `name`  | string | No | Nuevo nombre |
| `email`  | string | No | Nuevo email |
| `id_role`  | number | No | Nuevo rol |

### 5. Crear usuario
**Método:** `POST`  
**Endpoint:** `/api/users/create`  
**Descripción:** Crea un nuevo usuario
**Autenticación:** Requerida (Admin)

**Parámetros del Body:**
| Nombre | Tipo | Requerido | Descripción |
|---------|------|------------|--------------|
| `name`  | string | Sí | Nombre del usuario |
| `email`  | string | Sí | Email del usuario |
| `password`  | string | Sí | Contraseña |
| `id_role`  | number | Sí | ID del rol (1: Admin, 2: Cliente) |

### 6. Eliminar usuario
**Método:** `DELETE`  
**Endpoint:** `/api/users/:id`  
**Descripción:** Elimina un usuario del sistema
**Autenticación:** Requerida (Admin)

**Parámetros de la URL:**
| Nombre | Tipo | Descripción |
|---------|------|--------------|
| `id` | id | ID del usuario |

---

## 📝 Notas Generales

#### Autenticación
La mayoría de las rutas requieren autenticación mediante JWT. El token debe incluirse en el header:

```Authorization: Bearer {token}```

- `200` - OK: Solicitud exitosa
- `201` - Created: Recurso creado exitosamente
- `400` - Bad Request: Datos inválidos
- `401` - Unauthorized: No autenticado
- `403` - Forbidden: Sin permisos
- `404` - Not Found: Recurso no encontrado
- `500` - Internal Server Error: Error del servidor

#### Formato de Respuesta
Todas las respuestas siguen el formato:
```json
{
  "success": true/false,
  "data": { ... },
  "message": "Mensaje descriptivo"
}
```

#### Roles de Usuario

- Administrador (acceso completo)
- Cliente (acceso limitado)

#### Paginación
Las rutas con paginación incluyen:
```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```
