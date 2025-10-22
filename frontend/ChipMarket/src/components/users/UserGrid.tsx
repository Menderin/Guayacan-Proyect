// src/components/users/UserGrid.tsx

import React from 'react';
import { Loader2, User as UserIcon } from 'lucide-react';
import { UserCard } from './UserCard';
import { Pagination } from '../products/Pagination'; // Reutilizamos el componente de paginación
import type { User } from '../../types/user.types';
import type { Pagination as PaginationType } from '../../types/user.types';

interface UserGridProps {
  users: User[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  pagination: PaginationType;
  onPageChange: (page: number) => void;
  debouncedSearch: string;
}

export const UserGrid: React.FC<UserGridProps> = ({
  users,
  loading,
  error,
  viewMode,
  pagination,
  onPageChange,
  debouncedSearch
}) => {
  return (
    <div className="flex-1">
      {/* Contador de resultados */}
      {!loading && users.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Mostrando {((pagination.page - 1) * pagination.limit) + 1} -{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuarios
        </div>
      )}

      {/* Estado: Cargando */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Estado: Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Estado: Resultados encontrados */}
      {!loading && !error && users.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            // Vista Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <UserCard key={user.id} user={user} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            // Vista Lista (Tabla)
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <UserCard key={user.id} user={user} viewMode={viewMode} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación reutilizada */}
          <Pagination pagination={pagination} onPageChange={onPageChange} />
        </>
      )}

      {/* Estado: Sin resultados */}
      {!loading && !error && users.length === 0 && debouncedSearch && (
        <div className="text-center py-20">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-gray-600">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}

      {/* Estado: Búsqueda mínima requerida */}
      {!loading && !error && !debouncedSearch && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
          <UserIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Comienza tu búsqueda
          </h3>
          <p className="text-gray-600">
            Ingresa al menos 2 caracteres para buscar usuarios
          </p>
        </div>
      )}
    </div>
  );
};