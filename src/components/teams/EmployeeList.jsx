import { Edit, Eye, Pencil, ScanEye } from 'lucide-react';

const EmployeeList = ({
  employees = [],
  loading = false,
  error = '',
  selectedEmployeeIds = [],
  onCheckboxChange,
  onRowClick,
  onEdit,
  onView,
  hasActiveSearch = false // Added this prop
}) => {

  return (
    <div className="space-y-4">
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
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                    Loading employees...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-red-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Failed to load employees: {error}
                  </div>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {hasActiveSearch ? 'No employees match your search.' : 'No employees found.'}
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr
                  key={employee.employee_id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={(e) => onRowClick?.(employee, e)}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.includes(employee.employee_id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onCheckboxChange?.(employee.employee_id);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4 font-medium text-gray-900">{employee.name}</td>
                  <td className="p-4 text-gray-600">{employee.employee_code}</td>
                  <td className="p-4 text-gray-600">{employee.email}</td>
                  <td className="p-4 text-gray-600">{employee.mobile_number}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.gender?.toLowerCase() === 'female' 
                        ? 'bg-pink-100 text-pink-800' 
                        : employee.gender?.toLowerCase() === 'male'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.gender || 'Not specified'}
                    </span>
                  </td>
                  <td
                    className="p-4 flex space-x-2 justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView?.(employee);
                      }}
                      className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(employee);
                      }}
                      className="p-2 rounded-full bg-green-50  hover:bg-green-100 hover:text-green-800 transition-colors duration-200"
                      title="Edit"
                    >
                      <Edit  size={16} />
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