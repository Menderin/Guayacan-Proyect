/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserListPage } from '../../pages/Admin/Users/UserListPage'; // ← Correcto

import '../../styles/AdminDashboard.css';
import '../../styles/Management.css'; // Puedes reusar los estilos que ya creamos

export const UserManagement: React.FC = () => {
    const [activeUserTab, setActiveUserTab] = useState('list');
    const { user } = useAuth();

    const userTabs = [
        { id: 'list', name: 'Lista de Usuarios' },
        { id: 'search', name: 'Buscar Usuario' },
        { id: 'add', name: 'Agregar Usuario' },
        { id: 'edit', name: 'Editar Usuario' },
        { id: 'delete', name: 'Eliminar Usuario' },
    ];

    return (
        <div className="product-management-layout">
            <aside className="product-sidebar">
                <h3 className="product-sidebar__title">Gestión de Usuarios</h3>
                <nav className="product-sidebar__nav">
                    {userTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveUserTab(tab.id)}
                            className={`product-sidebar__tab ${
                                activeUserTab === tab.id ? 'product-sidebar__tab--active' : ''
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="product-content">
                {/* ✅ CORRECTO: Sin props */}
                {activeUserTab === 'list' && <UserListPage />}

                {activeUserTab === 'search' && (
                    <div className="admin-dashboard__placeholder">
                        <h2>Buscar Usuario</h2>
                        <p>Aquí irá el formulario para buscar usuarios.</p>
                    </div>
                )}

                {activeUserTab === 'add' && (
                    <div className="admin-dashboard__placeholder">
                        <h2>Agregar Nuevo Usuario</h2>
                        <p>Aquí irá el formulario para crear un usuario nuevo.</p>
                    </div>
                )}

                {activeUserTab === 'edit' && (
                    <div className="admin-dashboard__placeholder">
                        <h2>Editar Usuario</h2>
                        <p>Aquí irá la interfaz para seleccionar y editar un usuario existente.</p>
                    </div>
                )}

                {activeUserTab === 'delete' && (
                    <div className="admin-dashboard__placeholder">
                        <h2>Eliminar Usuario</h2>
                        <p>Aquí irá la interfaz para buscar y eliminar un usuario.</p>
                    </div>
                )}
            </main>
        </div>
    );
};