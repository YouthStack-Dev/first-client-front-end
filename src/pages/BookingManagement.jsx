import React, { useEffect, useState } from 'react';
import { BookingHistory } from '../components/BookingHistory';
import BookingForm from '../components/BookingForm';
import HeaderWithActionNoRoute from '../components/HeaderWithActionNoRoute';

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
  const [selectedDate, setSelectedDate] = useState("");
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shiftBookings, setShiftBookings] = useState([]);


   var response ;

  useEffect(() => {
    if (selectedDate) {
      console.log(" thsi si the bookings");
      
      setShiftBookings(response?.TimeShifts || []);
     
      
    }
  }, [selectedDate, response]);

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
        <HeaderWithActionNoRoute
            title="Manage Booking"
            buttonLabel="Add"
            showBackButton={false}
            onButtonClick={() => setIsModalOpen(true)} // or any custom handler
          />

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
