// src/components/users/UserEditGrid.tsx

import React, { useState } from 'react';
import { UserCard } from './UserCard';
import { EditUserModal } from './EditUserModal';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  role: {
    role_name: string;
  };
}

interface UserEditGridProps {
  users: User[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
  onPageChange: (page: number) => void;
  debouncedSearch: string;
}

export const UserEditGrid: React.FC<UserEditGridProps> = ({
  users,
  loading,
  error,
  viewMode,
  pagination,
  onPageChange,
  debouncedSearch
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setSelectedUser(null);
    // Aquí podrías actualizar la lista local o recargar
    window.location.reload(); // Recargar para ver cambios
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">⚠️ {error}</p>
      </div>
    );
  }

  if (users.length === 0 && debouncedSearch) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No se encontraron resultados
        </h3>
        <p className="text-gray-500">
          Intenta buscar con otros términos
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Grid o Lista */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        {users.map(user => (
          <UserEditCard
            key={user.id}
            user={user}
            viewMode={viewMode}
            onEdit={handleEditClick}
          />
        ))}
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de Edición */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={handleCloseModal}
          onSave={handleUserUpdated}
        />
      )}
    </>
  );
};

// Componente de tarjeta con botón EDITAR
interface UserEditCardProps {
  user: User;
  viewMode: 'grid' | 'list';
  onEdit: (user: User) => void;
}

const UserEditCard: React.FC<UserEditCardProps> = ({ user, viewMode, onEdit }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeClass = (roleName: string) => {
    return roleName === 'admin'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(user.role.role_name)}`}>
              {user.role.role_name}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">📧 {user.email}</p>
          <p className="text-xs text-gray-500">📅 Registrado: {formatDate(user.created_at)}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">ID: {user.id}</span>
          <button
            onClick={() => onEdit(user)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <span>✏️</span>
            Editar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(user.role.role_name)}`}>
          {user.role.role_name}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">📧 {user.email}</p>
        <p className="text-xs text-gray-500">📅 {formatDate(user.created_at)}</p>
        <p className="text-xs text-gray-400">ID: {user.id}</p>
      </div>

      <button
        onClick={() => onEdit(user)}
        className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
      >
        <span>✏️</span>
        Editar Usuario
      </button>
    </div>
  );
};