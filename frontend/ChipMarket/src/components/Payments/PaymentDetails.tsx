// src/components/Payments/PaymentDetails.tsx

import React from 'react';
import { CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Payment } from '../../types/payment.types';

interface PaymentDetailsProps {
  payments: Payment[];
  totalAmount: number;
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ payments, totalAmount }) => {
  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString('es-CL');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle size={16} style={{ color: '#059669' }} />;
      case 'Pending':
        return <Clock size={16} style={{ color: '#f59e0b' }} />;
      case 'Failed':
        return <XCircle size={16} style={{ color: '#dc2626' }} />;
      default:
        return <Clock size={16} style={{ color: '#64748b' }} />;
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'Completed': 'Completado',
      'Pending': 'Pendiente',
      'Failed': 'Fallido',
      'Refunded': 'Reembolsado'
    };
    return labels[status] || status;
  };

  const totalPaid = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const totalPending = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  // ✅ CORRECCIÓN: Por pagar = Total - Pagado (sin restar pendientes)
  const remainingToPay = Math.max(0, totalAmount - totalPaid);

  return (
    <div style={{
      background: 'white',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      padding: '1.25rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '2px solid #f1f5f9'
      }}>
        <CreditCard size={20} style={{ color: '#3b82f6' }} />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e3a8a' }}>
          Historial de Pagos
        </h3>
      </div>

      {payments.length === 0 ? (
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
          No hay pagos registrados para este pedido
        </p>
      ) : (
        <>
          {/* Lista de pagos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {payments.map((payment, index) => (
              <div
                key={payment.id_payment}
                style={{
                  padding: '0.875rem',
                  background: 
                    payment.status === 'Completed' ? '#f0fdf4' : 
                    payment.status === 'Pending' ? '#fef3c7' : 
                    '#fee2e2',
                  border: `1px solid ${
                    payment.status === 'Completed' ? '#86efac' : 
                    payment.status === 'Pending' ? '#fcd34d' : 
                    '#fca5a5'
                  }`,
                  borderRadius: '8px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }}>
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem'
                    }}>
                      {getStatusIcon(payment.status)}
                      <span style={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: '#1e293b'
                      }}>
                        Pago #{index + 1} {index === 0 && '(Inicial)'}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.8125rem',
                      color: '#64748b'
                    }}>
                      {formatDate(payment.payment_date)}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 
                      payment.status === 'Completed' ? '#059669' : 
                      payment.status === 'Pending' ? '#f59e0b' : 
                      '#dc2626'
                  }}>
                    ${formatCurrency(payment.amount)}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <span style={{
                    fontSize: '0.8125rem',
                    color: '#475569',
                    fontWeight: 500
                  }}>
                    💳 {payment.payment_method}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontWeight: 600,
                    background: 
                      payment.status === 'Completed' ? '#dcfce7' : 
                      payment.status === 'Pending' ? '#fef3c7' : 
                      '#fee2e2',
                    color: 
                      payment.status === 'Completed' ? '#166534' : 
                      payment.status === 'Pending' ? '#92400e' : 
                      '#991b1b'
                  }}>
                    {getStatusLabel(payment.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div style={{
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Total del pedido:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                ${formatCurrency(totalAmount)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>✅ Pagado:</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669' }}>
                ${formatCurrency(totalPaid)}
              </span>
            </div>
            {totalPending > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>⏳ Pendiente de confirmar:</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f59e0b' }}>
                  ${formatCurrency(totalPending)}
                </span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '0.75rem',
              marginTop: '0.75rem',
              borderTop: '2px solid #e2e8f0'
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e3a8a' }}>
                Por pagar:
              </span>
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: 700, 
                color: remainingToPay > 0 ? '#dc2626' : '#059669'
              }}>
                ${formatCurrency(remainingToPay)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};