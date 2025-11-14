// src/hooks/useUserPayments.ts

import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:3000/api/payments';

export interface PaymentProduct {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
}

export interface OrderDetail {
  id_detail_order: number;
  product_sku: string;
  quantity: number;
  price: number;
}

export interface Order {
  id_order: number;
  order_date: string;
  status: string;
  total_amount: number;
  user_id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  details: OrderDetail[];
}

export interface Payment {
  id_payment: number;
  order_id: number;
  payment_date: string;
  payment_method: string;
  amount: number;
  status: string;
  transaction_id?: string;
  order: Order;
  products?: PaymentProduct[];
}

interface UseUserPaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  refetchPayments: () => void;
}

export const useUserPayments = (userId: number | null): UseUserPaymentsReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!userId) {
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token'); // Ajusta según tu auth
      const response = await fetch(`${API_URL}/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron cargar los pagos`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setPayments(result.data);
      } else {
        throw new Error(result.message || 'Error al cargar pagos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar pagos';
      setError(errorMessage);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const refetchPayments = useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    refetchPayments
  };
};