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

interface DeleteConfirmModalProps {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  product, 
  onConfirm, 
  onCancel, 
  isDeleting 
}) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  return (
    <div className="edit-product-modal">
      <div className="edit-product-modal__overlay" onClick={onCancel} />
      <div className="edit-product-modal__content" style={{ maxWidth: '500px' }}>
        <div className="edit-product-modal__header">
          <h2>⚠️ Confirmar Eliminación</h2>
          <button className="edit-product-modal__close" onClick={onCancel} type="button">
            ✕
          </button>
        </div>

        <div className="edit-product-modal__body">
          <div style={{ 
            padding: '1.5rem', 
            background: '#fef3c7', 
            borderRadius: '12px', 
            border: '2px solid #fbbf24',
            marginBottom: '1.5rem'
          }}>
            <p style={{ 
              margin: 0, 
              color: '#92400e', 
              fontWeight: 600,
              fontSize: '0.9375rem',
              lineHeight: 1.6
            }}>
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="edit-product-modal__section">
            <h3 className="edit-product-modal__section-title" style={{ fontSize: '0.9375rem' }}>
              Producto a eliminar:
            </h3>
            <div style={{ 
              padding: '1rem', 
              background: '#f9fafb', 
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              {/* Imagen del producto */}
              <div style={{ 
                width: '100%', 
                height: '180px', 
                marginBottom: '1rem',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e5e7eb'
              }}>
                {product.images && product.images.length > 0 ? (
                  <>
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={handleImageError}
                    />
                    <span style={{ 
                      fontSize: '4rem', 
                      color: '#d1d5db',
                      display: 'none'
                    }}>💻</span>
                  </>
                ) : (
                  <span style={{ fontSize: '4rem', color: '#d1d5db' }}>💻</span>
                )}
              </div>

              <p style={{ margin: '0.5rem 0', color: '#111827', fontWeight: 600, fontSize: '1rem' }}>
                {product.name}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                <strong>SKU:</strong> {product.sku}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                <strong>Categoría:</strong> {product.category}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#059669', fontWeight: 700, fontSize: '1.125rem' }}>
                {formatPrice(product.price)}
              </p>
              <p style={{ margin: '0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                <strong>Stock:</strong> {product.stock} unidades
              </p>
            </div>
          </div>

          <div className="edit-product-modal__buttons" style={{ marginTop: '1.5rem' }}>
            <button type="button" onClick={onCancel} disabled={isDeleting}>
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={onConfirm} 
              disabled={isDeleting}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              {isDeleting ? '🗑️ Eliminando...' : '🗑️ Eliminar Producto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DeleteProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/productos/${productToDelete._id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      
      if (res.ok && result.success) {
        setToastMessage('✅ Producto eliminado exitosamente');
        setProductToDelete(null);
        loadProducts(currentPage);
      } else {
        throw new Error(result.message || 'Error al eliminar producto');
      }
    } catch (err) {
      setToastMessage('❌ ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setProductToDelete(null);
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
            <h2 className="product-list-header__title">Eliminar productos: {totalProducts}</h2>
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
                    <button 
                      className="product-actions__delete-btn" 
                      onClick={() => handleDeleteClick(p)}
                    >
                      🗑️ Eliminar
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

      {productToDelete && (
        <DeleteConfirmModal
          product={productToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};