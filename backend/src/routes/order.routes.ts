// routes/order.routes.ts
import { Router } from 'express';
import { 
  // Controladores para clientes
  getMyOrders, 
  getOrderDetail, 
  getPersonalOrdersByStatus,
  getMyPayments,
  
  // Controladores para administradores
  getOrdersByUserId,
  getAllOrders,
  getPaymentsByOrderId,
  getOrderDetailsById,
  getOrdersByStatus,
  createOrder,

  // Controladores de reembolsos
  processRefund,
  processPartialRefund,
  checkRefundEligibility,
  getRefundHistory,
  
  // Búsqueda avanzada
  getOrdersWithFilters,
  getOrdersSummary,
  updateOrderStatus
} from '../controllers/order.controller';
import { authenticateToken, isClient, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// ========================================
// RUTAS ESPECÍFICAS (DEBEN IR PRIMERO)
// ========================================

/**
 * GET /api/orders/summary
 * Obtener resumen y estadísticas de pedidos
 */
router.get('/summary', getOrdersSummary);

/**
 * GET /api/orders/search
 * Búsqueda avanzada con filtros múltiples
 */
router.get('/search', getOrdersWithFilters);

/**
 * GET /api/orders/refunds/history
 * Obtener historial de todos los reembolsos
 * Query params: orderId (opcional)
 */
router.get('/refunds/history', getRefundHistory);

/**
 * GET /api/orders/all
 * Obtener todos los pedidos del sistema
 */
router.get('/all', getAllOrders);

/**
 * GET /api/orders/status/:status
 * Obtener todos los pedidos por estado
 * Params: status (Pending, Completed, Cancelled, etc.)
 */
router.get('/status/:status', getOrdersByStatus);

// ========================================
// RUTAS PARA CLIENTES
// ========================================

/**
 * GET /api/orders/my-orders
 * Obtener todos los pedidos del cliente autenticado
 */
router.get('/my-orders', authenticateToken, isClient, getMyOrders);

/**
 * GET /api/orders/my-orders/status/:status
 * Obtener pedidos del cliente por estado
 */
router.get('/my-orders/status/:status', authenticateToken, isClient, getPersonalOrdersByStatus);

/**
 * GET /api/orders/my-orders/:orderId
 * Obtener detalle de un pedido específico del cliente
 */
router.get('/my-orders/:orderId', authenticateToken, isClient, getOrderDetail);

/**
 * GET /api/orders/my-payments
 * Obtener todos los pagos del cliente autenticado
 */
router.get('/my-payments', authenticateToken, isClient, getMyPayments);

// ========================================
// RUTAS PARA ADMINISTRADORES
// ========================================

/**
 * POST /api/orders
 * Crear un nuevo pedido
 * Body: { userId, products: [{sku, quantity}], paymentMethod, shippingAddress?, status? }
 * Requiere: Admin
 */
router.post('/', authenticateToken, isAdmin, createOrder);

/**
 * GET /api/orders/users/:userId
 * Obtener todos los pedidos de un usuario específico
 * Params: userId
 * Requiere: Admin
 */
router.get('/users/:userId', authenticateToken, isAdmin, getOrdersByUserId);

/**
 * GET /api/orders/payments/:orderId
 * Obtener todos los pagos de un pedido específico
 * Params: orderId
 * Requiere: Admin
 */
router.get('/payments/:orderId', authenticateToken, isAdmin, getPaymentsByOrderId);

// ========================================
// RUTAS DE REEMBOLSOS
// ========================================

/**
 * GET /api/orders/:orderId/can-refund
 * Verificar si un pedido puede ser reembolsado
 * Requiere: Admin
 */
router.get('/:orderId/can-refund', authenticateToken, isAdmin, checkRefundEligibility);

/**
 * POST /api/orders/:orderId/refund
 * Procesar reembolso completo de un pedido
 * Body: { reason: string, refundAmount?: number }
 * Requiere: Admin
 * CON MIDDLEWARES PARA PROTEGER LA RUTA
 */
router.post('/:orderId/refund', authenticateToken, isAdmin, processRefund);

/**
 * POST /api/orders/:orderId/partial-refund
 * Procesar reembolso parcial (productos específicos)
 * Body: { productSkus: string[], reason: string }
 * Requiere: Admin
 */
router.post('/:orderId/partial-refund', authenticateToken, isAdmin, processPartialRefund);

/**
 * PUT /api/orders/:orderId/status
 * Actualizar el estado de un pedido
 * Body: { status: string }
 * Requiere: Admin
 */
router.put('/:orderId/status', authenticateToken, isAdmin, updateOrderStatus);

// ========================================
// RUTA GENÉRICA
// ========================================

/**
 * GET /api/orders/:orderId
 * Obtener detalles completos de un pedido
 * Params: orderId
 * Requiere: Admin
 * IMPORTANTE: Esta ruta DEBE ir al final para evitar conflictos
 */
router.get('/:orderId', authenticateToken, isAdmin, getOrderDetailsById);

export default router;

/*
ORDEN DE RUTAS:
1. Rutas específicas primero:
   - /summary
   - /search
   - /refunds/history
   - /all
   - /status/:status

2. Rutas de clientes:
   - /my-orders
   - /my-orders/status/:status
   - /my-orders/:orderId
   - /my-payments

3. Rutas de admin específicas:
   - POST /
   - /users/:userId
   - /payments/:orderId

4. Rutas de reembolsos (ANTES de /:orderId):
   - /:orderId/can-refund
   - POST /:orderId/refund (CON MIDDLEWARES)
   - POST /:orderId/partial-refund
   - PUT /:orderId/status

5. Ruta genérica AL FINAL:
   - GET /:orderId

RUTAS SIN AUTENTICACIÓN (para Dashboard):
- GET /summary
- GET /all
- GET /status/:status
- GET /refunds/history

RUTAS CON AUTENTICACIÓN (Admin):
- POST /:orderId/refund (Protegido)
- POST /:orderId/partial-refund (Protegido)
- PUT /:orderId/status (Protegido)
- GET /:orderId/can-refund (Protegido)
- GET /:orderId (Protegido)
*/