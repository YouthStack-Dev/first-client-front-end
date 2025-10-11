import React from 'react';
import { Building2, Edit, Trash, History, UserCheck, UserX } from 'lucide-react';
import ReusableButton from '../ui/ReusableButton';

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
                      checked={departments.length > 0 && selectedDepartments.length === departments.length}
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
                {departments?.map((department) => {
                  console.log("Rendering department inside 63:", department);
                  
                  return ( // Added return statement here
                    <tr key={department?.team_id} className="hover:bg-sidebar-primary-25 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(department?.team_id)}
                          onChange={(e) => onSelectDepartment(department?.team_id, e.target.checked)}
                          className="rounded border-app-border text-sidebar-primary-600 focus:ring-sidebar-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-app-text-primary">{department?.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-app-text-secondary">{department?.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <ReusableButton
                        module="team"
                        action="read"
                        icon={UserCheck}
                        buttonName={department?.active_employee_count?.toString() || "0"}
                        title="View Active Employees"
                        onClick={() => onViewEmployees(department?.team_id, true, department?.name)}
                        className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
                      />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <ReusableButton
  module="team"
  action="read"
  icon={UserX}
  buttonName={(department?.inactive_employee_count || 0).toString()}
  title="View Inactive Employees"
  onClick={() => onViewEmployees(department?.team_id, false, department?.name)}
  className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
  size={14}
/>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                      {/* Delete Button (as you already have) */}
                      <ReusableButton
                        module="team"
                        action="delete"
                        icon={Trash}
                        title="Delete Team"
                        onClick={() => alert('No logic has been implemented')}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      />

                      {/* History Button */}
                      <ReusableButton
                        module="team"
                        action="view_history"
                        icon={History}
                        title="View History"
                        onClick={() => onViewHistory(department?.team_id)}
                        className="text-sidebar-secondary-600 hover:text-sidebar-secondary-700 transition-colors"
                      />

                      {/* Edit Button */}
                      <ReusableButton
                        module="team"
                        action="update"
                        icon={Edit}
                        title="Edit Department"
                        onClick={() => onEditDepartment(department)}
                        className="text-sidebar-primary-600 hover:text-sidebar-primary-700 transition-colors"
                      />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {(!departments || departments.length === 0) && !isLoading && (
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