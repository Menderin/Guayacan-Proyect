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
            {product.stock > 0 ? 'En stock' : 'Agotado'}
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

        {product.score && (
          <div className="card__score">
            Relevancia: {product.score.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
};