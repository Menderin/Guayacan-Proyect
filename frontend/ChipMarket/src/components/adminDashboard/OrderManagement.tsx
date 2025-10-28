/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FilterOrders from '../../pages/Admin/Orders/FilterOrders';
import { UpdateOrderStatusPage } from '../../pages/Admin/Orders/UpdateOrderStatusPage';
import { CreateUserPage } from '../../pages/Admin/Users/CreateUserPage';
import { RefundManagementPage } from '../../pages/Admin/Orders/RefoundManagementPage';
import  SalesAnalyticsPage  from '../../pages/Admin/Orders/SalesAnalyticsPage';
import { Search, Users, UserPlus, UserPen, UserX} from 'lucide-react';

import '../../styles/AdminDashboard.css';
import '../../styles/Management.css';

export const OrderManagement: React.FC = () => {
    const [activeOrderTab, setActiveOrderTab] = useState('search');
    const { user } = useAuth();

    const userTabs = [
        { id: 'search', name: 'Consultar historial de pedidos', icon: Search },
        { id: 'add', name: 'Registrar pedido', icon: UserPlus},
        { id: 'edit', name: 'Actualizar estado de pedido', icon: UserPen },
        { id: 'refused', name: 'Gestión de reembolsos', icon: UserPen },
        { id: 'analytics', name: 'Análisis', icon: UserPen }
    ];

    return (
        <div className="product-management-layout">
            <aside className="product-sidebar">
                <h3 className="product-sidebar__title">Gestión de Pedidos</h3>
                <nav className="product-sidebar__nav">
                    {userTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveOrderTab(tab.id)}
                            className={`product-sidebar__tab ${
                                activeOrderTab === tab.id ? 'product-sidebar__tab--active' : ''
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="product-content">

                {activeOrderTab === 'search' && <FilterOrders />}

                {activeOrderTab === 'add' && <CreateUserPage />}

                {activeOrderTab === 'edit' && <UpdateOrderStatusPage />}

                {activeOrderTab === 'refused' && <RefundManagementPage />}

                {activeOrderTab === 'analytics' && <SalesAnalyticsPage />}

            </main>
        </div>
    );
};