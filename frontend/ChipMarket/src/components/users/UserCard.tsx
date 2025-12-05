// src/components/users/UserCard.tsx
import React from 'react';
import { Mail, Calendar, Shield } from 'lucide-react';
import type { User } from '../../types/user.types';
import '../../styles/ProductCard.css';

interface UserCardProps {
  user: User;
  viewMode: 'grid' | 'list';
}

export const UserCard: React.FC<UserCardProps> = ({ user, viewMode }) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeClass = (roleName: string): string => {
    const role = roleName.toLowerCase();
    if (role === 'admin' || role === 'administrador') {
      return 'card__badge--admin';
    }
    return 'card__badge--customer';
  };

  if (viewMode === 'list') {
    return (
      <tr className="card card--list">
        <td className="card__content">
          <div className="card__header">
            <h3 className="card__title">{user.name}</h3>
            <span className={`card__badge ${getRoleBadgeClass(user.role.role_name)}`}>
              {user.role.role_name}
            </span>
          </div>
        </td>
        <td>
          <div className="card__user-info">
            <p className="card__email">
              <Mail className="card__info-icon" />
              <span>{user.email}</span>
            </p>
          </div>
        </td>
        <td>
          <p className="card__date">
            <Calendar className="card__info-icon" />
            <span>{formatDate(user.created_at)}</span>
          </p>
        </td>
        <td>
          <p className="card__user-id">
            <Shield className="card__info-icon" />
            <span>ID: {user.id}</span>
          </p>
        </td>
        <td>
          <div className="card__footer">
            <div className="card__user-stats">
              <span className="card__stat-label">Usuario desde</span>
              <span className="card__stat-value">
                {new Date(user.created_at).getFullYear()}
              </span>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  //  Vista Grid (por defecto)
  return (
    <div className="card">
      <div className="card__content">
        <div className="card__header">
          <h3 className="card__title">{user.name}</h3>
          <span className={`card__badge ${getRoleBadgeClass(user.role.role_name)}`}>
            {user.role.role_name}
          </span>
        </div>

        <div className="card__user-info">
          <p className="card__email">
            <Mail className="card__info-icon" />
            <span>{user.email}</span>
          </p>
          <p className="card__date">
            <Calendar className="card__info-icon" />
            <span>{formatDate(user.created_at)}</span>
          </p>
          <p className="card__user-id">
            <Shield className="card__info-icon" />
            <span>ID: {user.id}</span>
          </p>
        </div>

        <div className="card__footer">
          <div className="card__user-stats">
            <span className="card__stat-label">Usuario desde</span>
            <span className="card__stat-value">
              {new Date(user.created_at).getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};