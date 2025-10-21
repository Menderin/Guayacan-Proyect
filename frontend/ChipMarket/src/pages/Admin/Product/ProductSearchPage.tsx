// src/pages/ProductSearchPage.tsx

import React from 'react';
import { useProductSearch } from '../../../hooks/useProductSearch'; 
import { SearchHeader } from '../../../components/products/SearchHeader';
import { ProductGrid } from '../../../components/products/ProductGrid'; 
import '../../../styles/ProductSearchPage.css';

export const ProductSearchPage: React.FC = () => {
    const {
        searchQuery, setSearchQuery, suggestions, showSuggestions, setShowSuggestions, 
        handleSuggestionClick, showFilters, setShowFilters, viewMode, setViewMode, 
        sortBy, setSortBy, sortOrder, setSortOrder,
        products, loading, error, pagination, handlePageChange, debouncedSearch
    } = useProductSearch(); 

    return (
        <div className="product-search-page min-h-screen bg-gray-50">
            {/* SearchHeader fijo en la parte superior */}
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

            {/* Espaciador para compensar el header fijo */}
            <div className="search-header-spacer" />

            {/* Contenido principal */}
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