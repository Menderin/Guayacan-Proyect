// src/pages/AdminDashboard.tsx

import React, { useState } from 'react';
import { Search, Barcode, Users, ShoppingBasket, BadgeDollarSign, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Asegúrate de que este import esté aquí
//Importacion de componentes
import { Home } from '..//components/adminDashboard/Home';
import { ProductManagement } from '../components/adminDashboard/ProductManegement';
import { UserManagement } from '../components/adminDashboard/UserManegements';
import { OrderManagement } from '../components/adminDashboard/OrderManagement';
import { PaymentManegement } from '../components/adminDashboard/PaymentManagement';

import '../styles/AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('home');
    const { user, logout } = useAuth();

    const tabs = [
        { id: 'home', name: 'Inicio', icon: Search },
        { id: 'products', name: 'Gestionar Productos', icon: Barcode },
        { id: 'users', name: 'Gestionar Usuarios', icon: Users },
        { id: 'orders', name: 'Gestionar Órdenes/Pedidos', icon: ShoppingBasket },
        { id: 'payments', name: 'Gestionar Pagos', icon: BadgeDollarSign },
        { id: 'logout', name: 'Cerrar Sesión', icon: LogOut },
    ];

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard__header">
                <div className="admin-dashboard__header-content">
                    <div className="admin-dashboard__top">
                        <div>
                            <h1 className="admin-dashboard__title">Dashboard Admin</h1>
                            <p className="admin-dashboard__subtitle">Bienvenido, {user?.name}</p>
                        </div>
                        <div className="admin-dashboard__user-badge">
                            {user?.id_role === 1 ? 'Admin' : 'User'}
                        </div>
                    </div>

                    <div className="admin-dashboard__tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`admin-dashboard__tab ${
                                        activeTab === tab.id ? 'admin-dashboard__tab--active' : ''
                                    }`}
                                >
                                    <Icon className="admin-dashboard__tab-icon" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bloque de Contenido - Modificado */}
            <div>
                {activeTab === 'home' && <Home />}

                {activeTab === 'products' && <ProductManagement />}
                
                {activeTab === 'users' && <UserManagement />}

                {activeTab === 'orders' && <OrderManagement />}

                {activeTab === 'payments' && <PaymentManegement />}

                {activeTab === 'logout' && (
                    <div className="admin-dashboard__content">
                        <div className="admin-dashboard__placeholder">
                            <h2 className="admin-dashboard__placeholder-title">Cerrar Sesión</h2>
                            <p className="admin-dashboard__placeholder-text">
                                Necesitas confirmar para cerrar sesión.
                            </p>
                            <button className="logout-confirm-btn"onClick={logout}>Confirmar Cerrar Sesión</button>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};