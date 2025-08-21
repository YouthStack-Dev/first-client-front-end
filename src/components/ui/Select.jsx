import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';

 const Select = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option...',
  label = '',
  error = '',
  disabled = false,
  searchable = false,
  clearable = false,
  multiple = false,
  size = 'md',
  variant = 'default',
  className = '',
  dropdownClassName = '',
  optionClassName = '',
  renderOption = null,
  renderValue = null,
  maxHeight = '200px',
  loading = false,
  emptyMessage = 'No options found',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2',
    lg: 'px-4 py-3 text-lg'
  };

  // Style variants
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    primary: 'border-blue-300 focus:border-blue-600 focus:ring-blue-600',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500'
  };

  // Filter options based on search query
  const filteredOptions = searchable && searchQuery
    ? options.filter(option =>
        (option.label || option.name || option.toString())
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : options;

  // Get display value
  const getDisplayValue = () => {
    if (multiple) {
      const selectedOptions = options.filter(opt => 
        Array.isArray(value) ? value.includes(opt.value || opt.id || opt) : false
      );
      if (selectedOptions.length === 0) return placeholder;
      if (selectedOptions.length === 1) return renderValue ? renderValue(selectedOptions[0]) : (selectedOptions[0].label || selectedOptions[0].name || selectedOptions[0]);
      return `${selectedOptions.length} items selected`;
    }

    const selectedOption = options.find(opt => (opt.value || opt.id || opt) === value);
    if (!selectedOption) return placeholder;
    return renderValue ? renderValue(selectedOption) : (selectedOption.label || selectedOption.name || selectedOption);
  };

  // Handle option selection
  const handleOptionClick = (option) => {
    const optionValue = option.value || option.id || option;
    
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : '');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [isOpen, searchable]);

  // Reset highlighted index when options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  const hasValue = multiple ? (Array.isArray(value) && value.length > 0) : value;
  const showClear = clearable && hasValue && !disabled;

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Select Button */}
      <div
        className={`
          relative w-full cursor-pointer border rounded-lg bg-white transition-all duration-200
          ${sizeClasses[size]}
          ${error ? variantClasses.error : variantClasses[variant]}
          ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'hover:border-gray-400'}
          ${isOpen ? 'ring-2 ring-opacity-20' : ''}
          focus:outline-none focus:ring-2 focus:ring-opacity-20
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className={`block truncate ${!hasValue ? 'text-gray-500' : 'text-gray-900'}`}>
            {getDisplayValue()}
          </span>
          
          <div className="flex items-center space-x-1">
            {/* Clear Button */}
            {showClear && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                tabIndex={-1}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            
            {/* Dropdown Arrow */}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg
            ${dropdownClassName}
          `}
          style={{ maxHeight }}
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-auto" style={{ maxHeight: searchable ? `calc(${maxHeight} - 60px)` : maxHeight }}>
            {loading ? (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                <span className="mt-2 block">Loading...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = option.value || option.id || option;
                const isSelected = multiple
                  ? Array.isArray(value) && value.includes(optionValue)
                  : value === optionValue;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={optionValue}
                    className={`
                      px-3 py-2 cursor-pointer flex items-center justify-between transition-colors
                      ${isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      ${isSelected ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}
                      ${optionClassName}
                    `}
                    onClick={() => handleOptionClick(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="truncate">
                      {renderOption ? renderOption(option) : (option.label || option.name || option)}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 ml-2 flex-shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};



export  default Select;