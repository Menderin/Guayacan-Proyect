// src/pages/Admin/Orders/OrderDetailsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import type { OrderWithDetails, OrderDetailsApiResponse } from '../../../types/order.types';
import { authenticatedFetch } from '../../../utils/api.helper';
import '../../../styles/OrderDetailsPage.css'; // Importar el CSS

interface OrderDetailsPageProps {
  orderId: number;
  onBack: () => void;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId, onBack }) => {
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`📋 Cargando detalles del pedido ${orderId}...`);
      
      const response = await authenticatedFetch(`/api/orders/order-details-by-id/${orderId}`);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result: OrderDetailsApiResponse = await response.json();
      console.log('📋 Respuesta:', result);

      if (result.success && result.data) {
        setOrder(result.data);
        console.log('✅ Detalles cargados');
      } else {
        throw new Error(result.message || 'Error al cargar detalles');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

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
      pending: 'status-badge--pending',
      completed: 'status-badge--completed',
      cancelled: 'status-badge--cancelled',
      processing: 'status-badge--processing'
    };
    return classes[status.toLowerCase()] || '';
  };

  if (loading) {
    return (
      <div className="order-details-state">
        <p className="order-details-state__message order-details-state__message--loading">
          Cargando detalles...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-state">
        <p className="order-details-state__message order-details-state__message--error">
          Error: {error || 'No se encontró el pedido'}
        </p>
        <div className="order-details-state__actions">
          <button
            onClick={loadOrderDetails}
            className="order-details-state__btn order-details-state__btn--retry"
          >
            Reintentar
          </button>
          <button
            onClick={onBack}
            className="order-details-state__btn order-details-state__btn--back"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-layout">
      {/* Header */}
      <div className="order-details-header">
        <button
          onClick={onBack}
          className="order-details-header__back-btn"
        >
          Volver a pedidos
        </button>
        
        <div className="order-details-header__content">
          <div className="order-details-header__info">
            <h2>Pedido #{order.id_order}</h2>
            <p>📅 {formatDate(order.order_date)}</p>
          </div>
          <div className="order-details-header__summary">
            <span className={`order-details-header__status ${getStatusClass(order.status)}`}>
              {order.status}
            </span>
            <p className="order-details-header__total">
              {formatPrice(order.total_amount)}
            </p>
          </div>
        </div>
      </div>

      {/* Productos del pedido */}
      {order.details && order.details.length > 0 && (
        <div className="order-section-card">
          <h3 className="order-section-card__title">🛍️ Productos</h3>
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Cantidad</th>
                  <th style={{ textAlign: 'right' }}>Precio Unit.</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.details.map((detail) => (
                  <tr key={detail.id_detail_order}>
                    <td>
                      <span className="products-table__sku">{detail.product_sku}</span>
                    </td>
                    <td className="products-table__quantity">{detail.quantity}</td>
                    <td className="products-table__price">{formatPrice(detail.price)}</td>
                    <td className="products-table__subtotal">
                      {formatPrice((parseFloat(detail.price) * detail.quantity).toString())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Información de envío */}
      {order.shipping && (
        <div className="order-section-card">
          <h3 className="order-section-card__title">🚚 Envío</h3>
          <div className="shipping-grid">
            <div className="shipping-field">
              <span className="shipping-field__label">Dirección</span>
              <p className="shipping-field__value">{order.shipping.address}</p>
            </div>
            <div className="shipping-field">
              <span className="shipping-field__label">Ciudad</span>
              <p className="shipping-field__value">{order.shipping.city}</p>
            </div>
            <div className="shipping-field">
              <span className="shipping-field__label">Empresa de transporte</span>
              <p className="shipping-field__value">{order.shipping.transport_company}</p>
            </div>
            <div className="shipping-field">
              <span className="shipping-field__label">Estado</span>
              <span className={`shipping-field__status ${getStatusClass(order.shipping.status)}`}>
                {order.shipping.status}
              </span>
            </div>
            <div className="shipping-field">
              <span className="shipping-field__label">Fecha de envío</span>
              <p className="shipping-field__value">{formatDate(order.shipping.shipping_date)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pagos */}
      {order.payments && order.payments.length > 0 && (
        <div className="order-section-card">
          <h3 className="order-section-card__title">💳 Pagos</h3>
          <div className="payments-list">
            {order.payments.map((payment) => (
              <div key={payment.id_payment} className="payment-card">
                <div className="payment-card__content">
                  <div>
                    <p className="payment-card__method">{payment.payment_method}</p>
                    <p className="payment-card__date">{formatDate(payment.payment_date)}</p>
                  </div>
                  <div className="payment-card__summary">
                    <p className="payment-card__amount">{formatPrice(payment.amount)}</p>
                    <span className={`payment-card__status ${getStatusClass(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};