import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Calendar, History, UserX, ArrowLeft, Download, Trash2, Edit, Eye } from 'lucide-react';
import { mockTeams, mockBookings } from '../../staticData/EmployeMockData';
import BookingModal from '../modals/BookingModalProps';
import EmployeeHistoryModal from '../modals/EmployeeHistoryModalProps';
import WeekOffModal from '../modals/WeekOffModal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeesOfDepartment } from '../../redux/features/manageTeam/manageTeamThunks';
import { log } from '../../utils/logger';
import EmployeeForm from '../EmployeeForm';

const EmployeeList = () => {
  const { teamId } = useParams();
  const dispatch = useDispatch();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showWeekOffModal, setShowWeekOffModal] = useState(false);
  const [formMode, setFormMode] = useState(null); // null, 'edit', or 'view'

  // Get data from Redux
  const { employees, employeesStatus: status, employeesError: error } = useSelector(state => state.manageTeam);

  log(`🚀 Department ID from route: ${teamId}`);
  log(`📦 Employees from Redux: `, employees);

  // Get team info from static mock
  const team = mockTeams.find(t => t.id === parseInt(teamId || '0'));

  // Load employees on mount
  useEffect(() => {
    if (teamId) {
      log("📡 Dispatching fetchEmployeesOfDepartment with departmentId:", teamId);
      dispatch(fetchEmployeesOfDepartment({ departmentId: teamId }));
    }
  }, [dispatch, teamId]);

  // Filter employees by search
  const filteredEmployees = (employees || []).filter(emp =>
    (emp.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (emp.position && emp.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
     emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
     emp.user_id.toString().includes(searchQuery))
  );

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.user_id));
    }
  };

  const handleSelectEmployee = (employeeUserId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeUserId) ? prev.filter(id => id !== employeeUserId) : [...prev, employeeUserId]
    );
  };

  const handleBookRide = (employee) => {
    setSelectedEmployee(employee);
    setShowBookingModal(true);
  };

  const handleViewHistory = (employee) => {
    setSelectedEmployee(employee);
    setShowHistoryModal(true);
  };

  const handleWeekOff = (employee) => {
    setSelectedEmployee(employee);
    setShowWeekOffModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setFormMode('edit');
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setFormMode('view');
  };

  const handleBookingSubmit = (bookingData) => {
    log('✅ New booking submitted:', bookingData);
    setShowBookingModal(false);
    setSelectedEmployee(null);
  };

  const handleBulkActions = (action) => {
    if (selectedEmployees.length === 0) {
      alert('Please select employees first');
      return;
    }
    if (action === 'download') {
      log('⬇ Downloading report for employees:', selectedEmployees);
    } else if (action === 'delete') {
      log('🗑 Deleting employees:', selectedEmployees);
      setSelectedEmployees([]);
    }
  };

  const handleCloseForm = () => {
    setFormMode(null);
    setSelectedEmployee(null);
  };

  const isAllSelected = filteredEmployees.length > 0 && selectedEmployees.length === filteredEmployees.length;
  const isIndeterminate = selectedEmployees.length > 0 && selectedEmployees.length < filteredEmployees.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto">
        {formMode ? (
          <>
            <button
              onClick={handleCloseForm}
              className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={20} /> Back to Employee List
            </button>
            <EmployeeForm
              mode={formMode}
              employeeId={selectedEmployee?.user_id}
              onClose={handleCloseForm}
            />
          </>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-200 rounded-lg">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {team?.name} - Active Employees
                </h1>
                <p className="text-gray-600">Manager: {team?.manager || 'N/A'}</p>
              </div>
            </div>

            {/* Status & error logging */}
            {status === 'loading' && <p className="text-blue-500">Loading employees...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {status === 'succeeded' && filteredEmployees.length === 0 && !searchQuery && (
              <p className="text-gray-500 text-center mt-8">No active employees found in this department.</p>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 flex-wrap">
                {selectedEmployees.length > 0 && (
                  <button
                    onClick={() => handleBulkActions('delete')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
                  >
                    <Trash2 size={16} /> Delete Selected ({selectedEmployees.length})
                  </button>
                )}
              </div>
              <div className="relative max-w-md">
                <Search

 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="min-w-full table-auto text-sm">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600"
                        />
                      </th>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Position</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <tr key={employee.user_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.includes(employee.user_id)}
                              onChange={() => handleSelectEmployee(employee.user_id)}
                              className="h-4 w-4 text-blue-600"
                            />
                          </td>
                          <td className="px-4 py-3">#{employee.employee_code}</td>
                          <td className="px-4 py-3">{employee.username}</td>
                          <td className="px-4 py-3">{employee.position || 'N/A'}</td>
                          <td className="px-4 py-3">{employee.email}</td>
                          <td className="px-4 py-3">{employee.mobile_number || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                          </td>
                          <td className="px-4 py-3 flex gap-1">
                            <button
                              onClick={() => handleBookRide(employee)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                            >
                              Book
                            </button>
                            <button
                              onClick={() => handleViewHistory(employee)}
                              className="bg-gray-200 px-2 py-1 rounded text-xs"
                            >
                              History
                            </button>
                            <button
                              onClick={() => handleWeekOff(employee)}
                              className="bg-orange-200 px-2 py-1 rounded text-xs"
                            >
                              Week Off
                            </button>
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                            >
                              <Edit size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleViewEmployee(employee)}
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                            >
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                          {status === 'loading' ? 'Loading employees...' : 'No employees found matching your criteria.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredEmployees.length === 0 && !status.includes('loading') && searchQuery && (
              <div className="py-12 text-center text-gray-500">No employees found matching "{searchQuery}".</div>
            )}
            {filteredEmployees.length === 0 && !status.includes('loading') && !searchQuery && (
              <div className="py-12 text-center text-gray-500">No active employees to display in this department.</div>
            )}

            {/* Modals */}
            {showBookingModal && selectedEmployee && (
              <BookingModal
                employee={selectedEmployee}
                onClose={() => setShowBookingModal(false)}
                onSubmit={handleBookingSubmit}
              />
            )}
            {showHistoryModal && selectedEmployee && (
              <EmployeeHistoryModal
                employee={selectedEmployee}
                bookings={mockBookings.filter(b => b.employeeId === selectedEmployee.user_id)}
                onClose={() => setShowHistoryModal(false)}
              />
            )}
            {showWeekOffModal && selectedEmployee && (
              <WeekOffModal
                employee={selectedEmployee}
                onClose={() => setShowWeekOffModal(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;