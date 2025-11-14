/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreatePaymentPage } from '../../pages/Admin/Payments/CreatePaymentPage';
import { Search, DollarSign, BarChart3 } from 'lucide-react';

import { SearchUserPayments } from '../../pages/Admin/Payments/SearchUserPayments';
import { PaymentReports } from './PaymentReports';

import '../../styles/AdminDashboard.css';
import '../../styles/Management.css';

export const PaymentManagement: React.FC = () => {
     const [activePaymentTab, setActivePaymentTab] = useState('search');
     const { user } = useAuth();
     const paymentTabs = [
        { id: 'search', name: 'Consultar historial de pagos', icon: Search },
         { id: 'add', name: 'Registrar pago', icon: DollarSign },
        { id: 'analytics', name: 'Análisis', icon: BarChart3 }
    ];
    return (
         <div className="product-management-layout">
             <aside className="product-sidebar">
                 <h3 className="product-sidebar__title">Gestión de Pagos</h3>
                     <nav className="product-sidebar__nav">
                         {paymentTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                             <button
                                key={tab.id}
                                onClick={() => setActivePaymentTab(tab.id)}
                                className={`product-sidebar__tab ${
                                    activePaymentTab === tab.id ? 'product-sidebar__tab--active' : ''
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
                {activePaymentTab === 'search' && <SearchUserPayments />}
                {activePaymentTab === 'add' && <CreatePaymentPage />}
                {activePaymentTab === 'analytics' && <PaymentReports />}
             </main>
        </div>
    );
};