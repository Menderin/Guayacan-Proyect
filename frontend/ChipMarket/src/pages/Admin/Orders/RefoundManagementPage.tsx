import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertCircle, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import '../../../styles/RefoundManagementPage.css';

// Tipos
interface Product {
  sku: string;
  name: string;
  category: string;
  stock: number;
  images?: string[];
}

interface OrderDetail {
  id_detail_order: number;
  product_sku: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: Product | null;
}

interface Order {
  id_order: number;
  user_id: number;
  order_date: string;
  status: string;
  total_amount: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  details: OrderDetail[];
  payments?: Array<{
    id_payment: number;
    amount: number;
    payment_method: string;
    status: string;
  }>;
}

const API_URL = 'http://localhost:3000/api';

export const RefundManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [refundReason, setRefundReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState<any>(null);

  // Cargar pedidos al montar
  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Filtrar pedidos por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => 
        order.id_order.toString().includes(searchTerm) ||
        order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.details.some(d => 
          d.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.product_sku.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_URL}/orders/`;
      if (statusFilter === 'all') {
        url += 'all';
      } else {
        url += `status/${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al cargar pedidos');

      const data = await response.json();
      const ordersData = data.data || data;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setFilteredOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const openRefundModal = (order: Order) => {
    setSelectedOrder(order);
    setShowRefundModal(true);
    setRefundType('full');
    setSelectedProducts([]);
    setRefundReason('');
    setRefundSuccess(null);
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setSelectedOrder(null);
    setRefundType('full');
    setSelectedProducts([]);
    setRefundReason('');
    setRefundSuccess(null);
  };

  const toggleProductSelection = (sku: string) => {
    setSelectedProducts(prev => 
      prev.includes(sku) 
        ? prev.filter(s => s !== sku)
        : [...prev, sku]
    );
  };

  const processRefund = async () => {
    if (!selectedOrder) return;
    if (!refundReason.trim()) {
      alert('Debe proporcionar una razón para el reembolso');
      return;
    }

    if (refundType === 'partial' && selectedProducts.length === 0) {
      alert('Debe seleccionar al menos un producto para reembolso parcial');
      return;
    }

    setProcessingRefund(true);
    setError('');

    try {
      const endpoint = refundType === 'full' 
        ? `${API_URL}/orders/${selectedOrder.id_order}/refund`
        : `${API_URL}/orders/${selectedOrder.id_order}/partial-refund`;

      const body = refundType === 'full'
        ? { reason: refundReason }
        : { productSkus: selectedProducts, reason: refundReason };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar reembolso');
      }

      const result = await response.json();
      setRefundSuccess(result.data);
      
      // Actualizar lista de pedidos
      setTimeout(() => {
        fetchOrders();
        closeRefundModal();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setProcessingRefund(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      Pending: 'status-badge status-pending',
      Completed: 'status-badge status-completed',
      Cancelled: 'status-badge status-cancelled',
      Processing: 'status-badge status-processing'
    };
    return classes[status] || 'status-badge status-default';
  };

  const canRefund = (order: Order) => {
    return order.status !== 'Cancelled' && order.status !== 'Refunded';
  };

  const calculatePartialRefundTotal = () => {
    if (!selectedOrder) return 0;
    return selectedOrder.details
      .filter(d => selectedProducts.includes(d.product_sku))
      .reduce((sum, d) => sum + d.subtotal, 0);
  };

  return (
    <div className="refund-management-page">
      
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Gestión de Reembolsos</h1>
        <p className="page-subtitle">Administra y procesa reembolsos de pedidos</p>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="filters-container">
        <div className="filters-wrapper">
          
          {/* Búsqueda */}
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por ID, cliente, producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filtro de Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">Todos los estados</option>
            <option value="Pending">Pendiente</option>
            <option value="Completed">Completado</option>
            <option value="Cancelled">Cancelado</option>
            <option value="Processing">Procesando</option>
          </select>

          {/* Botón Recargar */}
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="refresh-button"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <p>Cargando pedidos...</p>
        </div>
      )}

      {/* Tabla de Pedidos */}
      {!loading && (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th className="text-center">Productos</th>
                <th className="text-right">Total</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No hay pedidos para mostrar
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id_order}>
                    <td className="order-id">#{order.id_order}</td>
                    <td>
                      <div className="customer-name">{order.user.name}</div>
                      <div className="customer-email">{order.user.email}</div>
                    </td>
                    <td className="order-date">
                      {new Date(order.order_date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="text-center products-count">
                      {order.details.length} items
                    </td>
                    <td className="text-right order-total">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="text-center">
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-center">
                      {canRefund(order) ? (
                        <button
                          onClick={() => openRefundModal(order)}
                          className="refund-button"
                        >
                          Reembolsar
                        </button>
                      ) : (
                        <span className="not-available">No disponible</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Reembolso */}
      {showRefundModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-container">
            
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  Procesar Reembolso - Pedido #{selectedOrder.id_order}
                </h2>
                <p className="modal-subtitle">
                  Cliente: {selectedOrder.user.name} ({selectedOrder.user.email})
                </p>
              </div>
              <button onClick={closeRefundModal} className="modal-close">
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              
              {/* Success Message */}
              {refundSuccess && (
                <div className="success-alert">
                  <CheckCircle size={20} />
                  <div>
                    <p className="success-title">¡Reembolso procesado exitosamente!</p>
                    <p className="success-detail">
                      Monto reembolsado: ${refundSuccess.refundedAmount.toFixed(2)}
                    </p>
                    <p className="success-detail">
                      Productos reabastecidos: {refundSuccess.productsRestocked.length}
                    </p>
                  </div>
                </div>
              )}

              {/* Tipo de Reembolso */}
              <div className="form-group">
                <label className="form-label">Tipo de Reembolso</label>
                <div className="refund-type-buttons">
                  <button
                    onClick={() => setRefundType('full')}
                    className={`refund-type-button ${refundType === 'full' ? 'active' : ''}`}
                  >
                    <div className="refund-type-title">💰 Reembolso Completo</div>
                    <div className="refund-type-subtitle">
                      Todos los productos - ${selectedOrder.total_amount.toFixed(2)}
                    </div>
                  </button>
                  <button
                    onClick={() => setRefundType('partial')}
                    className={`refund-type-button ${refundType === 'partial' ? 'active' : ''}`}
                  >
                    <div className="refund-type-title">📦 Reembolso Parcial</div>
                    <div className="refund-type-subtitle">Productos específicos</div>
                  </button>
                </div>
              </div>

              {/* Lista de Productos */}
              {refundType === 'partial' && (
                <div className="form-group">
                  <label className="form-label">Seleccione productos a reembolsar</label>
                  <div className="products-list">
                    {selectedOrder.details.map((detail) => (
                      <label
                        key={detail.id_detail_order}
                        className={`product-item ${selectedProducts.includes(detail.product_sku) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(detail.product_sku)}
                          onChange={() => toggleProductSelection(detail.product_sku)}
                          className="product-checkbox"
                        />
                        <div className="product-info">
                          <div className="product-name">
                            {detail.product?.name || detail.product_sku}
                          </div>
                          <div className="product-details">
                            SKU: {detail.product_sku} | Cantidad: {detail.quantity} | Precio: ${detail.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="product-subtotal">
                          ${detail.subtotal.toFixed(2)}
                        </div>
                      </label>
                    ))}
                  </div>
                  {selectedProducts.length > 0 && (
                    <div className="partial-refund-total">
                      Total a reembolsar: ${calculatePartialRefundTotal().toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {/* Razón del Reembolso */}
              <div className="form-group">
                <label className="form-label">Razón del Reembolso *</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Ingrese la razón del reembolso..."
                  rows={4}
                  className="reason-textarea"
                />
              </div>

              {/* Información del Pedido */}
              <div className="order-summary">
                <h3 className="order-summary-title">Resumen del Pedido</h3>
                <div className="order-summary-grid">
                  <div className="order-summary-item">
                    <span className="order-summary-label">Total del pedido:</span>
                    <span className="order-summary-value">
                      ${selectedOrder.total_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="order-summary-item">
                    <span className="order-summary-label">Productos:</span>
                    <span className="order-summary-value">
                      {selectedOrder.details.length} items
                    </span>
                  </div>
                  <div className="order-summary-item">
                    <span className="order-summary-label">Estado actual:</span>
                    <span className="order-summary-value">{selectedOrder.status}</span>
                  </div>
                  <div className="order-summary-item">
                    <span className="order-summary-label">Pagos:</span>
                    <span className="order-summary-value">
                      {selectedOrder.payments?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && !refundSuccess && (
                <div className="error-alert-modal">
                  <XCircle size={18} />
                  {error}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                onClick={closeRefundModal}
                disabled={processingRefund}
                className="cancel-button"
              >
                Cancelar
              </button>
              <button
                onClick={processRefund}
                disabled={
                  processingRefund || 
                  !refundReason.trim() || 
                  (refundType === 'partial' && selectedProducts.length === 0)
                }
                className="submit-button"
              >
                {processingRefund ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <DollarSign size={16} />
                    Procesar Reembolso
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};