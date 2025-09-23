import React from 'react';
import { Building2, Edit, Trash, History, UserCheck, UserX } from 'lucide-react';
import { logDebug } from '../../utils/logger';

const DepartmentList = ({
  departments,
  selectedDepartments,
  isLoading,
  searchTerm,
  onSelectDepartment,
  onSelectAllDepartments,
  onEditDepartment,
  onDeleteDepartment,
  onViewEmployees,
  onViewHistory, // New prop for history action
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange
}) => {

  logDebug("Rendering DepartmentList", departments)
  return (
    <>
      <div className="bg-app-surface rounded-lg border border-app-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sidebar-primary-500 mx-auto mb-4"></div>
            <p className="text-app-text-secondary">Loading departments...</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-app-border">
              <thead className="bg-sidebar-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedDepartments.length === departments.length && departments.length > 0}
                      onChange={onSelectAllDepartments}
                      className="rounded border-app-border text-sidebar-primary-600 focus:ring-sidebar-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-app-text-secondary uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-app-text-secondary uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-app-text-secondary uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-app-text-secondary uppercase tracking-wider">
                    Inactive
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-app-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-app-surface divide-y divide-app-border">
                {departments.map((department) => (
                  <tr key={department.id} className="hover:bg-sidebar-primary-25 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(department.id)}
                        onChange={(e) => onSelectDepartment(department.id, e.target.checked)}
                        className="rounded border-app-border text-sidebar-primary-600 focus:ring-sidebar-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-app-text-primary">{department.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-app-text-secondary">{department.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
                        onClick={() => onViewEmployees(department.id, true ,department.name)} 
                        title="View Active Employees"
                      >
                        <UserCheck size={14} className="mr-1" />
                        {department.active || 0}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
                        onClick={() => onViewEmployees(department.id, false)} // for inactive
                        title="View Inactive Employees"
                      >
                        <UserX size={14} className="mr-1" />
                        {department.inactive || 0}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        <button
                          className="text-sidebar-primary-600 hover:text-sidebar-primary-700 transition-colors"
                          onClick={() => onEditDepartment(department)}
                          title="Edit Department"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="text-sidebar-danger-600 hover:text-sidebar-danger-700 transition-colors"
                          onClick={() => onDeleteDepartment(department.id)}
                          title="Delete Department"
                        >
                          <Trash size={16} />
                        </button>
                        <button
                          className="text-sidebar-secondary-600 hover:text-sidebar-secondary-700 transition-colors"
                          onClick={() => onViewHistory(department.id)}
                          title="View History"
                        >
                          <History size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {departments.length === 0 && !isLoading && (
              <div className="p-8 text-center">
                <Building2 className="w-12 h-12 text-app-text-muted mx-auto mb-4" />
                <p className="text-app-text-secondary">
                  {searchTerm ? 'No departments found matching your search' : 'No departments found'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

     
    </>
  );
};

export default DepartmentList;