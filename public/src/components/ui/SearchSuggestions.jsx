// components/ui/SearchSuggestions.jsx
import React from 'react';
import { UsersRound, User, Plus } from 'lucide-react';

const SearchSuggestions = ({ results, isLoading, onSelect, searchTerm, onCreateNew, onClose }) => {
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-auto">
        <div className="p-4 text-center">Searching...</div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 max-h-60 overflow-auto">
      {results.length > 0 ? (
        results.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
            onClick={() => onSelect(item)}
          >
            {item.type === 'department' ? (
              <UsersRound size={16} className="text-blue-600" />
            ) : (
              <User size={16} className="text-green-600" />
            )}
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-500 capitalize">
                {item.type} {item.department && `• ${item.department}`}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div
          className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
          onClick={onCreateNew}
        >
          <Plus size={16} className="text-blue-600" />
          <div>
            <div className="font-medium">Create "{searchTerm}"</div>
            <div className="text-sm text-gray-500">Create a new department</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;