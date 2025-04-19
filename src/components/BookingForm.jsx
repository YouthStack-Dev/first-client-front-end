import React, { useState } from 'react';
import { Search, Clock, X } from 'lucide-react';

const BookingForm = ({ employees, onSubmit, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bookingType, setBookingType] = useState('login');
  const [shiftTime, setShiftTime] = useState('');
  const [date, setDate] = useState('');

  const filteredEmployees = employees.filter(
    (employee) =>
      !selectedEmployees.find(selected => selected.id === employee.id) &&
      (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedEmployees.length === 0 || !shiftTime || !date) return;

    selectedEmployees.forEach(employee => {
      onSubmit({
        employeeId: employee.id,
        type: bookingType,
        shiftTime,
        date,
      });
    });

    setSelectedEmployees([]);
    setSearchTerm('');
    setBookingType('login');
    setShiftTime('');
    setDate('');
    onClose(); // Close the modal after submitting
  };

  const removeEmployee = (employeeId) => {
    setSelectedEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Create New Booking</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search and select multiple employees"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredEmployees.map((employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      onClick={() => {
                        setSelectedEmployees(prev => [...prev, employee]);
                        setSearchTerm('');
                      }}
                    >
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.id}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedEmployees.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                {selectedEmployees.map(employee => (
                  <div
                    key={employee.id}
                    className="flex items-center bg-white px-3 py-1 rounded-full border border-gray-200"
                  >
                    <span className="text-sm font-medium mr-2">{employee.name}</span>
                    <button
                      type="button"
                      onClick={() => removeEmployee(employee.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Booking Type</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="bookingType"
                    value="login"
                    checked={bookingType === 'login'}
                    onChange={(e) => setBookingType(e.target.value)}
                  />
                  <span className="ml-2">Login</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="bookingType"
                    value="logout"
                    checked={bookingType === 'logout'}
                    onChange={(e) => setBookingType(e.target.value)}
                  />
                  <span className="ml-2">Logout</span>
                </label>
              </div>
            </div>

            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="time"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={shiftTime}
                onChange={(e) => setShiftTime(e.target.value)}
                required
              />
            </div>

            <div>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={selectedEmployees.length === 0 || !shiftTime || !date}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Create Bookings ({selectedEmployees.length} {selectedEmployees.length === 1 ? 'employee' : 'employees'})
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
