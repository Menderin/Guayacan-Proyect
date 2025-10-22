import React, { useState } from 'react';
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

interface UserListProps {
  users: User[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
  editMode?: boolean; // Nuevo prop para activar modo edición
}

export const UserListComponent: React.FC<UserListProps> = ({ 
  users, 
  loading, 
  error, 
  onReload,
  editMode = false 
}) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [localUsers, setLocalUsers] = useState<User[]>(users);

    // Actualizar usuarios locales cuando cambien los props
    React.useEffect(() => {
        setLocalUsers(users);
    }, [users]);

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
    };

    const handleUserUpdated = (updatedUser: User) => {
        // Actualizar la lista local
        setLocalUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === updatedUser.id ? updatedUser : user
            )
        );
        setSelectedUser(null);
        // Recargar la lista completa del servidor
        onReload();
    };
    
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
        <>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <span>👥</span>
                            Total de usuarios: {localUsers.length}
                        </h2>
                        {!editMode && (
                            <button 
                                onClick={onReload}
                                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <span>🔄</span>
                                Recargar
                            </button>
                        )}
                    </div>
                </div>

                {localUsers.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {localUsers.map(user => (
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
                                    
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-sm text-gray-400">ID: {user.id}</span>
                                        
                                        {/* Botones de acción */}
                                        <div className="flex gap-2 mt-2">
                                            {editMode && (
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-1"
                                                >
                                                    <span>✏️</span>
                                                    Editar
                                                </button>
                                            )}
                                            <button
                                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                                            >
                                                <span>📦</span>
                                                Ver pedidos
                                            </button>
                                        </div>
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