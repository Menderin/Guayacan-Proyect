// src/pages/ProductSearchPage.tsx

import React from 'react'; // Solo necesitamos React
// Importamos el hook que ahora contiene toda la lógica:
import { useProductSearch } from '../../../hooks/useProductSearch'; 
// Importamos los componentes visuales que se quedan
import { SearchHeader } from '../../../components/products/SearchHeader';
// ELIMINAMOS: import { FilterPanel } from '../components/products/FilterPanel';
import { ProductGrid } from '../../../components/products/ProductGrid'; 
// ELIMINAMOS los imports de tipos de datos, ya que están en el hook
import '../../../styles/ProductSearchPage.css';

// ELIMINAMOS: const API_URL = 'http://localhost:3000/api';

export const ProductSearchPage: React.FC = () => {
    // 1. Llama al hook y extrae solo los valores necesarios para la interfaz de búsqueda
    const {
        // Valores y handlers para SearchHeader
        searchQuery, setSearchQuery, suggestions, showSuggestions, setShowSuggestions, 
        handleSuggestionClick, showFilters, setShowFilters, viewMode, setViewMode, 
        sortBy, setSortBy, sortOrder, setSortOrder,

        // Valores y handlers para ProductGrid
        products, loading, error, pagination, handlePageChange, debouncedSearch
        // Ya no necesitamos traer 'filters', 'availableFilters', 'handleFilterChange' ni 'clearFilters' aquí.
    } = useProductSearch(); 

    // 2. Todo el código de useEffect y funciones internas fue movido al hook.

    return (
        <div className="min-h-screen bg-gray-50">
            {/* El SearchHeader sigue funcionando, pero con los props del hook */}
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