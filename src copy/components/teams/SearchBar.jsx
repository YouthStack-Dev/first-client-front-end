import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  className = "",
  initialValue = ""
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const hasSearchQuery = searchQuery.trim() !== '';

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder={placeholder}
        className={`block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
          bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
          focus:border-blue-500 text-sm ${className}`}
      />
      {hasSearchQuery && (
        <button
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 pr-3 flex items-center 
            text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;