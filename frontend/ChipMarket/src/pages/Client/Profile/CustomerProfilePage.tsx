// src/pages/CustomerProfilePage.tsx

import React, { useState } from 'react';
import { 
  User, 
  ShoppingBag, 
  CreditCard, 
  Settings, 
  ArrowLeft,
  Package,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Mail,
  Lock,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCustomerOrders } from '../../../hooks/useCustomerOrders';
import { useCustomerPayments } from '../../../hooks/useCustomerPayments';
import '../../../styles/CustomerProfile.css';

interface CustomerProfilePageProps {
  onBack: () => void;
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'payments' | 'settings'>('orders');

  return (
    <div className="customer-profile">
      {/* Header */}
      <header className="customer-profile__header">
        <div className="customer-profile__header-content">
          <button onClick={onBack} className="customer-profile__back-btn">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a la tienda</span>
          </button>
          <h1 className="customer-profile__title">Mi Cuenta</h1>
        </div>
      </header>

      <div className="customer-profile__container">
        {/* Sidebar con info del usuario */}
        <aside className="customer-profile__sidebar">
          <div className="customer-profile__user-card">
            <div className="customer-profile__avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="customer-profile__user-name">{user?.name || 'Usuario'}</h2>
            <p className="customer-profile__user-email">{user?.email || 'email@example.com'}</p>
          </div>

          {/* Menú de navegación */}
          <nav className="customer-profile__nav">
            <button
              onClick={() => setActiveTab('orders')}
              className={`customer-profile__nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Mis Pedidos</span>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`customer-profile__nav-btn ${activeTab === 'payments' ? 'active' : ''}`}
            >
              <CreditCard className="w-5 h-5" />
              <span>Mis Pagos</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`customer-profile__nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings className="w-5 h-5" />
              <span>Configuración</span>
            </button>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="customer-profile__content">
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'settings' && <SettingsTab user={user} />}
        </main>
      </div>
    </div>
  );
};

