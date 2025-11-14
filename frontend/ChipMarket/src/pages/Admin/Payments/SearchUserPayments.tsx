// src/pages/UserPaymentsPage.tsx

import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Grid, List } from 'lucide-react';
import { useUserPayments } from '../../../hooks/useUserPayments';
import { UserPaymentsGrid } from '../../../components/Payments/UserPaymentsGrid';
import { UserSearchCards } from '../../../components/Payments/UserSearchCards';
import { useUserSearch } from '../../../hooks/useUserSearch';

import '../../../styles/PaymentsCards.css';

export const SearchUserPayments: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [localViewMode, setLocalViewMode] = useState<'grid' | 'list'>('grid');

  // Hook de búsqueda de usuarios
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    users,
    loading: loadingUsers,
    error: errorUsers,
    pagination,
    setPagination
  } = useUserSearch();

  // Hook de pagos del usuario seleccionado
  const {
    payments,
    loading: loadingPayments,
    error: errorPayments,
    refetchPayments
  } = useUserPayments(selectedUserId);

  const handleUserSelect = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
  };

  const handleBackToSearch = () => {
    setSelectedUserId(null);
    setSelectedUserName('');
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Si hay un usuario seleccionado, mostrar sus pagos
  if (selectedUserId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={handleBackToSearch}
            className="mb-6 flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors bg-white rounded-lg border border-indigo-200 hover:border-indigo-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a la búsqueda
          </button>

          {/* Refresh Button */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={refetchPayments}
              disabled={loadingPayments}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loadingPayments ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {/* Payments Grid */}
          <UserPaymentsGrid
            payments={payments}
            loading={loadingPayments}
            error={errorPayments}
            userName={selectedUserName}
          />
        </div>
      </div>
    );
  }

  // Vista de búsqueda de usuarios
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Consultar Pagos de Usuarios
          </h1>
          <p className="text-gray-600">
            Busca un usuario para ver su historial de pagos
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setLocalViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  localViewMode === 'grid'
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Vista de cuadrícula"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLocalViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  localViewMode === 'list'
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Vista de lista"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Info */}
          {debouncedSearch && !loadingUsers && users.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              Mostrando {users.length} resultado{users.length !== 1 ? 's' : ''} para "{debouncedSearch}"
            </div>
          )}
        </div>

        {/* User Cards */}
        <div className="mb-6">
          <UserSearchCards
            users={users}
            loading={loadingUsers}
            error={errorUsers}
            viewMode={localViewMode}
            onUserSelect={handleUserSelect}
          />
        </div>

        {/* Pagination */}
        {!loadingUsers && !errorUsers && users.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Anterior
            </button>
            <div className="px-4 py-2 border border-gray-300 rounded-lg bg-white font-medium">
              Página {pagination.page} de {pagination.totalPages}
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Search Hint */}
        {!loadingUsers && !errorUsers && users.length === 0 && !debouncedSearch && (
          <div className="payment-empty-state">
            <div className="payment-empty-state__icon" style={{ width: '4rem', height: '4rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="payment-empty-state__title">
              Comienza tu búsqueda
            </h3>
            <p className="payment-empty-state__description">
              Ingresa al menos 2 caracteres para buscar usuarios
            </p>
          </div>
        )}
      </div>
    </div>
  );
};