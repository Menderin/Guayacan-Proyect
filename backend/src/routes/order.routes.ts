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
// RUTAS PÚBLICAS O DE BÚSQUEDA AVANZADA (colocar primero para evitar conflictos)
// ========================================

/**
 * GET /api/orders/summary
 * Obtener resumen y estadísticas de pedidos
 * Requiere: Admin
 */
router.get('/summary', getOrdersSummary);

/**
 * GET /api/orders/search
 * Búsqueda avanzada con filtros múltiples
 * Requiere: Admin
 */
router.get('/search', getOrdersWithFilters);

// ========================================
// RUTAS PARA CLIENTES (requieren autenticación + rol cliente)
// ========================================

/**
 * GET /api/orders/my-orders
 * Obtener todos los pedidos del cliente autenticado
 */
router.get('/my-orders', authenticateToken, isClient, getMyOrders);

/**
 * GET /api/orders/my-orders/status/:status
 * Obtener pedidos del cliente por estado
 * Params: status (Pending, Completed, Cancelled, etc.)
 */
router.get('/my-orders/status/:status', authenticateToken, isClient, getPersonalOrdersByStatus);

/**
 * GET /api/orders/my-orders/:orderId
 * Obtener detalle de un pedido específico del cliente
 * Params: orderId
 */
router.get('/my-orders/:orderId', authenticateToken, isClient, getOrderDetail);

/**
 * GET /api/orders/my-payments
 * Obtener todos los pagos del cliente autenticado
 */
router.get('/my-payments', authenticateToken, isClient, getMyPayments);

// ========================================
// RUTAS PARA ADMINISTRADORES (requieren autenticación + rol admin)
// ========================================

/**
 * GET /api/orders/all
 * Obtener todos los pedidos del sistema
 * Requiere: Admin
 */
router.get('/all', getAllOrders);

/**
 * GET /api/orders/status/:status
 * Obtener todos los pedidos por estado
 * Params: status (Pending, Completed, Cancelled, etc.)
 * Requiere: Admin
 */
router.get('/status/:status', getOrdersByStatus);

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

/**
 * GET /api/orders/:orderId
 * Obtener detalles completos de un pedido
 * Params: orderId
 * Requiere: Admin
 * IMPORTANTE: Esta ruta debe ir al final para evitar conflictos con otras rutas
 */
router.get('/:orderId', authenticateToken, isAdmin, getOrderDetailsById);


// ========================================
// RUTAS DE REEMBOLSOS (Admin only)
// ========================================

/**
 * GET /api/orders/refunds/history
 * Obtener historial de todos los reembolsos
 * Query params: orderId (opcional)
 * Requiere: Admin
 */
router.get('/refunds/history', getRefundHistory);

/**
 * GET /api/orders/:orderId/can-refund
 * Verificar si un pedido puede ser reembolsado
 * Requiere: Admin
 */
router.get('/:orderId/can-refund', checkRefundEligibility);

/**
 * POST /api/orders/:orderId/refund
 * Procesar reembolso completo de un pedido
 * Body: { reason: string, refundAmount?: number }
 * Requiere: Admin
 */
router.post('/:orderId/refund', processRefund);

/**
 * POST /api/orders/:orderId/partial-refund
 * Procesar reembolso parcial (productos específicos)
 * Body: { productSkus: string[], reason: string }
 * Requiere: Admin
 */
router.post('/:orderId/partial-refund', authenticateToken, isAdmin, processPartialRefund);

router.put('/:orderId/status', authenticateToken, isAdmin, updateOrderStatus);

export default router;

// ========================================
// EJEMPLOS DE USO
// ========================================

/*

CLIENTES:
---------
GET /api/orders/my-orders
GET /api/orders/my-orders/123
GET /api/orders/my-orders/status/Pending
GET /api/orders/my-payments

ADMINISTRADORES:
----------------
GET /api/orders/all
GET /api/orders/123
GET /api/orders/status/Completed
GET /api/orders/users/5
GET /api/orders/payments/123

BÚSQUEDA AVANZADA (Admin):
--------------------------
GET /api/orders/search?startDate=2025-01-01&endDate=2025-01-31&status=Completed&page=1&limit=20
GET /api/orders/search?userEmail=juan@example.com&productSku=PC-GAMING-001
GET /api/orders/search?userId=5&startDate=2025-01-01

RESUMEN Y ESTADÍSTICAS (Admin):
-------------------------------
GET /api/orders/summary
GET /api/orders/summary?startDate=2025-01-01&endDate=2025-12-31
GET /api/orders/summary?status=Completed

*/