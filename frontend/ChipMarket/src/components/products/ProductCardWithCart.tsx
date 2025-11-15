// src/components/customer/ProductCardWithCart.tsx

import React, { useState } from 'react';
import { Package, DollarSign, ShoppingCart, Check } from 'lucide-react';
import type { Product } from '../../types/product.types';
import '../../styles/ProductCard.css';

interface ProductCardWithCartProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onAddToCart: (product: Product, quantity: number) => void;
}

const getImgurDirectUrl = (url: string): string => {
  if (!url) return '';
  if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return url;
  
  const imgurRegex = /imgur\.com\/(a\/)?([a-zA-Z0-9]+)/;
  const match = url.match(imgurRegex);
  
  if (match && match[2]) {
    return `https://i.imgur.com/${match[2]}.jpg`;
  }
  
  return url;
};

export const ProductCardWithCart: React.FC<ProductCardWithCartProps> = ({
  product,
  viewMode,
  onAddToCart
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const imageUrl = product.images && product.images[0] 
    ? getImgurDirectUrl(product.images[0]) 
    : '';

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
    
    if (imageUrl.endsWith('.jpg')) {
      const pngUrl = imageUrl.replace('.jpg', '.png');
      const img = new Image();
      img.src = pngUrl;
      img.onload = () => {
        setImageError(false);
        setImageLoading(false);
      };
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleAddToCart = () => {
    if (product.stock > 0) {
      onAddToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className={`card ${viewMode === 'list' ? 'card--list' : ''}`}>
      <div className="card__image-wrapper">
        {imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <div className="card__placeholder">
                <div className="card__loading-spinner" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={product.name}
              className="card__image"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          </>
        ) : (
          <div className="card__placeholder">
            <Package className="card__placeholder-icon" />
            {imageError && (
              <p className="card__error-text">Imagen no disponible</p>
            )}
          </div>
        )}
      </div>

      <div className="card__content">
        <div className="card__header">
          <h3 className="card__title">{product.name}</h3>
          <span
            className={`card__badge ${
              product.stock > 0
                ? 'card__badge--in-stock'
                : 'card__badge--out-of-stock'
            }`}
          >
            {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
          </span>
        </div>

        <p className="card__category">{product.category}</p>
        <p className="card__sku">SKU: {product.sku}</p>

        {product.components && (
          <div className="card__components">
            {product.components.procesator && (
              <p className="card__component">
                <span className="card__component-label">CPU:</span>{' '}
                {product.components.procesator}
              </p>
            )}
            {product.components.gpu && (
              <p className="card__component">
                <span className="card__component-label">GPU:</span>{' '}
                {product.components.gpu}
              </p>
            )}
            {product.components.ram && (
              <p className="card__component">
                <span className="card__component-label">RAM:</span>{' '}
                {product.components.ram}
              </p>
            )}
          </div>
        )}

        <div className="card__footer">
          <div className="card__price-wrapper">
            <DollarSign className="card__price-icon" />
            <span className="card__price">
              {product.price.toLocaleString('es-CL')}
            </span>
          </div>
          {product.garantee && (
            <span className="card__guarantee">{product.garantee}</span>
          )}
        </div>

        {/* Cart Controls */}
        <div className="card__cart-controls">
          {!isOutOfStock && (
            <div className="card__quantity-selector">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="card__qty-btn"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="card__qty-display">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="card__qty-btn"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addedToCart}
            className={`card__add-to-cart-btn ${
              addedToCart ? 'card__add-to-cart-btn--added' : ''
            } ${isOutOfStock ? 'card__add-to-cart-btn--disabled' : ''}`}
          >
            {addedToCart ? (
              <>
                <Check className="w-5 h-5" />
                Agregado
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                {isOutOfStock ? 'Sin Stock' : 'Agregar al Carrito'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};