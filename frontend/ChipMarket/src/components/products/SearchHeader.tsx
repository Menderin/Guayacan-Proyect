// src/components/products/SearchHeader.tsx

import React from 'react';
import { Grid, List } from 'lucide-react';
import { SearchBar } from './SearchBar';
import '../../styles/SearchHeader.css';

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
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
}) => {
    return (
        <div className="search-header-container">
            <div className="search-header-content">
                
                {/* Top Bar: SearchBar + View Mode */}
                <div className="search-header-topbar">
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        suggestions={suggestions}
                        showSuggestions={showSuggestions}
                        setShowSuggestions={setShowSuggestions}
                        onSuggestionClick={onSuggestionClick}
                    />

                    {/* View Mode Toggle */}
                    <div className="view-mode-toggle">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`view-mode-btn ${
                                viewMode === 'grid' ? 'view-mode-btn--active' : ''
                            }`}
                            aria-label="Vista de cuadrícula"
                        >
                            <Grid />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`view-mode-btn ${
                                viewMode === 'list' ? 'view-mode-btn--active' : ''
                            }`}
                            aria-label="Vista de lista"
                        >
                            <List />
                        </button>
                    </div>
                </div>

                {/* Sort Bar */}
                <div className="search-header-sortbar">
                    <span className="search-header-sortbar__label">Ordenar por:</span>
                    <div className="search-header-sortbar__controls">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                            aria-label="Criterio de ordenamiento"
                        >
                            <option value="relevance">Relevancia</option>
                            <option value="price">Precio</option>
                            <option value="name">Nombre</option>
                            <option value="createdAt">Más recientes</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="sort-select"
                            aria-label="Orden"
                        >
                            <option value="asc">Ascendente</option>
                            <option value="desc">Descendente</option>
                        </select>
                        <div className={`sort-direction-indicator sort-direction-indicator--${sortOrder}`}>
                            {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};