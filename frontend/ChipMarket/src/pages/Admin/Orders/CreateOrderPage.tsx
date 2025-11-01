// src/pages/Admin/Orders/CreateOrderPage.tsx

import React, { useState } from 'react';
import { Package, CreditCard, Truck, Save, X, CheckCircle } from 'lucide-react';
import { UserSelector } from '../../../components/common/UserSelector';
import { ProductSelector } from '../../../components/common/ProductSelector';
import { OrderSummary } from '../../../components/common/OrderSummary';
import { useCreateOrder } from '../../../hooks/useCreateOrder';
import { ToastNotification } from '../../../components/common/ToastNotification';
import type { User } from '../../../types/user.types';
import type { OrderProductInput, ShippingAddress } from '../../../types/order.types';
import '../../../styles/CreateOrder.css';

export const CreateOrderPage: React.FC = () => {
  // Estado del formulario
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<OrderProductInput[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address: '',
    city: '',
    transportCompany: ''
  });
  const [includeShipping, setIncludeShipping] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Hook personalizado
  const { loading, error, success, createdOrderId, createOrder, reset } = useCreateOrder();

  // Métodos de pago disponibles
  const paymentMethods = [
    'Tarjeta de crédito',
    'Tarjeta de débito',
    'Transferencia bancaria',
    'Efectivo',
    'PayPal',
    'MercadoPago',
    'Webpay'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      alert('Debe seleccionar un cliente');
      return;
    }

    if (selectedProducts.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    if (!paymentMethod) {
      alert('Debe seleccionar un método de pago');
      return;
    }

    // Preparar datos del pedido
    const orderData = {
      userId: selectedUser.id,
      products: selectedProducts.map(p => ({
        sku: p.sku,
        quantity: p.quantity
      })),
      paymentMethod,
      shippingAddress: includeShipping ? shippingAddress : undefined
    };

    const result = await createOrder(orderData);

    if (result) {
      setShowToast(true);
      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        handleReset();
      }, 2000);
    }
  };

  const handleReset = () => {
    setSelectedUser(null);
    setSelectedProducts([]);
    setPaymentMethod('');
    setShippingAddress({
      address: '',
      city: '',
      transportCompany: ''
    });
    setIncludeShipping(false);
    reset();
  };

  return (
    <div className="create-order-page">
      <div className="create-order-page__container">
        {/* Header */}
        <div className="create-order-page__header">
          <div className="create-order-page__header-content">
            <Package className="create-order-page__header-icon" />
            <div>
              <h1 className="create-order-page__title">Registrar Nuevo Pedido</h1>
              <p className="create-order-page__subtitle">
                Complete los datos del pedido y seleccione los productos
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="create-order-page__form">
          <div className="create-order-page__layout">
            {/* Columna izquierda - Formulario */}
            <div className="create-order-page__form-column">
              
              {/* Sección Cliente */}
              <div className="create-order-page__section">
                <div className="create-order-page__section-header">
                  <h2 className="create-order-page__section-title">
                    1. Información del Cliente
                  </h2>
                </div>
                <UserSelector
                  selectedUser={selectedUser}
                  onUserSelect={setSelectedUser}
                  disabled={loading}
                />
              </div>

              {/* Sección Productos */}
              <div className="create-order-page__section">
                <div className="create-order-page__section-header">
                  <h2 className="create-order-page__section-title">
                    2. Selección de Productos
                  </h2>
                </div>
                <ProductSelector
                  selectedProducts={selectedProducts}
                  onProductsChange={setSelectedProducts}
                  disabled={loading}
                />
              </div>

              {/* Sección Método de Pago */}
              <div className="create-order-page__section">
                <div className="create-order-page__section-header">
                  <CreditCard className="create-order-page__section-icon" />
                  <h2 className="create-order-page__section-title">
                    3. Método de Pago
                  </h2>
                </div>
                <div className="create-order-page__payment-methods">
                  {paymentMethods.map((method) => (
                    <label key={method} className="create-order-page__payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={loading}
                        className="create-order-page__radio"
                      />
                      <span className="create-order-page__payment-label">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sección Envío (Opcional) */}
              <div className="create-order-page__section">
                <div className="create-order-page__section-header">
                  <Truck className="create-order-page__section-icon" />
                  <h2 className="create-order-page__section-title">
                    4. Información de Envío (Opcional)
                  </h2>
                </div>
                
                <label className="create-order-page__checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeShipping}
                    onChange={(e) => setIncludeShipping(e.target.checked)}
                    disabled={loading}
                    className="create-order-page__checkbox"
                  />
                  <span>Agregar información de envío</span>
                </label>

                {includeShipping && (
                  <div className="create-order-page__shipping-fields">
                    <div className="create-order-page__field">
                      <label className="create-order-page__label">Dirección</label>
                      <input
                        type="text"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({
                          ...shippingAddress,
                          address: e.target.value
                        })}
                        placeholder="Ej: Av. Los Pinos 123, Depto 4B"
                        disabled={loading}
                        className="create-order-page__input"
                      />
                    </div>

                    <div className="create-order-page__field">
                      <label className="create-order-page__label">Ciudad</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({
                          ...shippingAddress,
                          city: e.target.value
                        })}
                        placeholder="Ej: Coquimbo"
                        disabled={loading}
                        className="create-order-page__input"
                      />
                    </div>

                    <div className="create-order-page__field">
                      <label className="create-order-page__label">Empresa de Transporte</label>
                      <input
                        type="text"
                        value={shippingAddress.transportCompany}
                        onChange={(e) => setShippingAddress({
                          ...shippingAddress,
                          transportCompany: e.target.value
                        })}
                        placeholder="Ej: Chilexpress, Starken, Correos"
                        disabled={loading}
                        className="create-order-page__input"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Columna derecha - Resumen */}
            <div className="create-order-page__summary-column">
              <div className="create-order-page__summary-sticky">
                <OrderSummary
                  products={selectedProducts}
                  paymentMethod={paymentMethod}
                  shippingAddress={includeShipping ? shippingAddress : null}
                />

                {/* Botones de acción */}
                <div className="create-order-page__actions">
                  <button
                    type="submit"
                    disabled={loading || selectedProducts.length === 0 || !selectedUser}
                    className="create-order-page__btn create-order-page__btn--primary"
                  >
                    {loading ? (
                      <>
                        <div className="create-order-page__spinner"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Crear Pedido
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={loading}
                    className="create-order-page__btn create-order-page__btn--secondary"
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                </div>

                {/* Mensajes */}
                {error && (
                  <div className="create-order-page__error">
                    {error}
                  </div>
                )}

                {success && createdOrderId && (
                  <div className="create-order-page__success">
                    <CheckCircle size={20} />
                    <div>
                      <p className="create-order-page__success-title">
                        ¡Pedido creado exitosamente!
                      </p>
                      <p className="create-order-page__success-text">
                        ID del pedido: #{createdOrderId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {showToast && success && (
        <ToastNotification
          message={`Pedido #${createdOrderId} creado exitosamente`}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};