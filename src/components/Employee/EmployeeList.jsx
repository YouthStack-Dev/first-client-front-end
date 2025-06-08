import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Calendar, History, UserX, ArrowLeft, Download, Trash2 } from 'lucide-react';
import { mockEmployees, mockTeams  ,mockBookings} from '../../staticData/EmployeMockData';
import BookingModal from '../modals/BookingModalProps';
import EmployeeHistoryModal from '../modals/EmployeeHistoryModalProps';
import WeekOffModal from '../modals/WeekOffModal';
// import { mockEmployees, mockTeams, mockBookings } from '../data/mockData';
// import BookingModal from './BookingModal';
// import EmployeeHistoryModal from './EmployeeHistoryModal';
// import WeekOffModal from './WeekOffModal';

const EmployeeList = () => {
  const { teamId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showWeekOffModal, setShowWeekOffModal] = useState(false);

  const team = mockTeams.find(t => t.id === parseInt(teamId || '0'));
  const employees = mockEmployees.filter(emp => 
    emp.teamId === parseInt(teamId || '0') &&
    emp.status === 'active' &&
    (emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
     emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     emp.id.toString().includes(searchQuery))
  );

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
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

  const handleBookingSubmit = (bookingData) => {
    console.log('New booking:', bookingData);
    setShowBookingModal(false);
    setSelectedEmployee(null);
  };

  const handleBulkActions = (action) => {
    if (selectedEmployees.length === 0) {
      alert('Please select employees first');
      return;
    }

    switch (action) {
      case 'download':
        console.log('Downloading report for employees:', selectedEmployees);
        break;
      case 'delete':
        console.log('Deleting employees:', selectedEmployees);
        setSelectedEmployees([]);
        break;
      default:
        break;
    }
  };

  const isAllSelected = employees.length > 0 && selectedEmployees.length === employees.length;
  const isIndeterminate = selectedEmployees.length > 0 && selectedEmployees.length < employees.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className=" mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {team?.name} - Active Employees
            </h1>
            <p className="text-gray-600">Manager: {team?.manager}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <button 
              onClick={() => handleBulkActions('download')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
            >
              <Download size={16} /> Download Report
            </button>

            {selectedEmployees.length > 0 && (
              <button 
                onClick={() => handleBulkActions('delete')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm transition-colors"
              >
                <Trash2 size={16} /> Delete Selected ({selectedEmployees.length})
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search employees by name, position, email, or ID..."
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
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 font-medium text-gray-900">Select All</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Employee ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Position</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleSelectEmployee(employee.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">#{employee.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{employee.position}</td>
                    <td className="px-4 py-3 text-gray-700">{employee.email}</td>
                    <td className="px-4 py-3 text-gray-700">{employee.phone}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBookRide(employee)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Calendar size={12} />
                          Book Ride
                        </button>
                        <button
                          onClick={() => handleViewHistory(employee)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <History size={12} />
                          History
                        </button>
                        <button
                          onClick={() => handleWeekOff(employee)}
                          className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <UserX size={12} />
                          Week Off
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {employees.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No employees found matching your search criteria.</p>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {employees.length} active employees
          {selectedEmployees.length > 0 && (
            <span className="ml-2 font-medium">• {selectedEmployees.length} selected</span>
          )}
        </div>

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
            bookings={mockBookings.filter(b => b.employeeId === selectedEmployee.id)}
            onClose={() => setShowHistoryModal(false)}
          />
        )}

        {showWeekOffModal && selectedEmployee && (
          <WeekOffModal
            employee={selectedEmployee}
            onClose={() => setShowWeekOffModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
