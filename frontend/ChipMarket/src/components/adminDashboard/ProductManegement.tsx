// src/components/ProductManagement.tsx (o donde lo vayas a ubicar)

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// Importa tus componentes reales aquí cuando los tengas
// import { ProductListPage } from './ProductListPage';
// import { AddProductPage } from './AddProductPage';

import {ProductSearchPage} from '../../pages/Admin/Product/ProductSearchPage';
import { AnalyticsPage } from '../../pages/Admin/Product/AnalyticsPage';

// Importa los estilos
import '../../styles/AdminDashboard.css'; // Puedes reusar los estilos que ya creamos
import '../../styles/Management.css';

export const ProductManagement: React.FC = () => {
    const [activeProductTab, setActiveProductTab] = useState('list');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                {/* Aquí se renderiza el contenido según el tab activo */}
                {activeProductTab === 'list' && (
                    <div>
                        <h2>Lista de Productos</h2>
                        <p>Aquí irá tu componente para mostrar y paginar todos los productos.</p>
                        {/* Ejemplo: <ProductListPage /> */}
                    </div>
                )}
                {activeProductTab === 'search' && (
                    <ProductSearchPage />
                )}
                {activeProductTab === 'add' && (
                    <div>
                        <h2>Agregar Nuevo Producto</h2>
                        <p>Aquí irá el formulario para crear un producto nuevo.</p>
                        {/* Ejemplo: <AddProductPage /> */}
                    </div>
                )}
                {activeProductTab === 'edit' && (
                    <div>
                        <h2>Editar Producto</h2>
                        <p>Aquí irá la interfaz para seleccionar y editar un producto existente.</p>
                    </div>
                )}
                {activeProductTab === 'delete' && (
                    <div>
                        <h2>Eliminar Producto</h2>
                        <p>Aquí irá la interfaz para buscar y eliminar un producto.</p>
                    </div>
                )}
                {activeProductTab === 'analytics' && (
                    <AnalyticsPage />
                )}
            </main>
        </div>
    );
};