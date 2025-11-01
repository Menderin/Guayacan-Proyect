// src/types/payment.types.ts

/**
 * Métodos de pago válidos según el backend
 */
export type PaymentMethod = 
  | 'Tarjeta de crédito'
  | 'Tarjeta de débito'
  | 'Transferencia bancaria'
  | 'Efectivo'
  | 'PayPal'
  | 'MercadoPago'
  | 'Webpay';

/**
 * Estados de pago válidos
 */
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

/**
 * Estructura de un pago
 */
export interface Payment {
  id_payment: number;
  order_id: number;
  payment_method: PaymentMethod;
  amount: string | number;
  status: PaymentStatus;
  payment_date: string;
}

/**
 * Datos para crear un nuevo pago
 */
export interface CreatePaymentDTO {
  orderId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  status?: PaymentStatus;
}

/**
 * Datos para actualizar un pago
 */
export interface UpdatePaymentDTO {
  status: PaymentStatus;
}

/**
 * Respuesta de la API al crear/obtener un pago
 */
export interface PaymentApiResponse {
  success: boolean;
  message: string;
  data?: {
    payment: Payment;
    order: {
      id_order: number;
      status: string;
      total_amount: string | number;
      paid_amount: string | number;
      remaining_amount: string | number;
    };
  };
}

/**
 * Respuesta de la API al listar pagos
 */
export interface PaymentListApiResponse {
  success: boolean;
  message: string;
  data?: Payment[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Filtros para búsqueda avanzada de pagos
 */
export interface PaymentSearchFilters {
  orderId?: number;
  userId?: number;
  status?: PaymentStatus | '';
  paymentMethod?: PaymentMethod | '';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page: number;
  limit: number;
}

/**
 * Estadísticas de pagos
 */
export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  byStatus: {
    status: PaymentStatus;
    count: number;
    amount: number;
  }[];
  byMethod: {
    method: PaymentMethod;
    count: number;
    amount: number;
  }[];
  averagePayment: number;
  recentPayments: Payment[];
}

/**
 * Respuesta de estadísticas de pagos
 */
export interface PaymentStatsApiResponse {
  success: boolean;
  message: string;
  data?: PaymentStats;
}