// src/components/orders/OrderGrid.tsx
import React from 'react';
import { Loader2, Package, Search } from 'lucide-react';
import { OrderCard } from './OrderCard';
import { Pagination } from './Pagination';
import type { Order, Pagination as PaginationType } from '../../types/order.types';
import '../../styles/OrderGrid.css';

interface OrderGridProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export const OrderGrid: React.FC<OrderGridProps> = ({
  orders,
  loading,
  error,
  hasSearched,
  pagination,
  onPageChange
}) => {
  return (
    <div className="order-grid">
      {/* Contador de resultados */}
      {!loading && hasSearched && orders.length > 0 && (
        <div className="order-grid__counter">
          Mostrando {((pagination.page - 1) * pagination.limit) + 1} -{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
          {pagination.total} pedidos
        </div>
      )}

      {/* Estado: Cargando */}
      {loading && (
        <div className="order-grid__loading">
          <Loader2 className="order-grid__spinner" />
          <p className="order-grid__loading-text">Buscando pedidos...</p>
        </div>
      )}

      {/* Estado: Error */}
      {error && (
        <div className="order-grid__error">
          <div className="order-grid__error-header">
            <svg className="order-grid__error-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="order-grid__error-title">Error</span>
          </div>
          <p className="order-grid__error-message">{error}</p>
        </div>
      )}

      {/* Estado: Resultados encontrados */}
      {!loading && !error && hasSearched && orders.length > 0 && (
        <>
          <div className="order-grid__list">
            {orders.map((order) => (
              <OrderCard key={order.id_order} order={order} />
            ))}
          </div>

          <Pagination pagination={pagination} onPageChange={onPageChange} />
        </>
      )}

      {/* Estado: Sin resultados */}
      {!loading && !error && hasSearched && orders.length === 0 && (
        <div className="order-grid__empty">
          <Package className="order-grid__empty-icon" />
          <h3 className="order-grid__empty-title">No se encontraron pedidos</h3>
          <p className="order-grid__empty-text">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}

      {/* Estado: Sin búsqueda inicial */}
      {!loading && !error && !hasSearched && (
        <div className="order-grid__initial">
          <Search className="order-grid__initial-icon" />
          <h3 className="order-grid__initial-title">Comienza tu búsqueda</h3>
          <p className="order-grid__initial-text">
            Aplica filtros y haz clic en "Buscar pedidos" para ver los resultados
          </p>
        </div>
      )}
    </div>
  );
};