// src/pages/Admin/Users/UserEditPage.tsx

import React, { useState } from 'react';
import { useUserSearch } from '../../../hooks/useUserSearch';
import type { User } from '../../../types/user.types';
import { EditUserModal } from '../../../components/users/EditUserModal';
import { ToastNotification } from '../../../components/common/ToastNotification'; 
import '../../../styles/UserListPage.css'; 

export const UserEditPage: React.FC = () => {
    // ⬅️ CAMBIO CLAVE: Pasar loadAllOnMount: true
    const {
        users,
        loading,
        error,
        refetchUsers
    } = useUserSearch({ loadAllOnMount: true });

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
    };

    const handleUserUpdated = (updatedUser: User) => {
        setSelectedUser(null);
        if (refetchUsers) {
            refetchUsers();
        }
        setToastMessage('Usuario actualizado exitosamente');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="user-list-state">
                <p className="user-list-state__message user-list-state__message--loading">
                    Cargando usuarios...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-list-state">
                <p className="user-list-state__message user-list-state__message--error">
                    Error: {error}
                </p>
                <button
                    onClick={() => refetchUsers && refetchUsers()}
                    className="user-list-state__retry-btn"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <>
            {toastMessage && (
                <ToastNotification 
                    message={toastMessage} 
                    onClose={() => setToastMessage(null)} 
                />
            )}
        
            <div className="user-list-container">
                <div className="user-list-header">
                    <div className="user-list-header__content">
                        <h2 className="user-list-header__title user-list-header__title--edit">
                            Editar Usuarios: {users.length}
                        </h2>
                        <button
                            onClick={refetchUsers}
                            className="user-list-header__reload-btn"
                        >
                            🔄 Recargar
                        </button>
                    </div>
                </div>

                {users.length > 0 ? (
                    <ul className="user-list">
                        {users.map(user => (
                            <li key={user.id} className="user-list__item">
                                <div className="user-list__content">
                                    <div className="user-info">
                                        <div className="user-info__header">
                                            <h3 className="user-info__name">
                                                {user.name}
                                            </h3>
                                            <span
                                                className={`user-info__role-badge ${
                                                    user.role.role_name === 'admin'
                                                        ? 'user-info__role-badge--admin'
                                                        : 'user-info__role-badge--customer'
                                                }`}
                                            >
                                                {user.role.role_name}
                                            </span>
                                        </div>
                                        <p className="user-info__email">
                                            {user.email}
                                        </p>
                                        <p className="user-info__date">
                                            Registrado: {formatDate(user.created_at)}
                                        </p>
                                    </div>
                                    
                                    <div className="user-actions">
                                        <span className="user-actions__id">ID: {user.id}</span>
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className="user-actions__edit-btn"
                                        >
                                            Editar
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="user-list-empty">
                        <p className="user-list-empty__message">
                            No se encontraron usuarios.
                        </p>
                    </div>
                )}
            </div>

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