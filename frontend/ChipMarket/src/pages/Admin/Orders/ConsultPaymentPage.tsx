import React, { useEffect, useState } from 'react';
import { authenticatedFetch } from '../../../utils/api.helper';
import "../../../styles/ConsultPayment.css";

interface Payment {
    id_payment: number;
    orderId: number;
    userId: number;
    amount: number;
    payment_method: string;
    status: string;
    createdAt: string;
}

export const ConsultPaymentPage: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchPayments = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await authenticatedFetch('/api/payments/all'); // puedes cambiar por /status/:status si quieres filtrar
            const data = await res.json();
            if (data.success) setPayments(data.data);
            else setError(data.message || 'Error al obtener pagos');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayments(); }, []);

    return (
        <div className="consult-payment-container">
            <h2>Historial de Pagos</h2>

            {loading && <p>Cargando pagos...</p>}
            {error && <p className="error-alert">{error}</p>}

            {!loading && payments.length > 0 && (
                <table className="payments-table">
                    <thead>
                        <tr>
                            <th>ID Pago</th>
                            <th>Monto</th>
                            <th>Método</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.id_payment}>
                                <td>{p.id_payment}</td>
                                <td>${p.amount.toFixed(2)}</td>
                                <td>{p.payment_method}</td>
                                <td>{p.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {!loading && payments.length === 0 && <p>No hay pagos registrados.</p>}
        </div>
    );

};
