// src/components/adminDashboard/Home.tsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Package, DollarSign } from 'lucide-react';
import { LowStockAlerts } from '../home/LowStockAlerts';
import { StatsCard } from '../home/StatsCard';
import '../../styles/Home.css';

interface Product {
  _id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    productos: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

interface Order {
  id_order: number;
  user_id: number;
  order_date: string;
  status: string;
  total_amount: string;
}

interface OrdersApiResponse {
  success: boolean;
  message: string;
  data: Order[];
}

interface Stats {
  totalProducts: number;
  totalRevenue: number;
  lowStockCount: number;
  pendingOrders: number;
}

export const Home: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Hacer todas las llamadas en paralelo
      const [productsResponse, pendingOrdersResponse, completedOrdersResponse] = await Promise.all([
        fetch('http://localhost:3000/api/productos'),
        fetch('http://localhost:3000/api/orders/order/status/Pending'),
        fetch('http://localhost:3000/api/orders/order/status/Completed')
      ]);

      const productsData: ApiResponse = await productsResponse.json();
      const pendingData: OrdersApiResponse = await pendingOrdersResponse.json();
      const completedData: OrdersApiResponse = await completedOrdersResponse.json();
      
      // Calcular estadísticas de productos
      let totalProducts = 0;
      let lowStock = 0;
      
      if (productsData.success) {
        const products: Product[] = productsData.data.productos || [];
        totalProducts = products.length;
        lowStock = products.filter((p: Product) => p.stock <= 5).length;
      }

      // Calcular pedidos pendientes
      const pendingOrders = pendingData.success ? pendingData.data.length : 0;

      // Calcular ingresos totales de pedidos completados
      let totalRevenue = 0;
      if (completedData.success) {
        totalRevenue = completedData.data.reduce(
          (sum: number, order: Order) => sum + parseFloat(order.total_amount),
          0
        );
      }
      
      setStats({
        totalProducts,
        totalRevenue,
        lowStockCount: lowStock,
        pendingOrders
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-dashboard">
      <div className="home-dashboard__container">
        
        {/* Sección de Estadísticas Generales */}
        <section className="home-dashboard__section">
          <h2 className="home-dashboard__section-title">Resumen General</h2>
          <div className="home-dashboard__stats-grid">
            <StatsCard
              title="Total Productos"
              value={stats.totalProducts}
              icon={Package}
              trend="+12%"
              trendUp={true}
              loading={loading}
            />
            <StatsCard
              title="Ingresos Totales"
              value={`${stats.totalRevenue.toLocaleString('es-CL')}`}
              icon={DollarSign}
              trend="+8%"
              trendUp={true}
              loading={loading}
              variant="success"
            />
            <StatsCard
              title="Stock Bajo"
              value={stats.lowStockCount}
              icon={AlertTriangle}
              trend="Alerta"
              trendUp={false}
              loading={loading}
              variant="warning"
            />
            <StatsCard
              title="Pedidos Pendientes"
              value={stats.pendingOrders}
              icon={TrendingUp}
              trend={stats.pendingOrders > 0 ? "Activo" : "Sin actividad"}
              trendUp={stats.pendingOrders > 0}
              loading={loading}
            />
          </div>
        </section>

        {/* Sección de Alertas de Bajo Stock */}
        <section className="home-dashboard__section">
          <h2 className="home-dashboard__section-title">
            <AlertTriangle className="home-dashboard__section-icon" />
            Alertas de Stock Bajo
          </h2>
          <LowStockAlerts />
        </section>

        {/* Sección de Análisis (Placeholder para futuras implementaciones) */}
        <section className="home-dashboard__section">
          <h2 className="home-dashboard__section-title">Análisis de Ventas</h2>
          <div className="home-dashboard__placeholder-chart">
            <p className="home-dashboard__placeholder-text">
              Gráfico de análisis de ventas próximamente
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};