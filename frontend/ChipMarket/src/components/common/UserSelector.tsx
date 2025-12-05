// src/components/common/UserSelector.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ChevronDown } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import type { User as UserType } from '../../types/user.types';
import '../../styles/UserSelector.css';

interface UserSelectorProps {
  selectedUser: UserType | null;
  onUserSelect: (user: UserType | null) => void;
  disabled?: boolean;
  error?: string | null;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUser,
  onUserSelect,
  disabled = false,
  error = null
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { users, loading, searchUsers, getAllUsers } = useUsers();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
    } else {
      getAllUsers();
    }
  }, [searchQuery, searchUsers, getAllUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (user: UserType) => {
    onUserSelect(user);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleClear = () => {
    onUserSelect(null);
    setSearchQuery('');
  };

  return (
    <div className="user-selector" ref={dropdownRef}>
      <label className="user-selector__label">
        Cliente *
      </label>

      {selectedUser ? (
        <div className="user-selector__selected">
          <div className="user-selector__selected-info">
            <User className="user-selector__icon" />
            <div>
              <p className="user-selector__selected-name">{selectedUser.name}</p>
              <p className="user-selector__selected-email">{selectedUser.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="user-selector__clear-btn"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="user-selector__search-container">
          <div className="user-selector__input-wrapper">
            <Search className="user-selector__search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="Buscar cliente por nombre..."
              disabled={disabled}
              className="user-selector__input"
            />
            <ChevronDown className="user-selector__chevron" />
          </div>

          {showDropdown && (
            <div className="user-selector__dropdown">
              {loading ? (
                <div className="user-selector__loading">
                  <div className="spinner"></div>
                  <span>Buscando clientes...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="user-selector__empty">
                  No se encontraron clientes
                </div>
              ) : (
                <ul className="user-selector__list">
                  {users.map((user) => (
                    <li
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="user-selector__item"
                    >
                      <User className="user-selector__item-icon" />
                      <div className="user-selector__item-info">
                        <p className="user-selector__item-name">{user.name}</p>
                        <p className="user-selector__item-email">{user.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="user-selector__error">{error}</p>}
    </div>
  );
};