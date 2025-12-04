// src/pages/Admin/Products/EditProductPage.tsx
import React, { useState, useEffect } from 'react';
import type { Product } from '../../../types/product.types';
import { EditProductModal } from '../../../components/products/EditProductModal';
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

export const EditProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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

  const handleEditClick = (product: Product) => setSelectedProduct(product);
  
  const handleCloseModal = () => setSelectedProduct(null);

  const handleProductUpdated = (updated: Product) => {
    setSelectedProduct(null);
    loadProducts(currentPage);
    setToastMessage('✅ Producto actualizado exitosamente');
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);

  const getStockBadgeClass = (stock: number) => {
    if (stock === 0) return 'product-info__stock-badge--out';
    if (stock < 10) return 'product-info__stock-badge--low';
    return 'product-info__stock-badge--high';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  if (loading) {
    return (
      <div className="product-list-state">
        <p className="product-list-state__message--loading">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-state">
        <p className="product-list-state__message--error">Error: {error}</p>
        <button className="product-list-state__retry-btn" onClick={() => loadProducts(currentPage)}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {toastMessage && <ToastNotification message={toastMessage} onClose={() => setToastMessage(null)} />}
      
      <div className="product-list-container">
        <div className="product-list-header">
          <div className="product-list-header__content">
            <h2 className="product-list-header__title">Editando productos: {totalProducts}</h2>
            <div className="product-list-header__actions">
              <button className="product-list-header__reload-btn" onClick={() => loadProducts(currentPage)}>
                🔄 Recargar
              </button>
            </div>
          </div>
        </div>

        {products.length > 0 ? (
          <ul className="product-list">
            {products.map(p => (
              <li key={p._id} className="product-list__item">
                <div className="product-list__content">
                  <div className="product-image">
                    {p.images && p.images.length > 0 ? (
                      <>
                        <img 
                          src={p.images[0]} 
                          alt={p.name}
                          className="product-image__img"
                          onError={handleImageError}
                        />
                        <span className="product-image__placeholder" style={{ display: 'none' }}>💻</span>
                      </>
                    ) : (
                      <span className="product-image__placeholder">💻</span>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <div className="product-info__header">
                      <h3 className="product-info__name">{p.name}</h3>
                    </div>
                    
                    <p className="product-info__sku">SKU: {p.sku}</p>
                    <p className="product-info__category">{p.category}</p>
                    <p className="product-info__price">{formatPrice(p.price)}</p>
                    <p className={`product-info__stock-badge ${getStockBadgeClass(p.stock)}`}>
                      {p.stock} EN STOCK
                    </p>
                    {p.garantee && (
                      <p className="product-info__garantee">Garantía: {p.garantee}</p>
                    )}
                  </div>
                  
                  <div className="product-actions">
                    <button className="product-actions__edit-btn" onClick={() => handleEditClick(p)}>
                      ✏️ Editar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="product-list-empty">
            <p className="product-list-empty__message">No hay productos disponibles</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="product-list-pagination">
            <button 
              className="product-list-pagination__btn" 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
            >
              ← Anterior
            </button>
            <span className="product-list-pagination__info">
              Página {currentPage} de {totalPages}
            </span>
            <button 
              className="product-list-pagination__btn" 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {selectedProduct && (
        <EditProductModal 
          product={selectedProduct} 
          onClose={handleCloseModal} 
          onSave={handleProductUpdated} 
        />
      )}
    </>
  );
};