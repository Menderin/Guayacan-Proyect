// src/hooks/useProductSearch.ts

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
// Asegúrate de que la ruta a 'types' sea correcta
import type { 
    Product, 
    SearchFilters, 
    Pagination as PaginationType, 
    AvailableFilters 
} from '../types/product.types'; 

// Constante necesaria para las llamadas a la API
const API_URL = 'http://localhost:3000/api'; 

export const useProductSearch = () => {
    // 1. ESTADOS
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

    
    const [totalInStock, setTotalInStock] = useState(0); 

    const debouncedSearch = useDebounce(searchQuery, 300);

    useEffect(() => {
        fetchTotalInventory();
    }, []); 

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

    // 3. FUNCIONES
    
    const fetchTotalInventory = async () => {
        try {
            // Se asume que el endpoint /search devuelve el 'total' de coincidencias
            // incluso cuando se usa 'inStock=true'. Usamos un límite alto para asegurarnos.
            const params = new URLSearchParams({
                inStock: 'true',
                limit: '1' // Solo necesitamos el conteo 'total', no todos los datos
            });
            
            const response = await fetch(`${API_URL}/search?${params}`); 
            const data = await response.json();

            if (data.success) {
                // data.data.total es el número total de productos que cumplen con los parámetros (en este caso, inStock=true)
                setTotalInStock(data.data.total || 0); 
            }
        } catch (err) {
            console.error('Error fetching total inventory:', err);
        }
    };
    
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
    
    // 4. RETORNO DEL HOOK
    return {
        // Búsqueda y Resultados
        searchQuery, setSearchQuery, products, loading, error, 
        suggestions, setSuggestions, showSuggestions, setShowSuggestions, 
        handleSuggestionClick, debouncedSearch,
        // Filtros
        filters, setFilters, handleFilterChange, clearFilters, 
        showFilters, setShowFilters, availableFilters,
        // Visualización y Paginación
        viewMode, setViewMode, sortBy, setSortBy, sortOrder, setSortOrder,
        pagination, handlePageChange,
        // DEVOLVER el nuevo estado:
        totalInStock, 
    };
};