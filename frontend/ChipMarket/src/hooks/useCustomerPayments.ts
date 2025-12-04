// src/hooks/useCustomerPayments.ts

import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:3000/api/orders';

export interface CustomerPayment {
  id_payment: number;
  order_id: number;
  payment_date: string;
  payment_method: string;
  amount: number;
  status: string;
  transaction_id?: string;
  order?: {
    id_order: number;
    order_date: string;
    status: string;
    total_amount: number;
  };
}

interface UseCustomerPaymentsReturn {
  payments: CustomerPayment[];
  loading: boolean;
  error: string | null;
  refetchPayments: () => void;
}

export const useCustomerPayments = (): UseCustomerPaymentsReturn => {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Endpoint: GET /api/orders/my-orders/my-payments
      const response = await fetch(`${API_URL}/my-payments`, {
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
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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