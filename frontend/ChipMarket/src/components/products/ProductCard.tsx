import React, { useState } from 'react';
import { Package, DollarSign } from 'lucide-react';
import type { Product } from '../../types/product.types';
import '../../styles/ProductCard.css';

import '../../styles/ProductSearchPage.css';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

// Función para convertir URL de Imgur a URL directa de imagen
const getImgurDirectUrl = (url: string): string => {
  if (!url) return '';
  
  // Si ya es una URL directa de imagen, retornarla
  if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return url;
  }
  
  // Convertir URLs de Imgur al formato directo
  // Formato álbum: https://imgur.com/a/Y77CftR
  // Formato imagen: https://imgur.com/Y77CftR
  // Formato directo: https://i.imgur.com/Y77CftR.jpg
  
  const imgurRegex = /imgur\.com\/(a\/)?([a-zA-Z0-9]+)/;
  const match = url.match(imgurRegex);
  
  if (match && match[2]) {
    const imageId = match[2];
    // Intentar con .jpg por defecto (Imgur suele usar jpg)
    return `https://i.imgur.com/${imageId}.jpg`;
  }
  
  return url;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const imageUrl = product.images && product.images[0] 
    ? getImgurDirectUrl(product.images[0]) 
    : '';

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
    
    // Si falla .jpg, intentar con .png
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

  return (
    <div className={`product-card ${viewMode === 'list' ? 'product-card--list' : ''}`}>
      <div className="product-card__image-wrapper">
        {imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <div className="product-card__placeholder">
                <div className="product-card__loading-spinner" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={product.name}
              className="product-card__image"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          </>
        ) : (
          <div className="product-card__placeholder">
            <Package className="product-card__placeholder-icon" />
            {imageError && (
              <p className="product-card__error-text">Imagen no disponible</p>
            )}
          </div>
        )}
      </div>

      <div className="product-card__content">
        <div className="product-card__header">
          <h3 className="product-card__title">{product.name}</h3>
          <span
            className={`product-card__badge ${
              product.stock > 0
                ? 'product-card__badge--in-stock'
                : 'product-card__badge--out-of-stock'
            }`}
          >
            {product.stock > 0 ? 'En stock' : 'Agotado'}
          </span>
        </div>

        <p className="product-card__category">{product.category}</p>
        <p className="product-card__sku">SKU: {product.sku}</p>

        {product.components && (
          <div className="product-card__components">
            {product.components.procesator && (
              <p className="product-card__component">
                <span className="product-card__component-label">CPU:</span>{' '}
                {product.components.procesator}
              </p>
            )}
            {product.components.gpu && (
              <p className="product-card__component">
                <span className="product-card__component-label">GPU:</span>{' '}
                {product.components.gpu}
              </p>
            )}
            {product.components.ram && (
              <p className="product-card__component">
                <span className="product-card__component-label">RAM:</span>{' '}
                {product.components.ram}
              </p>
            )}
          </div>
        )}

        <div className="product-card__footer">
          <div className="product-card__price-wrapper">
            <DollarSign className="product-card__price-icon" />
            <span className="product-card__price">
              {product.price.toLocaleString('es-CL')}
            </span>
          </div>
          {product.garantee && (
            <span className="product-card__guarantee">{product.garantee}</span>
          )}
        </div>

        {product.score && (
          <div className="product-card__score">
            Relevancia: {product.score.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
};