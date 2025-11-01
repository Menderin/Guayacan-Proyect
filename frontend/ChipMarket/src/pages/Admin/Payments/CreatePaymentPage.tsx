// src/pages/Admin/Payments/CreatePaymentPage.tsx

import React, { useState, useEffect } from 'react';
import { DollarSign, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { OrderSelector } from '../../../components/common/OrderSelector';
import { useCreatePayment } from '../../../hooks/useCreatePayment';
import { ToastNotification } from '../../../components/common/ToastNotification';
import type { Order } from '../../../types/order.types';
import type { PaymentMethod, PaymentStatus } from '../../../types/payment.types';
import '../../../styles/CreatePayment.css';

export const CreatePaymentPage: React.FC = () => {
  // Estado del formulario
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
  const [showToast, setShowToast] = useState(false);

  // Hook personalizado
  const { loading, error, success, createdPaymentId, orderInfo, createPayment, reset } = useCreatePayment();

  // Métodos de pago disponibles
  const paymentMethods: PaymentMethod[] = [
    'Tarjeta de crédito',
    'Tarjeta de débito',
    'Transferencia bancaria',
    'Efectivo',
    'PayPal',
    'MercadoPago',
    'Webpay'
  ];

  // Estados de pago
  const paymentStatuses: PaymentStatus[] = ['Pending', 'Completed', 'Failed'];

  // Calcular monto pendiente del pedido
  const orderTotalAmount = selectedOrder ? parseFloat(selectedOrder.total_amount.toString()) : 0;
  const remainingAmount = orderInfo ? orderInfo.remainingAmount : orderTotalAmount;

  // Autocompletar el monto con el total del pedido
  useEffect(() => {
    if (selectedOrder && !amount) {
      setAmount(selectedOrder.total_amount.toString());
    }
  }, [selectedOrder, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder) {
      alert('Debe seleccionar un pedido');
      return;
    }

    if (!paymentMethod) {
      alert('Debe seleccionar un método de pago');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Debe ingresar un monto válido');
      return;
    }

    const paymentData = {
      orderId: selectedOrder.id_order,
      paymentMethod: paymentMethod as PaymentMethod,
      amount: parseFloat(amount),
      status: paymentStatus
    };

    const result = await createPayment(paymentData);

    if (result) {
      setShowToast(true);
      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        handleReset();
      }, 2000);
    }
  };

  const handleReset = () => {
    setSelectedOrder(null);
    setPaymentMethod('');
    setAmount('');
    setPaymentStatus('Pending');
    reset();
  };

  const handleOrderSelect = (order: Order | null) => {
    setSelectedOrder(order);
    if (order) {
      setAmount(order.total_amount.toString());
    } else {
      setAmount('');
    }
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('es-CL');
  };

  return (
    <div className="create-payment-page">
      <div className="create-payment-page__container">
        {/* Header */}
        <div className="create-payment-page__header">
          <div className="create-payment-page__header-content">
            <DollarSign className="create-payment-page__header-icon" />
            <div>
              <h1 className="create-payment-page__title">Registrar Nuevo Pago</h1>
              <p className="create-payment-page__subtitle">
                Registre pagos recibidos asociados a pedidos pendientes
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="create-payment-page__form">
          <div className="create-payment-page__layout">
            {/* Formulario principal */}
            <div className="create-payment-page__main">
              
              {/* Sección Pedido */}
              <div className="create-payment-page__section">
                <div className="create-payment-page__section-header">
                  <h2 className="create-payment-page__section-title">
                    1. Seleccionar Pedido
                  </h2>
                </div>
                <OrderSelector
                  selectedOrder={selectedOrder}
                  onOrderSelect={handleOrderSelect}
                  disabled={loading}
                  filterByStatus="Pending"
                />
              </div>

              {/* Información del pedido seleccionado */}
              {selectedOrder && (
                <div className="create-payment-page__order-info">
                  <div className="create-payment-page__info-card">
                    <div className="create-payment-page__info-row">
                      <span className="create-payment-page__info-label">Total del pedido:</span>
                      <span className="create-payment-page__info-value">
                        ${formatCurrency(orderTotalAmount)}
                      </span>
                    </div>
                    <div className="create-payment-page__info-row">
                      <span className="create-payment-page__info-label">Estado:</span>
                      <span className={`create-payment-page__status create-payment-page__status--${selectedOrder.status.toLowerCase()}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    {orderInfo && (
                      <>
                        <div className="create-payment-page__info-row">
                          <span className="create-payment-page__info-label">Monto pagado:</span>
                          <span className="create-payment-page__info-value create-payment-page__info-value--paid">
                            ${formatCurrency(orderInfo.paidAmount)}
                          </span>
                        </div>
                        <div className="create-payment-page__info-row">
                          <span className="create-payment-page__info-label">Monto pendiente:</span>
                          <span className="create-payment-page__info-value create-payment-page__info-value--pending">
                            ${formatCurrency(orderInfo.remainingAmount)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Sección Método de Pago */}
              <div className="create-payment-page__section">
                <div className="create-payment-page__section-header">
                  <h2 className="create-payment-page__section-title">
                    2. Método de Pago
                  </h2>
                </div>
                <div className="create-payment-page__field">
                  <label className="create-payment-page__label">Método de pago *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    disabled={loading || !selectedOrder}
                    className="create-payment-page__select"
                    required
                  >
                    <option value="">Seleccionar método...</option>
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sección Monto y Estado */}
              <div className="create-payment-page__section">
                <div className="create-payment-page__section-header">
                  <h2 className="create-payment-page__section-title">
                    3. Detalles del Pago
                  </h2>
                </div>

                <div className="create-payment-page__fields-row">
                  <div className="create-payment-page__field">
                    <label className="create-payment-page__label">Monto *</label>
                    <div className="create-payment-page__amount-input-wrapper">
                      <span className="create-payment-page__currency">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        disabled={loading || !selectedOrder}
                        min="0"
                        step="1"
                        className="create-payment-page__amount-input"
                        required
                      />
                    </div>
                    {amount && parseFloat(amount) > orderTotalAmount && (
                      <p className="create-payment-page__warning">
                        <AlertCircle size={14} />
                        El monto excede el total del pedido
                      </p>
                    )}
                  </div>

                  <div className="create-payment-page__field">
                    <label className="create-payment-page__label">Estado del pago</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      disabled={loading || !selectedOrder}
                      className="create-payment-page__select"
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="create-payment-page__actions">
                <button
                  type="submit"
                  disabled={loading || !selectedOrder || !paymentMethod || !amount}
                  className="create-payment-page__btn create-payment-page__btn--primary"
                >
                  {loading ? (
                    <>
                      <div className="create-payment-page__spinner"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Registrar Pago
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="create-payment-page__btn create-payment-page__btn--secondary"
                >
                  <X size={18} />
                  Cancelar
                </button>
              </div>

              {/* Mensajes */}
              {error && (
                <div className="create-payment-page__error">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              {success && createdPaymentId && (
                <div className="create-payment-page__success">
                  <CheckCircle size={20} />
                  <div>
                    <p className="create-payment-page__success-title">
                      ¡Pago registrado exitosamente!
                    </p>
                    <p className="create-payment-page__success-text">
                      ID del pago: #{createdPaymentId}
                    </p>
                    {orderInfo && (
                      <p className="create-payment-page__success-text">
                        Estado del pedido: <strong>{orderInfo.status}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {showToast && success && (
        <ToastNotification
          message={`Pago #${createdPaymentId} registrado exitosamente`}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};