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