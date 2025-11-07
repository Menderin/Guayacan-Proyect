/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FilterOrders from '../../pages/Admin/Orders/FilterOrders';
import { ConsultPaymentPage } from '../../pages/Admin/Orders/ConsultPaymentPage';

import { UserEditPage } from '../../pages/Admin/Users/UserEditPage';
import { CreateUserPage } from '../../pages/Admin/Users/CreateUserPage';
import { AnalyticsPage } from '../../pages/Admin/Product/AnalyticsPage';
import { Search, Users, UserPlus, UserPen, UserX} from 'lucide-react';

import '../../styles/AdminDashboard.css';
import '../../styles/Management.css';

export const PaymentManegement: React.FC = () => {
    const [activePaymentTab, setActivePaymentTab] = useState('search');
    const { user } = useAuth();

    const userTabs = [
        { id: 'search', name: 'Consultar historial de pagos', icon: Search },
        { id: 'add', name: 'Registrar pago', icon: UserPlus},
        { id: 'analytics', name: 'Análisis', icon: UserPen },
        { id: 'consult', name: 'Consultar pagos', icon: Users}
    ];

    return (
        <div className="product-management-layout">
            <aside className="product-sidebar">
                <h3 className="product-sidebar__title">Gestión de Pedidos</h3>
                <nav className="product-sidebar__nav">
                    {userTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActivePaymentTab(tab.id)}
                            className={`product-sidebar__tab ${
                                activePaymentTab === tab.id ? 'product-sidebar__tab--active' : ''
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="product-content">

                {activePaymentTab === 'search' && <FilterOrders />}

                {activePaymentTab === 'add' && <CreateUserPage />}

                {activePaymentTab === 'analytics' && <AnalyticsPage />}

                {activePaymentTab === 'consult' && <ConsultPaymentPage />}

            </main>
        </div>
    );
};