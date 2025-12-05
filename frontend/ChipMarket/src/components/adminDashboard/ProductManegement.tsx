// src/components/ProductManagement.tsx (o donde lo vayas a ubicar)

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// import { ProductListPage } from './ProductListPage';
// import { AddProductPage } from './AddProductPage';

import { ProductListPage } from '../../pages/Admin/Product/ProductListPage';
import {ProductSearchPage} from '../../pages/Admin/Product/ProductSearchPage';
import { AnalyticsPage } from '../../pages/Admin/Product/AnalyticsPage';

import '../../styles/AdminDashboard.css'; 
import '../../styles/Management.css';
import { AddProductPage } from '../../pages/Admin/Product/AddProductPage';
import { EditProductPage } from '../../pages/Admin/Product/EditProductPage';
import { DeleteProductPage } from '../../pages/Admin/Product/DeleteProductPage';

export const ProductManagement: React.FC = () => {
    const [activeProductTab, setActiveProductTab] = useState('list');
    const { user } = useAuth(); // Lo mantenemos por si lo necesitas dentro de algún sub-componente

    const productTabs = [
        { id: 'list', name: 'Lista de Productos' },
        { id: 'search', name: 'Buscar Producto' },
        { id: 'add', name: 'Agregar Producto' },
        { id: 'edit', name: 'Editar Producto' },
        { id: 'delete', name: 'Eliminar Producto' },
        { id: 'analytics', name: 'Análisis' }
    ];

    return (
        <div className="product-management-layout">
            {/* --- 1. Barra Lateral Vertical (Sidebar) --- */}
            <aside className="product-sidebar">
                <h3 className="product-sidebar__title">Gestión de Productos</h3>
                <nav className="product-sidebar__nav">
                    {productTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveProductTab(tab.id)}
                            className={`product-sidebar__tab ${
                                activeProductTab === tab.id ? 'product-sidebar__tab--active' : ''
                            }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* --- 2. Contenido Principal Dinámico --- */}
            <main className="product-content">
                {}
                {activeProductTab === 'list' && (
                    <ProductListPage />
                )}
                {activeProductTab === 'search' && (
                    <ProductSearchPage />
                )}
                {activeProductTab === 'add' && (
                    <AddProductPage/>
                )}
                {activeProductTab === 'edit' && (
                    <EditProductPage />
                )}
                {activeProductTab === 'delete' && (
                    <DeleteProductPage />
                )}
                {activeProductTab === 'analytics' && (
                    <AnalyticsPage />
                )}
            </main>
        </div>
    );
};