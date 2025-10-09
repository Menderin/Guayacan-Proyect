import React from 'react';
import type { SearchFilters, AvailableFilters } from '../../types/product.types';

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
  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Filtros</h3>
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Limpiar
          </button>
        </div>

        <div className="space-y-4">
          {/* Categoría */}
          {availableFilters?.categories && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) => onFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Todas</option>
                {availableFilters.categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Rango de precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={filters.minPrice}
                onChange={(e) => onFilterChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="Máx"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => onFilterChange('inStock', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Solo en stock</span>
            </label>
          </div>

          {/* Garantía */}
          {availableFilters?.garantees && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Garantía
              </label>
              <select
                value={filters.garantee}
                onChange={(e) => onFilterChange('garantee', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Todas</option>
                {availableFilters.garantees.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          )}

          {/* Procesador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Procesador
            </label>
            <input
              type="text"
              placeholder="ej: Intel i7"
              value={filters.procesator}
              onChange={(e) => onFilterChange('procesator', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* GPU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPU
            </label>
            <input
              type="text"
              placeholder="ej: RTX 3060"
              value={filters.gpu}
              onChange={(e) => onFilterChange('gpu', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* RAM */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RAM
            </label>
            <input
              type="text"
              placeholder="ej: 16GB"
              value={filters.ram}
              onChange={(e) => onFilterChange('ram', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};