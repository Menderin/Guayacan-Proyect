// src/hooks/useCreatePayment.ts

import { useState } from 'react';
import { PaymentService } from '../services/payment.service';
import type { CreatePaymentDTO, PaymentMethod, PaymentStatus } from '../types/payment.types';

interface UseCreatePaymentReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  createdPaymentId: number | null;
  orderInfo: {
    status: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
  } | null;
  createPayment: (paymentData: CreatePaymentDTO) => Promise<boolean>;
  reset: () => void;
  validatePayment: (paymentData: CreatePaymentDTO) => string | null;
}

/**
 * Hook para crear pagos con validaciones
 */
export const useCreatePayment = (): UseCreatePaymentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdPaymentId, setCreatedPaymentId] = useState<number | null>(null);
  const [orderInfo, setOrderInfo] = useState<{
    status: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
  } | null>(null);

  /**
   * Métodos de pago válidos
   */
  const validPaymentMethods: PaymentMethod[] = [
    'Tarjeta de crédito',
    'Tarjeta de débito',
    'Transferencia bancaria',
    'Efectivo',
    'PayPal',
    'MercadoPago',
    'Webpay'
  ];

  /**
   * Estados de pago válidos
   */
  const validPaymentStatuses: PaymentStatus[] = ['Pending', 'Completed', 'Failed', 'Refunded'];

  /**
   * Validar datos del pago antes de enviar
   */
  const validatePayment = (paymentData: CreatePaymentDTO): string | null => {
    // Validar ID del pedido
    if (!paymentData.orderId || paymentData.orderId <= 0) {
      return 'Debe seleccionar un pedido válido';
    }

    // Validar método de pago
    if (!paymentData.paymentMethod || paymentData.paymentMethod.trim() === '') {
      return 'Debe seleccionar un método de pago';
    }

    if (!validPaymentMethods.includes(paymentData.paymentMethod)) {
      return 'Método de pago no válido';
    }

    // Validar monto
    if (!paymentData.amount || paymentData.amount <= 0) {
      return 'El monto debe ser mayor a 0';
    }

    // Validar estado (si se proporciona)
    if (paymentData.status && !validPaymentStatuses.includes(paymentData.status)) {
      return 'Estado de pago no válido';
    }

    return null; // Todo válido
  };

  /**
   * Crear pago
   */
  const createPayment = async (paymentData: CreatePaymentDTO): Promise<boolean> => {
    // Validar antes de enviar
    const validationError = validatePayment(paymentData);
    if (validationError) {
      setError(validationError);
      return false;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setCreatedPaymentId(null);
    setOrderInfo(null);

    try {
      const response = await PaymentService.createPayment(paymentData);

      if (response.success && response.data) {
        setSuccess(true);
        setCreatedPaymentId(response.data.payment.id_payment);
        
        // Guardar información del pedido actualizado
        setOrderInfo({
          status: response.data.order.status,
          totalAmount: typeof response.data.order.total_amount === 'string' 
            ? parseFloat(response.data.order.total_amount) 
            : response.data.order.total_amount,
          paidAmount: typeof response.data.order.paid_amount === 'string'
            ? parseFloat(response.data.order.paid_amount)
            : response.data.order.paid_amount,
          remainingAmount: typeof response.data.order.remaining_amount === 'string'
            ? parseFloat(response.data.order.remaining_amount)
            : response.data.order.remaining_amount
        });

        return true;
      } else {
        setError(response.message || 'Error al registrar el pago');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión con el servidor';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resetear el estado
   */
  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setCreatedPaymentId(null);
    setOrderInfo(null);
  };

  return {
    loading,
    error,
    success,
    createdPaymentId,
    orderInfo,
    createPayment,
    reset,
    validatePayment
  };
};