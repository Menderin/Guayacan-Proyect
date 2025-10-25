import { Router } from 'express';
import {



    // Controladores para administradores
    getAllPayments,
    getPaymentsByStatus,

    // Búsqueda avanzada
    getPaymentsWithFilters
} from '../controllers/payment.controller';


const router = Router();

// ========================================
// RUTAS PÚBLICAS O DE BÚSQUEDA AVANZADA (colocar primero para evitar conflictos)
// ========================================

/**
 * GET /api/payments/search
 * Búsqueda avanzada con filtros múltiples
 * Requiere: Admin
 */
router.get('/search', getPaymentsWithFilters);



// ========================================
// RUTAS PARA ADMINISTRADORES
// ========================================

/**
 * GET /api/payments/all
 * Obtener todos los pagos del sistema
 * Requiere: Admin
 */
router.get('/all', getAllPayments);


/**
 * GET /api/payments/status/:status
 * Obtener todos los pagos por estado
 * Params: status (Pending, Completed, Cancelled, etc.)
 * Requiere: Admin
 */
router.get('/status/:status', getPaymentsByStatus);





export default router;