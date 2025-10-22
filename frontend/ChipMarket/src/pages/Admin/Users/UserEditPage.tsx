// src/pages/Admin/Users/UserEditPage.tsx

import React, { useState } from 'react';
import { useUserSearch } from '../../../hooks/useUserSearch';
import type { User } from '../../../types/user.types'; // Tipo User ya no UserApiResponse
import { EditUserModal } from '../../../components/users/EditUserModal';
// 1. Importa el nuevo componente Toast
import { ToastNotification } from '../../../components/common/ToastNotification'; 

// ¡Importamos el CSS que funciona!
import '../../../styles/UserListPage.css'; 

export const UserEditPage: React.FC = () => {
    // Seguimos usando tu hook para la lógica
    const {
        users,
        loading,
        error,
        refetchUsers // Usaremos esto para el botón de recarga
    } = useUserSearch();

    // Lógica para el Modal
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // 2. Nuevo estado para el mensaje del Toast
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
    };

    // 3. Modificamos handleUserUpdated
    const handleUserUpdated = (updatedUser: User) => {
        // Cerramos el modal
        setSelectedUser(null);
        // Recargamos los datos de la lista
        if (refetchUsers) {
            refetchUsers();
        }
        // ¡Mostramos el toast!
        setToastMessage('Usuario actualizado exitosamente');
    };

    // Copiamos la función de formato de fecha
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Copiamos los estados de Loading y Error
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

    // Copiamos y adaptamos el HTML principal
    return (
        <>
            {/* 4. Renderizamos el Toast aquí */}
            {toastMessage && (
                <ToastNotification 
                    message={toastMessage} 
                    onClose={() => setToastMessage(null)} 
                />
            )}
        
            <div className="user-list-container">
                {/* Header Adaptado */}
                <div className="user-list-header">
                    <div className="user-list-header__content">
                        <h2 className="user-list-header__title user-list-header__title--edit">
                            Editar Usuarios: {users.length}
                        </h2>
                        {/* El header de "Editar" no necesita botón de recarga,
                            pero puedes añadirlo si quieres con onClick={refetchUsers} */}
                    </div>
                </div>

                {/* Lista de usuarios Adaptada */}
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
                                    
                                    {/* AQUÍ ESTÁ EL CAMBIO MÁS IMPORTANTE (Botones) */}
                                    <div className="user-actions">
                                        <span className="user-actions__id">ID: {user.id}</span>
                                        
                                        {/* Usamos una nueva clase CSS que definiremos */}
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

            {/* Renderizamos el Modal al final */}
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