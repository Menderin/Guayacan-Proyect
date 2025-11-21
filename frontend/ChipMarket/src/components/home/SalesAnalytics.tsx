import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart 
} from 'recharts';
import { TrendingUp, TrendingDown, Package, Calendar } from 'lucide-react';

interface OrderDetail {
  id_detail_order: number;
  product_sku: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    sku: string;
    name: string;
    category: string;
    stock: number;
  } | null;
}

interface Order {
  id_order: number;
  user_id: number;
  order_date: string;
  status: string;
  total_amount: number;
  details: OrderDetail[];
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
  price: number; 
  category: string;
  procesator?: string;
  ram?: string;
  gpu?: string;
  garantee?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function SalesAnalytics() {
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
      
      // ✅ URL ACTUALIZADA - ahora es /status/:status
      const API_BASE = 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/orders/status/Completed`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Datos recibidos:', data);
      
      if (!data.success || !data.data || data.data.length === 0) {
        setLoading(false);
        setError('No hay pedidos completados para mostrar');
        return;
      }

      const orders: Order[] = data.data;
      console.log('📦 Total de pedidos:', orders.length);
      
      // Calcular totales
      const revenue = orders.reduce((sum, order) => {
        const amount = typeof order.total_amount === 'string' 
          ? parseFloat(order.total_amount) 
          : order.total_amount;
        return sum + amount;
      }, 0);
      
      setTotalRevenue(revenue);
      setTotalOrders(orders.length);

      // Procesar ventas por mes
      const salesByMonth = processMonthlySales(orders);
      setMonthlySales(salesByMonth);

      // Procesar productos más vendidos
      const productStats = await processProductStats(orders);
      
      if (productStats.length === 0) {
        console.warn('⚠️ No se encontraron estadísticas de productos');
        // No lanzar error, continuar con datos parciales
      }
      
      // Top 5 productos más vendidos
      const sorted = [...productStats].sort((a, b) => b.quantity - a.quantity);
      setTopProducts(sorted.slice(0, 5));
      
      // Top 5 productos menos vendidos
      setWorstProducts(sorted.slice(-5).reverse());

      // Estadísticas por categoría
      const categorySales = processCategoryStats(productStats);
      setCategoryStats(categorySales);

      // Estadísticas por componentes
      setProcessorStats(processProcessorStats(productStats));
      setRamStats(processRamStats(productStats));
      setGpuStats(processGpuStats(productStats));
      setGaranteeStats(processGaranteeStats(productStats));

    } catch (error) {
      console.error('❌ Error al cargar análisis:', error);
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
      
      const amount = typeof order.total_amount === 'string' 
        ? parseFloat(order.total_amount) 
        : order.total_amount;
      
      monthlyData[monthKey].ventas += amount;
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
    const productMap: { [sku: string]: { 
      quantity: number; 
      revenue: number;
      price: number; 
      name: string;
      category: string;
    } } = {};
    
    orders.forEach(order => {
      if (order.details && Array.isArray(order.details)) {
        order.details.forEach(detail => {
          const rawPrice = detail.price || 0;
          const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice;

          if (!productMap[detail.product_sku]) {
            productMap[detail.product_sku] = { 
              quantity: 0, 
              revenue: 0,
              price: price, 
              name: detail.product?.name || detail.product_sku,
              category: detail.product?.category || 'Sin categoría'
            };
          }
          
          productMap[detail.product_sku].quantity += detail.quantity;
          productMap[detail.product_sku].revenue += price * detail.quantity;
          
          if (price > 0) {
            productMap[detail.product_sku].price = price;
          }
        });
      }
    });

    const productStats: ProductStats[] = [];
    const API_BASE = 'http://localhost:3000';
    
    for (const [sku, stats] of Object.entries(productMap)) {
      const safePrice = stats.price || 0; 

      try {
        const response = await fetch(`${API_BASE}/api/search?sku=${sku}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data.products && data.data.products.length > 0) {
            const product = data.data.products[0];
            
            const apiPrice = product.price ? (typeof product.price === 'string' ? parseFloat(product.price) : product.price) : 0;
            const finalPrice = apiPrice > 0 ? apiPrice : safePrice;

            productStats.push({
              sku: product.sku,
              name: product.name,
              quantity: stats.quantity,
              revenue: stats.revenue,
              price: finalPrice, 
              category: product.category,
              procesator: product.components?.procesator || 'N/A',
              ram: product.components?.ram || 'N/A',
              gpu: product.components?.gpu || 'N/A',
              garantee: product.garantee || 'N/A'
            });
            continue;
          }
        }
        
        productStats.push({
          sku,
          name: stats.name,
          quantity: stats.quantity,
          revenue: stats.revenue,
          price: safePrice, 
          category: stats.category,
          procesator: 'N/A',
          ram: 'N/A',
          gpu: 'N/A',
          garantee: 'N/A'
        });
      } catch (error) {
        console.error(`❌ Error al obtener producto ${sku}:`, error);
        productStats.push({
          sku,
          name: stats.name,
          quantity: stats.quantity,
          revenue: stats.revenue,
          price: safePrice, 
          category: stats.category,
          procesator: 'N/A',
          ram: 'N/A',
          gpu: 'N/A',
          garantee: 'N/A'
        });
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

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
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

    return Object.entries(processorMap)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .filter(item => item.name !== 'N/A')
      .sort((a, b) => b.value - a.value);
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

    return Object.entries(ramMap)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .filter(item => item.name !== 'N/A')
      .sort((a, b) => b.value - a.value);
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

    return Object.entries(gpuMap)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .filter(item => item.name !== 'N/A')
      .sort((a, b) => b.value - a.value);
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

    return Object.entries(garanteeMap)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .filter(item => item.name !== 'N/A')
      .sort((a, b) => b.value - a.value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };

  const getCurrentFilterData = () => {
    switch (activeFilter) {
      case 'processor':
        return processorStats.length > 0 ? processorStats : [{ name: 'Sin datos', value: 0 }];
      case 'ram':
        return ramStats.length > 0 ? ramStats : [{ name: 'Sin datos', value: 0 }];
      case 'gpu':
        return gpuStats.length > 0 ? gpuStats : [{ name: 'Sin datos', value: 0 }];
      case 'garantee':
        return garanteeStats.length > 0 ? garanteeStats : [{ name: 'Sin datos', value: 0 }];
      default:
        return categoryStats.length > 0 ? categoryStats : [{ name: 'Sin datos', value: 0 }];
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
          <p style={{ color: '#64748b' }}>Cargando análisis de ventas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', textAlign: 'center', margin: '2rem' }}>
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
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
        >
          🔄 Reintentar
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

      {/* Título */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
          📊 Análisis de Ventas
        </h1>
        <p style={{ margin: 0, color: '#64748b' }}>
          Estadísticas y métricas de pedidos completados
        </p>
      </div>

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
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{totalOrders.toLocaleString('es-CL')}</p>
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
          📈 Ventas y Volumen de Órdenes
        </h2>
        {monthlySales.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#64748b" 
                tick={{fill: '#64748b'}}
                axisLine={false}
                tickLine={false}
              />
              
              {/* EJE IZQUIERDO: DINERO (Ventas) */}
              <YAxis 
                yAxisId="left"
                orientation="left"
                stroke="#3b82f6" 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
              />
              
              {/* EJE DERECHO: CANTIDAD (Órdenes) */}
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                axisLine={false}
                tickLine={false}
              />

              <Tooltip 
                contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                formatter={(value: number, name: string) => 
                  name === 'Ventas' ? [formatCurrency(value), 'Ingresos'] : [value, 'Órdenes']
                }
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }}/>
              
              {/* Barras para el Dinero */}
              <Bar 
                yAxisId="left" 
                dataKey="ventas" 
                name="Ventas" 
                barSize={40} 
                fill="#3b82f6" 
                radius={[6, 6, 0, 0]} 
              />
              
              {/* Línea para la Cantidad */}
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="ordenes" 
                name="Órdenes" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>No hay datos suficientes para mostrar</p>
        )}
      </div>

      
      {topProducts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#10b981" />
              Top 5 Productos Más Vendidos
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topProducts.map((product, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  borderLeft: '4px solid #10b981'
                }}>
                  
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#10b981', 
                    opacity: 0.6,
                    width: '40px',
                    textAlign: 'center',
                    marginRight: '0.5rem'
                  }}>
                    {index + 1}°
                  </div>

                  <div style={{ flex: 1, marginRight: '1rem' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>
                      {product.name}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>
                      {product.category}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>
                      {product.quantity} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>unid.</span>
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                      {formatCurrency(product.price)} {/* <--- 5. CAMBIO AQUÍ (Top Products) */}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

      
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingDown size={20} color="#ef4444" />
              Top 5 Productos Menos Vendidos
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {worstProducts.map((product, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: '#fff1f2', 
                  borderRadius: '10px',
                  borderLeft: '4px solid #ef4444'
                }}>
                  
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#ef4444', 
                    opacity: 0.6,
                    width: '40px',
                    textAlign: 'center',
                    marginRight: '0.5rem'
                  }}>
                    {index + 1}°
                  </div>

                  <div style={{ flex: 1, marginRight: '1rem' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#334155', fontSize: '0.9rem' }}>
                      {product.name}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', background: 'white', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fecdd3' }}>
                      {product.category}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', color: '#ef4444', fontSize: '1.1rem' }}>
                      {product.quantity} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>unid.</span>
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                      {formatCurrency(product.price)} 
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      
      <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
            🎯 Análisis Detallado
          </h2>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['category', 'processor', 'ram', 'gpu', 'garantee'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as any)}
                style={{
                  padding: '0.5rem 1rem',
                  background: activeFilter === filter ? '#3b82f6' : '#f1f5f9',
                  color: activeFilter === filter ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {filter === 'category' ? 'Categoría' :
                 filter === 'processor' ? 'Procesador' :
                 filter === 'ram' ? 'RAM' :
                 filter === 'gpu' ? 'GPU' : 'Garantía'}
              </button>
            ))}
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
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {getCurrentFilterData().map((stat, index) => (
              <div key={stat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', marginBottom: '0.5rem', background: '#f8fafc', borderRadius: '8px', borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}>
                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>{stat.name}</span>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{formatCurrency(stat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}