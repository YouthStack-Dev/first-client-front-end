import React, { useState, useMemo } from 'react';
import { Eye, Pencil, Plus } from 'lucide-react';
import ToolBar from '../ui/ToolBar';
import SearchBar from './SearchBar'; // Import the new SearchBar component
import { logDebug } from '../../utils/logger';

const EmployeeList = ({
  employees = [],
  loading = false,
  error = '',
  selectedEmployeeIds = [],
  onAddClick,
  onCheckboxChange,
  onRowClick,
  onEdit,
  onView
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter employees based on search query (name and mobile number)
  const filteredEmployees = useMemo(() => {
    if (!employees || employees.length === 0) return [];

    if (!searchQuery.trim()) return employees;

    const query = searchQuery.toLowerCase().trim();

    return employees.filter(employee => {
      const nameMatch = employee.name?.toLowerCase().includes(query);
      const mobileMatch = employee.mobile_number?.toString().includes(query);

      return nameMatch || mobileMatch;
    });
  }, [employees, searchQuery]);

  const hasActiveSearch = searchQuery.trim() !== '';

  logDebug("this is the employees in employee list", employees);
  logDebug("filtered employees", filteredEmployees);
  logDebug("current search query", searchQuery);

  return (
    <div className="space-y-4">
<ToolBar
  onAddClick={onAddClick}
  addButtonLabel="Add employee"
  addButtonIcon={<Plus size={16} />}
  className="p-4 bg-white border rounded shadow-sm"
  searchBar={
    <SearchBar
      placeholder="Search by name or mobile number..."
      onSearch={setSearchQuery}
      className="max-w-md"
    />
  }
/>


      {/* Results count - moved to below the toolbar */}
      {!loading && !error && (
        <div className="px-4 text-xs text-gray-600">
          {hasActiveSearch ? (
            <>
              Showing {filteredEmployees.length} of {employees.length} employees
              {filteredEmployees.length === 0 && " - No matches found"}
            </>
          ) : (
            `Total: ${employees.length} employees`
          )}
        </div>
      )}

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-medium">
            <tr>
              <th className="p-4">
                <input type="checkbox" disabled className="w-4 h-4" />
              </th>
              <th className="p-4">Name</th>
              <th className="p-4">Employee Code</th>
              <th className="p-4">Email</th>
              <th className="p-4">Mobile Number</th>
              <th className="p-4">Gender</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  Loading employees...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-red-500">
                  Failed to load employees: {error}
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  {hasActiveSearch ? 'No employees match your search.' : 'No employees found.'}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr
                  key={employee.employee_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRowClick?.(employee)}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.includes(employee.employee_id)}
                      onChange={() => onCheckboxChange?.(employee.employee_id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4">{employee.name}</td>
                  <td className="p-4">{employee.employee_code}</td>
                  <td className="p-4">{employee.email}</td>
                  <td className="p-4">{employee.mobile_number}</td>
                  <td className="p-4">{employee.gender}</td>
                  <td
                    className="p-4 flex space-x-2 justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => onView?.(employee, e)}
                      className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                      title="View"
                    >
                      <Eye className="w-5 h-5" />
                    </button>

                    <button
                      onClick={(e) => onEdit?.(employee, e)}
                      className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-800 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;