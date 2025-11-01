// routes/payment.routes.ts
import { Router } from 'express';
import { 
  // Consultas (GET)
  getAllPayments,
  getPaymentsByStatus,
  getPaymentsWithFilters,
  getPaymentDetails,
  getPaymentStats,
  
  // Operaciones (POST, PUT, DELETE)
  createPayment,
  updatePayment,
  deletePayment
} from '../controllers/payment.controller';
import { authenticateToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// ========================================
// RUTAS DE CONSULTA (GET)
// ========================================

/**
 * GET /api/payments/stats
 * Obtener estadísticas de pagos
 * Requiere: Admin
 */
router.get('/stats', authenticateToken, isAdmin, getPaymentStats);

/**
 * GET /api/payments/search
 * Búsqueda avanzada de pagos con filtros
 * Query params: userId, orderId, status, paymentMethod, startDate, endDate, minAmount, maxAmount, page, limit
 * Requiere: Admin
 */
router.get('/search', authenticateToken, isAdmin, getPaymentsWithFilters);

/**
 * GET /api/payments/all
 * Obtener todos los pagos del sistema
 * Requiere: Admin
 */
router.get('/all', authenticateToken, isAdmin, getAllPayments);

/**
 * GET /api/payments/status/:status
 * Obtener pagos filtrados por estado
 * Params: status (Pending, Completed, Failed, Refunded)
 * Requiere: Admin
 */
router.get('/status/:status', authenticateToken, isAdmin, getPaymentsByStatus);

/**
 * GET /api/payments/:paymentId
 * Obtener detalles completos de un pago específico
 * Params: paymentId
 * Requiere: Admin
 */
router.get('/:paymentId', authenticateToken, isAdmin, getPaymentDetails);

// ========================================
// RUTAS DE OPERACIONES (POST, PUT, DELETE)
// ========================================

/**
 * POST /api/payments
 * Crear un nuevo pago asociado a un pedido
 * Body: { orderId, paymentMethod, amount, status? }
 * Requiere: Admin
 */
router.post('/', authenticateToken, isAdmin, createPayment);

/**
 * PUT /api/payments/:paymentId
 * Actualizar estado de un pago
 * Params: paymentId
 * Body: { status }
 * Requiere: Admin
 */
router.put('/:paymentId', authenticateToken, isAdmin, updatePayment);

/**
 * DELETE /api/payments/:paymentId
 * Eliminar un pago pendiente o fallido
 * Params: paymentId
 * Requiere: Admin
 */
router.delete('/:paymentId', authenticateToken, isAdmin, deletePayment);

export default router;

// ========================================
// EJEMPLOS DE USO
// ========================================

/*

CREAR PAGO:
-----------
POST /api/payments
{
  "orderId": 1,
  "paymentMethod": "Tarjeta de crédito",
  "amount": 500000,
  "status": "Completed"
}

ACTUALIZAR PAGO:
----------------
PUT /api/payments/1
{
  "status": "Completed"
}

OBTENER PAGO:
-------------
GET /api/payments/1

ELIMINAR PAGO:
--------------
DELETE /api/payments/1

OBTENER TODOS LOS PAGOS:
------------------------
GET /api/payments/all

OBTENER PAGOS POR ESTADO:
-------------------------
GET /api/payments/status/Completed

BÚSQUEDA AVANZADA:
------------------
GET /api/payments/search?userId=2&status=Completed&page=1&limit=10

ESTADÍSTICAS:
-------------
GET /api/payments/stats

*/