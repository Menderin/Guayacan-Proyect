// src/components/Payments/UserSearchCards.tsx

import React from 'react';
import { Loader2, User as UserIcon } from 'lucide-react';
import type { User } from '../../types/user.types';
import '../../styles/PaymentsCards.css';

interface UserSearchCardsProps {
  users: User[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  onUserSelect: (userId: number, userName: string) => void;
}

export const UserSearchCards: React.FC<UserSearchCardsProps> = ({
  users,
  loading,
  error,
  viewMode,
  onUserSelect
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className="payment-empty-state">
        <UserIcon className="payment-empty-state__icon" />
        <h3 className="payment-empty-state__title">
          No se encontraron usuarios
        </h3>
        <p className="payment-empty-state__description">
          Intenta con otros términos de búsqueda
        </p>
      </div>
    );
  }

  // Grid view
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => onUserSelect(user.id, user.name)}
            className="user-search-card"
          >
            <div className="user-search-card__content">
              <div className="user-search-card__avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-search-card__info">
                <h3 className="user-search-card__name">{user.name}</h3>
                <p className="user-search-card__email">{user.email}</p>
              </div>
            </div>
            <div className="user-search-card__cta">
              Click para ver pagos →
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List view (table)
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => onUserSelect(user.id, user.name)}
              className="user-table-row"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="user-table-row__avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Ver pagos →
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};