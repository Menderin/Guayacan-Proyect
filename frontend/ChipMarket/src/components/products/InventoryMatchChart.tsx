// src/components/products/InventoryMatchChart.tsx

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

import '../../styles/ProductSearchPage.css';

// 1. Registrar los elementos necesarios para el gráfico Doughnut/Pie
ChartJS.register(ArcElement, Tooltip, Legend);

interface InventoryMatchChartProps {
  filteredCount: number; // Productos que coinciden con los filtros (el numerador)
  totalInStock: number; // Total de productos que están EN STOCK (el denominador)
}

export const InventoryMatchChart: React.FC<InventoryMatchChartProps> = ({ 
  filteredCount, 
  totalInStock 
}) => {
  // Manejo de casos límite
  if (totalInStock === 0) {
    return <p>No hay inventario en stock para analizar.</p>;
  }
  
  // Calcular los dos segmentos del pastel
  const unmatchedCount = totalInStock - filteredCount;

  // 2. Definición de los datos del gráfico
  const data = {
    labels: [
      `Coincidencia (${filteredCount})`,
      `Stock No Filtrado (${unmatchedCount})`,
    ],
    datasets: [
      {
        data: [filteredCount, unmatchedCount],
        backgroundColor: [
          '#10B981', // Verde: Coincidencia
          '#E5E7EB', // Gris: Stock No Filtrado
        ],
        hoverBackgroundColor: [
          '#059669',
          '#D1D5DB',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 3. Definición de las opciones
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Permite que el gráfico use el tamaño del contenedor
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: `Tasa de Coincidencia de Inventario: ${((filteredCount / totalInStock) * 100).toFixed(1)}%`,
        font: {
            size: 16
        }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};