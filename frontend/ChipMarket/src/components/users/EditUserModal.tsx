// src/components/users/EditUserModal.tsx

import React, { useState } from 'react'; // 1. useState está importado
import type { User } from '../../types/user.types';

// Importamos el CSS
import '../../styles/EditUserModal.css'; 

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2. AÑADIMOS EL NUEVO ESTADO PARA LA CONTRASEÑA
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (password && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const body: any = { name: name.trim() };
      if (password) {
        body.password = password;
      }

      const response = await fetch(
        // Asegúrate que esta URL sea correcta para tu API
        `http://localhost:3000/api/users/edit-user/${user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (data.success) { // Asumo que tu API devuelve { success: true, data: ... }
        onSave(data.data); // Pasamos el usuario actualizado
      } else {
        setError(data.message || 'Error al actualizar usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (sin cambios) */}
        <div className="modal-header">
          <h2 className="modal-title">
            <span>✏️</span>
            Editar Usuario
          </h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            &times; {/* Este es el caracter '×' */}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Email (sin cambios) */}
          <div className="modal-form-group">
            <label className="modal-label">
              <span>📧</span>
              Email (no editable)
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="modal-input modal-input--disabled"
            />
          </div>

          {/* Nombre (sin cambios) */}
          <div className="modal-form-group">
            <label htmlFor="name" className="modal-label">
              <span>👤</span>
              Nombre completo *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingrese el nombre"
              required
              minLength={2}
              maxLength={100}
              className="modal-input"
            />
          </div>

          {/* === CAMBIOS EN EL GRUPO DE CONTRASEÑA === */}
          <div className="modal-form-group">
            <label htmlFor="password" className="modal-label">
              <span>🔒</span>
              Nueva contraseña (opcional)
            </label>
            
            {/* 3. Contenedor para posicionar el icono */}
            <div className="modal-input-wrapper">
              <input
                // 4. Tipo de input dinámico
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dejar en blanco para no cambiar"
                minLength={6}
                className="modal-input" // El CSS se encargará del padding
              />
              
              {/* 5. Botón para mostrar/ocultar */}
              <button
                type="button" 
                className="modal-password-toggle"
                onClick={() => setShowPassword(!showPassword)} // Cambia el estado
              >
                {/* Muestra un icono u otro */}
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            <p className="modal-input-hint">
              Mínimo 6 caracteres. Dejar vacío si no desea cambiarla.
            </p>
          </div>
          {/* === FIN DE LOS CAMBIOS === */}


          {/* Error (sin cambios) */}
          {error && (
            <div className="modal-error">
              <span>⚠️</span> {error}
            </div>
          )}
          
          {/* Botones (Footer) (sin cambios) */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="modal-btn modal-btn--secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="modal-btn modal-btn--primary"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};