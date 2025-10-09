// src/components/products/SearchHeader.tsx

import React from 'react';
import { Filter, Grid, List } from 'lucide-react'; // Puedes eliminar 'Filter', 'Grid', y 'List' si no los usas en otro lado
import { SearchBar } from './SearchBar';

interface SearchHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    suggestions: string[];
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    onSuggestionClick: (suggestion: string) => void;
    showFilters: boolean; 
    setShowFilters: (show: boolean) => void;
    viewMode: 'grid' | 'list'; 
    setViewMode: (mode: 'grid' | 'list') => void; 
    sortBy: string;
    setSortBy: (sort: string) => void;
    sortOrder: string;
    setSortOrder: (order: string) => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
    searchQuery,
    setSearchQuery,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    onSuggestionClick,
    //showFilters,
    //setShowFilters,
     viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
}) => {
    return (
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center gap-4">
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        suggestions={suggestions}
                        showSuggestions={showSuggestions}
                        setShowSuggestions={setShowSuggestions}
                        onSuggestionClick={onSuggestionClick}
                    />

                    {/* ❌ ESTE BLOQUE ES EL BOTÓN "FILTROS" Y DEBE ELIMINARSE ❌ */}
                    {/*
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Filter className="w-5 h-5" />
                        Filtros
                    </button>
                   */ }

                    {/* ❌ ESTE BLOQUE ES EL CONTROL DE VISTA (GRID/LIST) Y DEBE ELIMINARSE ❌ */}
                    {
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 border rounded-lg ${
                                viewMode === 'grid'
                                    ? 'bg-blue-50 border-blue-500 text-blue-600'
                                    : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 border rounded-lg ${
                                viewMode === 'list'
                                    ? 'bg-blue-50 border-blue-500 text-blue-600'
                                    : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                    }
                </div>

                {/* Barra de ordenamiento - ESTE BLOQUE SE MANTIENE */}
                <div className="flex items-center gap-4 mt-4">
                    <span className="text-sm text-gray-600">Ordenar por:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="relevance">Relevancia</option>
                        <option value="price">Precio</option>
                        <option value="name">Nombre</option>
                        <option value="createdAt">Más recientes</option>
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="asc">Ascendente</option>
                        <option value="desc">Descendente</option>
                    </select>
                </div>
            </div>
        </div>
    );
};