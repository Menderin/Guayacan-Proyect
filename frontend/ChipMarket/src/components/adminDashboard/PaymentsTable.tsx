// frontend/src/components/adminDashboard/PaymentsTable.tsx

import React from 'react';
import type { Payment } from '../../types/payment.types';
import '../../styles/PaymentsTable.css'; // Crearemos este archivo ahora

interface PaymentsTableProps {
  payments: Payment[];
  loading: boolean;
}

// --- Funciones de Ayuda ---

/** Formatea un número a peso chileno (CLP) */
const formatCurrency = (amount: number | string) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(numericAmount);
};

/** Formatea una fecha a un string legible */
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Devuelve una clase CSS según el estado del pago */
const getStatusClass = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'status-badge--pending';
    case 'Completed':
      return 'status-badge--completed';
    case 'Failed':
      return 'status-badge--failed';
    default:
      return 'status-badge--default';
  }
};

// --- Componente Principal ---

export const PaymentsTable: React.FC<PaymentsTableProps> = ({ payments, loading }) => {
  
  // Contenido del cuerpo de la tabla
  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className="table-state-cell">Cargando pagos...</td>
        </tr>
      );
    }

    if (payments.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="table-state-cell">No se encontraron pagos.</td>
        </tr>
      );
    }

    return payments.map((payment) => (
      <tr key={payment.id_payment}>
        <td>{payment.id_payment}</td>
        <td>{payment.order_id}</td>
        <td>{payment.payment_method}</td>
        <td className="table-cell--right">{formatCurrency(payment.amount)}</td>
        <td>{formatDate(payment.payment_date)}</td>
        <td>
          <span className={`status-badge ${getStatusClass(payment.status)}`}>
            {payment.status}
          </span>
        </td>
      </tr>
    ));
  };

  return (
    <div className="reports-table-wrapper">
      <table className="reports-table">
        <thead>
          <tr>
            <th>ID Pago</th>
            <th>ID Pedido</th>
            <th>Método</th>
            <th className="table-cell--right">Monto</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>
    </div>
  );
};