// src/pages/CustomerShopPage.tsx

import React, { useState } from 'react';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useProductSearch } from '../../../hooks/useProductSearch';
import { SearchHeader } from '../../../components/products/SearchHeader';
import { FilterPanel } from '../../../components/products/FilterPanel';
import { ProductGridWithCart } from '../../../components/products/ProductGridWithCart';
import { useCart } from '../../../hooks/useCart';
import '../../../styles/CustomerShop.css';
import { useAuth } from '../../../context/AuthContext';

export const CustomerShopPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuth();

  // Hook de búsqueda de productos (reutilizado)
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    products,
    loading,
    error,
    viewMode,
    setViewMode,
    pagination,
    setPagination,
    filters,
    setFilters,
    availableFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    suggestions,
    showSuggestions,
    setShowSuggestions
  } = useProductSearch();

  // Hook del carrito
  const { cart, addToCart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice } = useCart();

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      garantee: '',
      procesator: '',
      gpu: '',
      ram: ''
    });
  };

  const handleLogout = () => {
    // Implementar logout
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="customer-shop">
      {/* Header Superior */}
      <header className="customer-shop__header">
        <div className="customer-shop__header-content">
          <div className="customer-shop__logo">
            <link rel="stylesheet" href="ChipMarket" />
            <h1>ChipMarket</h1>
          </div>

          <div className="customer-shop__actions">
            <button
              onClick={() => {
                setShowCart(true);
                setShowProfile(false);
              }}
              className="customer-shop__action-btn"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Carrito</span>
              {getTotalItems() > 0 && (
                <span className="customer-shop__cart-badge">{getTotalItems()}</span>
              )}
            </button>

            <button
              onClick={() => {
                setShowProfile(true);
                setShowCart(false);
              }}
              className="customer-shop__action-btn"
            >
              <User className="w-5 h-5" />
              <span>Perfil</span>
            </button>

            <button className="logout-confirm-btn" onClick={logout}>
                    Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="customer-shop__main">
        {/* Panel de Filtros */}
        {showFilters && (
          <aside className="customer-shop__sidebar">
            <FilterPanel
              filters={filters}
              availableFilters={availableFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>
        )}

        {/* Área de Productos */}
        <main className="customer-shop__content">
          <SearchHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            onSuggestionClick={handleSuggestionClick}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />

          <ProductGridWithCart
            products={products}
            loading={loading}
            error={error}
            viewMode={viewMode}
            pagination={pagination}
            onPageChange={handlePageChange}
            debouncedSearch={debouncedSearch}
            onAddToCart={addToCart}
          />
        </main>

        {/* Panel del Carrito (Slide-in) */}
        {showCart && (
          <div className="cart-panel-overlay" onClick={() => setShowCart(false)}>
            <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
              <div className="cart-panel__header">
                <h2>Carrito de Compras</h2>
                <button onClick={() => setShowCart(false)} className="cart-panel__close">
                  ✕
                </button>
              </div>

              <div className="cart-panel__content">
                {cart.length === 0 ? (
                  <div className="cart-panel__empty">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p>Tu carrito está vacío</p>
                  </div>
                ) : (
                  <>
                    <div className="cart-panel__items">
                      {cart.map((item) => (
                        <div key={item.product.sku} className="cart-item">
                          <img
                            src={item.product.images?.[0] || '/placeholder.png'}
                            alt={item.product.name}
                            className="cart-item__image"
                          />
                          <div className="cart-item__info">
                            <h3 className="cart-item__name">{item.product.name}</h3>
                            <p className="cart-item__price">
                              ${item.product.price.toLocaleString('es-CL')}
                            </p>
                            <div className="cart-item__quantity">
                              <button
                                onClick={() => updateQuantity(item.product.sku, item.quantity - 1)}
                                className="cart-item__qty-btn"
                              >
                                -
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.sku, item.quantity + 1)}
                                className="cart-item__qty-btn"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.sku)}
                            className="cart-item__remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="cart-panel__footer">
                      <div className="cart-panel__total">
                        <span>Total:</span>
                        <span className="cart-panel__total-amount">
                          ${getTotalPrice().toLocaleString('es-CL')}
                        </span>
                      </div>
                      <button className="cart-panel__checkout-btn">
                        Proceder al Pago
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Panel de Perfil (Slide-in) */}
        {showProfile && (
          <div className="profile-panel-overlay" onClick={() => setShowProfile(false)}>
            <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
              <div className="profile-panel__header">
                <h2>Mi Perfil</h2>
                <button onClick={() => setShowProfile(false)} className="profile-panel__close">
                  ✕
                </button>
              </div>

              <div className="profile-panel__content">
                <div className="profile-section">
                  <h3>Información Personal</h3>
                  <div className="profile-field">
                    <label>Nombre</label>
                    <p>{user.name}</p>
                  </div>
                  <div className="profile-field">
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>
                </div>

                <div className="profile-section">
                  <h3>Mis Pedidos</h3>
                  <button className="profile-link-btn">Ver historial de pedidos</button>
                </div>

                <div className="profile-section">
                  <h3>Configuración</h3>
                  <button className="profile-link-btn">Cambiar contraseña</button>
                  <button className="profile-link-btn">Editar dirección</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};