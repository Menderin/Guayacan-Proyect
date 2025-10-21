// src/components/adminDashboard/LowStockAlerts.tsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, RefreshCw } from 'lucide-react';
import Alert from '../common/Alert';
import '../../styles/LowStockAlerts.css';

interface Product {
  _id: string;
  sku: string;
  name: string;
  stock: number;
  price: number;
  category: string;
}

interface ApiResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const LowStockAlerts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/api/productos/poco-stock?threshold=5&limit=10');
      
      if (!response.ok) {
        throw new Error('Error al obtener productos con bajo stock');
      }

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      } else {
        throw new Error('La respuesta no fue exitosa');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLowStockProducts();
  };

  const getStockLevel = (stock: number): 'critical' | 'warning' | 'low' => {
    if (stock === 0) return 'critical';
    if (stock <= 2) return 'warning';
    return 'low';
  };

  const getStockColor = (level: string): string => {
    switch (level) {
      case 'critical':
        return 'stock-critical';
      case 'warning':
        return 'stock-warning';
      default:
        return 'stock-low';
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="low-stock-alerts">
        <div className="low-stock-alerts__loading">
          <div className="spinner"></div>
          <p>Cargando alertas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="low-stock-alerts">
        <Alert type="error" message={error} />
        <button 
          onClick={handleRefresh} 
          className="low-stock-alerts__refresh-btn"
        >
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="low-stock-alerts">
        <Alert 
          type="success" 
          message="✓ No hay productos con stock bajo en este momento" 
        />
      </div>
    );
  }

  return (
    <div className="low-stock-alerts">
      <div className="low-stock-alerts__header">
        <div className="low-stock-alerts__count">
          <AlertTriangle size={20} />
          <span>{products.length} producto{products.length !== 1 ? 's' : ''} con stock bajo</span>
        </div>
        <button 
          onClick={handleRefresh} 
          className={`low-stock-alerts__refresh-btn ${refreshing ? 'refreshing' : ''}`}
          disabled={refreshing}
        >
          <RefreshCw size={16} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="low-stock-alerts__list">
        {products.map((product) => {
          const stockLevel = getStockLevel(product.stock);
          return (
            <div key={product._id} className="low-stock-alerts__item">
              <div className="low-stock-alerts__item-icon">
                <Package size={24} />
              </div>
              
              <div className="low-stock-alerts__item-info">
                <div className="low-stock-alerts__item-header">
                  <h4 className="low-stock-alerts__item-name">{product.name}</h4>
                  <span className={`low-stock-alerts__badge ${getStockColor(stockLevel)}`}>
                    {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'}
                  </span>
                </div>
                
                <div className="low-stock-alerts__item-details">
                  <span className="low-stock-alerts__sku">SKU: {product.sku}</span>
                  <span className="low-stock-alerts__category">{product.category}</span>
                  <span className="low-stock-alerts__price">
                    ${product.price.toLocaleString('es-CL')}
                  </span>
                </div>

                {stockLevel === 'critical' && (
                  <Alert 
                    type="error" 
                    message="¡CRÍTICO! Producto sin stock disponible" 
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};