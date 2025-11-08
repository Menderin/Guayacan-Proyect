// controllers/order.controller.ts
import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { ApiResponse } from '../utils/response.utils';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    [key: string]: any;
  };
}

const orderService = new OrderService();

// ========================================
// CONTROLADORES PARA CLIENTES
// ========================================

/**
 * GET /api/orders/my-orders
 * Obtener todos los pedidos del cliente autenticado
 */
export const getMyOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await orderService.getOrdersByUserId(userId);
    return ApiResponse.success(res, result, 'Pedidos obtenidos exitosamente');
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener pedidos',
      404
    );
  }
};

/**
 * GET /api/orders/my-orders/:orderId
 * Obtener un pedido específico del cliente autenticado
 */
export const getOrderDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const userId = req.user!.userId;
    
    if (isNaN(orderId)) {
      return ApiResponse.error(res, 'ID de pedido inválido', 400);
    }
    
    const order = await orderService.getOrderById(orderId, userId);
    return ApiResponse.success(res, order, 'Detalle del pedido obtenido');
  } catch (error) {
    console.error('Error al obtener detalle:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener detalle del pedido',
      404
    );
  }
};

/**
 * GET /api/orders/my-orders/status/:status
 * Obtener pedidos del cliente autenticado filtrados por estado
 */
export const getPersonalOrdersByStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.params;
    
    if (!status) {
      return ApiResponse.error(res, 'Estado es requerido', 400);
    }
    
    const orders = await orderService.getPersonalOrdersByStatus(userId, status);
    return ApiResponse.success(res, orders, `Pedidos con estado ${status}`);
  } catch (error) {
    console.error('Error:', error);
    return ApiResponse.error(res, 'Error al obtener pedidos por estado', 500);
  }
};

/**
 * GET /api/orders/my-payments
 * Obtener todos los pagos del cliente autenticado
 */
export const getMyPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const payments = await orderService.getPaymentsByUser(userId);
    return ApiResponse.success(res, payments, 'Pagos obtenidos exitosamente');
  } catch (error) {
    console.error('Error:', error);
    return ApiResponse.error(res, 'Error al obtener pagos', 500);
  }
};

// ========================================
// CONTROLADORES PARA ADMINISTRADORES
// ========================================

/**
 * GET /api/orders/users/:userId
 * Obtener todos los pedidos de un usuario específico (Admin)
 */
export const getOrdersByUserId = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return ApiResponse.error(res, 'ID de usuario inválido', 400);
    }
    
    const orders = await orderService.getOrdersByUserId(userId);
    return ApiResponse.success(res, orders, 'Pedidos del usuario obtenidos exitosamente');
  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener pedidos del usuario',
      404
    );
  }
};

/**
 * GET /api/orders/all
 * Obtener todos los pedidos del sistema (Admin)
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await orderService.getAllOrders();
    return ApiResponse.success(res, orders, 'Todos los pedidos obtenidos exitosamente');
  } catch (error) {
    console.error('Error al obtener todos los pedidos:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener todos los pedidos',
      500
    );
  } 
};

/**
 * GET /api/orders/:orderId
 * Obtener detalles completos de un pedido (Admin)
 */
export const getOrderDetailsById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId || isNaN(Number(orderId))) {
      return ApiResponse.error(res, 'ID de pedido inválido', 400);
    }

    const orderDetails = await orderService.getOrderDetailsById(Number(orderId));
    
    return ApiResponse.success(
      res, 
      orderDetails, 
      'Detalles del pedido obtenidos exitosamente'
    );

  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener detalles del pedido',
      error instanceof Error && error.message.includes('no encontrado') ? 404 : 500
    );
  }
};

/**
 * GET /api/orders/status/:status
 * Obtener pedidos filtrados por estado (Admin)
 */
export const getOrdersByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    
    if (!status) {
      return ApiResponse.error(res, 'Estado es requerido', 400);
    }
    
    const orders = await orderService.getOrdersByStatus(status);
    return ApiResponse.success(
      res, 
      orders, 
      `Pedidos con estado ${status} obtenidos exitosamente`
    );
  } catch (error) {
    console.error('Error al obtener pedidos por estado:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener pedidos por estado',
      500
    );
  }
};

/**
 * GET /api/orders/payments/:orderId
 * Obtener pagos de un pedido específico (Admin)
 */
export const getPaymentsByOrderId = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    if (isNaN(orderId)) {
      return ApiResponse.error(res, 'ID de pedido inválido', 400);
    }
    
    const payments = await orderService.getPaymentsByOrderId(orderId);
    return ApiResponse.success(res, payments, 'Pagos del pedido obtenidos exitosamente');
  } catch (error) {
    console.error('Error al obtener pagos del pedido:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener pagos del pedido',
      500
    );
  }
};

