// src/pages/Admin/Users/UserListPage.tsx

import React, { useState, useEffect } from 'react';
import type { User, UserApiResponse } from '../../../types/user.types';
import { UserOrdersPage } from './UserOrderPage';
import '../../../styles/UserListPage.css'; // Importar el CSS

export const UserListPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<{ id: number; name: string } | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('📡 Llamando a la API...');
            const response = await fetch('/api/users/all-users');
            
            console.log('📡 Status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const result: UserApiResponse = await response.json();
            console.log('📡 Respuesta:', result);
            
            if (result.success && result.data) {
                setUsers(result.data);
                console.log('✅ Usuarios cargados:', result.data.length);
            } else {
                throw new Error(result.message || 'Error al cargar usuarios');
            }
        } catch (err) {
            console.error('❌ Error:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Si hay un usuario seleccionado, mostrar sus pedidos
    if (selectedUser) {
        return (
            <UserOrdersPage
                userId={selectedUser.id}
                userName={selectedUser.name}
                onBack={() => setSelectedUser(null)}
            />
        );
    }

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
                    onClick={loadUsers}
                    className="user-list-state__retry-btn"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="user-list-container">
            {/* Header */}
            <div className="user-list-header">
                <div className="user-list-header__content">
                    <h2 className="user-list-header__title">
                        Total de usuarios: {users.length}
                    </h2>
                    <button
                        onClick={loadUsers}
                        className="user-list-header__reload-btn"
                    >
                        🔄 Recargar
                    </button>
                </div>
            </div>

            {/* Lista de usuarios */}
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
                                        onClick={() => setSelectedUser({ id: user.id, name: user.name })}
                                        className="user-actions__orders-btn"
                                    >
                                        Ver pedidos
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
    );
};