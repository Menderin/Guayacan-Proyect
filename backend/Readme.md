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
**Descripción:** Obtiene el detalle completo de un pedido específico del cliente
**Autenticación:** Requerida (Cliente)

**Parámetros:**
| Nombre | Tipo | Descripción |
|---------|------|------------|
| `orderId` | number | ID del Pedido |

```