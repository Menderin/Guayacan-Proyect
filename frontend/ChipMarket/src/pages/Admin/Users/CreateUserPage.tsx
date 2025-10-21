// src/pages/Admin/Users/CreateUserPage.tsx
import React from 'react';
import { useCreateUser } from '../../../hooks/useCreateUser';
import { useUsers } from '../../../context/UserContext';
import '../../../styles/CreateUserPage.css';

export const CreateUserPage: React.FC = () => {
  const { fetchUsers } = useUsers();
  const {
    formData,
    errors,
    successMessage,
    errorMessage,
    loading,
    handleChange,
    handleSubmit,
    resetForm
  } = useCreateUser();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit();
    if (success) {
      // Recargar la lista de usuarios después de crear uno nuevo
      await fetchUsers();
    }
  };

  return (
    <div className="create-user-page">
      <div className="create-user-header">
        <h2 className="create-user-header__title">Agregar Nuevo Cliente</h2>
        <p className="create-user-header__subtitle">
          Complete el formulario para registrar un nuevo cliente en el sistema
        </p>
      </div>

      <div className="create-user-form-container">
        <form onSubmit={onSubmit} className="create-user-form">
          {/* Mensajes de éxito/error */}
          {successMessage && (
            <div className="create-user-form__message create-user-form__message--success">
              <span className="create-user-form__message-icon">✓</span>
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="create-user-form__message create-user-form__message--error">
              <span className="create-user-form__message-icon">✕</span>
              {errorMessage}
            </div>
          )}

          {/* Campo Nombre */}
          <div className="create-user-form__field">
            <label htmlFor="name" className="create-user-form__label">
              Nombre completo <span className="create-user-form__required">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`create-user-form__input ${errors.name ? 'create-user-form__input--error' : ''}`}
              placeholder="Ej: Juan Pérez González"
              disabled={loading}
            />
            {errors.name && (
              <span className="create-user-form__error">{errors.name}</span>
            )}
          </div>

          {/* Campo Email */}
          <div className="create-user-form__field">
            <label htmlFor="email" className="create-user-form__label">
              Correo electrónico <span className="create-user-form__required">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`create-user-form__input ${errors.email ? 'create-user-form__input--error' : ''}`}
              placeholder="Ej: juan.perez@example.com"
              disabled={loading}
            />
            {errors.email && (
              <span className="create-user-form__error">{errors.email}</span>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className="create-user-form__field">
            <label htmlFor="password" className="create-user-form__label">
              Contraseña <span className="create-user-form__required">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`create-user-form__input ${errors.password ? 'create-user-form__input--error' : ''}`}
              placeholder="Mínimo 8 caracteres"
              disabled={loading}
            />
            {errors.password ? (
              <span className="create-user-form__error">{errors.password}</span>
            ) : (
              <span className="create-user-form__hint">
                La contraseña debe contener: mayúscula, minúscula, número y mínimo 8 caracteres
              </span>
            )}
          </div>

          {/* Información adicional */}
          <div className="create-user-form__info">
            <p className="create-user-form__info-text">
              ℹ️ El usuario será creado con el rol de <strong>Cliente</strong> por defecto.
            </p>
          </div>

          {/* Botones */}
          <div className="create-user-form__buttons">
            <button
              type="button"
              onClick={resetForm}
              className="create-user-form__reset-btn"
              disabled={loading}
            >
              Limpiar Formulario
            </button>
            <button
              type="submit"
              className="create-user-form__submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="create-user-form__spinner"></span>
                  Creando...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Crear Cliente
                </>
              )}
            </button>
          </div>
        </form>

        {/* Información de ayuda */}
        <div className="create-user-help">
          <h3 className="create-user-help__title">📋 Información importante</h3>
          <ul className="create-user-help__list">
            <li>El email debe ser único en el sistema</li>
            <li>La contraseña será encriptada automáticamente</li>
            <li>El cliente podrá iniciar sesión inmediatamente después de ser creado</li>
            <li>Todos los campos marcados con (*) son obligatorios</li>
          </ul>
        </div>
      </div>
    </div>
  );
};