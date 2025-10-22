import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';
import type { Product, ProductApiResponse } from '../types/product.types';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  hasLoaded: boolean;
  createProduct: (data: Omit<Product, '_id'>) => Promise<{ success: boolean; message: string; product?: Product }>;
  creatingProduct: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

const API_URL = 'http://localhost:3000/api';

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/productos`);
      const result: ProductApiResponse = await res.json();
      if (!result.success) throw new Error(result.message || 'Error al obtener productos');
      setProducts(result.data?.productos || []);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (data: Omit<Product, '_id'>) => {
  setCreatingProduct(true);
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result: ProductApiResponse = await res.json();

    if (!result.success) return { success: false, message: result.message || 'Error al crear producto' };

    if (result.data?.product) setProducts(prev => [...prev, result.data.product]);

    return { success: true, message: result.message || 'Producto creado exitosamente', product: result.data?.product };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, message: msg };
  } finally {
    setCreatingProduct(false);
  }
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error, fetchProducts, hasLoaded, createProduct, creatingProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts debe usarse dentro de un ProductProvider');
  return context;
};
