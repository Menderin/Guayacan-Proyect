// src/components/orders/OrderFilters.tsx
import React from 'react';
import { Search, Filter } from 'lucide-react';
import type { OrderSearchFilters } from '../../types/order.types';
import '../../styles/FilterOders.css';

interface OrderFiltersProps {
  filters: OrderSearchFilters;
  loading: boolean;
  onFilterChange: (key: keyof OrderSearchFilters, value: string | number) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'Pending', label: 'Pendiente' },
  { value: 'processing', label: 'Procesando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'Refused', label: 'Reembolsado' },
  { value: 'Completed', label: 'Completado' }
];

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  loading,
  onFilterChange,
  onSearch,
  onClearFilters
}) => {
  return (
    <div className="order-filters">
      <div className="order-filters__header">
        <Filter className="order-filters__icon" />
        <h2 className="order-filters__title">Filtros de búsqueda</h2>
      </div>

      <div className="order-filters__grid">
        {/* Fecha inicio */}
        <div className="order-filters__field">
          <label className="order-filters__label">Fecha inicio</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="order-filters__input"
          />
        </div>

        {/* Fecha fin */}
        <div className="order-filters__field">
          <label className="order-filters__label">Fecha fin</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="order-filters__input"
          />
        </div>

        {/* Estado */}
        <div className="order-filters__field">
          <label className="order-filters__label">Estado</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="order-filters__input"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email usuario */}
        <div className="order-filters__field">
          <label className="order-filters__label">Email del usuario</label>
          <input
            type="email"
            placeholder="usuario@ejemplo.com"
            value={filters.userEmail}
            onChange={(e) => onFilterChange('userEmail', e.target.value)}
            className="order-filters__input"
          />
        </div>

        {/* ID Usuario */}
        <div className="order-filters__field">
          <label className="order-filters__label">ID Usuario</label>
          <input
            type="number"
            placeholder="123"
            value={filters.userId}
            onChange={(e) => onFilterChange('userId', e.target.value)}
            className="order-filters__input"
          />
        </div>

        {/* SKU Producto */}
        <div className="order-filters__field">
          <label className="order-filters__label">SKU Producto</label>
          <input
            type="text"
            placeholder="PROD-001"
            value={filters.productSku}
            onChange={(e) => onFilterChange('productSku', e.target.value)}
            className="order-filters__input"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="order-filters__actions">
        <button
          onClick={onSearch}
          disabled={loading}
          className="order-filters__button order-filters__button--primary"
        >
          <Search className="order-filters__button-icon" />
          {loading ? 'Buscando...' : 'Buscar pedidos'}
        </button>
        <button
          onClick={onClearFilters}
          className="order-filters__button order-filters__button--secondary"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};