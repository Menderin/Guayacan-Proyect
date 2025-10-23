import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Package, Calendar } from 'lucide-react';

interface Order {
  id_order: number;
  user_id: number;
  order_date: string;
  status: string;
  total_amount: string;
  details: Array<{
    id_detail_order: number;
    order_id: number;
    product_sku: string;
    quantity: number;
    price: string;
  }>;
}

interface Product {
  _id: string;
  sku: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface MonthlySales {
  month: string;
  ventas: number;
  ordenes: number;
}

interface ProductStats {
  sku: string;
  name: string;
  quantity: number;
  revenue: number;
  category: string;
  procesator?: string;
  ram?: string;
  gpu?: string;
  garantee?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function SalesAnalytics() {
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
  const [topProducts, setTopProducts] = useState<ProductStats[]>([]);
  const [worstProducts, setWorstProducts] = useState<ProductStats[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [processorStats, setProcessorStats] = useState<any[]>([]);
  const [ramStats, setRamStats] = useState<any[]>([]);
  const [gpuStats, setGpuStats] = useState<any[]>([]);
  const [garanteeStats, setGaranteeStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'category' | 'processor' | 'ram' | 'gpu' | 'garantee'>('category');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener pedidos completados
      const response = await fetch('http://localhost:3000/api/orders/order/status/Completed');
      
      if (!response.ok) {
        throw new Error('Error al cargar los pedidos');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data || data.data.length === 0) {
        setLoading(false);
        setError('No hay pedidos completados para mostrar');
        return;
      }

      const orders: Order[] = data.data;
      
      // Calcular totales
      const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      setTotalRevenue(revenue);
      setTotalOrders(orders.length);

      // Procesar ventas por mes
      const salesByMonth = processMonthlySales(orders);
      setMonthlySales(salesByMonth);

      // Procesar productos más vendidos
      const productStats = await processProductStats(orders);
      
      if (productStats.length === 0) {
        setLoading(false);
        setError('No se pudieron cargar los detalles de productos');
        return;
      }
      
      // Top 5 productos más vendidos
      const sorted = [...productStats].sort((a, b) => b.quantity - a.quantity);
      setTopProducts(sorted.slice(0, 5));
      
      // Top 5 productos menos vendidos (pero que se hayan vendido)
      setWorstProducts(sorted.slice(-5).reverse());

      // Estadísticas por categoría
      const categorySales = processCategoryStats(productStats);
      setCategoryStats(categorySales);

      // Estadísticas por procesador
      const processorSales = processProcessorStats(productStats);
      setProcessorStats(processorSales);

      // Estadísticas por RAM
      const ramSales = processRamStats(productStats);
      setRamStats(ramSales);

      // Estadísticas por GPU
      const gpuSales = processGpuStats(productStats);
      setGpuStats(gpuSales);

      // Estadísticas por garantía
      const garanteeSales = processGaranteeStats(productStats);
      setGaranteeStats(garanteeSales);

    } catch (error) {
      console.error('Error al cargar análisis:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const processMonthlySales = (orders: Order[]): MonthlySales[] => {
    const monthlyData: { [key: string]: { ventas: number; ordenes: number } } = {};
    
    orders.forEach(order => {
      const date = new Date(order.order_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { ventas: 0, ordenes: 0 };
      }
      
      monthlyData[monthKey].ventas += parseFloat(order.total_amount);
      monthlyData[monthKey].ordenes += 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' }),
          ventas: Math.round(data.ventas),
          ordenes: data.ordenes
        };
      });
  };

  const processProductStats = async (orders: Order[]): Promise<ProductStats[]> => {
    const productMap: { [sku: string]: { quantity: number; revenue: number } } = {};
    
    // Agregar cantidades y ingresos por SKU
    orders.forEach(order => {
      if (order.details && Array.isArray(order.details)) {
        order.details.forEach(detail => {
          if (!productMap[detail.product_sku]) {
            productMap[detail.product_sku] = { quantity: 0, revenue: 0 };
          }
          productMap[detail.product_sku].quantity += detail.quantity;
          productMap[detail.product_sku].revenue += parseFloat(detail.price) * detail.quantity;
        });
      }
    });

    // Obtener información de productos
    const productStats: ProductStats[] = [];
    
    for (const [sku, stats] of Object.entries(productMap)) {
      try {
        const response = await fetch(`http://localhost:3000/api/search?sku=${sku}`);
        const data = await response.json();
        
        if (data.success && data.data.products && data.data.products.length > 0) {
          const product = data.data.products[0];
          productStats.push({
            sku: product.sku,
            name: product.name,
            quantity: stats.quantity,
            revenue: stats.revenue,
            category: product.category,
            procesator: product.components?.procesator || 'N/A',
            ram: product.components?.ram || 'N/A',
            gpu: product.components?.gpu || 'N/A',
            garantee: product.garantee || 'N/A'
          });
        }
      } catch (error) {
        console.error(`Error al obtener producto ${sku}:`, error);
      }
    }

    return productStats;
  };

  const processCategoryStats = (productStats: ProductStats[]) => {
    const categoryMap: { [category: string]: number } = {};
    
    productStats.forEach(product => {
      if (!categoryMap[product.category]) {
        categoryMap[product.category] = 0;
      }
      categoryMap[product.category] += product.revenue;
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));
  };

  const processProcessorStats = (productStats: ProductStats[]) => {
    const processorMap: { [processor: string]: number } = {};
    
    productStats.forEach(product => {
      const processor = product.procesator || 'N/A';
      if (!processorMap[processor]) {
        processorMap[processor] = 0;
      }
      processorMap[processor] += product.revenue;
    });

    return Object.entries(processorMap).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));
  };

