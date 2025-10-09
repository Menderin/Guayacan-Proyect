import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { SearchHeader } from '../components/products/SearchHeader';
import { FilterPanel } from '../components/products/FilterPanel';
import { ProductGrid } from '../components/products/ProductGrid';
import type {
    Product,
    SearchFilters,
    Pagination as PaginationType,
    AvailableFilters
} from '../types/product.types';
import '../styles/ProductSearchPage.css';

const API_URL = 'http://localhost:3000/api';

export const ProductSearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    garantee: '',
    procesator: '',
    gpu: '',
    ram: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters | null>(null);
  
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      fetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearch || Object.values(filters).some(v => v)) {
      searchProducts();
    }
  }, [debouncedSearch, pagination.page, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchAvailableFilters();
  }, [debouncedSearch]);

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(
        `${API_URL}/search/suggestions?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const fetchAvailableFilters = async () => {
    try {
      const response = await fetch(
        `${API_URL}/search/filters${debouncedSearch ? `?q=${encodeURIComponent(debouncedSearch)}` : ''}`
      );
      const data = await response.json();
      if (data.success) {
        setAvailableFilters(data.data);
      }
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  const searchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: debouncedSearch,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_URL}/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination({
          page: data.data.page,
          limit: pagination.limit,
          total: data.data.total,
          totalPages: data.data.totalPages,
          hasNext: data.data.hasNext,
          hasPrev: data.data.hasPrev
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error al buscar productos. Verifica que el servidor esté ejecutándose.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      garantee: '',
      procesator: '',
      gpu: '',
      ram: ''
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        onSuggestionClick={handleSuggestionClick}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {showFilters && (
            <FilterPanel
              filters={filters}
              availableFilters={availableFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          )}

          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            viewMode={viewMode}
            pagination={pagination}
            onPageChange={handlePageChange}
            debouncedSearch={debouncedSearch}
          />
        </div>
      </div>
    </div>
  );
};