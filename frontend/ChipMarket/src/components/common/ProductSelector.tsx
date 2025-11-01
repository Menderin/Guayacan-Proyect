// src/components/common/ProductSelector.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Plus, Minus, Trash2 } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import type { Product } from '../../types/product.types';
import type { OrderProductInput } from '../../types/order.types';
import '../../styles/ProductSelector.css';

interface ProductSelectorProps {
  selectedProducts: OrderProductInput[];
  onProductsChange: (products: OrderProductInput[]) => void;
  disabled?: boolean;
  error?: string | null;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProducts,
  onProductsChange,
  disabled = false,
  error = null
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { products, loading, searchProducts } = useProducts();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Buscar productos cuando cambia el query
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const debounce = setTimeout(() => {
        searchProducts(searchQuery);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [searchQuery, searchProducts]);

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

  const handleProductSelect = (product: Product) => {
    const existingProduct = selectedProducts.find(p => p.sku === product.sku);

    if (existingProduct) {
      // Si ya existe, aumentar cantidad
      const updated = selectedProducts.map(p =>
        p.sku === product.sku
          ? { ...p, quantity: p.quantity + 1 }
          : p
      );
      onProductsChange(updated);
    } else {
      // Agregar nuevo producto
      const newProduct: OrderProductInput = {
        sku: product.sku,
        quantity: 1,
        name: product.name,
        price: product.price,
        stock: product.stock
      };
      onProductsChange([...selectedProducts, newProduct]);
    }

    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleQuantityChange = (sku: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveProduct(sku);
      return;
    }

    const product = selectedProducts.find(p => p.sku === sku);
    if (product && product.stock && newQuantity > product.stock) {
      alert(`Stock disponible: ${product.stock} unidades`);
      return;
    }

    const updated = selectedProducts.map(p =>
      p.sku === sku ? { ...p, quantity: newQuantity } : p
    );
    onProductsChange(updated);
  };

  const handleRemoveProduct = (sku: string) => {
    const updated = selectedProducts.filter(p => p.sku !== sku);
    onProductsChange(updated);
  };

  const calculateSubtotal = (product: OrderProductInput): number => {
    return (product.price || 0) * product.quantity;
  };

  return (
    <div className="product-selector">
      <label className="product-selector__label">
        Productos *
      </label>

      {/* Buscador de productos */}
      <div className="product-selector__search-container" ref={dropdownRef}>
        <div className="product-selector__input-wrapper">
          <Search className="product-selector__search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Buscar producto por nombre o SKU..."
            disabled={disabled}
            className="product-selector__input"
          />
        </div>

        {showDropdown && searchQuery.trim().length >= 2 && (
          <div className="product-selector__dropdown">
            {loading ? (
              <div className="product-selector__loading">
                <div className="spinner"></div>
                <span>Buscando productos...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="product-selector__empty">
                No se encontraron productos
              </div>
            ) : (
              <ul className="product-selector__list">
                {products.map((product) => (
                  <li
                    key={product._id}
                    onClick={() => handleProductSelect(product)}
                    className="product-selector__item"
                  >
                    <Package className="product-selector__item-icon" />
                    <div className="product-selector__item-info">
                      <p className="product-selector__item-name">{product.name}</p>
                      <p className="product-selector__item-details">
                        SKU: {product.sku} | Stock: {product.stock} | ${product.price.toLocaleString('es-CL')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Lista de productos seleccionados */}
      {selectedProducts.length > 0 && (
        <div className="product-selector__selected-list">
          <h4 className="product-selector__selected-title">
            Productos seleccionados ({selectedProducts.length})
          </h4>
          
          <div className="product-selector__table-wrapper">
            <table className="product-selector__table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Precio Unit.</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts.map((product) => (
                  <tr key={product.sku}>
                    <td>
                      <div className="product-selector__product-name">
                        <Package size={16} />
                        {product.name || 'Producto'}
                      </div>
                    </td>
                    <td className="product-selector__sku">{product.sku}</td>
                    <td className="product-selector__price">
                      ${(product.price || 0).toLocaleString('es-CL')}
                    </td>
                    <td>
                      <div className="product-selector__quantity-controls">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(product.sku, product.quantity - 1)}
                          disabled={disabled}
                          className="product-selector__qty-btn"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) => handleQuantityChange(product.sku, parseInt(e.target.value) || 0)}
                          disabled={disabled}
                          min="1"
                          max={product.stock}
                          className="product-selector__qty-input"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(product.sku, product.quantity + 1)}
                          disabled={disabled || (product.stock !== undefined && product.quantity >= product.stock)}
                          className="product-selector__qty-btn"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      {product.stock && (
                        <span className="product-selector__stock-info">
                          Stock: {product.stock}
                        </span>
                      )}
                    </td>
                    <td className="product-selector__subtotal">
                      ${calculateSubtotal(product).toLocaleString('es-CL')}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.sku)}
                        disabled={disabled}
                        className="product-selector__remove-btn"
                        title="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && <p className="product-selector__error">{error}</p>}
    </div>
  );
};