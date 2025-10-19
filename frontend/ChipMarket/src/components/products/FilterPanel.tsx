import React from 'react';
import type { SearchFilters, AvailableFilters } from '../../types/product.types';
import '../../styles/FilterPanel.css';

interface FilterPanelProps {
  filters: SearchFilters;
  availableFilters: AvailableFilters | null;
  onFilterChange: (key: keyof SearchFilters, value: unknown) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  availableFilters,
  onFilterChange,
  onClearFilters
}) => {
  // Contar filtros activos
  const countActiveFilters = (): number => {
    let count = 0;
    if (filters.category) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.inStock) count++;
    if (filters.garantee) count++;
    if (filters.procesator) count++;
    if (filters.gpu) count++;
    if (filters.ram) count++;
    return count;
  };

  const activeFiltersCount = countActiveFilters();

  return (
    <div className="filter-panel-wrapper">
      <div className="filter-panel">
        
        {/* Header */}
        <div className="filter-panel__header">
          <h3 className="filter-panel__title">
            Filtros
            {activeFiltersCount > 0 && (
              <span className="filter-panel__active-count">{activeFiltersCount}</span>
            )}
          </h3>
          <button
            onClick={onClearFilters}
            className="filter-panel__clear-btn"
          >
            Limpiar
          </button>
        </div>

        {/* Filters */}
        <div className="filter-panel__filters">
          
          {/* Categoría */}
          {availableFilters?.categories && (
            <div className="filter-group">
              <label className="filter-group__label">
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) => onFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">Todas</option>
                {availableFilters.categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Rango de precio */}
          <div className="filter-group">
            <label className="filter-group__label">
              Precio
            </label>
            <div className="filter-price-range">
              <input
                type="number"
                placeholder="Mínimo"
                value={filters.minPrice}
                onChange={(e) => onFilterChange('minPrice', e.target.value)}
                className="filter-input"
              />
              <input
                type="number"
                placeholder="Máximo"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="filter-group">
            <label className="filter-checkbox-wrapper">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => onFilterChange('inStock', e.target.checked)}
                className="filter-checkbox"
              />
              <span className="filter-checkbox-label">Solo en stock</span>
            </label>
          </div>

          {/* Garantía */}
          {availableFilters?.garantees && (
            <div className="filter-group">
              <label className="filter-group__label">
                Garantía
              </label>
              <select
                value={filters.garantee}
                onChange={(e) => onFilterChange('garantee', e.target.value)}
                className="filter-select"
              >
                <option value="">Todas</option>
                {availableFilters.garantees.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          )}

          {/* Procesador */}
          <div className="filter-group">
            <label className="filter-group__label">
              Procesador
            </label>
            <input
              type="text"
              placeholder="ej: Intel i7"
              value={filters.procesator}
              onChange={(e) => onFilterChange('procesator', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* GPU */}
          <div className="filter-group">
            <label className="filter-group__label">
              GPU
            </label>
            <input
              type="text"
              placeholder="ej: RTX 3060"
              value={filters.gpu}
              onChange={(e) => onFilterChange('gpu', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* RAM */}
          <div className="filter-group">
            <label className="filter-group__label">
              RAM
            </label>
            <input
              type="text"
              placeholder="ej: 16GB"
              value={filters.ram}
              onChange={(e) => onFilterChange('ram', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};