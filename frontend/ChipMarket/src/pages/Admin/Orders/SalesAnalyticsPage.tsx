import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Tipos
interface ProductSale {
  sku: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  averagePrice: number;
}

interface SalesSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusBreakdown: Record<string, number>;
  topProducts: Array<{
    sku: string;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function SalesAnalyticsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'revenue' | 'quantity'>('revenue');

  // Cargar datos al montar y cuando cambien los filtros
  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate, status]);

  const fetchSalesData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Construir query params
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);

      const response = await fetch(`/api/orders/summary?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos de ventas');
      }

      const data = await response.json();
      setSummary(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatus('');
  };

  const handleExportCSV = () => {
    if (!summary || summary.topProducts.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Encabezado con información del período
    let periodInfo = 'REPORTE DE VENTAS POR PRODUCTO\n';
    periodInfo += `Generado el: ${new Date().toLocaleString('es-ES')}\n`;
    
    if (startDate && endDate) {
      periodInfo += `Período: ${startDate} al ${endDate}\n`;
    } else if (startDate) {
      periodInfo += `Desde: ${startDate}\n`;
    } else if (endDate) {
      periodInfo += `Hasta: ${endDate}\n`;
    } else {
      periodInfo += `Período: Todos los registros\n`;
    }
    
    if (status) {
      periodInfo += `Estado de Pedidos: ${status}\n`;
    }
    
    periodInfo += `Total de Pedidos: ${summary.totalOrders}\n`;
    periodInfo += `Ingresos Totales: ${summary.totalRevenue.toFixed(2)}\n`;
    periodInfo += `\n`;

    const headers = 'SKU,Nombre del Producto,Cantidad Vendida,Ingresos Totales,Precio Promedio\n';
    const rows = sortedProducts.map(p => 
      `"${p.sku}","${p.name}",${p.totalQuantity},${p.totalRevenue.toFixed(2)},${p.averagePrice.toFixed(2)}`
    ).join('\n');

    const csvContent = periodInfo + headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Nombre del archivo con las fechas si existen
    let filename = 'ventas_productos_';
    if (startDate && endDate) {
      filename += `${startDate}_al_${endDate}`;
    } else {
      filename += new Date().toISOString().slice(0, 10);
    }
    filename += '.csv';
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Productos ordenados según el criterio seleccionado
  const sortedProducts = summary?.topProducts
    .map(p => ({
      ...p,
      averagePrice: p.totalRevenue / p.totalQuantity
    }))
    .sort((a, b) => {
      if (sortBy === 'revenue') {
        return b.totalRevenue - a.totalRevenue;
      }
      return b.totalQuantity - a.totalQuantity;
    }) || [];

  // Datos para el gráfico de barras
  const chartData = sortedProducts.slice(0, 10).map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    Ventas: p.totalRevenue,
    Cantidad: p.totalQuantity
  }));

  // Datos para el gráfico de estados
  const statusData = summary ? Object.entries(summary.statusBreakdown).map(([name, value]) => ({
    name,
    value
  })) : [];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Análisis de Ventas por Producto
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Visualiza y analiza las ventas de productos por período
        </p>
      </div>

      {/* Panel de Filtros */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '24px', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            Filtros de Búsqueda
          </h3>
          <button
            onClick={handleClearFilters}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              color: '#6b7280',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Limpiar Filtros
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Estado del Pedido
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">Todos los estados</option>
              <option value="Pending">Pendiente</option>
              <option value="Completed">Completado</option>
              <option value="Cancelled">Cancelado</option>
              <option value="Processing">Procesando</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Ordenar Por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'revenue' | 'quantity')}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="revenue">Ingresos (Mayor a Menor)</option>
              <option value="quantity">Cantidad Vendida (Mayor a Menor)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      {!loading && summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total de Pedidos</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{summary.totalOrders}</p>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Ingresos Totales</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>${summary.totalRevenue.toFixed(2)}</p>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Valor Promedio de Pedido</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>${summary.averageOrderValue.toFixed(2)}</p>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Productos Diferentes</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>{summary.topProducts.length}</p>
          </div>
        </div>
      )}

      {/* Gráficos */}
      {!loading && summary && chartData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
              Top 10 Productos por {sortBy === 'revenue' ? 'Ingresos' : 'Cantidad'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Ventas" fill="#10b981" />
                <Bar dataKey="Cantidad" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
              Estados de Pedidos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <p>Cargando datos de ventas...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          border: '1px solid #fecaca', 
          padding: '16px', 
          borderRadius: '8px',
          color: '#991b1b',
          marginBottom: '24px'
        }}>
          Error: {error}
        </div>
      )}

      {/* Tabla de Productos */}
      {!loading && !error && summary && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              Productos Vendidos ({sortedProducts.length} productos)
            </h3>
            <button
              onClick={handleExportCSV}
              disabled={sortedProducts.length === 0}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: sortedProducts.length === 0 ? 'not-allowed' : 'pointer',
                opacity: sortedProducts.length === 0 ? 0.5 : 1
              }}
            >
              Exportar a CSV
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    #
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    SKU
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Nombre del Producto
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Cantidad Vendida
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Precio Promedio
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                    Ingresos Totales
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                      No hay productos para mostrar con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  sortedProducts.map((product, index) => (
                    <tr key={product.sku} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>
                        {product.sku.substring(0, 12)}...
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                        {product.name}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#111827', textAlign: 'center', fontWeight: '600' }}>
                        {product.totalQuantity}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280', textAlign: 'right' }}>
                        ${product.averagePrice.toFixed(2)}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#10b981', textAlign: 'right', fontWeight: '700' }}>
                        ${product.totalRevenue.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}