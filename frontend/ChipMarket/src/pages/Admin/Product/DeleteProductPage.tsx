// src/pages/Admin/Products/DeleteProductPage.tsx
import React, { useState, useEffect } from 'react';
import type { Product } from '../../../types/product.types';
import { ToastNotification } from '../../../components/common/ToastNotification';
import '../../../styles/ProductListPage.css';

interface ProductApiResponse {
  success: boolean;
  data?: {
    productos: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

export const DeleteProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadProducts = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/productos?page=${page}&limit=10`);
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const result: ProductApiResponse = await res.json();
      if (result.success && result.data) {
        setProducts(result.data.productos);
        setCurrentPage(result.data.pagination.page);
        setTotalPages(result.data.pagination.totalPages);
        setTotalProducts(result.data.pagination.total);
      } else {
        throw new Error(result.message || 'Error al cargar productos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(currentPage);
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleDeleteClick = async (productId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/productos/${productId}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setToastMessage('Producto eliminado exitosamente');
        loadProducts(currentPage);
      } else {
        throw new Error(result.message || 'Error al eliminar producto');
      }
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);

  if (loading) return <p className="product-list-state__message--loading">Cargando productos...</p>;
  if (error)
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={() => loadProducts(currentPage)}>Reintentar</button>
      </div>
    );

  return (
    <>
      {toastMessage && <ToastNotification message={toastMessage} onClose={() => setToastMessage(null)} />}
      <div className="product-list-container">
        <div className="product-list-header">
          <h2>Eliminar productos: {totalProducts}</h2>
          <button onClick={() => loadProducts(currentPage)}>🔄 Recargar</button>
        </div>

        {products.length > 0 ? (
          <ul className="product-list">
            {products.map(p => (
              <li key={p._id} className="product-list__item">
                <div className="product-list__content">
                  <div className="product-info">
                    <h3>{p.name}</h3>
                    <p>SKU: {p.sku}</p>
                    <p>{p.category}</p>
                    <p>{formatPrice(p.price)}</p>
                    <p>{p.stock} en stock</p>
                  </div>
                  <button onClick={() => handleDeleteClick(p._id)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay productos.</p>
        )}

        {totalPages > 1 && (
          <div className="product-list-pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              ← Anterior
            </button>
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </>
  );
};
