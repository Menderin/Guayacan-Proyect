// src/hooks/useCreateOrder.ts

import { useState } from 'react';
import { OrderService } from '../services/order.service';
import type { CreateOrderDTO, OrderProductInput, ShippingAddress } from '../types/order.types';

interface UseCreateOrderReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  createdOrderId: number | null;
  createOrder: (orderData: CreateOrderDTO) => Promise<boolean>;
  reset: () => void;
  validateOrder: (orderData: CreateOrderDTO) => string | null;
}

/**
 * Hook para crear pedidos con validaciones
 */
export function useCreateOrder(): UseCreateOrderReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  /**
   * Validar datos del pedido antes de enviar
   */
  const validateOrder = (orderData: CreateOrderDTO): string | null => {
    // Validar usuario
    if (!orderData.userId || orderData.userId <= 0) {
      return 'Debe seleccionar un cliente válido';
    }

    // Validar productos
    if (!orderData.products || orderData.products.length === 0) {
      return 'Debe agregar al menos un producto al pedido';
    }

    // Validar cada producto
    for (const product of orderData.products) {
      if (!product.sku || product.sku.trim() === '') {
        return 'Todos los productos deben tener un SKU válido';
      }
      if (!product.quantity || product.quantity <= 0) {
        return 'La cantidad de cada producto debe ser mayor a 0';
      }
    }

    // Validar método de pago
    if (!orderData.paymentMethod || orderData.paymentMethod.trim() === '') {
      return 'Debe seleccionar un método de pago';
    }

    // Validar dirección de envío (opcional pero si existe debe estar completa)
    if (orderData.shippingAddress) {
      const { address, city } = orderData.shippingAddress;
      if (!address || address.trim() === '') {
        return 'La dirección de envío no puede estar vacía';
      }
      if (!city || city.trim() === '') {
        return 'La ciudad de envío no puede estar vacía';
      }
    }

    return null; // Todo válido
  };

  /**
   * Crear pedido
   */
  const createOrder = async (orderData: CreateOrderDTO): Promise<boolean> => {
    // Validar antes de enviar
    const validationError = validateOrder(orderData);
    if (validationError) {
      setError(validationError);
      return false;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setCreatedOrderId(null);

    try {
      const response = await OrderService.createOrder(orderData);

      if (response.success && response.data) {
        setSuccess(true);
        setCreatedOrderId(response.data.order.id_order);
        return true;
      } else {
        setError(response.message || 'Error al crear el pedido');
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
    setCreatedOrderId(null);
  };

  return {
    loading,
    error,
    success,
    createdOrderId,
    createOrder,
    reset,
    validateOrder
  };
}