// ========================================
// FILTROS AVANZADOS Y BÚSQUEDA
// ========================================

/**
 * GET /api/orders/search
 * Obtener pedidos con filtros avanzados (Admin)
 * Query params: startDate, endDate, userId, userEmail, productSku, status, page, limit
 */
export const getOrdersWithFilters = async (req: Request, res: Response) => {
  try {
    const {
      startDate,
      endDate,
      userId,
      userEmail,
      productSku,
      status,
      page = '1',
      limit = '10'
    } = req.query;

    // Validar paginación
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    if (isNaN(pageNum) || pageNum < 1) {
      return ApiResponse.error(res, 'Número de página inválido', 400);
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return ApiResponse.error(res, 'Límite inválido (debe ser entre 1 y 100)', 400);
    }

    const filters = {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      userId: userId ? parseInt(userId as string) : undefined,
      userEmail: userEmail as string | undefined,
      productSku: productSku as string | undefined,
      status: status as string | undefined,
      page: pageNum,
      limit: limitNum
    };

    const result = await orderService.getOrdersWithFilters(filters);

    return res.status(200).json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
      message: 'Pedidos obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los pedidos',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/orders/summary
 * Obtener resumen y estadísticas de pedidos (Admin)
 * Query params: startDate, endDate, userId, status
 */
export const getOrdersSummary = async (req: Request, res: Response) => {
  try {
    const {
      startDate,
      endDate,
      userId,
      status
    } = req.query;

    const filters = {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      userId: userId ? parseInt(userId as string) : undefined,
      status: status as string | undefined
    };

    const summary = await orderService.getOrdersSummary(filters);

    return res.status(200).json({
      success: true,
      data: summary,
      message: 'Resumen obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error fetching summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el resumen',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


// ========================================
// CONTROLADORES DE REEMBOLSOS
// ========================================

/**
 * POST /api/orders/:orderId/refund
 * Procesar reembolso completo de un pedido
 * Requiere: Admin
 * Body: { reason: string, refundAmount?: number }
 */
export const processRefund = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { reason, refundAmount } = req.body;
    
    // ✅ CORRECCIÓN: Manejar múltiples posibles estructuras de req.user
    const adminUserId = req.user?.userId || req.user?.id || 0;

    // ✅ VALIDACIÓN: Asegurar que el usuario esté autenticado
    if (!req.user) {
      return ApiResponse.error(res, 'Usuario no autenticado', 401);
    }

    if (adminUserId === 0) {
      console.error('❌ req.user structure:', req.user);
      return ApiResponse.error(res, 'No se pudo obtener el ID del usuario', 500);
    }

    // Validaciones
    if (isNaN(orderId)) {
      return ApiResponse.error(res, 'ID de pedido inválido', 400);
    }

    if (!reason || reason.trim() === '') {
      return ApiResponse.error(res, 'Debe proporcionar una razón para el reembolso', 400);
    }

    if (refundAmount && (isNaN(refundAmount) || refundAmount <= 0)) {
      return ApiResponse.error(res, 'Monto de reembolso inválido', 400);
    }

    // Verificar si el pedido puede ser reembolsado
    const canRefund = await orderService.canBeRefunded(orderId);
    if (!canRefund.canRefund) {
      return ApiResponse.error(res, canRefund.reason || 'No se puede procesar el reembolso', 400);
    }

    // Procesar el reembolso
    const result = await orderService.processRefund({
      orderId,
      reason,
      refundAmount,
      adminUserId
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.refundDetails
    });

  } catch (error) {
    console.error('Error al procesar reembolso:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al procesar reembolso',
      500
    );
  }
};

/**
 * POST /api/orders/:orderId/partial-refund
 * Procesar reembolso parcial de productos específicos
 * Requiere: Admin
 * Body: { productSkus: string[], reason: string }
 */
export const processPartialRefund = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { productSkus, reason } = req.body;
    
    // ✅ CORRECCIÓN: Manejar múltiples posibles estructuras de req.user
    const adminUserId = req.user?.userId || req.user?.id || 0;

    // ✅ VALIDACIÓN: Asegurar que el usuario esté autenticado
    if (!req.user) {
      return ApiResponse.error(res, 'Usuario no autenticado', 401);
    }

    if (adminUserId === 0) {
      console.error('❌ req.user structure:', req.user);
      return ApiResponse.error(res, 'No se pudo obtener el ID del usuario', 500);
    }

    // Validaciones
    if (isNaN(orderId)) {
      return ApiResponse.error(res, 'ID de pedido inválido', 400);
    }

    if (!reason || reason.trim() === '') {
      return ApiResponse.error(res, 'Debe proporcionar una razón para el reembolso', 400);
    }

    if (!Array.isArray(productSkus) || productSkus.length === 0) {
      return ApiResponse.error(res, 'Debe proporcionar al menos un SKU de producto', 400);
    }

    // Procesar reembolso parcial
    const result = await orderService.processPartialRefund(
      orderId,
      productSkus,
      reason,
      adminUserId
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.refundDetails
    });

  } catch (error) {
    console.error('Error al procesar reembolso parcial:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al procesar reembolso parcial',
      500
    );
  }
};

/**
 * PUT /api/orders/:orderId/status
 * Actualizar el estado de un pedido
 * Requiere: Admin
 * Body: { status: string }
 */
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { status } = req.body;
    const adminUserId = req.user?.userId;

    // Validaciones
    if (isNaN(orderId)) {
      return ApiResponse.error(res, 'ID de pedido inválido', 400);
    }

    if (!status || status.trim() === '') {
      return ApiResponse.error(res, 'Debe proporcionar un nuevo estado', 400);
    }

    // Actualizar pedido usando servicio
    const result = await orderService.updateOrderStatus(orderId, status);

    if (!result.success) {
      return ApiResponse.error(res, result.message || 'No se pudo actualizar el pedido', 400);
    }

    return res.status(200).json({
      success: true,
      message: 'Estado del pedido actualizado exitosamente',
      data: {
        id_order: orderId,
        new_status: status,
        updated_by: adminUserId,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error interno del servidor',
      500
    );
  }
};

/**
 * GET /api/orders/:orderId/can-refund
 * Verificar si un pedido puede ser reembolsado
 * Requiere: Admin
 */
export const checkRefundEligibility = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);

    if (isNaN(orderId)) {
      return ApiResponse.error(res, 'ID de pedido inválido', 400);
    }

    const result = await orderService.canBeRefunded(orderId);

    return res.status(200).json({
      success: true,
      data: {
        canRefund: result.canRefund,
        reason: result.reason,
        order: result.order ? {
          id: result.order.id_order,
          status: result.order.status,
          total_amount: result.order.total_amount,
          order_date: result.order.order_date
        } : null
      }
    });

  } catch (error) {
    console.error('Error al verificar elegibilidad:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al verificar elegibilidad',
      500
    );
  }
};

