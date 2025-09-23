import React, { useState } from 'react';
import { X, Calendar, UserX } from 'lucide-react';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WeekOffModal = ({ employee, onClose }) => {
  const [selectedDay, setSelectedDay] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDay || !reason) {
      alert('Please select a day and enter a reason.');
      return;
    }

    const weekOffData = {
      employeeId: employee.id,
      employeeName: employee.name,
      weekOffDay: selectedDay,
      reason,
      createdAt: new Date().toISOString(),
    };

    console.log('Week off request:', weekOffData);
    alert('Week off request submitted successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <UserX className="text-orange-500" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Week Off Request
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Employee:</span> {employee.name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Position:</span> {employee.position}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">ID:</span> {employee.id}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Select Week Off Day
              </label>
              <div className="grid grid-cols-2 gap-2">
                {weekdays.map((day) => (
                  <label
                    key={day}
                    className="flex items-center space-x-2 p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="weekOffDay"
                      value={day}
                      checked={selectedDay === day}
                      onChange={(e) => setSelectedDay(e.target.value)}
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for week off..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WeekOffModal;
