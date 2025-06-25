import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { mockVehicles } from '../../staticData/mockTrackingData';

const SearchBox = ({ onVehicleSelect, selectedVehicle }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (query.length > 0) {
      const lowerQuery = query.toLowerCase();

      const filtered = mockVehicles
        .filter(vehicle =>
          vehicle.vehicleNumber.toLowerCase().includes(lowerQuery) ||
          vehicle.driver.name.toLowerCase().includes(lowerQuery)
        )
        .map(vehicle => {
          const isVehicleMatch = vehicle.vehicleNumber.toLowerCase().includes(lowerQuery);
          return {
            id: vehicle.id,
            type: isVehicleMatch ? 'vehicle' : 'driver',
            displayText: isVehicleMatch
              ? `${vehicle.vehicleNumber} (${vehicle.driver.name})`
              : `${vehicle.driver.name} (${vehicle.vehicleNumber})`,
            vehicle
          };
        });

      setSuggestions(filtered);
      setShowSuggestions(true);
      setActiveSuggestion(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.displayText);
    setShowSuggestions(false);
    onVehicleSelect(suggestion.vehicle);
    setActiveSuggestion(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        handleSuggestionClick(suggestions[activeSuggestion]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder="Search by vehicle number or driver name..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                index === activeSuggestion
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{suggestion.displayText}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  suggestion.vehicle.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : suggestion.vehicle.status === 'inactive'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {suggestion.vehicle.status}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {suggestion.vehicle.type} • {suggestion.vehicle.model}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
