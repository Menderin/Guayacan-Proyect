import { Router } from 'express';
import { 
  getMyOrders, 
  getOrderDetail, 
  getOrdersByStatus,
  getMyPayments, 
  getOrdersByUserId,
  getAllOrders,
  getPaymentsByOrderId,
  getOrderDetailsById
} from '../controllers/order.controller';
import { authenticateToken, isClient } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación y rol de cliente
// router.use(authenticateToken);

router.get('/my-orders', getMyOrders);
router.get('/my-orders/:orderId', getOrderDetail);
router.get('/my-orders/status/:status', getOrdersByStatus);
router.get('/my-payments', getMyPayments);
router.get('/orders-by-user-id/:userId', getOrdersByUserId);
router.get('/payments-by-order-id/:orderId', getPaymentsByOrderId);
router.get('/order-details-by-id/:orderId', getOrderDetailsById);
router.get('/all-orders', getAllOrders);

export default router;