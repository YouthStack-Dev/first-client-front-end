import React from 'react';
import { Building2, Edit, Trash } from 'lucide-react';
import Pagination from '../Pagination';

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
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange
}) => {
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
                    Employees
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
                        className="bg-sidebar-accent-100 text-sidebar-accent-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-sidebar-accent-200 transition-colors"
                        onClick={() => onViewEmployees(department.id)}
                      >
                        {department.users || 0} 
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        <button
                          className="text-sidebar-primary-600 hover:text-sidebar-primary-700 transition-colors"
                          onClick={() => onEditDepartment(department)}
                        >
                          <Edit size={16} className="inline-block mr-1" />
                        </button>
                        <button
                          className="text-sidebar-danger-600 hover:text-sidebar-danger-700 transition-colors"
                          onClick={() => onDeleteDepartment(department.id)}
                        >
                        <Trash size={16} className="inline-block mr-1" />
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

      {/* Pagination for Departments */}
      {!isLoading && departments.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
};


export default DepartmentList;