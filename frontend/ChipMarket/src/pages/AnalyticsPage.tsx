// src/pages/AnalyticsPage.tsx

import React from 'react';
import { useProductSearch } from '../hooks/useProductSearch';
import { FilterPanel } from '../components/products/FilterPanel'; 
import { InventoryMatchChart } from '../components/products/InventoryMatchChart'; 
import '../styles/AnalyticsPage.css'; 

// Importa el tipo Product correcto desde tu archivo de tipos
import type { Product } from '../types/product.types';


export const AnalyticsPage: React.FC = () => {
    const { 
        filters, 
        availableFilters, 
        handleFilterChange, 
        clearFilters,
        products, 
        loading,
        error,
        totalInStock,
    } = useProductSearch();

    const tableHeaders = [
        'SKU', 
        'Nombre', 
        'Categoria', 
        'Precio', 
        'Procesador', 
        'RAM', 
        'En Stock'
    ];
    
    // 🛑 FUNCIÓN PARA EXPORTAR A CSV
    const handleExportToCSV = () => {
        if (products.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        // Definir las cabeceras del archivo CSV
        const headers = tableHeaders.join(',') + '\n';
        
        // Mapear los datos de los productos a filas de CSV
        const csvRows = products.map((product: Product) => {
            const dataRow = [
                // Asegurar que los datos se mapean correctamente y entre comillas
                `"${product.sku || 'N/A'}"`, 
                `"${product.name}"`,
                `"${product.category || 'N/A'}"`,
                `${product.price.toFixed(2)}`, 
                `"${product.components.procesator || 'N/A'}"`,
                `"${product.components.ram || 'N/A'}"`,
                `"${product.stock ? 'Si' : 'No'}"`
            ];
            return dataRow.join(',');
        });

        // Combinar cabeceras y filas
        const csvContent = headers + csvRows.join('\n');

        // Crear y descargar el Blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) { 
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'resultados_analisis_' + new Date().toISOString().slice(0, 10) + '.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    // 🛑 FIN DE LA FUNCIÓN DE EXPORTACIÓN

    return (
        <div className="analytics-dashboard-content max-w-7xl mx-auto px-4 py-6">
            <div className="flex gap-6">
                
                {/* 1. Panel de Filtros y Controles de Vista */}
                <div className="filter-sidebar-wrapper">
                    
                   
                    
                    <div className="filter-panel-container">
                        <FilterPanel
                            filters={filters}
                            availableFilters={availableFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={clearFilters}
                        />
                    </div>
                </div>

                {/* 2. CONTENEDOR PRINCIPAL DE ANÁLISIS: Tabla y Gráficos */}
                <div style={{ display: 'flex', gap: '20px', flexGrow: 1 }}>

                    {/* 2a. Sección de la Tabla (65% de ancho) */}
                    <div className="analytics-main-view" style={{ flex: '1 1 65%' }}> 
                        <div className="bg-white p-6 rounded-lg shadow min-h-[500px]"> 
                            {/* 🛑 CABECERA DE TABLA Y BOTÓN CSV */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Resultados Tabulares ({products.length} productos)
                                </h2>
                                {/* 🛑 BOTÓN DE EXPORTAR CSV */}
                                <button 
                                    onClick={handleExportToCSV}
                                    disabled={loading || products.length === 0}
                                    style={{
                                        padding: '8px 15px',
                                        backgroundColor: '#10B981',
                                        color: 'white',
                                        borderRadius: '6px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        border: 'none',
                                        opacity: (loading || products.length === 0) ? 0.6 : 1
                                    }}
                                >
                                    Descargar reporte (Excel) 📥
                                </button>
                                {/* 🛑 FIN BOTÓN */}
                            </div>
                            
                            {loading && <p style={{ color: 'blue' }}>Cargando productos...</p>}
                            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                            
                            {!loading && !error && (
                                <div className="analytics-table-container"> 
                                    <table className="product-results-table"> 
                                        <thead> 
                                            <tr>
                                                {tableHeaders.map((header) => (
                                                    <th key={header} style={{ textAlign: header === 'Precio' || header === 'En Stock' ? 'center' : 'left' }}>
                                                        {header}
                                                    </th>
                                                ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan={tableHeaders.length} style={{ textAlign: 'center', fontStyle: 'italic' }}>
                                                    No hay productos que coincidan con los filtros aplicados.
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((product) => (
                                                <tr key={product._id}>
                                                    <td>{product.sku ? product.sku.substring(0, 8) + '...' : 'N/A'}</td>
                                                    <td>{product.name}</td>
                                                    <td>{product.category}</td>
                                                    <td style={{ color: '#065f46', fontWeight: 'bold', textAlign: 'center' }}>${product.price.toFixed(2)}</td>
                                                    <td>{product.components.procesator || 'N/A'}</td>
                                                    <td>{product.components.ram || 'N/A'}</td>
                                                    <td style={{ textAlign: 'center' }}> 
                                                        <span 
                                                            className={`status-badge ${product.stock ? 'status-in-stock' : 'status-out-stock'}`}
                                                        >
                                                            {product.stock ? 'Sí' : 'No'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    </div>
                
                    {/* 2b. Sección de Gráficos (35% de ancho) */}
                    <div style={{ flex: '0 0 35%' }}>
                        <div className="bg-white p-6 rounded-lg shadow h-[400px]">
                            {/* Ajuste de margen para subir el gráfico un poco (mb-4 a mb-2) */}
                            <h3 className="text-lg font-semibold text-gray-700 mb-2"> 
                                Coincidencia de Stock vs. Filtros
                            </h3>
                            <InventoryMatchChart
                                filteredCount={products.length}
                                totalInStock={totalInStock}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};