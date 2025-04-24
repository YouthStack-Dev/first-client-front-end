import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { BookingHistory } from '../components/BookingHistory';
import BookingForm from '../components/BookingForm';
import { useGetBookingsQuery } from '../redux/rtkquery/clientRtk';

// Mock data - Replace with actual API calls
const mockEmployees = [
  { id: "EMP001", name: "John Doe" },
  { id: "EMP002", name: "Jane Smith" },
  { id: "EMP003", name: "Mike Johnson" },
];

const mockBookings = [
  {
    id: "1",
    "customerId": "EMP001",
    employeeName: "John Doe",
    type: "login",
    status: "active",
    shiftTime: "09:00",
    date: "2024-02-20"
  },
  {
    id: "2",
    employeeId: "EMP002",
    employeeName: "Jane Smith",
    type: "logout",
    status: "canceled",
    shiftTime: "17:00",
    date: "2024-02-20"
  }
];

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, isError } = useGetBookingsQuery();
  useEffect(() => {
    if (data) {
      console.log(" this is the booking res" ,data.bookings );
      setBookings(data.bookings)

    }
  }, [data]);
  const handleCreateBooking = (newBooking) => {
    const employee = mockEmployees.find(emp => emp.id === newBooking.employeeId);
    if (!employee) return;

    const booking = {
      id: Math.random().toString(36).substr(2, 9),
      employeeName: employee.name,
      status: 'active',
      ...newBooking
    };

    setBookings(prev => [...prev, booking]);
    setIsModalOpen(false); // Close the modal after submitting
  };

  return (
    <div className=" bg-gray-100 px-4 sm:px-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex justify-between p-3 mb-3 bg-blue-200">
          <h1 className="text-xl font-semibold text-gray-900">Booking Management</h1>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="p-2 bg-blue-600 text-white rounded-lg flex items-center justify-center"
          >
            <Plus size={16} className="mr-1" />
            Add Booking
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div className="lg:col-span-2">
            <BookingHistory bookings={bookings} />
          </div>
        </div>

        {/* Modal for booking form */}
        {isModalOpen && (
          <BookingForm
            employees={mockEmployees}
            onSubmit={handleCreateBooking}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
