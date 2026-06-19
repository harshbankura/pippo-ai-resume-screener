import React, { useState, useEffect } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, searchTerm, placeholder = "Search candidates..." }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');

  // Debounced search to avoid excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(localSearchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, onSearch]);

  const handleClear = () => {
    setLocalSearchTerm('');
    onSearch('');
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <i className="fi fi-rr-search search-icon"></i>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
        />
        {localSearchTerm && (
          <button className="clear-search-btn" onClick={handleClear}>
            <i className="fi fi-rr-cross"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
