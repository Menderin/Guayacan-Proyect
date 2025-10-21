import { Router } from 'express';
import { 
  getMyOrders, 
  getOrderDetail, 
  getPersonalOrdersByStatus,
  getMyPayments, 
  getOrdersByUserId,
  getAllOrders,
  getPaymentsByOrderId,
  getOrderDetailsById,
  getOrdersByStatus
} from '../controllers/order.controller';
import { authenticateToken, isClient } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación y rol de cliente
// router.use(authenticateToken);

router.get('/my-orders', getMyOrders);
router.get('/my-orders/:orderId', getOrderDetail);
router.get('/my-orders/status/:status', getPersonalOrdersByStatus);
router.get('/my-payments', getMyPayments);
router.get('/orders-by-user-id/:userId', getOrdersByUserId);
router.get('/payments-by-order-id/:orderId', getPaymentsByOrderId);
router.get('/order-details-by-id/:orderId', getOrderDetailsById);
router.get('/all-orders', getAllOrders);
router.get('/order/status/:status', getOrdersByStatus);

export default router;