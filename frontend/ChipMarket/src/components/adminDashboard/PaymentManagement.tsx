/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreatePaymentPage } from '../../pages/Admin/Payments/CreatePaymentPage';
import { Search, DollarSign, BarChart3 } from 'lucide-react';
import '../../styles/AdminDashboard.css';
import '../../styles/Management.css';
export const PaymentManagement: React.FC = () => {
    const [activePaymentTab, setActivePaymentTab] = useState('add');
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
                {activePaymentTab === 'search' && (
                    <div style={{ 
                        padding: '4rem 2rem', 
                        textAlign: 'center', 
                        color: '#64748b',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <Search size={64} style={{ opacity: 0.3 }} />
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#475569' }}>
                            Consultar Historial de Pagos
                        </h2>
                        <p style={{ margin: 0, fontSize: '1rem' }}>
                            Esta funcionalidad estará disponible próximamente.
                        </p>
                    </div>
                )}
                {activePaymentTab === 'add' && <CreatePaymentPage />}
                {activePaymentTab === 'analytics' && (
                    <div style={{ 
                        padding: '4rem 2rem', 
                        textAlign: 'center', 
                        color: '#64748b',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <BarChart3 size={64} style={{ opacity: 0.3 }} />
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#475569' }}>
                            Análisis de Pagos
                        </h2>
                        <p style={{ margin: 0, fontSize: '1rem' }}>
                            Esta funcionalidad estará disponible próximamente.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};