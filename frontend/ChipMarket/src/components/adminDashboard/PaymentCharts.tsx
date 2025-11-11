// frontend/src/components/adminDashboard/PaymentCharts.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import * as d3 from 'd3';
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

interface HeatmapCell {
  week: number;
  day: number;
  count: number;
  amount: number;
  payments: Payment[];
}

type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

export const PaymentCharts: React.FC = () => {
  // Estados existentes
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [metrics, setMetrics] = useState<KeyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados nuevos para el heatmap
  const [heatmapStatus, setHeatmapStatus] = useState<PaymentStatus>('Completed');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [heatmapPayments, setHeatmapPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]); // Para escala global
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [useGlobalScale, setUseGlobalScale] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0, 
    }).format(numericAmount);
  };

  // Inicializar mes actual
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  // Cargar estadísticas generales (gráfico de torta y métricas)
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
        setChartData(dataForChart);

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

  // Cargar datos para el heatmap
  useEffect(() => {
    if (selectedMonth) {
      loadHeatmapData();
    }
  }, [heatmapStatus, selectedMonth]);

  const loadHeatmapData = async () => {
    setHeatmapLoading(true);
    
    try {
      const response = await PaymentService.getPaymentsByStatus(heatmapStatus);
      
      if (response.success && response.data) {
        // Filtrar por mes seleccionado
        const [year, month] = selectedMonth.split('-');
        const filteredPayments = response.data.filter((p: Payment) => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate.getFullYear() === parseInt(year) && 
                 paymentDate.getMonth() === parseInt(month) - 1;
        });
        
        setHeatmapPayments(filteredPayments);
      }
    } catch (err) {
      console.error('Error al cargar datos del heatmap:', err);
    } finally {
      setHeatmapLoading(false);
    }
  };

  const getWeekOfMonth = (date: Date): number => {
    const d = new Date(date);
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay();
    const offsetDate = d.getDate() + firstDayOfWeek - 1;
    return Math.floor(offsetDate / 7) + 1;
  };

  const renderHeatmap = () => {
    if (!svgRef.current || heatmapPayments.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const heatmapData: Record<string, HeatmapCell> = {};
    
    heatmapPayments.forEach(payment => {
      const date = new Date(payment.payment_date);
      const dayOfWeek = date.getDay();
      const weekOfMonth = getWeekOfMonth(date);
      const key = `${weekOfMonth}-${dayOfWeek}`;
      
      if (!heatmapData[key]) {
        heatmapData[key] = {
          week: weekOfMonth,
          day: dayOfWeek,
          count: 0,
          amount: 0,
          payments: []
        };
      }
      heatmapData[key].count++;
      heatmapData[key].amount += parseFloat(String(payment.amount));
      heatmapData[key].payments.push(payment);
    });

    const maxCount = Math.max(...Object.values(heatmapData).map(d => d.count), 1);
    const maxWeek = Math.max(...Object.values(heatmapData).map(d => d.week), 5);

    const margin = { top: 50, right: 20, bottom: 30, left: 60 };
    const cellSize = 60;
    const width = cellSize * 7 + margin.left + margin.right;
    const height = cellSize * maxWeek + margin.top + margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const colorScale = d3.scaleSequential()
      .domain([0, maxCount])
      .interpolator(d3.interpolateBlues);

    for (let week = 1; week <= maxWeek; week++) {
      for (let day = 0; day < 7; day++) {
        const key = `${week}-${day}`;
        const data = heatmapData[key];
        
        const cell = g.append('rect')
          .attr('class', 'heatmap-cell')
          .attr('x', day * cellSize)
          .attr('y', (week - 1) * cellSize)
          .attr('width', cellSize - 2)
          .attr('height', cellSize - 2)
          .attr('rx', 6)
          .attr('fill', data ? colorScale(data.count) : '#f0f0f0')
          .style('cursor', data ? 'pointer' : 'default')
          .style('stroke', '#fff')
          .style('stroke-width', '2');

        if (data) {
          cell
            .on('mouseover', function(event) {
              if (!tooltipRef.current) return;
              
              d3.select(this)
                .style('stroke', '#333')
                .style('stroke-width', '2');

              tooltipRef.current.innerHTML = `
                <strong>Semana ${data.week} - ${daysOfWeek[data.day]}</strong><br>
                Pagos: ${data.count}<br>
                Total: ${formatCurrency(data.amount)}
              `;
              tooltipRef.current.style.opacity = '1';
              tooltipRef.current.style.left = `${event.pageX + 10}px`;
              tooltipRef.current.style.top = `${event.pageY - 10}px`;
            })
            .on('mouseout', function() {
              if (!tooltipRef.current) return;
              
              d3.select(this)
                .style('stroke', '#fff')
                .style('stroke-width', '2');
              
              tooltipRef.current.style.opacity = '0';
            });

          g.append('text')
            .attr('x', day * cellSize + cellSize / 2)
            .attr('y', (week - 1) * cellSize + cellSize / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', data.count > maxCount / 2 ? 'white' : '#333')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .style('pointer-events', 'none')
            .text(data.count);
        }
      }
    }

    daysOfWeek.forEach((day, i) => {
      g.append('text')
        .attr('class', 'axis-label')
        .attr('x', i * cellSize + cellSize / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text(day);
    });

    for (let week = 1; week <= maxWeek; week++) {
      g.append('text')
        .attr('class', 'axis-label')
        .attr('x', -10)
        .attr('y', (week - 1) * cellSize + cellSize / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text(`S${week}`);
    }
  };

  useEffect(() => {
    if (!heatmapLoading && heatmapPayments.length > 0) {
      renderHeatmap();
    }
  }, [heatmapPayments, heatmapLoading]);

  // Calcular estadísticas del heatmap
  const heatmapTotal = heatmapPayments.length;
  const heatmapAmount = heatmapPayments.reduce((sum, p) => sum + parseFloat(String(p.amount)), 0);
  const heatmapAvg = heatmapTotal > 0 ? heatmapAmount / heatmapTotal : 0;

  if (loading) {
    return <div className="chart-container chart-loading">Cargando gráficos...</div>;
  }

  if (error) {
    return <div className="chart-container chart-error">Error al cargar estadísticas: {error}</div>;
  }

  return (
    <>
      {/* GRÁFICOS EXISTENTES */}
      <div className="reports-charts-grid">
        <div className="chart-container">
          <h3 className="chart-title">Distribución de Pagos</h3>
          <p className="chart-subtitle">Cantidad de transacciones por estado</p>
          <div className="chart-wrapper">
            {chartData ? <Pie data={chartData} /> : <p>No hay datos para el gráfico.</p>}
          </div>
        </div>
        
        <div className="chart-container">
          <h3 className="chart-title">Métricas Clave</h3>
          <p className="chart-subtitle">Resumen financiero de los pagos</p>
          {metrics && (
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Ingresos Totales (Cobrados)</span>
                <span className="metric-value metric-value--success">
                  {formatCurrency(metrics.totalRevenue)}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Monto Pendiente de Pago</span>
                <span className="metric-value metric-value--warning">
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

      {/* NUEVO CALENDAR HEATMAP */}
      <div className="heatmap-section">
        <h3 className="heatmap-section-title">📊 Calendar Heatmap - Distribución Temporal</h3>
        
        <div className="heatmap-controls">
          <div className="heatmap-control-group">
            <label htmlFor="heatmap-status">Estado:</label>
            <select 
              id="heatmap-status"
              value={heatmapStatus} 
              onChange={(e) => setHeatmapStatus(e.target.value as PaymentStatus)}
              className="heatmap-select"
            >
              <option value="Completed">Completados</option>
              <option value="Pending">Pendientes</option>
              <option value="Failed">Fallidos</option>
              <option value="Refunded">Reembolsados</option>
            </select>
          </div>
          
          <div className="heatmap-control-group">
            <label htmlFor="heatmap-month">Mes:</label>
            <input 
              id="heatmap-month"
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="heatmap-input"
            />
          </div>
        </div>

        {heatmapLoading && (
          <div className="heatmap-loading">
            <div className="loading-spinner"></div>
            <p>Cargando datos...</p>
          </div>
        )}

        {!heatmapLoading && heatmapPayments.length === 0 && (
          <div className="heatmap-empty">
            <p>No hay datos para el período seleccionado</p>
          </div>
        )}

        {!heatmapLoading && heatmapPayments.length > 0 && (
          <>
            <div className="heatmap-stats">
              <div className="heatmap-stat-card">
                <div className="heatmap-stat-value">{heatmapTotal}</div>
                <div className="heatmap-stat-label">Total Pagos</div>
              </div>
              <div className="heatmap-stat-card">
                <div className="heatmap-stat-value">{formatCurrency(heatmapAmount)}</div>
                <div className="heatmap-stat-label">Monto Total</div>
              </div>
              <div className="heatmap-stat-card">
                <div className="heatmap-stat-value">{formatCurrency(heatmapAvg)}</div>
                <div className="heatmap-stat-label">Promedio</div>
              </div>
            </div>

            <div className="heatmap-container">
              <svg ref={svgRef}></svg>
            </div>

            <div className="heatmap-legend">
              <span className="legend-text">Menos</span>
              <div className="legend-gradient"></div>
              <span className="legend-text">Más</span>
            </div>
          </>
        )}

        <div ref={tooltipRef} className="heatmap-tooltip"></div>
      </div>
    </>
  );
};