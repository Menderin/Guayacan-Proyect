// src/pages/Admin/Users/UserOrdersPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import type { Order, OrderApiResponse } from '../../../types/order.types';
import { authenticatedFetch } from '../../../utils/api.helper';
import { OrderDetailsPage } from '../Orders/OrderDetailsPage';
import '../../../styles/UserOrderPage.css'; // Importar el CSS

interface UserOrdersPageProps {
  userId: number;
  userName: string;
  onBack: () => void;
}

export const UserOrdersPage: React.FC<UserOrdersPageProps> = ({ userId, userName, onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`📦 Cargando pedidos del usuario ${userId}...`);
      
      const url = `/api/orders/orders-by-user-id/${userId}`;
      console.log('📦 URL:', url);
      
      const response = await authenticatedFetch(url);

      console.log('📦 Status:', response.status);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result: OrderApiResponse = await response.json();
      console.log('📦 Respuesta:', result);

      if (result.success && result.data && result.data.orders) {
        console.log('📦 Primer pedido (estructura):', result.data.orders[0]);
        setOrders(result.data.orders);
        console.log('✅ Pedidos cargados:', result.data.orders.length);
      } else {
        throw new Error(result.message || 'Error al cargar pedidos');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(numPrice);
  };

  const getStatusClass = (status: string) => {
    const classes: { [key: string]: string } = {
      pending: 'order-status-badge--pending',
      completed: 'order-status-badge--completed',
      cancelled: 'order-status-badge--cancelled',
      processing: 'order-status-badge--processing'
    };
    return classes[status.toLowerCase()] || '';
  };

  // Si hay un pedido seleccionado, mostrar sus detalles
  if (selectedOrderId) {
    return (
      <OrderDetailsPage
        orderId={selectedOrderId}
        onBack={() => setSelectedOrderId(null)}
      />
    );
  }

  return (
    <div className="user-orders-container">
      {/* Header */}
      <div className="user-orders-header">
        <div className="user-orders-header__content">
          <div className="user-orders-header__info">
            <button
              onClick={onBack}
              className="user-orders-header__back-btn"
            >
              Volver a usuarios
            </button>
            <h2 className="user-orders-header__title">
              Pedidos de {userName}
            </h2>
            <p className="user-orders-header__user-id">ID de usuario: {userId}</p>
          </div>
          <button
            onClick={loadOrders}
            className="user-orders-header__reload-btn"
          >
            Recargar
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="user-orders-content">
        {loading ? (
          <div className="user-orders-state">
            <p className="user-orders-state__message user-orders-state__message--loading">
              Cargando pedidos...
            </p>
          </div>
        ) : error ? (
          <div className="user-orders-state">
            <p className="user-orders-state__message user-orders-state__message--error">
              Error: {error}
            </p>
            <button
              onClick={loadOrders}
              className="user-orders-state__retry-btn"
            >
              Reintentar
            </button>
          </div>
        ) : orders.length > 0 ? (
          <div>
            <p className="user-orders-content__count">
              Total de pedidos: <strong>{orders.length}</strong>
            </p>
            <div className="orders-list">
              {orders.map(order => {
                console.log('🔍 Renderizando orden:', order);
                return (
                  <div key={order.id_order} className="order-card">
                    <div className="order-card__header">
                      <div className="order-card__info">
                        <h3>Pedido #{order.id_order}</h3>
                        <p>{formatDate(order.order_date)}</p>
                      </div>
                      <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-card__footer">
                      <p className="order-card__price">
                        {formatPrice(order.total_amount)}
                      </p>
                      <button
                        onClick={() => setSelectedOrderId(order.id_order)}
                        className="order-card__details-btn"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="user-orders-empty">
            <p className="user-orders-empty__message">
              Este usuario no tiene pedidos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};