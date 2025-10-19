// src/components/users/UserCard.tsx

import React from 'react';
import { User as UserIcon, Mail, Calendar } from 'lucide-react';
import type { User } from '../../types/user.types';

interface UserCardProps {
  user: User;
  viewMode: 'grid' | 'list';
}

export const UserCard: React.FC<UserCardProps> = ({ user, viewMode }) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (viewMode === 'list') {
    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 rounded-full p-2 flex-shrink-0">
              <UserIcon className="text-indigo-600 w-5 h-5" />
            </div>
            <span className="font-medium text-gray-800">{user.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-gray-600">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            {user.email}
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {user.role.role_name}
          </span>
        </td>
        <td className="px-6 py-4 text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(user.created_at)}
          </div>
        </td>
      </tr>
    );
  }

  // Vista Grid
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100">
      <div className="flex items-start gap-4">
        <div className="bg-indigo-100 rounded-full p-3 flex-shrink-0">
          <UserIcon className="text-indigo-600 w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-800 truncate mb-3">
            {user.name}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{formatDate(user.created_at)}</span>
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {user.role.role_name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};