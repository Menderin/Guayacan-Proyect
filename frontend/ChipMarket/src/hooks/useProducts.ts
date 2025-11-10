// src/hooks/useProducts.ts

import { useState, useCallback } from 'react';
import type { Product } from '../types/product.types';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchProducts: (query: string) => Promise<void>;
  getProductBySku: (sku: string) => Promise<Product | null>;
  reset: () => void;
}

/**
 * Hook para buscar y gestionar productos
 */
export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:3000/api/productos';

  /**
   * Buscar productos por query
   */
  const searchProducts = useCallback(async (query: string) => {
    if (!query || query.trim() === '') {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success && data.data?.productos) {
        setProducts(data.data.productos);
      } else {
        setProducts([]);
        setError(data.message || 'No se encontraron productos');
      }
    } catch (err) {
      setError('Error al buscar productos');
      setProducts([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener un producto específico por SKU
   */
  const getProductBySku = useCallback(async (sku: string): Promise<Product | null> => {
    if (!sku || sku.trim() === '') {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar por SKU exacto
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(sku)}`);
      const data = await response.json();

      if (data.success && data.data?.productos) {
        // Buscar coincidencia exacta de SKU
        const exactMatch = data.data.productos.find(
          (p: Product) => p.sku.toLowerCase() === sku.toLowerCase()
        );
        
        if (exactMatch) {
          return exactMatch;
        }
      }

      setError('Producto no encontrado');
      return null;
    } catch (err) {
      setError('Error al obtener el producto');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Resetear estado
   */
  const reset = () => {
    setProducts([]);
    setLoading(false);
    setError(null);
  };

  return {
    products,
    loading,
    error,
    searchProducts,
    getProductBySku,
    reset
  };
}