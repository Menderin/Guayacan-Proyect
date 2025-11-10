// src/services/payment.service.ts

import { authenticatedFetch } from '../utils/api.helper';
import type {
  CreatePaymentDTO,
  UpdatePaymentDTO,
  PaymentApiResponse,
  PaymentListApiResponse,
  PaymentSearchFilters,
  PaymentStatsApiResponse
} from '../types/payment.types';

const API_URL = 'http://localhost:3000/api/payments';

/**
 * Servicio para gestionar pagos
 */
export const PaymentService = {
  /**
   * Crear un nuevo pago
   */
  async createPayment(paymentData: CreatePaymentDTO): Promise<PaymentApiResponse> {
    try {
      const response = await authenticatedFetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al crear pago:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de un pago
   */
  async updatePayment(paymentId: number, updateData: UpdatePaymentDTO): Promise<PaymentApiResponse> {
    try {
      const response = await authenticatedFetch(`${API_URL}/${paymentId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un pago específico
   */
  async getPaymentDetails(paymentId: number): Promise<PaymentApiResponse> {
    try {
      const response = await authenticatedFetch(`${API_URL}/${paymentId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener detalles del pago:', error);
      throw error;
    }
  },

  /**
   * Eliminar un pago (solo Pending o Failed)
   */
  async deletePayment(paymentId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await authenticatedFetch(`${API_URL}/${paymentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los pagos
   */
  async getAllPayments(): Promise<PaymentListApiResponse> {
    try {
      const response = await authenticatedFetch(`${API_URL}/all`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener todos los pagos:', error);
      throw error;
    }
  },

  /**
   * Obtener pagos por estado
   */
  async getPaymentsByStatus(status: string): Promise<PaymentListApiResponse> {
    try {
      const response = await authenticatedFetch(`${API_URL}/status/${status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener pagos por estado:', error);
      throw error;
    }
  },

  /**
   * Búsqueda avanzada de pagos
   */
  async searchPayments(filters: Partial<PaymentSearchFilters>): Promise<PaymentListApiResponse> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await authenticatedFetch(`${API_URL}/search?${params}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al buscar pagos:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de pagos
   */
  async getPaymentStats(): Promise<PaymentStatsApiResponse> {
    try {
      const response = await authenticatedFetch(`${API_URL}/stats`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener estadísticas de pagos:', error);
      throw error;
    }
  },

/**
   * Obtener pagos de un pedido específico
   */
  async getPaymentsByOrderId(orderId: number): Promise<PaymentListApiResponse> {
    try {
      const response = await authenticatedFetch(`${API_URL}/order/${orderId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener pagos del pedido:', error);
      throw error;
    }
  }
};