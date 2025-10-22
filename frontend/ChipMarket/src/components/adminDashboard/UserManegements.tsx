/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserListPage } from '../../pages/Admin/Users/UserListPage';
import { UserSearchPage } from '../../pages/Admin/Users/UserSearchPage';
import { UserEditPage } from '../../pages/Admin/Users/UserEditPage';
import { CreateUserPage } from '../../pages/Admin/Users/CreateUserPage';
import { DeleteUserPage } from '../../pages/Admin/Users/DeleteUserPage';
import { Search, Users, UserPlus, UserPen, UserX} from 'lucide-react';

import '../../styles/AdminDashboard.css';
import '../../styles/Management.css';

export const UserManagement: React.FC = () => {
    const [activeUserTab, setActiveUserTab] = useState('list');
    const { user } = useAuth();

    const userTabs = [
        { id: 'list', name: 'Lista de Usuarios', icon:  Users},
        { id: 'search', name: 'Buscar Usuario', icon: Search },
        { id: 'add', name: 'Agregar Usuario', icon: UserPlus},
        { id: 'edit', name: 'Editar Usuario', icon: UserPen },
        { id: 'delete', name: 'Eliminar Usuario', icon: UserX },
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
                {activeUserTab === 'list' && <UserListPage />}

                {activeUserTab === 'search' && <UserSearchPage />}

                {activeUserTab === 'add' && <CreateUserPage />}

                {activeUserTab === 'edit' && <UserEditPage />}

                {activeUserTab === 'delete' && <DeleteUserPage />}
            </main>
        </div>
    );
};