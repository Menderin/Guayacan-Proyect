// src/components/common/OrderSelector.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, ChevronDown } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import type { Order } from '../../types/order.types';
import '../../styles/OrderSelector.css';

interface OrderSelectorProps {
  selectedOrder: Order | null;
  onOrderSelect: (order: Order | null) => void;
  disabled?: boolean;
  error?: string | null;
  filterByStatus?: string; // Para filtrar solo pedidos pendientes, por ejemplo
}

export const OrderSelector: React.FC<OrderSelectorProps> = ({
  selectedOrder,
  onOrderSelect,
  disabled = false,
  error = null,
  filterByStatus = 'Pending'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { pendingOrders, loading, getPendingOrders } = useOrders();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar pedidos pendientes al montar
  useEffect(() => {
    if (filterByStatus === 'Pending') {
      getPendingOrders();
    }
  }, [getPendingOrders, filterByStatus]);

  // Filtrar pedidos según búsqueda
  const filteredOrders = pendingOrders.filter(order => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      order.id_order.toString().includes(query) ||
      order.user_id.toString().includes(query) ||
      order.status.toLowerCase().includes(query)
    );
  });

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOrderSelect = (order: Order) => {
    onOrderSelect(order);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleClear = () => {
    onOrderSelect(null);
    setSearchQuery('');
  };

  const formatCurrency = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toLocaleString('es-CL');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="order-selector" ref={dropdownRef}>
      <label className="order-selector__label">
        Pedido *
      </label>

      {selectedOrder ? (
        <div className="order-selector__selected">
          <div className="order-selector__selected-info">
            <ShoppingBag className="order-selector__icon" />
            <div>
              <p className="order-selector__selected-id">
                Pedido #{selectedOrder.id_order}
              </p>
              <p className="order-selector__selected-details">
                Total: ${formatCurrency(selectedOrder.total_amount)} | 
                Estado: {selectedOrder.status} | 
                {formatDate(selectedOrder.order_date)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="order-selector__clear-btn"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="order-selector__search-container">
          <div className="order-selector__input-wrapper">
            <Search className="order-selector__search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="Buscar pedido por ID..."
              disabled={disabled}
              className="order-selector__input"
            />
            <ChevronDown className="order-selector__chevron" />
          </div>

          {showDropdown && (
            <div className="order-selector__dropdown">
              {loading ? (
                <div className="order-selector__loading">
                  <div className="spinner"></div>
                  <span>Cargando pedidos...</span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="order-selector__empty">
                  {pendingOrders.length === 0 
                    ? 'No hay pedidos pendientes'
                    : 'No se encontraron pedidos con ese criterio'
                  }
                </div>
              ) : (
                <ul className="order-selector__list">
                  {filteredOrders.map((order) => (
                    <li
                      key={order.id_order}
                      onClick={() => handleOrderSelect(order)}
                      className="order-selector__item"
                    >
                      <ShoppingBag className="order-selector__item-icon" />
                      <div className="order-selector__item-info">
                        <p className="order-selector__item-id">
                          Pedido #{order.id_order}
                        </p>
                        <p className="order-selector__item-details">
                          Total: ${formatCurrency(order.total_amount)} | 
                          {formatDate(order.order_date)}
                        </p>
                        <span className={`order-selector__status order-selector__status--${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="order-selector__error">{error}</p>}
    </div>
  );
};