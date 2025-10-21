import React from 'react';
import { Search, X } from 'lucide-react';
import '../../styles/SearchBar.css';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  onSuggestionClick: (suggestion: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  onSuggestionClick
}) => {
  const handleClear = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar-wrapper">
        <Search className="search-bar-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Buscar productos por nombre, categoría o componentes..."
          className="search-bar-input"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="search-bar-clear-btn"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions-dropdown">
          <ul className="search-suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  onClick={() => onSuggestionClick(suggestion)}
                  className="search-suggestion-item"
                >
                  <Search className="search-suggestion-icon" />
                  <span className="search-suggestion-text">{suggestion}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};