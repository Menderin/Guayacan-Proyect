/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/Admin/Products/ProductListPage.tsx

import React, { useState, useEffect } from 'react';
import type { Product } from '../../../types/product.types';
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

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadProducts = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Llamando a la API de productos...');
      const response = await fetch(`/api/productos?page=${page}&limit=10`);
      
      console.log('📡 Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const result: ProductApiResponse = await response.json();
      console.log('📡 Respuesta:', result);
      
      if (result.success && result.data) {
        setProducts(result.data.productos);
        setCurrentPage(result.data.pagination.page);
        setTotalPages(result.data.pagination.totalPages);
        setTotalProducts(result.data.pagination.total);
        console.log('✅ Productos cargados:', result.data.productos.length);
      } else {
        throw new Error(result.message || 'Error al cargar productos');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(currentPage);
  }, [currentPage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Modal de detalles del producto
  if (selectedProduct) {
    return (
      <div className="product-detail-modal">
        <div className="product-detail-modal__overlay" onClick={() => setSelectedProduct(null)} />
        <div className="product-detail-modal__content">
          <button
            onClick={() => setSelectedProduct(null)}
            className="product-detail-modal__close"
          >
            ✕
          </button>
          
          <h2 className="product-detail-modal__title">{selectedProduct.name}</h2>
          
          <div className="product-detail-modal__body">
            <div className="product-detail-section">
              <h3>Información General</h3>
              <p><strong>SKU:</strong> {selectedProduct.sku}</p>
              <p><strong>Categoría:</strong> {selectedProduct.category}</p>
              <p><strong>Precio:</strong> {formatPrice(selectedProduct.price)}</p>
              <p><strong>Stock:</strong> {selectedProduct.stock} unidades</p>
              <p><strong>Garantía:</strong> {selectedProduct.garantee || 'N/A'}</p>
            </div>

            {selectedProduct.components && (
              <div className="product-detail-section">
                <h3>Componentes</h3>
                {selectedProduct.components.procesator && (
                  <p><strong>Procesador:</strong> {selectedProduct.components.procesator}</p>
                )}
                {selectedProduct.components.gpu && (
                  <p><strong>GPU:</strong> {selectedProduct.components.gpu}</p>
                )}
                {selectedProduct.components.ram && (
                  <p><strong>RAM:</strong> {selectedProduct.components.ram}</p>
                )}
                {selectedProduct.components.storage && (
                  <p><strong>Almacenamiento:</strong> {selectedProduct.components.storage}</p>
                )}
                {selectedProduct.components.mother_board && (
                  <p><strong>Placa Madre:</strong> {selectedProduct.components.mother_board}</p>
                )}
              </div>
            )}

            {selectedProduct.images && selectedProduct.images.length > 0 && (
              <div className="product-detail-section">
                <h3>Imágenes</h3>
                <div className="product-detail-images">
                  {selectedProduct.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`${selectedProduct.name} ${idx + 1}`} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="product-list-state">
        <p className="product-list-state__message product-list-state__message--loading">
          Cargando productos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-state">
        <p className="product-list-state__message product-list-state__message--error">
          Error: {error}
        </p>
        <button
          onClick={() => loadProducts(currentPage)}
          className="product-list-state__retry-btn"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      {/* Header */}
      <div className="product-list-header">
        <div className="product-list-header__content">
          <h2 className="product-list-header__title">
            Productos: {totalProducts} total
          </h2>
          <div className="product-list-header__actions">
            <button
              onClick={() => loadProducts(currentPage)}
              className="product-list-header__reload-btn"
            >
              🔄 Recargar
            </button>
            <button className="product-list-header__add-btn">
              ➕ Agregar Producto
            </button>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      {products.length > 0 ? (
        <>
          <ul className="product-list">
            {products.map(product => (
              <li key={product._id} className="product-list__item">
                <div className="product-list__content">
                  {/* Imagen del producto */}
                  <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="product-image__img"
                      />
                    ) : (
                      <div className="product-image__placeholder">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Información del producto */}
                  <div className="product-info">
                    <div className="product-info__header">
                      <h3 className="product-info__name">
                        {product.name}
                      </h3>
                      <span
                        className={`product-info__stock-badge ${
                          product.stock > 10
                            ? 'product-info__stock-badge--high'
                            : product.stock > 0
                            ? 'product-info__stock-badge--low'
                            : 'product-info__stock-badge--out'
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                      </span>
                    </div>
                    <p className="product-info__sku">
                      SKU: {product.sku}
                    </p>
                    <p className="product-info__category">
                      {product.category}
                    </p>
                    <p className="product-info__price">
                      {formatPrice(product.price)}
                    </p>
                    {product.garantee && (
                      <p className="product-info__garantee">
                        Garantía: {product.garantee}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="product-actions">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="product-actions__detail-btn"
                    >
                      Ver Detalles
                    </button>
                    <button className="product-actions__edit-btn">
                      ✏️ Editar
                    </button>
                    <button className="product-actions__delete-btn">
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="product-list-pagination">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="product-list-pagination__btn"
              >
                ← Anterior
              </button>
              <span className="product-list-pagination__info">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="product-list-pagination__btn"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="product-list-empty">
          <p className="product-list-empty__message">
            No se encontraron productos.
          </p>
          <button className="product-list-empty__add-btn">
            ➕ Agregar primer producto
          </button>
        </div>
      )}
    </div>
  );
};