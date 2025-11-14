// src/components/Payments/UserPaymentsGrid.tsx

import React, { useState } from 'react';
import { Loader2, CreditCard, Package, Calendar, DollarSign, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';
import type { Payment } from '../../hooks/useUserPayments';
import '../../styles/PaymentsCards.css';

interface UserPaymentsGridProps {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  userName?: string;
}

export const UserPaymentsGrid: React.FC<UserPaymentsGridProps> = ({
  payments,
  loading,
  error,
  userName
}) => {
  const [expandedPaymentId, setExpandedPaymentId] = useState<number | null>(null);

  const getStatusClass = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'completed' || normalized === 'completado') return 'completed';
    if (normalized === 'pending' || normalized === 'pendiente') return 'pending';
    if (normalized === 'failed' || normalized === 'fallido') return 'failed';
    return 'completed';
  };

  const getStatusIcon = (status: string) => {
    const statusClass = getStatusClass(status);
    switch (statusClass) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'failed':
        return <XCircle className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const toggleExpand = (paymentId: number) => {
    setExpandedPaymentId(expandedPaymentId === paymentId ? null : paymentId);
  };

  return (
    <div className="w-full">
      {/* Header */}
      {userName && (
        <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Historial de Pagos
          </h2>
          <p className="text-gray-600">
            Usuario: <span className="font-semibold">{userName}</span>
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold">Error al cargar los pagos</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Payments List */}
      {!loading && !error && payments.length > 0 && (
        <div className="space-y-4">
          {payments.map((payment) => {
            const statusClass = getStatusClass(payment.status);
            const isExpanded = expandedPaymentId === payment.id_payment;
            
            return (
              <div
                key={payment.id_payment}
                className={`payment-card payment-card--${statusClass}`}
              >
                <div className="payment-card__content">
                  {/* Header */}
                  <div className="payment-card__header">
                    <div className="payment-card__header-left">
                      <div className={`payment-card__status-icon payment-card__status-icon--${statusClass}`}>
                        {getStatusIcon(payment.status)}
                      </div>
                      <div>
                        <h3 className="payment-card__title">
                          Pago #{payment.id_payment}
                        </h3>
                        <p className="payment-card__subtitle">
                          Orden #{payment.order_id}
                        </p>
                      </div>
                    </div>
                    <div className="payment-card__header-right">
                      <p className="payment-card__amount">
                        {formatCurrency(payment.amount)}
                      </p>
                      <span className={`payment-card__badge payment-card__badge--${statusClass}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>

                  {/* Payment Info Grid */}
                  <div className="payment-card__info-grid">
                    <div className="payment-card__info-item">
                      <Calendar className="payment-card__info-icon" />
                      <span className="payment-card__info-value">
                        {formatDate(payment.payment_date)}
                      </span>
                    </div>
                    <div className="payment-card__info-item">
                      <CreditCard className="payment-card__info-icon" />
                      <span className="payment-card__info-value">
                        {payment.payment_method}
                      </span>
                    </div>
                    {payment.transaction_id && (
                      <div className="payment-card__info-item">
                        <DollarSign className="payment-card__info-icon" />
                        <span className="payment-card__transaction-id">
                          {payment.transaction_id}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Toggle Button */}
                  {payment.products && payment.products.length > 0 && (
                    <button
                      onClick={() => toggleExpand(payment.id_payment)}
                      className={`payment-card__toggle ${isExpanded ? 'payment-card__toggle--expanded' : ''}`}
                    >
                      <Package className="w-4 h-4" />
                      {isExpanded ? 'Ocultar' : 'Ver'} productos ({payment.products.length})
                      <ChevronDown className="payment-card__toggle-icon" />
                    </button>
                  )}
                </div>

                {/* Expandable Products Section */}
                {isExpanded && payment.products && (
                  <div className="payment-card__expandable">
                    <h4 className="payment-card__expandable-header">
                      <Package className="payment-card__expandable-icon" />
                      Productos ({payment.products.length})
                    </h4>
                    <div className="payment-card__expandable-content">
                      {payment.products.map((product, index) => (
                        <div key={`${product.sku}-${index}`} className="payment-card__product">
                          <div className="payment-card__product-left">
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="payment-card__product-image"
                              />
                            )}
                            <div className="payment-card__product-info">
                              <p className="payment-card__product-name">{product.name}</p>
                              <p className="payment-card__product-sku">SKU: {product.sku}</p>
                            </div>
                          </div>
                          <div className="payment-card__product-right">
                            <p className="payment-card__product-subtotal">
                              {formatCurrency(product.subtotal)}
                            </p>
                            <p className="payment-card__product-breakdown">
                              {product.quantity} × {formatCurrency(product.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && payments.length === 0 && (
        <div className="payment-empty-state">
          <CreditCard className="payment-empty-state__icon" />
          <h3 className="payment-empty-state__title">
            No hay pagos registrados
          </h3>
          <p className="payment-empty-state__description">
            Este usuario aún no ha realizado ningún pago
          </p>
        </div>
      )}
    </div>
  );
};