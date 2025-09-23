import React, { useState, useEffect } from 'react';
import ReactSearchBox from 'react-search-box';
import { Building, User } from 'lucide-react';

const EnhancedSearchInput = ({ onSearchChange, onSelect, placeholder }) => {
  const [searchType, setSearchType] = useState('department'); // 'department' or 'employee'
  const [searchData, setSearchData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch search suggestions based on type and query
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSearchData([]);
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = searchType === 'department' 
        ? `/api/departments/search?q=${query}`
        : `/api/employees/search?q=${query}`;
      
      const response = await API_CLIENT.get(endpoint);
      
      const formattedData = response.data.map(item => ({
        key: item.id.toString(),
        value: searchType === 'department' ? item.name : `${item.first_name} ${item.last_name}`,
        item: item // Store the full object for later use
      }));
      
      setSearchData(formattedData);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setSearchData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    onSearchChange(value);
    fetchSuggestions(value);
  };

  const handleSelect = (record) => {
    onSelect(record.item, searchType);
  };

  const toggleSearchType = () => {
    setSearchType(prevType => prevType === 'department' ? 'employee' : 'department');
    setSearchData([]); // Clear previous suggestions when changing type
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <button
        onClick={toggleSearchType}
        className="flex items-center gap-1 px-3 py-2 bg-gray-200 rounded-l-lg hover:bg-gray-300 transition"
        title={`Search by ${searchType === 'department' ? 'Employee' : 'Department'}`}
      >
        {searchType === 'department' ? (
          <>
            <Building size={16} />
            <span className="hidden sm:inline">Dept</span>
          </>
        ) : (
          <>
            <User size={16} />
            <span className="hidden sm:inline">Emp</span>
          </>
        )}
      </button>
      
      <div className="flex-grow">
        <ReactSearchBox
          placeholder={placeholder || `Search ${searchType}s...`}
          data={searchData}
          onSelect={handleSelect}
          onChange={handleSearchChange}
          autoFocus={false}
          clearOnSelect={false}
          fuseConfigs={{
            threshold: 0.3, // Adjust search sensitivity
          }}
          inputFontColor="#333"
          inputBorderColor="#ccc"
          inputFontSize="14px"
          inputHeight="40px"
          inputBackgroundColor="#fff"
          dropDownHoverColor="#f0f0f0"
          dropDownBorderColor="#e0e0e0"
          leftIcon={isLoading ? 
            <div className="spinner">Loading...</div> : 
            (searchType === 'department' ? <Building size={16} /> : <User size={16} />)
          }
          iconBoxSize="16px"
        />
      </div>
    </div>
  );
};

export default EnhancedSearchInput;