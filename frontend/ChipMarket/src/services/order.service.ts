// src/services/order.service.ts

import { authenticatedFetch } from '../utils/api.helper';
import type {
  CreateOrderDTO,
  CreateOrderApiResponse,
  OrderSearchFilters,
  OrderSearchApiResponse,
  OrderDetailsApiResponse,
  OrderStatus
} from '../types/order.types';

const API_URL = 'http://localhost:3000/api/orders';

/**
 * Servicio para gestionar pedidos
 */
export const OrderService = {
  /**
   * Crear un nuevo pedido
   */
  async createOrder(orderData: CreateOrderDTO): Promise<CreateOrderApiResponse> {
    try {
      const response = await authenticatedFetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  },

  /**
   * Buscar pedidos con filtros avanzados
   */
  async searchOrders(filters: Partial<OrderSearchFilters>): Promise<OrderSearchApiResponse> {
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
      console.error('Error al buscar pedidos:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un pedido específico
   */
  async getOrderDetails(orderId: number): Promise<OrderDetailsApiResponse> {
    try {
      const response = await authenticatedFetch(`${API_URL}/${orderId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener detalles del pedido:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de un pedido
   */
  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<{ success: boolean; message: string }> {
    try {
      const response = await authenticatedFetch(`${API_URL}/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los pedidos del sistema
   */
  async getAllOrders(): Promise<OrderSearchApiResponse> {
    try {
      const response = await authenticatedFetch(`${API_URL}/all`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener todos los pedidos:', error);
      throw error;
    }
  },

  /**
   * Obtener pedidos por estado
   */
  async getOrdersByStatus(status: OrderStatus): Promise<OrderSearchApiResponse> {
    try {
      const response = await authenticatedFetch(`${API_URL}/status/${status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener pedidos por estado:', error);
      throw error;
    }
  },

  /**
   * Verificar si un pedido puede ser reembolsado
   */
  async canRefund(orderId: number): Promise<{ success: boolean; data?: { canRefund: boolean; reason?: string } }> {
    try {
      const response = await authenticatedFetch(`${API_URL}/${orderId}/can-refund`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al verificar elegibilidad de reembolso:', error);
      throw error;
    }
  },

  /**
   * Procesar reembolso de un pedido
   */
  async refundOrder(orderId: number, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await authenticatedFetch(`${API_URL}/${orderId}/refund`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al procesar reembolso:', error);
      throw error;
    }
  },

  /**
   * Obtener resumen y estadísticas de pedidos
   */
  async getOrdersSummary(filters?: {
    startDate?: string;
    endDate?: string;
    userId?: number;
    status?: OrderStatus;
  }): Promise<{ success: boolean; data?: any }> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await authenticatedFetch(`${API_URL}/summary?${params}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener resumen de pedidos:', error);
      throw error;
    }
  }
};