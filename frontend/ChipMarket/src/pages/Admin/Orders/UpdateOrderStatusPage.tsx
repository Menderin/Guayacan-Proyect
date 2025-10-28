import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { authenticatedFetch } from '../../../utils/api.helper';
import '../../../styles/UpdateOrderStatusPage.css';

interface Product {
  sku: string;
  name: string;
  quantity: number;
  price: number;
}

interface Shipping {
  address: string;
  city: string;
  transport_company: string;
  status: string;
}

interface Payment {
  id_payment: number;
  amount: number;
  payment_method: string;
  status: string;
}

interface Order {
  id_order: number;
  user: { id: number; name: string; email: string };
  order_date: string;
  status: string;
  total_amount: number;
  details: Product[];
  shipping?: Shipping;
  payments?: Payment[];
}

export const UpdateOrderStatusPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedFetch('/api/orders/status/Pending');
      const data = await response.json();
      setOrders(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (order: Order) => setSelectedOrder(order);
  const closeEditModal = () => setSelectedOrder(null);

  const handleStatusChange = (newStatus: string) => {
    if (!selectedOrder) return;
    setSelectedOrder({ ...selectedOrder, status: newStatus });
  };

  const handleFieldChange = (field: keyof Shipping, value: any) => {
    if (!selectedOrder) return;
    if (selectedOrder.shipping) {
      setSelectedOrder({ ...selectedOrder, shipping: { ...selectedOrder.shipping, [field]: value } });
    }
  };

  const saveOrder = async () => {
    if (!selectedOrder) return;

    console.log('Status que se va a enviar:', selectedOrder.status);

    try {
      const response = await authenticatedFetch(`/api/orders/${selectedOrder.id_order}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedOrder.status })
      });
      const result = await response.json();
      if (!result.success) alert(result.message || 'Error al guardar');
      else {
        setOrders(prev => prev.map(o => o.id_order === selectedOrder.id_order ? selectedOrder : o));
        closeEditModal();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className="update-order-status-container">
      <div className="header">
        <h2>Pedidos Actuales</h2>
        <button className="reload-btn" onClick={fetchOrders}>
          <RefreshCw size={16} /> Recargar
        </button>
      </div>

      {error && <p className="error-alert">{error}</p>}
      {loading && <p>Cargando pedidos...</p>}

      {!loading && orders.length > 0 && (
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id_order}>
                <td>#{order.id_order}</td>
                <td>{order.user.name}<br/>{order.user.email}</td>
                <td>{new Date(order.order_date).toLocaleDateString('es-ES')}</td>
                <td>{order.details.length} items</td>
                <td>${order.total_amount.toFixed(2)}</td>
                <td>{order.status}</td>
                <td>
                  <button onClick={() => openEditModal(order)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedOrder && (
        <div className="order-details-card">
          <h3>Editar Pedido #{selectedOrder.id_order}</h3>
          <div className="order-details-field">
            <span>Estado:</span>
            <select value={selectedOrder.status} onChange={e => handleStatusChange(e.target.value)}>
              <option value="Pending">Pendiente</option>
              <option value="Completed">Completado</option>
            </select>
          </div>
          <div className="order-details-field">
            <span>Dirección:</span>
            <input value={selectedOrder.shipping?.address || ''} onChange={e => handleFieldChange('address', e.target.value)} />
          </div>
          <div className="order-details-field">
            <span>Ciudad:</span>
            <input value={selectedOrder.shipping?.city || ''} onChange={e => handleFieldChange('city', e.target.value)} />
          </div>
          <div className="order-details-actions">
            <button onClick={closeEditModal}>Cancelar</button>
            <button className="save-btn" onClick={saveOrder}>Guardar Cambios</button>
          </div>
        </div>
      )}
    </div>
  );
};
