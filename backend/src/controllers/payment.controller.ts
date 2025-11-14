import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { ApiResponse } from '../utils/response.utils';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    [key: string]: any;
  };
}

const paymentService = new PaymentService();


// ========================================
// CONTROLADORES PARA CLIENTES
// ========================================











// ========================================
// CONTROLADORES PARA ADMINISTRADORES
// ========================================

/**
 * GET /api/payments/all
 * Obtener todos los pagos del sistema (Admin)
 */
export const getAllPayments = async(req: Request, res: Response) => {
    try {
        const orders = await paymentService.getAllPayments();
        return ApiResponse.success(res, orders, 'Todos los pagos obtenidos exitosamente');
    } catch (error) {
    console.error('Error al obtener todos los pagos:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener todos los pagos',
      500
    );
  } 
};

/**
 * GET /api/orders/status/:status
 * Obtener pedidos filtrados por estado (Admin)
 */
export const getPaymentsByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    
    if (!status) {
      return ApiResponse.error(res, 'Estado es requerido', 400);
    }
    
    const orders = await paymentService.getPaymentsByStatus(status);
    return ApiResponse.success(
      res, 
      orders, 
      `´Pagos con estado ${status} obtenidos exitosamente`
    );
  } catch (error) {
    console.error('Error al obtener pagos por estado:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener pagos por estado',
      500
    );
  }
};

/**
 * GET /api/payments/userId/:userId
 * Obtener pagos por ID de usuario (Admin)
 * Query params: userId
 */
export const getPaymentsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return ApiResponse.error(res, 'ID de usuario inválido', 400);
    }
    const payments = await paymentService.getPaymentsByUserId(userId);
    return ApiResponse.success(
      res,
      payments,
      'Pagos obtenidos exitosamente'
    );
  } catch (error) {
    console.error('Error al obtener pagos por ID de usuario:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener pagos por ID de usuario',
      500
    );
  }
};

// ========================================
// CREAR NUEVO PAGO
// ========================================

/**
 * POST /api/payments
 * Crear un nuevo pago asociado a un pedido
 * Requiere: Admin
 * Body: { orderId, paymentMethod, amount, status? }
 */
export const createPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, paymentMethod, amount, status } = req.body;

    // Validaciones
    if (!orderId || !paymentMethod || !amount) {
      return ApiResponse.error(
        res,
        'Faltan campos requeridos: orderId, paymentMethod, amount',
        400
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return ApiResponse.error(
        res,
        'El monto debe ser un número mayor a 0',
        400
      );
    }

    if (typeof orderId !== 'number') {
      return ApiResponse.error(
        res,
        'El orderId debe ser un número',
        400
      );
    }

    // Validar estado si se proporciona
    const validStatuses = ['Pending', 'Completed', 'Failed', 'Refunded'];
    if (status && !validStatuses.includes(status)) {
      return ApiResponse.error(
        res,
        `Estado inválido. Los estados válidos son: ${validStatuses.join(', ')}`,
        400
      );
    }

    // Crear pago
    const result = await paymentService.createPayment({
      orderId,
      paymentMethod,
      amount,
      status
    });

    return res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: result
    });

  } catch (error) {
    console.error('Error al crear pago:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al crear pago',
      error instanceof Error && error.message.includes('no encontrado') ? 404 :
      error instanceof Error && error.message.includes('excede') ? 400 :
      error instanceof Error && error.message.includes('cancelado') ? 400 :
      500
    );
  }
};

// ========================================
// ACTUALIZAR PAGO
// ========================================

/**
 * PUT /api/payments/:paymentId
 * Actualizar el estado de un pago existente
 * Requiere: Admin
 * Body: { status }
 */
export const updatePayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    const { status } = req.body;

    if (isNaN(paymentId)) {
      return ApiResponse.error(res, 'ID de pago inválido', 400);
    }

    if (!status) {
      return ApiResponse.error(
        res,
        'Debe proporcionar un estado para actualizar',
        400
      );
    }

    // Validar estado
    const validStatuses = ['Pending', 'Completed', 'Failed', 'Refunded'];
    if (!validStatuses.includes(status)) {
      return ApiResponse.error(
        res,
        `Estado inválido. Los estados válidos son: ${validStatuses.join(', ')}`,
        400
      );
    }

    const result = await paymentService.updatePayment(paymentId, { status });

    return res.status(200).json({
      success: true,
      message: 'Pago actualizado exitosamente',
      data: result
    });

  } catch (error) {
    console.error('Error al actualizar pago:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al actualizar pago',
      error instanceof Error && error.message.includes('no encontrado') ? 404 :
      error instanceof Error && error.message.includes('reembolsado') ? 400 :
      500
    );
  }
};

// ========================================
// OBTENER DETALLES DE UN PAGO
// ========================================

/**
 * GET /api/payments/:paymentId
 * Obtener detalles completos de un pago específico
 * Requiere: Admin
 */
export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.paymentId);

    if (isNaN(paymentId)) {
      return ApiResponse.error(res, 'ID de pago inválido', 400);
    }

    const payment = await paymentService.getPaymentById(paymentId);

    if (!payment) {
      return ApiResponse.error(res, 'Pago no encontrado', 404);
    }

    return ApiResponse.success(
      res,
      payment,
      'Detalles del pago obtenidos exitosamente'
    );

  } catch (error) {
    console.error('Error al obtener pago:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener pago',
      500
    );
  }
};

// ========================================
// ELIMINAR PAGO
// ========================================

/**
 * DELETE /api/payments/:paymentId
 * Eliminar un pago pendiente o fallido
 * Requiere: Admin
 */
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.paymentId);

    if (isNaN(paymentId)) {
      return ApiResponse.error(res, 'ID de pago inválido', 400);
    }

    const result = await paymentService.deletePayment(paymentId);

    return ApiResponse.success(
      res,
      result,
      'Pago eliminado exitosamente'
    );

  } catch (error) {
    console.error('Error al eliminar pago:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al eliminar pago',
      error instanceof Error && error.message.includes('no encontrado') ? 404 :
      error instanceof Error && error.message.includes('completado') ? 400 :
      error instanceof Error && error.message.includes('reembolsado') ? 400 :
      500
    );
  }
};

// ========================================
// OBTENER ESTADÍSTICAS DE PAGOS
// ========================================

/**
 * GET /api/payments/stats
 * Obtener estadísticas generales de pagos
 * Requiere: Admin
 */
export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const stats = await paymentService.getPaymentStats();

    return ApiResponse.success(
      res,
      stats,
      'Estadísticas de pagos obtenidas exitosamente'
    );

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener estadísticas',
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
export const getPaymentsWithFilters = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      orderId,
      userEmail,
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
      userId: userId ? parseInt(userId as string) : undefined,
      orderId: orderId ? parseInt(orderId as string) : undefined,
      userEmail: userEmail as string | undefined,
      status: status as string | undefined,
      page: pageNum,
      limit: limitNum
    };

    const result = await paymentService.getPaymentsWithFilters(filters);

    return res.status(200).json({
      success: true,
      data: result.payments,
      pagination: result.pagination,
      message: 'Pagos obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los pagos',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


