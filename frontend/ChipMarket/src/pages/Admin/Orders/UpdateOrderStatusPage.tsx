import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
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

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled' | 'All';

const ORDER_STATUSES: OrderStatus[] = ['All', 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

const AVAILABLE_STATUSES = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

export const UpdateOrderStatusPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('All');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authenticatedFetch('/api/orders/all');
      const data = await response.json();
      const allOrders = data.data || [];
      setOrders(allOrders);
      applyFilter(allOrders, statusFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (ordersList: Order[], filter: OrderStatus) => {
    if (filter === 'All') {
      setFilteredOrders(ordersList);
    } else {
      setFilteredOrders(ordersList.filter(order => order.status === filter));
    }
  };

  const handleStatusFilterChange = (newFilter: OrderStatus) => {
    setStatusFilter(newFilter);
    applyFilter(orders, newFilter);
  };

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setSaveError('');
    setSaveSuccess(false);
  };
  
  const closeEditModal = () => {
    setSelectedOrder(null);
    setSaveError('');
    setSaveSuccess(false);
  };

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

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const response = await authenticatedFetch(`/api/orders/${selectedOrder.id_order}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedOrder.status })
      });
      const result = await response.json();
      
      if (!result.success) {
        setSaveError(result.message || 'Error al guardar los cambios');
      } else {
        setOrders(prev => prev.map(o => 
          o.id_order === selectedOrder.id_order ? selectedOrder : o
        ));
        applyFilter(
          orders.map(o => o.id_order === selectedOrder.id_order ? selectedOrder : o),
          statusFilter
        );
        setSaveSuccess(true);
        setTimeout(() => {
          closeEditModal();
        }, 1500);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error de conexión con el servidor');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { 
    fetchOrders(); 
  }, []);

  const getStatusBadgeClass = (status: string): string => {
    const statusMap: Record<string, string> = {
      'Pending': 'status-pending',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  };

  return (
    <div className="update-order-status-container">
      <div className="header">
        <div>
          <h2>Gestión de Pedidos</h2>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            Administra y actualiza el estado de todos los pedidos del sistema
          </p>
        </div>
        <button className="reload-btn" onClick={fetchOrders} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} /> 
          Recargar
        </button>
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <Filter size={18} />
          <span>Filtrar por estado:</span>
        </div>
        <div className="status-filters">
          {ORDER_STATUSES.map(status => (
            <button
              key={status}
              className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange(status)}
            >
              {status}
              {status !== 'All' && (
                <span className="filter-count">
                  {orders.filter(o => o.status === status).length}
                </span>
              )}
              {status === 'All' && (
                <span className="filter-count">{orders.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error-alert">{error}</p>}
      
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando pedidos...</p>
        </div>
      )}

      {!loading && filteredOrders.length === 0 && !error && (
        <div className="empty-state">
          <p>No hay pedidos {statusFilter !== 'All' ? `con estado "${statusFilter}"` : 'disponibles'}</p>
        </div>
      )}

      {!loading && filteredOrders.length > 0 && (
        <div className="table-container">
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
              {filteredOrders.map(order => (
                <tr key={order.id_order}>
                  <td className="order-id">#{order.id_order}</td>
                  <td className="customer-info">
                    <div className="customer-name">{order.user.name}</div>
                    <div className="customer-email">{order.user.email}</div>
                  </td>
                  <td>{new Date(order.order_date).toLocaleDateString('es-ES')}</td>
                  <td className="products-count">{order.details.length} items</td>
                  <td className="order-total">${order.total_amount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="edit-btn"
                      onClick={() => openEditModal(order)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="order-details-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Pedido #{selectedOrder.id_order}</h3>
              <button className="close-btn" onClick={closeEditModal}>✕</button>
            </div>

            <div className="modal-body">
              {saveError && (
                <div className="modal-error-message">
                  <span>⚠️</span>
                  <span>{saveError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="modal-success-message">
                  <span>✓</span>
                  <span>Estado actualizado exitosamente</span>
                </div>
              )}

              <div className="order-info-summary">
                <div className="info-item">
                  <span className="info-label">Cliente:</span>
                  <span className="info-value">{selectedOrder.user.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedOrder.user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total:</span>
                  <span className="info-value">${selectedOrder.total_amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="order-details-field">
                <label className="field-label">Estado del pedido *</label>
                <select 
                  value={selectedOrder.status} 
                  onChange={e => handleStatusChange(e.target.value)}
                  className="field-select"
                >
                  {AVAILABLE_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {selectedOrder.shipping && (
                <>
                  <div className="order-details-field">
                    <label className="field-label">Dirección de envío</label>
                    <input 
                      type="text"
                      value={selectedOrder.shipping.address || ''} 
                      onChange={e => handleFieldChange('address', e.target.value)}
                      className="field-input"
                      placeholder="Dirección completa"
                    />
                  </div>

                  <div className="order-details-field">
                    <label className="field-label">Ciudad</label>
                    <input 
                      type="text"
                      value={selectedOrder.shipping.city || ''} 
                      onChange={e => handleFieldChange('city', e.target.value)}
                      className="field-input"
                      placeholder="Ciudad"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="order-details-actions">
              <button 
                className="btn-cancel" 
                onClick={closeEditModal}
              >
                Cancelar
              </button>
              <button 
                className="btn-save" 
                onClick={saveOrder}
                disabled={saving || saveSuccess}
              >
                {saving ? (
                  <>
                    <span className="btn-spinner"></span>
                    Guardando...
                  </>
                ) : saveSuccess ? (
                  <>
                    <span>✓</span>
                    Guardado
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};