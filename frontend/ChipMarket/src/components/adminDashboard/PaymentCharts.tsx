// frontend/src/components/adminDashboard/PaymentCharts.tsx

import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2'; // <-- Usado en el return
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PaymentService } from '../../services/payment.service';
import '../../styles/PaymentCharts.css'; 
import type { Payment } from '../../types/payment.types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

interface KeyMetrics {
  totalRevenue: number;
  totalPendingAmount: number;
  totalPayments: number;
}

export const PaymentCharts: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null); // <-- Usado en el return
  const [metrics, setMetrics] = useState<KeyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number | string) => { // <-- Usado en el return
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0, 
    }).format(numericAmount);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const [
          statsResponse,
          completedResponse,
          pendingResponse
        ] = await Promise.all([
          PaymentService.getPaymentStats(),
          PaymentService.getPaymentsByStatus('Completed'),
          PaymentService.getPaymentsByStatus('Pending')
        ]);

        if (
          !statsResponse.success || !statsResponse.data || 
          !completedResponse.success || 
          !pendingResponse.success
        ) {
          throw new Error('No se pudieron cargar todas las estadísticas');
        }

        const stats = statsResponse.data; 
        const statusCounts = stats.byStatus as any; 
        
        const pendingCount = statusCounts.Pending || 0;
        const completedCount = statusCounts.Completed || 0;
        const failedCount = statusCounts.Failed || 0;

        const dataForChart: ChartData = {
          labels: ['Pendientes', 'Completados', 'Fallidos'],
          datasets: [
            {
              data: [pendingCount, completedCount, failedCount],
              backgroundColor: ['#f59e0b', '#22c55e', '#ef4444'],
              borderColor: ['#f59e0b', '#22c55e', '#ef4444'],
              borderWidth: 1,
            },
          ],
        };
        setChartData(dataForChart); // <-- Se le da valor a chartData

        const sumAmounts = (payments: Payment[]) => {
          return payments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0);
        };
        
        const completedAmount = sumAmounts(completedResponse.data || []);
        const pendingAmount = sumAmounts(pendingResponse.data || []);
        
        setMetrics({
          totalRevenue: completedAmount, 
          totalPendingAmount: pendingAmount, 
          totalPayments: (stats as any).total || 0,
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // --- Renderizado ---
  if (loading) {
    return <div className="chart-container chart-loading">Cargando gráficos...</div>;
  }

  if (error) {
    return <div className="chart-container chart-error">Error al cargar estadísticas: {error}</div>;
  }

  // ==========================================================
  // 👇 ¡ESTA ES LA PARTE QUE FALTABA O ESTABA INCORRECTA! 👇
  // ==========================================================
  return (
    <div className="reports-charts-grid">
      {/* Gráfico de Torta */}
      <div className="chart-container">
        <h3 className="chart-title">Distribución de Pagos</h3>
        <p className="chart-subtitle">Cantidad de transacciones por estado</p>
        <div className="chart-wrapper">
          {/* Aquí se usa 'chartData' y 'Pie' */}
          {chartData ? <Pie data={chartData} /> : <p>No hay datos para el gráfico.</p>}
        </div>
      </div>
      
      {/* Métricas Clave */}
      <div className="chart-container">
        <h3 className="chart-title">Métricas Clave</h3>
        <p className="chart-subtitle">Resumen financiero de los pagos</p>
        {metrics && (
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Ingresos Totales (Cobrados)</span>
              <span className="metric-value metric-value--success">
                {/* Aquí se usa 'formatCurrency' */}
                {formatCurrency(metrics.totalRevenue)}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Monto Pendiente de Pago</span>
              <span className="metric-value metric-value--warning">
                {/* Aquí se usa 'formatCurrency' */}
                {formatCurrency(metrics.totalPendingAmount)}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Total Transacciones</span>
              <span className="metric-value">
                {metrics.totalPayments.toLocaleString('es-CL')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};