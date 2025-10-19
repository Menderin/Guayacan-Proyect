// src/pages/AnalyticsPage.tsx

import React from 'react';
import { useProductSearch } from '../../../hooks/useProductSearch';
import { FilterPanel } from '../../../components/products/FilterPanel'; 
import { InventoryMatchChart } from '../../../components/products/InventoryMatchChart'; 
import '../../../styles/AnalyticsPage.css'; 
import type { Product } from '../../../types/product.types';

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
    
    // Función para exportar a CSV
    const handleExportToCSV = () => {
        if (products.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }

        const headers = tableHeaders.join(',') + '\n';
        
        const csvRows = products.map((product: Product) => {
            const dataRow = [
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

        const csvContent = headers + csvRows.join('\n');

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

    return (
        <div className="analytics-dashboard-content">
            <div className="flex">
                
                {/* Panel de Filtros */}
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

                {/* Contenedor Principal: Tabla y Gráficos */}
                <div className="analytics-main-content">

                    {/* Sección de la Tabla */}
                    <div className="analytics-main-view">
                        <div className="analytics-table-section">
                            
                            {/* Header con título y botón */}
                            <div className="analytics-table-header">
                                <h2 className="analytics-table-title">
                                    Resultados ({products.length} productos)
                                </h2>
                                <button 
                                    onClick={handleExportToCSV}
                                    disabled={loading || products.length === 0}
                                    className="analytics-export-btn"
                                >
                                    Descargar reporte (Excel)
                                </button>
                            </div>
                            
                            {/* Estados: Loading, Error */}
                            {loading && (
                                <div className="analytics-state">
                                    <p className="analytics-state__message analytics-state__message--loading">
                                        Cargando productos...
                                    </p>
                                </div>
                            )}
                            
                            {error && (
                                <div className="analytics-state">
                                    <p className="analytics-state__message analytics-state__message--error">
                                        Error: {error}
                                    </p>
                                </div>
                            )}
                            
                            {/* Tabla de Productos */}
                            {!loading && !error && (
                                <div className="analytics-table-container">
                                    <table className="product-results-table">
                                        <thead>
                                            <tr>
                                                {tableHeaders.map((header) => (
                                                    <th 
                                                        key={header} 
                                                        style={{ 
                                                            textAlign: header === 'Precio' || header === 'En Stock' ? 'center' : 'left' 
                                                        }}
                                                    >
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length === 0 ? (
                                                <tr>
                                                    <td colSpan={tableHeaders.length}>
                                                        <div className="analytics-empty">
                                                            No hay productos que coincidan con los filtros aplicados.
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                products.map((product) => (
                                                    <tr key={product._id}>
                                                        <td>{product.sku ? product.sku.substring(0, 8) + '...' : 'N/A'}</td>
                                                        <td>{product.name}</td>
                                                        <td>{product.category}</td>
                                                        <td style={{ color: '#065f46', fontWeight: 'bold', textAlign: 'center' }}>
                                                            ${product.price.toFixed(2)}
                                                        </td>
                                                        <td>{product.components.procesator || 'N/A'}</td>
                                                        <td>{product.components.ram || 'N/A'}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span className={`status-badge ${product.stock ? 'status-in-stock' : 'status-out-stock'}`}>
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
                
                    {/* Sección de Gráficos */}
                    <div className="analytics-chart-view">
                        <div className="analytics-chart-section">
                            <h3 className="analytics-chart-title">
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