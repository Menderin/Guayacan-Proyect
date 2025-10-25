// src/components/orders/OrderCard.tsx
import React, { useState } from 'react';
import { Package, User, Calendar, ChevronDown, ChevronUp, CreditCard, Truck } from 'lucide-react';
import type { Order } from '../../types/order.types';
import '../../styles/OrderCard.css';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: string | number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(Number(amount));
  };

  const getStatusBadgeClass = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'order-card__badge--pending',
      processing: 'order-card__badge--processing',
      shipped: 'order-card__badge--shipped',
      delivered: 'order-card__badge--delivered',
      cancelled: 'order-card__badge--cancelled'
    };
    return statusMap[status] || 'order-card__badge--default';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const totalAmount = order.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return (
    <div className="order-card">
      {/* Header del pedido */}
      <div className="order-card__header">
        <div className="order-card__header-left">
          <div className="order-card__title-row">
            <Package className="order-card__package-icon" />
            <h3 className="order-card__title">Pedido #{order.id_order}</h3>
            <span className={`order-card__badge ${getStatusBadgeClass(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <div className="order-card__date">
            <Calendar className="order-card__date-icon" />
            <span>{formatDate(order.order_date)}</span>
          </div>
        </div>
        <div className="order-card__header-right">
          <div className="order-card__total-label">Total</div>
          <div className="order-card__total-amount">{formatCurrency(totalAmount)}</div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="order-card__content">
        {/* Usuario */}
        {order.user && (
          <div className="order-card__user">
            <div className="order-card__user-avatar">
              <User className="order-card__user-icon" />
            </div>
            <div className="order-card__user-info">
              <div className="order-card__user-name">{order.user.name}</div>
              <div className="order-card__user-email">{order.user.email}</div>
            </div>
            <div className="order-card__user-id">ID: {order.user.id}</div>
          </div>
        )}

        {/* Resumen rápido */}
        <div className="order-card__summary">
          <div className="order-card__summary-item">
            <Package className="order-card__summary-icon" />
            <span>{order.details?.length || 0} producto(s)</span>
          </div>
          {order.shipping && (
            <div className="order-card__summary-item">
              <Truck className="order-card__summary-icon" />
              <span>{order.shipping.city}</span>
            </div>
          )}
        </div>

        {/* Botón expandir */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="order-card__expand-button"
        >
          {expanded ? (
            <>
              <ChevronUp className="order-card__expand-icon" />
              Ocultar detalles
            </>
          ) : (
            <>
              <ChevronDown className="order-card__expand-icon" />
              Ver detalles completos
            </>
          )}
        </button>
      </div>

      {/* Detalles expandidos */}
      {expanded && (
        <div className="order-card__details">
          {/* Productos */}
          {order.details && order.details.length > 0 && (
            <div className="order-card__section">
              <h4 className="order-card__section-title">
                <Package className="order-card__section-icon" />
                Productos del pedido
              </h4>
              <div className="order-card__products">
                {order.details.map((detail) => (
                  <div key={detail.id_detail_order} className="order-card__product">
                    <div className="order-card__product-info">
                      <div className="order-card__product-sku">{detail.product_sku}</div>
                      <div className="order-card__product-quantity">
                        Cantidad: {detail.quantity}
                      </div>
                    </div>
                    <div className="order-card__product-price">
                      <div className="order-card__product-amount">
                        {formatCurrency(detail.price)}
                      </div>
                      <div className="order-card__product-unit">por unidad</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información de envío */}
          {order.shipping && (
            <div className="order-card__section">
              <h4 className="order-card__section-title">
                <Truck className="order-card__section-icon" />
                Información de envío
              </h4>
              <div className="order-card__shipping">
                <div className="order-card__shipping-row">
                  <span className="order-card__shipping-label">Dirección:</span>
                  <span className="order-card__shipping-value">{order.shipping.address}</span>
                </div>
                <div className="order-card__shipping-row">
                  <span className="order-card__shipping-label">Ciudad:</span>
                  <span className="order-card__shipping-value">{order.shipping.city}</span>
                </div>
                {order.shipping.transport_company && (
                  <div className="order-card__shipping-row">
                    <span className="order-card__shipping-label">Empresa de transporte:</span>
                    <span className="order-card__shipping-value">
                      {order.shipping.transport_company}
                    </span>
                  </div>
                )}
                <div className="order-card__shipping-row">
                  <span className="order-card__shipping-label">Estado de envío:</span>
                  <span className={`order-card__badge ${getStatusBadgeClass(order.shipping.status)}`}>
                    {getStatusLabel(order.shipping.status)}
                  </span>
                </div>
                {order.shipping.shipping_date && (
                  <div className="order-card__shipping-row">
                    <span className="order-card__shipping-label">Fecha de envío:</span>
                    <span className="order-card__shipping-value">
                      {formatDate(order.shipping.shipping_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información de pago */}
          {order.payments && order.payments.length > 0 && (
            <div className="order-card__section">
              <h4 className="order-card__section-title">
                <CreditCard className="order-card__section-icon" />
                Información de pago
              </h4>
              <div className="order-card__payments">
                {order.payments.map((payment) => (
                  <div key={payment.id_payment} className="order-card__payment">
                    <div className="order-card__payment-header">
                      <span className="order-card__payment-amount">
                        {formatCurrency(payment.amount)}
                      </span>
                      <span className={`order-card__badge ${getStatusBadgeClass(payment.status)}`}>
                        {getStatusLabel(payment.status)}
                      </span>
                    </div>
                    <div className="order-card__payment-details">
                      <span>Método: {payment.payment_method}</span>
                      <span>{formatDate(payment.payment_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};