// frontend/src/components/adminDashboard/PaymentReports.tsx

import React, { useState, useEffect } from 'react';
import { PaymentService } from '../../services/payment.service';
import type { Payment } from '../../types/payment.types';
import '../../styles/PaymentReports.css'; 
import { PaymentsTable } from './PaymentsTable';
import { PaymentCharts } from './PaymentCharts'; 

type PaymentStatusFilter = 'all' | 'Pending' | 'Completed' | 'Failed';

export const PaymentReports: React.FC = () => {
     const [payments, setPayments] = useState<Payment[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [activeFilter, setActiveFilter] = useState<PaymentStatusFilter>('all');

     useEffect(() => {
         fetchPayments(activeFilter);
    }, [activeFilter]);

     const fetchPayments = async (status: PaymentStatusFilter) => {
        setLoading(true);
         setError(null);
         try {
             let response;
            if (status === 'all') {
                 response = await PaymentService.getAllPayments();
             } else {
                 response = await PaymentService.getPaymentsByStatus(status);
        }

             if (response.success && response.data) {
                setPayments(response.data);
             } else {
                 throw new Error(response.message || 'No se pudieron cargar los pagos');
        }
         } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
         setPayments([]);
         } finally {
            setLoading(false);
         }
     };

     const handleFilterClick = (status: PaymentStatusFilter) => {
         setActiveFilter(status);
     };

     const handleExportCSV = () => {
        if (payments.length === 0) {
             alert("No hay datos para exportar.");
             return;
         }
         const headers = ["ID Pago", "ID Pedido", "Método", "Monto", "Fecha", "Estado"];
        const formatCSVField = (field: any) => {
        let value = String(field);
             if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                value = `"${value.replace(/"/g, '""')}"`;
             }
             return value;
        };
         const csvRows = [headers.join(',')]; 
         payments.forEach(p => {
            const row = [
                p.id_payment,
                p.order_id,
                p.payment_method,
                p.amount, 
                p.payment_date, 
                p.status
             ];
            csvRows.push(row.map(formatCSVField).join(','));
         });
         const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
         link.setAttribute("href", url);
        link.setAttribute("download", `reporte-pagos-${activeFilter}.csv`);
         link.style.visibility = 'hidden';
        document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         URL.revokeObjectURL(url);
     };

     const filters: { label: string; status: PaymentStatusFilter }[] = [
        { label: 'Todos', status: 'all' },
         { label: 'Pendientes', status: 'Pending' },
         { label: 'Cobrados', status: 'Completed' },
        { label: 'Fallidos', status: 'Failed' },
    ];

     return (
         <div className="reports-container">
            <h2 className="reports-title">Reporte de Pagos</h2>

            {/* 2. AÑADIDO EL COMPONENTE DEL GRÁFICO (justo como pediste) */}
            <PaymentCharts />

             {/* --- ESTRUCTURA DE FILTROS MODIFICADA --- */}
            <div className="reports-filters">

                {/* Grupo de botones de filtro */}
                <div className="filter-btn-group">
                        {filters.map(filter => (
                            <button
                             key={filter.status}
                             className={`filter-btn ${activeFilter === filter.status ? 'filter-btn--active' : ''}`}
                             onClick={() => handleFilterClick(filter.status)}
                        >
                             {filter.label}
                         </button>
                     ))}
                </div>

                 {/* Botón de exportación */}
                <button 
                    className="export-btn" 
                    onClick={handleExportCSV}
                    disabled={loading || payments.length === 0}
                     >
                    Exportar a CSV
                </button>

            </div>

             <div className="reports-table-container">
                {error && <p className="reports-error">Error: {error}</p>}
                 
                {!error && (
                     <PaymentsTable payments={payments} loading={loading} />
                 )}
             </div>
         </div>
    );
};