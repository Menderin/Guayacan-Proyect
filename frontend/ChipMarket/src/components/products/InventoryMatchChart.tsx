// src/components/products/InventoryMatchChart.tsx

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

import '../../styles/ProductSearchPage.css';

ChartJS.register(ArcElement, Tooltip, Legend);

interface InventoryMatchChartProps {
  filteredCount: number; 
  totalInStock: number; 
}

export const InventoryMatchChart: React.FC<InventoryMatchChartProps> = ({ 
  filteredCount, 
  totalInStock 
}) => {
 
  if (totalInStock === 0) {
    return <p>No hay inventario en stock para analizar.</p>;
  }
  
  const unmatchedCount = totalInStock - filteredCount;

  const data = {
    labels: [
      `Coincidencia (${filteredCount})`,
      `Stock No Filtrado (${unmatchedCount})`,
    ],
    datasets: [
      {
        data: [filteredCount, unmatchedCount],
        backgroundColor: [
          '#10B981', 
          '#E5E7EB', 
        ],
        hoverBackgroundColor: [
          '#059669',
          '#D1D5DB',
        ],
        borderWidth: 1,
      },
    ],
  };


  const options = {
    responsive: true,
    maintainAspectRatio: false, 
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