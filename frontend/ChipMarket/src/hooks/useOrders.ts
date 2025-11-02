// src/hooks/useOrders.ts
import { useState, useCallback } from 'react';
import { OrderService } from '../services/order.service';
import type { Order, OrderWithUser } from '../types/order.types';

interface UseOrdersReturn {
  orders: OrderWithUser[];
  pendingOrders: Order[];
  unpaidOrders: Order[];
  loading: boolean;
  error: string | null;
  getPendingOrders: () => Promise<void>;
  getUnpaidOrders: () => Promise<void>;
  getOrderById: (orderId: number) => Promise<Order | null>;
  getAllOrders: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook para gestionar pedidos
 */
export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [unpaidOrders, setUnpaidOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calcular saldo pendiente
   */
  const calculateRemainingAmount = (order: Order): number => {
    const totalPaid = (order.payments || [])
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    
    return Number(order.total_amount) - totalPaid;
  };

  /**
   * Obtener pedidos pendientes (solo estado Pending)
   */
  const getPendingOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await OrderService.getOrdersByStatus('Pending');
      if (response.success && response.data) {
        setPendingOrders(response.data);
      } else {
        setPendingOrders([]);
        setError(response.message || 'No se encontraron pedidos pendientes');
      }
    } catch (err) {
      setError('Error al obtener pedidos pendientes');
      setPendingOrders([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener pedidos con saldo pendiente (cualquier estado)
   */
  const getUnpaidOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await OrderService.getAllOrders();
      
      if (response.success && response.data) {
        // Filtrar pedidos con saldo pendiente
        const ordersWithDebt = response.data.filter((order: Order) => {
          const remainingAmount = calculateRemainingAmount(order);
          return remainingAmount > 0 && order.status !== 'Cancelled';
        });

        // Ordenar por fecha (más recientes primero)
        ordersWithDebt.sort((a: Order, b: Order) => 
          new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
        );

        setUnpaidOrders(ordersWithDebt);
      } else {
        setUnpaidOrders([]);
        setError(response.message || 'No se encontraron pedidos con saldo pendiente');
      }
    } catch (err) {
      setError('Error al obtener pedidos con saldo pendiente');
      setUnpaidOrders([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener todos los pedidos
   */
  const getAllOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await OrderService.getAllOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
        setError(response.message || 'Error al obtener pedidos');
      }
    } catch (err) {
      setError('Error al obtener pedidos');
      setOrders([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener un pedido específico por ID
   */
  const getOrderById = useCallback(async (orderId: number): Promise<Order | null> => {
    if (!orderId || orderId <= 0) {
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await OrderService.getOrderDetails(orderId);
      if (response.success && response.data) {
        return response.data;
      }
      setError('Pedido no encontrado');
      return null;
    } catch (err) {
      setError('Error al obtener el pedido');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Resetear estado
   */
  const reset = () => {
    setOrders([]);
    setPendingOrders([]);
    setUnpaidOrders([]);
    setLoading(false);
    setError(null);
  };

  return {
    orders,
    pendingOrders,
    unpaidOrders,
    loading,
    error,
    getPendingOrders,
    getUnpaidOrders,
    getOrderById,
    getAllOrders,
    reset
  };
}