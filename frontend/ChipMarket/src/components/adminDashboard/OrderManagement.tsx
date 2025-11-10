/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FilterOrders from '../../pages/Admin/Orders/FilterOrders';
import { CreateOrderPage } from '../../pages/Admin/Orders/CreateOrderPage';
import { UpdateOrderStatusPage } from '../../pages/Admin/Orders/UpdateOrderStatusPage';
import { RefundManagementPage } from '../../pages/Admin/Orders/RefoundManagementPage';
import SalesAnalyticsPage from '../../pages/Admin/Orders/SalesAnalyticsPage';
import { Search, ShoppingCart, Edit, RefreshCcw, BarChart3 } from 'lucide-react';
import '../../styles/AdminDashboard.css';
import '../../styles/Management.css';

export const OrderManagement: React.FC = () => {
    const [activeOrderTab, setActiveOrderTab] = useState('search');
    const { user } = useAuth();

    const orderTabs = [
        { id: 'search', name: 'Consultar historial de pedidos', icon: Search },
        { id: 'add', name: 'Registrar pedido', icon: ShoppingCart },
        { id: 'edit', name: 'Actualizar estado de pedido', icon: Edit },
        { id: 'refused', name: 'Gestión de reembolsos', icon: RefreshCcw },
        { id: 'analytics', name: 'Análisis', icon: BarChart3 }
    ];

    return (
        <div className="product-management-layout">
            <aside className="product-sidebar">
                <h3 className="product-sidebar__title">Gestión de Pedidos</h3>
                <nav className="product-sidebar__nav">
                    {orderTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveOrderTab(tab.id)}
                                className={`product-sidebar__tab ${
                                    activeOrderTab === tab.id ? 'product-sidebar__tab--active' : ''
                                }`}
                            >
                                <Icon size={18} style={{ marginRight: '0.5rem' }} />
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            <main className="product-content">
                {activeOrderTab === 'search' && <FilterOrders />}
                {activeOrderTab === 'add' && <CreateOrderPage />}
                {activeOrderTab === 'edit' && <UpdateOrderStatusPage />}
                {activeOrderTab === 'refused' && <RefundManagementPage />}
                {activeOrderTab === 'analytics' && <SalesAnalyticsPage />}
            </main>
        </div>
    );
};