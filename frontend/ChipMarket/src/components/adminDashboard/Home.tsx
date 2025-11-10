// src/components/adminDashboard/Home.tsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Package, DollarSign, CreditCard } from 'lucide-react';
import { LowStockAlerts } from '../home/LowStockAlerts';
import { StatsCard } from '../home/StatsCard';
import SalesAnalytics from '../home/SalesAnalytics';
import { PaymentService } from '../../services/payment.service'; // ✅ IMPORTAR SERVICIO
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

// ✅ Importar el tipo Payment desde types
import type { Payment } from '../../types/payment.types';

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
  pendingPayments: number;
  pendingPaymentsAmount: number;
}

export const Home: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    pendingOrders: 0,
    pendingPayments: 0,
    pendingPaymentsAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // ✅ Usar Promise.all con el servicio de pagos
      const [
        productsResponse, 
        pendingOrdersResponse, 
        completedOrdersResponse,
        pendingPaymentsData // ✅ Ya no es un Response, es el objeto parseado
      ] = await Promise.all([
        fetch('http://localhost:3000/api/productos'),
        fetch('http://localhost:3000/api/orders/status/Pending'),
        fetch('http://localhost:3000/api/orders/status/Completed'),
        PaymentService.getPaymentsByStatus('Pending') // ✅ CAMBIO AQUÍ
      ]);

      const productsData: ApiResponse = await productsResponse.json();
      const pendingData: OrdersApiResponse = await pendingOrdersResponse.json();
      const completedData: OrdersApiResponse = await completedOrdersResponse.json();
      // ✅ pendingPaymentsData YA es el objeto, no necesita .json()
      
      // Calcular productos y stock bajo
      let totalProducts = 0;
      let lowStock = 0;
      
      if (productsData.success) {
        const products: Product[] = productsData.data.productos || [];
        totalProducts = products.length;
        lowStock = products.filter((p: Product) => p.stock <= 5).length;
      }

      // Calcular pedidos pendientes
      const pendingOrders = pendingData.success ? pendingData.data.length : 0;

      // Calcular ingresos totales (pedidos completados)
      let totalRevenue = 0;
      if (completedData.success) {
        totalRevenue = completedData.data.reduce(
          (sum: number, order: Order) => sum + parseFloat(order.total_amount),
          0
        );
      }

      // ✅ Calcular pagos pendientes (amount es string en la BD)
      let pendingPayments = 0;
      let pendingPaymentsAmount = 0;
      if (pendingPaymentsData.success && pendingPaymentsData.data) {
        pendingPayments = pendingPaymentsData.data.length;
        pendingPaymentsAmount = pendingPaymentsData.data.reduce(
          (sum: number, payment: Payment) => sum + parseFloat(payment.amount.toString()),
          0
        );
      }
      
      setStats({
        totalProducts,
        totalRevenue,
        lowStockCount: lowStock,
        pendingOrders,
        pendingPayments,
        pendingPaymentsAmount
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      // ✅ Mejor manejo de errores
      setStats({
        totalProducts: 0,
        totalRevenue: 0,
        lowStockCount: 0,
        pendingOrders: 0,
        pendingPayments: 0,
        pendingPaymentsAmount: 0
      });
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
              value={`$${stats.totalRevenue.toLocaleString('es-CL')}`}
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
            <StatsCard
              title="Pagos Pendientes"
              value={stats.pendingPayments}
              icon={CreditCard}
              trend={`$${stats.pendingPaymentsAmount.toLocaleString('es-CL')}`}
              trendUp={false}
              loading={loading}
              variant="danger"
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

        {/* Sección: Análisis de Ventas */}
        <section className="home-dashboard__section">
          <SalesAnalytics />
        </section>

      </div>
    </div>
  );
};