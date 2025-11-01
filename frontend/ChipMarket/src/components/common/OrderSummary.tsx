// src/components/common/OrderSummary.tsx

import React from 'react';
import { ShoppingCart, Package, DollarSign } from 'lucide-react';
import type { OrderProductInput } from '../../types/order.types';
import '../../styles/OrderSummary.css';

interface OrderSummaryProps {
  products: OrderProductInput[];
  paymentMethod?: string;
  shippingAddress?: {
    address: string;
    city: string;
    transportCompany?: string;
  } | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  products,
  paymentMethod,
  shippingAddress
}) => {
  // Calcular totales
  const calculateTotals = () => {
    const subtotal = products.reduce((sum, product) => {
      return sum + ((product.price || 0) * product.quantity);
    }, 0);

    const itemCount = products.reduce((sum, product) => sum + product.quantity, 0);

    // Puedes agregar cálculo de impuestos o envío aquí si es necesario
    const tax = 0; // subtotal * 0.19 (IVA 19% en Chile)
    const shipping = 0; // Costo de envío

    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total, itemCount };
  };

  const { subtotal, tax, shipping, total, itemCount } = calculateTotals();

  if (products.length === 0) {
    return (
      <div className="order-summary order-summary--empty">
        <ShoppingCart className="order-summary__empty-icon" />
        <p className="order-summary__empty-text">No hay productos en el pedido</p>
      </div>
    );
  }

  return (
    <div className="order-summary">
      <div className="order-summary__header">
        <ShoppingCart className="order-summary__icon" />
        <h3 className="order-summary__title">Resumen del Pedido</h3>
      </div>

      {/* Productos */}
      <div className="order-summary__section">
        <div className="order-summary__section-header">
          <Package size={18} />
          <span>Productos ({itemCount} {itemCount === 1 ? 'artículo' : 'artículos'})</span>
        </div>
        <ul className="order-summary__product-list">
          {products.map((product) => (
            <li key={product.sku} className="order-summary__product-item">
              <div className="order-summary__product-info">
                <span className="order-summary__product-name">
                  {product.name || product.sku}
                </span>
                <span className="order-summary__product-quantity">
                  x{product.quantity}
                </span>
              </div>
              <span className="order-summary__product-price">
                ${((product.price || 0) * product.quantity).toLocaleString('es-CL')}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Método de pago */}
      {paymentMethod && (
        <div className="order-summary__section">
          <div className="order-summary__section-header">
            <DollarSign size={18} />
            <span>Método de Pago</span>
          </div>
          <p className="order-summary__payment-method">{paymentMethod}</p>
        </div>
      )}

      {/* Dirección de envío */}
      {shippingAddress && (
        <div className="order-summary__section">
          <div className="order-summary__section-header">
            <Package size={18} />
            <span>Dirección de Envío</span>
          </div>
          <div className="order-summary__shipping">
            <p>{shippingAddress.address}</p>
            <p>{shippingAddress.city}</p>
            {shippingAddress.transportCompany && (
              <p className="order-summary__transport">
                Empresa: {shippingAddress.transportCompany}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Totales */}
      <div className="order-summary__totals">
        <div className="order-summary__total-row">
          <span>Subtotal:</span>
          <span>${subtotal.toLocaleString('es-CL')}</span>
        </div>

        {tax > 0 && (
          <div className="order-summary__total-row">
            <span>IVA (19%):</span>
            <span>${tax.toLocaleString('es-CL')}</span>
          </div>
        )}

        {shipping > 0 && (
          <div className="order-summary__total-row">
            <span>Envío:</span>
            <span>${shipping.toLocaleString('es-CL')}</span>
          </div>
        )}

        <div className="order-summary__total-row order-summary__total-row--final">
          <span>Total:</span>
          <span>${total.toLocaleString('es-CL')}</span>
        </div>
      </div>
    </div>
  );
};