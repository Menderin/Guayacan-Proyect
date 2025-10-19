// src/components/users/UserSearchHeader.tsx

import React from 'react';
import { Grid, List } from 'lucide-react';
import { SearchBar } from '../products/SearchBar'; // Reutilizamos el SearchBar

interface UserSearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  onSuggestionClick: (suggestion: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

export const UserSearchHeader: React.FC<UserSearchHeaderProps> = ({
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
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {/* Barra de búsqueda reutilizada - solo cambiar placeholder */}
          <div className="flex-1 relative">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              suggestions={suggestions}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
              onSuggestionClick={onSuggestionClick}
            />
          </div>

          {/* Control de vista Grid/List */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 border rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              title="Vista en cuadrícula"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 border rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              title="Vista en lista"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de ordenamiento */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm text-gray-600">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="relevance">Relevancia</option>
            <option value="name">Nombre</option>
            <option value="email">Email</option>
            <option value="created_at">Fecha de registro</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>
    </div>
  );
};