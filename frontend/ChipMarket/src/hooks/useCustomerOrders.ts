// src/hooks/useCustomerOrders.ts

import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:3000/api/orders';

export interface OrderProduct {
  id_detail_order: number;
  product_sku: string;
  quantity: number;
  price: number;
  subtotal?: number;
  product?: {
    sku: string;
    name: string;
    category: string;
    image_url?: string;
  };
}

export interface CustomerOrder {
  id_order: number;
  order_date: string;
  status: string;
  total_amount: number;
  details: OrderProduct[];
}

interface UseCustomerOrdersReturn {
  orders: CustomerOrder[];
  loading: boolean;
  error: string | null;
  refetchOrders: () => void;
}

export const useCustomerOrders = (): UseCustomerOrdersReturn => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Endpoint: GET /api/orders/my-orders
      const response = await fetch(`${API_URL}/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron cargar los pedidos`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // result.data.orders contiene el array de pedidos
        const ordersData = result.data.orders || result.data;
        setOrders(ordersData);
      } else {
        throw new Error(result.message || 'Error al cargar pedidos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar pedidos';
      setError(errorMessage);
      setOrders([]);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const refetchOrders = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetchOrders
  };
};