// src/components/users/UserListComponent.tsx

import React from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  role: {
    role_name: string;
  };
}

interface UserListProps {
  users: User[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
}

export const UserListComponent: React.FC<UserListProps> = ({ users, loading, error, onReload }) => {
    
    if (loading) {
        return (
            <div className="bg-white shadow-md rounded-lg p-8">
                <p className="text-center text-gray-500">Cargando usuarios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow-md rounded-lg p-8">
                <div className="text-center text-red-500">
                    <p className="mb-4">Error al cargar: {error}</p>
                    <button 
                        onClick={onReload} 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
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

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Total de usuarios: {users.length}
                    </h2>
                    <button 
                        onClick={onReload}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                        Recargar
                    </button>
                </div>
            </div>

            {users.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {users.map(user => (
                        <li key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            {user.name}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(user.role.role_name)}`}>
                                            {user.role.role_name}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        📧 {user.email}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        📅 Registrado: {formatDate(user.created_at)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-400">ID: {user.id}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="p-8 text-center">
                    <p className="text-gray-500">No se encontraron usuarios.</p>
                </div>
            )}
        </div>
    );
};