  const processRamStats = (productStats: ProductStats[]) => {
    const ramMap: { [ram: string]: number } = {};
    
    productStats.forEach(product => {
      const ram = product.ram || 'N/A';
      if (!ramMap[ram]) {
        ramMap[ram] = 0;
      }
      ramMap[ram] += product.revenue;
    });

    return Object.entries(ramMap).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));
  };

  const processGpuStats = (productStats: ProductStats[]) => {
    const gpuMap: { [gpu: string]: number } = {};
    
    productStats.forEach(product => {
      const gpu = product.gpu || 'N/A';
      if (!gpuMap[gpu]) {
        gpuMap[gpu] = 0;
      }
      gpuMap[gpu] += product.revenue;
    });

    return Object.entries(gpuMap).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));
  };

  const processGaranteeStats = (productStats: ProductStats[]) => {
    const garanteeMap: { [garantee: string]: number } = {};
    
    productStats.forEach(product => {
      const garantee = product.garantee || 'N/A';
      if (!garanteeMap[garantee]) {
        garanteeMap[garantee] = 0;
      }
      garanteeMap[garantee] += product.revenue;
    });

    return Object.entries(garanteeMap).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-CL')}`;
  };

  // Obtener los datos actuales según el filtro activo
  const getCurrentFilterData = () => {
    switch (activeFilter) {
      case 'processor':
        return processorStats;
      case 'ram':
        return ramStats;
      case 'gpu':
        return gpuStats;
      case 'garantee':
        return garanteeStats;
      default:
        return categoryStats;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #e2e8f0', 
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#64748b' }}>Cargando análisis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
        <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Error al cargar análisis</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error}</p>
        <button
          onClick={fetchAnalytics}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .stats-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }
        .stats-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
      `}</style>

      {/* Resumen General */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={24} />
            <h3 style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>Ingresos Totales</h3>
          </div>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{formatCurrency(totalRevenue)}</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(240,147,251,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Calendar size={24} />
            <h3 style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>Órdenes Completadas</h3>
          </div>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{totalOrders}</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(79,172,254,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Package size={24} />
            <h3 style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>Ticket Promedio</h3>
          </div>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            {formatCurrency(totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0)}
          </p>
        </div>
      </div>

      {/* Gráfico de Ventas Mensuales */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
          📊 Ventas por Mes
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={3} name="Ventas" />
            <Line type="monotone" dataKey="ordenes" stroke="#10b981" strokeWidth={3} name="Órdenes" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Productos Más y Menos Vendidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Top 5 Más Vendidos */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#10b981" />
            Top 5 Productos Más Vendidos
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" width={150} stroke="#64748b" style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                formatter={(value: number, name: string) => name === 'quantity' ? [`${value} unidades`, 'Cantidad'] : [formatCurrency(value), 'Ingresos']}
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Bar dataKey="quantity" fill="#10b981" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Menos Vendidos */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingDown size={20} color="#ef4444" />
            Top 5 Productos Menos Vendidos
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={worstProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" width={150} stroke="#64748b" style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                formatter={(value: number, name: string) => name === 'quantity' ? [`${value} unidades`, 'Cantidad'] : [formatCurrency(value), 'Ingresos']}
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Bar dataKey="quantity" fill="#ef4444" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ventas por Categoría con Filtros */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
            📈 Análisis de Ventas
          </h2>
          
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveFilter('category')}
              style={{
                padding: '0.5rem 1rem',
                background: activeFilter === 'category' ? '#3b82f6' : '#f1f5f9',
                color: activeFilter === 'category' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.3s ease'
              }}
            >
              Categoría
            </button>
            <button
              onClick={() => setActiveFilter('processor')}
              style={{
                padding: '0.5rem 1rem',
                background: activeFilter === 'processor' ? '#3b82f6' : '#f1f5f9',
                color: activeFilter === 'processor' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.3s ease'
              }}
            >
              Procesador
            </button>
            <button
              onClick={() => setActiveFilter('ram')}
              style={{
                padding: '0.5rem 1rem',
                background: activeFilter === 'ram' ? '#3b82f6' : '#f1f5f9',
                color: activeFilter === 'ram' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.3s ease'
              }}
            >
              Memoria RAM
            </button>
            <button
              onClick={() => setActiveFilter('gpu')}
              style={{
                padding: '0.5rem 1rem',
                background: activeFilter === 'gpu' ? '#3b82f6' : '#f1f5f9',
                color: activeFilter === 'gpu' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.3s ease'
              }}
            >
              Tarjeta Gráfica
            </button>
            <button
              onClick={() => setActiveFilter('garantee')}
              style={{
                padding: '0.5rem 1rem',
                background: activeFilter === 'garantee' ? '#3b82f6' : '#f1f5f9',
                color: activeFilter === 'garantee' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.3s ease'
              }}
            >
              Garantía
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getCurrentFilterData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {getCurrentFilterData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
          
          <div>
            {getCurrentFilterData().map((stat, index) => (
              <div key={stat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', marginBottom: '0.5rem', background: '#f8fafc', borderRadius: '8px', borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{stat.name}</span>
                <span style={{ color: '#64748b' }}>{formatCurrency(stat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}