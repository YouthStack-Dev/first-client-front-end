import React, { useState } from 'react';
import { Search, Calendar, User } from 'lucide-react';

export function BookingHistory({ bookings }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // {
//   "id": 1,
//   "customerId": 1,
//   "shiftId": 1,
//   "vehicleId": 1,
//   "status": "PENDING",
//   "bookingType": "LOGIN",
//   "isAdhoc": false,
//   "createdAt": "2025-04-20T14:01:59.333Z",
//   "updatedAt": "2025-04-20T14:01:59.333Z"
// },


  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || booking.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by employee name or ID"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="date"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          
        </div>
        <div>
        <button className='p-1 bg-blue-600 text-white rounded-lg py-2'>
            Search
        </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User   className="h-5 w-5 text-blue-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.customer.name}</div>
                        <div className="text-sm text-gray-500">{booking.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.bookingType=== "LOGIN" ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.bookingType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.timeshift.shift}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'PENDING' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