/**
 * GET /api/orders/refunds/history
 * Obtener historial de reembolsos
 * Requiere: Admin
 * Query params: orderId (opcional)
 */
export const getRefundHistory = async (req: Request, res: Response) => {
  try {
    const orderId = req.query.orderId ? parseInt(req.query.orderId as string) : undefined;

    if (orderId && isNaN(orderId)) {
      return ApiResponse.error(res, 'ID de pedido inválido', 400);
    }

    const history = await orderService.getRefundHistory(orderId);

    return res.status(200).json({
      success: true,
      data: {
        totalRefunds: history.length,
        refunds: history
      },
      message: 'Historial de reembolsos obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener historial de reembolsos',
      500
    );
  }
};

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      userId, 
      products, 
      paymentMethod, 
      shippingAddress, 
      status 
    } = req.body;

    // ========================================
    // VALIDACIONES
    // ========================================
    if (!userId || !products || !paymentMethod) {
      return ApiResponse.error(
        res, 
        'Faltan campos requeridos: userId, products, paymentMethod', 
        400
      );
    }

    if (!Array.isArray(products) || products.length === 0) {
      return ApiResponse.error(
        res, 
        'Debe incluir al menos un producto', 
        400
      );
    }

    // Validar estructura de productos
    for (const product of products) {
      if (!product.sku || !product.quantity) {
        return ApiResponse.error(
          res, 
          'Cada producto debe tener "sku" y "quantity"', 
          400
        );
      }

      if (typeof product.quantity !== 'number' || product.quantity <= 0) {
        return ApiResponse.error(
          res, 
          'La cantidad debe ser un número mayor a 0', 
          400
        );
      }
    }

    // Validar dirección de envío si se proporciona
    if (shippingAddress) {
      if (!shippingAddress.address || !shippingAddress.city) {
        return ApiResponse.error(
          res, 
          'La dirección de envío debe incluir "address" y "city"', 
          400
        );
      }
    }

    // ========================================
    // CREAR PEDIDO
    // ========================================
    const orderResult = await orderService.createOrder({
      userId,
      products,
      paymentMethod,
      shippingAddress,
      status
    });

    return res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: orderResult
    });

  } catch (error) {
    console.error('Error al crear pedido:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al crear pedido',
      error instanceof Error && error.message.includes('no encontrado') ? 404 :
      error instanceof Error && error.message.includes('insuficiente') ? 400 :
      500
    );
  }
};