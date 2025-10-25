// src/pages/FilterOrders.tsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Package } from 'lucide-react';
import { OrderGrid } from '../../../components/Orders//OrderGrid';
import { OrderFilters } from '../../../components/Orders/OrderFilters';
import type { Order, OrderSearchFilters, Pagination } from '../../../types/order.types';


const FilterOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [filters, setFilters] = useState<OrderSearchFilters>({
    startDate: '',
    endDate: '',
    userId: '',
    userEmail: '',
    productSku: '',
    status: '',
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`http://localhost:3000/api/orders/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Error al obtener los pedidos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasSearched) {
      fetchOrders();
    }
  }, [filters.page]);

  const handleFilterChange = (key: keyof OrderSearchFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleSearch = () => {
    fetchOrders();
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      userId: '',
      userEmail: '',
      productSku: '',
      status: '',
      page: 1,
      limit: 10
    });
    setHasSearched(false);
    setOrders([]);
    setError(null);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="filter-orders">
      <div className="filter-orders__container">
        {/* Header */}
        <div className="filter-orders__header">
          <h1 className="filter-orders__title">Búsqueda de Pedidos</h1>
          <p className="filter-orders__subtitle">
            Filtra y busca pedidos con criterios avanzados
          </p>
        </div>

        {/* Filtros */}
        <OrderFilters
          filters={filters}
          loading={loading}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
        />

        {/* Resultados */}
        <OrderGrid
          orders={orders}
          loading={loading}
          error={error}
          hasSearched={hasSearched}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default FilterOrders;