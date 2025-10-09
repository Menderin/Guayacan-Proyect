import React, { useState } from 'react';
import { Search, Grid, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProductSearchPage } from './ProductSearchPage';
import '../styles/AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('search');
  const { user } = useAuth();

  const tabs = [
    { id: 'search', name: 'Buscar Productos', icon: Search },
    { id: 'analytics', name: 'Análisis', icon: Grid },
    { id: 'settings', name: 'Configuración', icon: Filter }
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

      <div>
        {activeTab === 'search' && <ProductSearchPage />}
        {activeTab === 'analytics' && (
          <div className="admin-dashboard__content">
            <div className="admin-dashboard__placeholder">
              <h2 className="admin-dashboard__placeholder-title">Análisis</h2>
              <p className="admin-dashboard__placeholder-text">
                Sección de análisis en desarrollo
              </p>
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="admin-dashboard__content">
            <div className="admin-dashboard__placeholder">
              <h2 className="admin-dashboard__placeholder-title">Configuración</h2>
              <p className="admin-dashboard__placeholder-text">
                Sección de configuración en desarrollo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};