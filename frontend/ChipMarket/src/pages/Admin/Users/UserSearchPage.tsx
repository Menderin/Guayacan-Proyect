// src/pages/UserSearchPage.tsx

import React from 'react';
import { useUserSearch } from '../../../hooks/useUserSearch';
import { UserSearchHeader } from '../../../components/users/UserSearchHeader';
import { UserGrid } from '../../../components/users/UserGrid';

export const UserSearchPage: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    users,
    loading,
    error,
    viewMode,
    setViewMode,
    pagination,
    setPagination,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  } = useUserSearch();

  // Sugerencias de búsqueda (puedes personalizarlas)
  const suggestions = searchQuery.length > 0
    ? ['Juan', 'María', 'Carlos', 'Ana'].filter(s =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      {/* Barra de búsqueda y controles */}
      <UserSearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        onSuggestionClick={handleSuggestionClick}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* ESPACIADOR - Compensa la altura del header fijo */}
      <div className="search-header-spacer"></div>

      {/* Grid de resultados */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <UserGrid
          users={users}
          loading={loading}
          error={error}
          viewMode={viewMode}
          pagination={pagination}
          onPageChange={handlePageChange}
          debouncedSearch={searchQuery}
        />
      </div>
    </div>
  );
};