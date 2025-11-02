// src/pages/Admin/Payments/CreatePaymentPage.tsx

import React, { useState, useEffect } from 'react';
import { DollarSign, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { OrderSelector } from '../../../components/common/OrderSelector';
import { PaymentDetails } from '../../../components/Payments/PaymentDetails';
import { useCreatePayment } from '../../../hooks/useCreatePayment';
import { PaymentService } from '../../../services/payment.service';
import { ToastNotification } from '../../../components/common/ToastNotification';
import type { Order } from '../../../types/order.types';
import type { Payment, PaymentMethod, PaymentStatus } from '../../../types/payment.types';
import '../../../styles/CreatePayment.css';

type OperationType = 'confirm' | 'replace' | 'additional';

export const CreatePaymentPage: React.FC = () => {
  // Estado del formulario
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [existingPayments, setExistingPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [operationType, setOperationType] = useState<OperationType>('confirm');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Completed');
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
  const paymentStatuses: PaymentStatus[] = ['Completed', 'Failed'];

  // Cargar pagos existentes cuando se selecciona un pedido
  useEffect(() => {
    const fetchPayments = async () => {
      if (!selectedOrder) {
        setExistingPayments([]);
        setLoadingPayments(false);
        return;
      }

      setLoadingPayments(true);
      setExistingPayments([]);
      
      try {
        const response = await PaymentService.getPaymentsByOrderId(selectedOrder.id_order);
        
        if (response.success && response.data) {
          setExistingPayments(response.data);
          
          // Determinar el tipo de operación por defecto
          const hasPendingPayments = response.data.some(p => p.status === 'Pending');
          const hasCompletedPayments = response.data.some(p => p.status === 'Completed');
          
          if (hasPendingPayments) {
            setOperationType('confirm');
          } else if (hasCompletedPayments) {
            setOperationType('additional');
          } else {
            setOperationType('confirm');
          }
        } else {
          setExistingPayments([]);
        }
      } catch (error) {
        console.error('Error al cargar pagos:', error);
        setExistingPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchPayments();
  }, [selectedOrder?.id_order]);

  // Calcular montos
  const orderTotalAmount = selectedOrder ? parseFloat(selectedOrder.total_amount.toString()) : 0;
  
  const totalPaid = existingPayments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  
  const remainingAmount = orderTotalAmount - totalPaid;
  const pendingPayment = existingPayments.find(p => p.status === 'Pending');

  // Autocompletar monto según el tipo de operación
  useEffect(() => {
    if (!selectedOrder) return;

    if (operationType === 'replace' && remainingAmount > 0) {
      setAmount(remainingAmount.toString());
    } else if (operationType === 'additional' && remainingAmount > 0) {
      setAmount(remainingAmount.toString());
    }
  }, [operationType, selectedOrder, remainingAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder) {
      alert('Debe seleccionar un pedido');
      return;
    }

    // CASO 1: Confirmar pago pendiente
    if (operationType === 'confirm') {
      if (!pendingPayment) {
        alert('No hay pagos pendientes para confirmar');
        return;
      }

      try {
        const response = await PaymentService.updatePayment(pendingPayment.id_payment, {
          status: paymentStatus
        });

        if (response.success) {
          setShowToast(true);
          setTimeout(() => {
            handleReset();
          }, 2000);
        } else {
          alert(response.message || 'Error al actualizar el pago');
        }
      } catch (error) {
        alert('Error de conexión con el servidor');
      }
      return;
    }

    // CASO 2: Reemplazar pago fallido
    if (operationType === 'replace') {
      if (!pendingPayment) {
        alert('No hay pagos pendientes para reemplazar');
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

      if (parseFloat(amount) > remainingAmount) {
        alert(`El monto no puede exceder $${remainingAmount.toLocaleString()}`);
        return;
      }

      try {
        // Primero marcar el pendiente como fallido
        await PaymentService.updatePayment(pendingPayment.id_payment, {
          status: 'Failed'
        });

        // Luego crear nuevo pago
        const paymentData = {
          orderId: selectedOrder.id_order,
          paymentMethod: paymentMethod as PaymentMethod,
          amount: parseFloat(amount),
          status: paymentStatus
        };

        const result = await createPayment(paymentData);

        if (result) {
          setShowToast(true);
          setTimeout(() => {
            handleReset();
          }, 2000);
        }
      } catch (error) {
        alert('Error al procesar el reemplazo del pago');
      }
      return;
    }

    // CASO 3: Pago adicional (parcial)
    if (operationType === 'additional') {
      if (!paymentMethod) {
        alert('Debe seleccionar un método de pago');
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        alert('Debe ingresar un monto válido');
        return;
      }

      if (parseFloat(amount) > remainingAmount) {
        alert(`El monto no puede exceder $${remainingAmount.toLocaleString()}`);
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
        setTimeout(() => {
          handleReset();
        }, 2000);
      }
    }
  };

  const handleReset = () => {
    setSelectedOrder(null);
    setExistingPayments([]);
    setOperationType('confirm');
    setPaymentMethod('');
    setAmount('');
    setPaymentStatus('Completed');
    reset();
  };

  const handleOrderSelect = (order: Order | null) => {
    setSelectedOrder(order);
    if (!order) {
      setAmount('');
    }
  };

  // Determinar si mostrar opciones de operación
  const showOperationTypeSelector = selectedOrder && pendingPayment && remainingAmount > 0;
  const showAdditionalOption = totalPaid > 0 && remainingAmount > 0;

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
                  filterByStatus="unpaid"
                />
              </div>

              {/* Información y historial de pagos */}
              {selectedOrder && (
                <>
                  {loadingPayments ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      Cargando información de pagos...
                    </div>
                  ) : (
                    <PaymentDetails 
                      payments={existingPayments}
                      totalAmount={parseFloat(selectedOrder.total_amount.toString())}
                    />
                  )}

                  {/* Pedido completamente pagado */}
                  {!pendingPayment && remainingAmount === 0 && (
                    <div className="create-payment-page__section">
                      <div style={{
                        padding: '1.5rem',
                        background: '#f0fdf4',
                        border: '2px solid #86efac',
                        borderRadius: '12px',
                        textAlign: 'center'
                      }}>
                        <CheckCircle size={48} style={{ color: '#059669', marginBottom: '1rem' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '1.125rem', fontWeight: 600 }}>
                          ¡Pedido Completamente Pagado!
                        </h3>
                        <p style={{ margin: 0, color: '#15803d', fontSize: '0.875rem' }}>
                          Este pedido ya ha sido pagado en su totalidad. No se pueden registrar más pagos.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Selector de tipo de operación */}
                  {showOperationTypeSelector && (
                    <div className="create-payment-page__section">
                      <div className="create-payment-page__section-header">
                        <h2 className="create-payment-page__section-title">
                          2. ¿Qué deseas hacer?
                        </h2>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '1rem',
                          background: operationType === 'confirm' ? '#eff6ff' : '#f8fafc',
                          border: `2px solid ${operationType === 'confirm' ? '#3b82f6' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}>
                          <input
                            type="radio"
                            name="operationType"
                            value="confirm"
                            checked={operationType === 'confirm'}
                            onChange={(e) => setOperationType(e.target.value as OperationType)}
                            style={{ width: '1.25rem', height: '1.25rem', accentColor: '#3b82f6' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
                              ✅ Confirmar pago pendiente
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                              El pago de ${parseFloat(pendingPayment.amount.toString()).toLocaleString()} se recibió correctamente
                            </div>
                          </div>
                        </label>

                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '1rem',
                          background: operationType === 'replace' ? '#eff6ff' : '#f8fafc',
                          border: `2px solid ${operationType === 'replace' ? '#3b82f6' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}>
                          <input
                            type="radio"
                            name="operationType"
                            value="replace"
                            checked={operationType === 'replace'}
                            onChange={(e) => setOperationType(e.target.value as OperationType)}
                            style={{ width: '1.25rem', height: '1.25rem', accentColor: '#3b82f6' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
                              ❌ Pago falló, usar otro método
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                              Marcar como fallido y registrar nuevo pago con otro método
                            </div>
                          </div>
                        </label>

                        {showAdditionalOption && (
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem',
                            background: operationType === 'additional' ? '#eff6ff' : '#f8fafc',
                            border: `2px solid ${operationType === 'additional' ? '#3b82f6' : '#e2e8f0'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}>
                            <input
                              type="radio"
                              name="operationType"
                              value="additional"
                              checked={operationType === 'additional'}
                              onChange={(e) => setOperationType(e.target.value as OperationType)}
                              style={{ width: '1.25rem', height: '1.25rem', accentColor: '#3b82f6' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
                                ➕ Agregar pago parcial adicional
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Cliente pagará los ${remainingAmount.toLocaleString()} restantes con otro método
                              </div>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sin pagos pendientes pero con deuda */}
                  {!pendingPayment && remainingAmount > 0 && (
                    <div className="create-payment-page__section">
                      <div className="create-payment-page__section-header">
                        <h2 className="create-payment-page__section-title">
                          2. Registrar Pago
                        </h2>
                      </div>
                      <div style={{
                        padding: '1rem',
                        background: '#fef3c7',
                        border: '1px solid #fcd34d',
                        borderRadius: '8px',
                        color: '#92400e',
                        fontSize: '0.875rem',
                        marginBottom: '1rem'
                      }}>
                        💡 <strong>Nota:</strong> Este pedido aún tiene ${remainingAmount.toLocaleString()} pendientes de pago.
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Confirmar pago pendiente */}
              {selectedOrder && operationType === 'confirm' && pendingPayment && remainingAmount > 0 && (
                <div className="create-payment-page__section">
                  <div className="create-payment-page__section-header">
                    <h2 className="create-payment-page__section-title">
                      3. Confirmar Estado del Pago
                    </h2>
                  </div>

                  <div className="create-payment-page__field">
                    <label className="create-payment-page__label">Nuevo estado del pago *</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      disabled={loading}
                      className="create-payment-page__select"
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status === 'Completed' ? '✅ Completado' : '❌ Fallido'}
                        </option>
                      ))}
                    </select>
                    <p style={{
                      margin: '0.5rem 0 0 0',
                      fontSize: '0.8125rem',
                      color: '#64748b'
                    }}>
                      Selecciona "Completado" si el pago se recibió correctamente
                    </p>
                  </div>
                </div>
              )}

              {/* Reemplazar o agregar pago */}
              {selectedOrder && remainingAmount > 0 && (operationType === 'replace' || (operationType === 'additional' && !pendingPayment)) && (
                <>
                  <div className="create-payment-page__section">
                    <div className="create-payment-page__section-header">
                      <h2 className="create-payment-page__section-title">
                        {operationType === 'replace' ? '3. Nuevo Método de Pago' : '3. Método de Pago'}
                      </h2>
                    </div>
                    <div className="create-payment-page__field">
                      <label className="create-payment-page__label">Método de pago *</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        disabled={loading}
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
                      <p style={{
                        margin: '0.5rem 0 0 0',
                        fontSize: '0.8125rem',
                        color: '#64748b'
                      }}>
                        {operationType === 'replace' 
                          ? 'Selecciona el nuevo método de pago que usará el cliente'
                          : 'Selecciona el método con el que se realizará este pago adicional'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="create-payment-page__section">
                    <div className="create-payment-page__section-header">
                      <h2 className="create-payment-page__section-title">
                        4. Detalles del Pago
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
                            disabled={loading}
                            min="0"
                            step="1"
                            max={remainingAmount}
                            className="create-payment-page__amount-input"
                            required
                          />
                        </div>
                        {amount && parseFloat(amount) > remainingAmount && (
                          <p className="create-payment-page__warning">
                            <AlertCircle size={14} />
                            El monto excede el saldo pendiente (${remainingAmount.toLocaleString()})
                          </p>
                        )}
                        <p style={{
                          margin: '0.5rem 0 0 0',
                          fontSize: '0.8125rem',
                          color: '#64748b'
                        }}>
                          Monto máximo: ${remainingAmount.toLocaleString()}
                        </p>
                      </div>

                      <div className="create-payment-page__field">
                        <label className="create-payment-page__label">Estado del pago</label>
                        <select
                          value={paymentStatus}
                          onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                          disabled={loading}
                          className="create-payment-page__select"
                        >
                          {paymentStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status === 'Completed' ? '✅ Completado' : '❌ Fallido'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Botones de acción */}
              {selectedOrder && remainingAmount > 0 && (
                <div className="create-payment-page__actions">
                  <button
                    type="submit"
                    disabled={
                      loading || 
                      !selectedOrder || 
                      (operationType !== 'confirm' && (!paymentMethod || !amount)) ||
                      (amount !== '' && parseFloat(amount) > remainingAmount)
                    }
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
                        {operationType === 'confirm' && 'Confirmar Pago'}
                        {operationType === 'replace' && 'Reemplazar Pago'}
                        {operationType === 'additional' && 'Registrar Pago Adicional'}
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
              )}

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
          message={`Pago ${operationType === 'confirm' ? 'confirmado' : 'registrado'} exitosamente`}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};