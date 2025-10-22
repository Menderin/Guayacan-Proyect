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

export const getOrderDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const userId = req.user!.userId;
    
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

export const getPersonalOrdersByStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.params;
    
    const orders = await orderService.getPersonalOrdersByStatus(userId, status);
    return ApiResponse.success(res, orders, `Pedidos con estado ${status}`);
  } catch (error) {
    console.error('Error:', error);
    return ApiResponse.error(res, 'Error al obtener pedidos por estado', 500);
  }
};

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

export const getOrdersByUserId = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
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

export const getPaymentsByOrderId = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
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

export const getOrderDetailsById = async (req: Request, res: Response) => {
  try {
    // 1. Extraer el orderId de los parámetros de la URL
    const { orderId } = req.params;
    
    // 2. Validar que orderId existe y es un número
    if (!orderId || isNaN(Number(orderId))) {
      return res.status(400).json({
        success: false,
        message: 'ID de pedido inválido'
      });
    }

    // 3. Llamar al servicio
    const orderDetails = await orderService.getOrderDetailsById(Number(orderId));
    
    // 4. Validar que se encontró el pedido
    if (!orderDetails) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // 5. Retornar la respuesta exitosa
    return res.status(200).json({
      success: true,
      data: orderDetails,
      message: 'Detalles del pedido obtenidos exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al obtener detalles del pedido:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error al obtener detalles del pedido'
    });
  }
};


export const getOrdersByStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.params;
    const orders = await orderService.getOrdersByStatus(status);
    return ApiResponse.success(res, orders, `Pedidos con estado ${status} obtenidos exitosamente`);
  } catch (error) {
    console.error('Error al obtener pedidos por estado:', error);
    return ApiResponse.error(
      res,
      error instanceof Error ? error.message : 'Error al obtener pedidos por estado',
      500
    );
  }
};