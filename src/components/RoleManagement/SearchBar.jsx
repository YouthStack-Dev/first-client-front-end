import React from 'react';
/** @typedef {import('./types').SearchBarProps} SearchBarProps */
import { Search, X } from 'lucide-react';

/**
 * Renders a search bar with a search icon and a clear button.
 * @param {SearchBarProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function SearchBar({ searchQuery, setSearchQuery }) {
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative flex-grow max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Search roles..."
      />
      {searchQuery && (
        <button
          onClick={handleClearSearch}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;