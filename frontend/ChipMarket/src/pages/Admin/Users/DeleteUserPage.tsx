// src/pages/Admin/Users/DeleteUserPage.tsx
import React, { useState } from 'react';
import { useUsers } from '../../../context/UserContext';
import type { User } from '../../../types/user.types';
import '../../../styles/DeleteUserPage.css';

export const DeleteUserPage: React.FC = () => {
  const { users, loading, fetchUsers, hasLoaded } = useUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (!hasLoaded && !loading) {
      fetchUsers();
    }
  }, [hasLoaded, loading, fetchUsers]);

  // 👇 CAMBIO AQUÍ: user.role.role_name en lugar de user.id_role
  const filteredUsers = users.filter(user => {
    // Solo clientes (role_name debe ser algo como "Cliente" o "User", no "Admin")
    const isClient = user.role.role_name.toLowerCase() !== 'admin';
    
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm);
    
    return isClient && matchesSearch;
  });

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
    setMessage(null);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setDeleting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`http://localhost:3000/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Error al eliminar usuario');
      }

      setMessage({ type: 'success', text: `Usuario "${selectedUser.name}" eliminado exitosamente` });
      setShowModal(false);
      setSelectedUser(null);
      
      await fetchUsers();

    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al eliminar usuario' 
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedUser(null);
    setMessage(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !hasLoaded) {
    return (
      <div className="delete-user-state">
        <p className="delete-user-state__message">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="delete-user-page">
      <div className="delete-user-header">
        <h2 className="delete-user-header__title">Eliminar Cliente</h2>
        <p className="delete-user-header__subtitle">
          Busca y selecciona el cliente que deseas eliminar del sistema
        </p>
      </div>

      {message && (
        <div className={`delete-user-message delete-user-message--${message.type}`}>
          <span className="delete-user-message__icon">
            {message.type === 'success' ? '✓' : '✕'}
          </span>
          {message.text}
        </div>
      )}

      <div className="delete-user-search">
        <input
          type="text"
          placeholder="Buscar por ID, nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="delete-user-search__input"
        />
        <span className="delete-user-search__count">
          {filteredUsers.length} cliente{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="delete-user-warning">
        <span className="delete-user-warning__icon">⚠️</span>
        <div>
          <p className="delete-user-warning__title">Advertencia</p>
          <p className="delete-user-warning__text">
            Esta acción es irreversible. Solo se pueden eliminar clientes, no administradores.
          </p>
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <div className="delete-user-list">
          <table className="delete-user-table">
            <thead className="delete-user-table__head">
              <tr>
                <th className="delete-user-table__header">ID</th>
                <th className="delete-user-table__header">Nombre</th>
                <th className="delete-user-table__header">Email</th>
                <th className="delete-user-table__header">Rol</th>
                <th className="delete-user-table__header">Fecha de Registro</th>
                <th className="delete-user-table__header">Acción</th>
              </tr>
            </thead>
            <tbody className="delete-user-table__body">
              {filteredUsers.map(user => (
                <tr key={user.id} className="delete-user-table__row">
                  <td className="delete-user-table__cell">{user.id}</td>
                  <td className="delete-user-table__cell delete-user-table__cell--name">
                    {user.name}
                  </td>
                  <td className="delete-user-table__cell">{user.email}</td>
                  <td className="delete-user-table__cell">
                    <span className="delete-user-table__role-badge">
                      {user.role.role_name}
                    </span>
                  </td>
                  <td className="delete-user-table__cell">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="delete-user-table__cell">
                    <button
                      onClick={() => handleSelectUser(user)}
                      className="delete-user-table__delete-btn"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="delete-user-empty">
          <p className="delete-user-empty__message">
            {searchTerm ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados'}
          </p>
        </div>
      )}

      {showModal && selectedUser && (
        <div className="delete-user-modal">
          <div className="delete-user-modal__overlay" onClick={handleCancel} />
          <div className="delete-user-modal__content">
            <div className="delete-user-modal__header">
              <h3 className="delete-user-modal__title">⚠️ Confirmar Eliminación</h3>
            </div>

            <div className="delete-user-modal__body">
              <p className="delete-user-modal__text">
                ¿Estás seguro de que deseas eliminar este cliente?
              </p>
              
              <div className="delete-user-modal__info">
                <p><strong>ID:</strong> {selectedUser.id}</p>
                <p><strong>Nombre:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Rol:</strong> {selectedUser.role.role_name}</p>
              </div>

              <p className="delete-user-modal__warning">
                Esta acción es <strong>irreversible</strong> y eliminará permanentemente todos los datos del usuario.
              </p>
            </div>

            <div className="delete-user-modal__footer">
              <button
                onClick={handleCancel}
                className="delete-user-modal__cancel-btn"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="delete-user-modal__confirm-btn"
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};