// ========== Tab de Pedidos ==========
const OrdersTab: React.FC = () => {
  const { orders, loading, error } = useCustomerOrders();

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'completed' || normalized === 'completado') return 'status-completed';
    if (normalized === 'pending' || normalized === 'pendiente') return 'status-pending';
    if (normalized === 'cancelled' || normalized === 'cancelado') return 'status-cancelled';
    return 'status-pending';
  };

  const getStatusIcon = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'completed' || normalized === 'completado') return <CheckCircle className="w-5 h-5" />;
    if (normalized === 'pending' || normalized === 'pendiente') return <Clock className="w-5 h-5" />;
    if (normalized === 'cancelled' || normalized === 'cancelado') return <XCircle className="w-5 h-5" />;
    return <Package className="w-5 h-5" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="profile-tab">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-tab">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold">Error al cargar pedidos</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-tab">
      <div className="profile-tab__header">
        <h2 className="profile-tab__title">Mis Pedidos</h2>
        <p className="profile-tab__subtitle">Historial completo de tus compras ({orders.length})</p>
      </div>

      {orders.length === 0 ? (
        <div className="profile-empty-state">
          <ShoppingBag className="profile-empty-state__icon" />
          <h3 className="profile-empty-state__title">No tienes pedidos aún</h3>
          <p className="profile-empty-state__text">
            Comienza a comprar en nuestra tienda
          </p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id_order} className="order-card">
              <div className="order-card__header">
                <div className="order-card__info">
                  <div className="order-card__id">
                    <Package className="w-5 h-5" />
                    <span>Pedido #{order.id_order}</span>
                  </div>
                  <div className="order-card__date">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(order.order_date)}</span>
                  </div>
                </div>
                <div className={`order-card__status ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span>{order.status}</span>
                </div>
              </div>

              <div className="order-card__products">
                {order.details.map((detail) => (
                  <div key={detail.id_detail_order} className="order-product">
                    {detail.product?.image_url && (
                      <img
                        src={detail.product.image_url}
                        alt={detail.product.name}
                        className="order-product__image"
                      />
                    )}
                    <div className="order-product__info">
                      <p className="order-product__name">
                        {detail.product?.name || detail.product_sku}
                      </p>
                      <p className="order-product__details">
                        Cantidad: {detail.quantity} × {formatCurrency(detail.price)}
                      </p>
                    </div>
                    <div className="order-product__total">
                      {formatCurrency(detail.subtotal || detail.price * detail.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card__footer">
                <span className="order-card__total-label">Total:</span>
                <span className="order-card__total-amount">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ========== Tab de Pagos ==========
const PaymentsTab: React.FC = () => {
  const { payments, loading, error } = useCustomerPayments();

  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'completed' || normalized === 'completado') return 'status-completed';
    if (normalized === 'pending' || normalized === 'pendiente') return 'status-pending';
    if (normalized === 'failed' || normalized === 'fallido') return 'status-failed';
    return 'status-pending';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="profile-tab">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-tab">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold">Error al cargar pagos</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-tab">
      <div className="profile-tab__header">
        <h2 className="profile-tab__title">Mis Pagos</h2>
        <p className="profile-tab__subtitle">Historial de transacciones realizadas ({payments.length})</p>
      </div>

      {payments.length === 0 ? (
        <div className="profile-empty-state">
          <CreditCard className="profile-empty-state__icon" />
          <h3 className="profile-empty-state__title">No hay pagos registrados</h3>
          <p className="profile-empty-state__text">
            Tus pagos aparecerán aquí una vez que realices una compra
          </p>
        </div>
      ) : (
        <div className="payments-list">
          {payments.map((payment) => (
            <div key={payment.id_payment} className="payment-card-profile">
              <div className="payment-card-profile__header">
                <div className="payment-card-profile__info">
                  <div className="payment-card-profile__id">
                    <CreditCard className="w-5 h-5" />
                    <span>Pago #{payment.id_payment}</span>
                  </div>
                  <div className="payment-card-profile__date">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(payment.payment_date)}</span>
                  </div>
                </div>
                <div className={`payment-card-profile__status ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </div>
              </div>

              <div className="payment-card-profile__details">
                <div className="payment-detail-item">
                  <span className="payment-detail-label">Orden:</span>
                  <span className="payment-detail-value">#{payment.order_id}</span>
                </div>
                <div className="payment-detail-item">
                  <span className="payment-detail-label">Método:</span>
                  <span className="payment-detail-value">{payment.payment_method}</span>
                </div>
                {payment.transaction_id && (
                  <div className="payment-detail-item">
                    <span className="payment-detail-label">ID Transacción:</span>
                    <span className="payment-detail-value payment-detail-value--mono">
                      {payment.transaction_id}
                    </span>
                  </div>
                )}
              </div>

              <div className="payment-card-profile__footer">
                <span className="payment-card-profile__amount-label">Monto:</span>
                <span className="payment-card-profile__amount">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ========== Tab de Configuración ==========
interface SettingsTabProps {
  user: any;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ user }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  return (
    <div className="profile-tab">
      <div className="profile-tab__header">
        <h2 className="profile-tab__title">Configuración</h2>
        <p className="profile-tab__subtitle">Administra tu información personal</p>
      </div>

      <div className="settings-sections">
        {/* Información Personal */}
        <section className="settings-section">
          <div className="settings-section__header">
            <div className="settings-section__title-wrapper">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="settings-section__title">Información Personal</h3>
            </div>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="settings-edit-btn"
            >
              {isEditingProfile ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {!isEditingProfile ? (
            <div className="settings-info-grid">
              <div className="settings-field">
                <label className="settings-field__label">Nombre completo</label>
                <p className="settings-field__value">{user?.name || 'No especificado'}</p>
              </div>
              <div className="settings-field">
                <label className="settings-field__label">Correo electrónico</label>
                <p className="settings-field__value">{user?.email || 'No especificado'}</p>
              </div>
            </div>
          ) : (
            <form className="settings-form">
              <div className="settings-form__field">
                <label htmlFor="name">Nombre completo</label>
                <input
                  type="text"
                  id="name"
                  defaultValue={user?.name}
                  className="settings-form__input"
                />
              </div>
              <div className="settings-form__field">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  defaultValue={user?.email}
                  className="settings-form__input"
                />
              </div>
              <button type="submit" className="settings-form__submit">
                Guardar Cambios
              </button>
            </form>
          )}
        </section>

        {/* Cambiar Contraseña */}
        <section className="settings-section">
          <div className="settings-section__header">
            <div className="settings-section__title-wrapper">
              <Lock className="w-5 h-5 text-indigo-600" />
              <h3 className="settings-section__title">Seguridad</h3>
            </div>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="settings-edit-btn"
            >
              {isChangingPassword ? 'Cancelar' : 'Cambiar Contraseña'}
            </button>
          </div>

          {isChangingPassword && (
            <form className="settings-form">
              <div className="settings-form__field">
                <label htmlFor="current-password">Contraseña actual</label>
                <input
                  type="password"
                  id="current-password"
                  className="settings-form__input"
                />
              </div>
              <div className="settings-form__field">
                <label htmlFor="new-password">Nueva contraseña</label>
                <input
                  type="password"
                  id="new-password"
                  className="settings-form__input"
                />
              </div>
              <div className="settings-form__field">
                <label htmlFor="confirm-password">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  id="confirm-password"
                  className="settings-form__input"
                />
              </div>
              <button type="submit" className="settings-form__submit">
                Actualizar Contraseña
              </button>
            </form>
          )}
        </section>

        {/* Dirección de Envío */}
        <section className="settings-section">
          <div className="settings-section__header">
            <div className="settings-section__title-wrapper">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h3 className="settings-section__title">Dirección de Envío</h3>
            </div>
            <button className="settings-edit-btn">Agregar</button>
          </div>

          <div className="settings-empty">
            <p>No has agregado una dirección de envío</p>
          </div>
        </section>
      </div>
    </div>
  );
};