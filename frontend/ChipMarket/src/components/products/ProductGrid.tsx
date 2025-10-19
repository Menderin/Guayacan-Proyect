import React from 'react';
import { Loader2, Package } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Pagination } from './Pagination';
import type { Product, Pagination as PaginationType } from '../../types/product.types';

import '../../styles/ProductSearchPage.css';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  pagination: PaginationType;
  onPageChange: (page: number) => void;
  debouncedSearch: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  error,
  viewMode,
  pagination,
  onPageChange,
  debouncedSearch
}) => {
  return (
    <div className="flex-1">
      {!loading && products.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Mostrando {((pagination.page - 1) * pagination.limit) + 1} -{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} productos
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} viewMode={viewMode} />
            ))}
          </div>

          <Pagination pagination={pagination} onPageChange={onPageChange} />
        </>
      )}

      {!loading && !error && products.length === 0 && debouncedSearch && (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-600">
            Intenta con otros términos de búsqueda o ajusta los filtros
          </p>
        </div>
      )}
    </div>
  );
};