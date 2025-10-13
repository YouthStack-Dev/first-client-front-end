import { useState, useEffect } from 'react';
import ProfileCard from '@components/ProfileCard';
import MultiDateCalendar from '@components/MultiDateCalendar';
import ShiftSelector from '@components/ShiftSelector';
import BookingHistory from '@components/BookingHistory';
import { Calendar, CheckCircle, Clock, History } from 'lucide-react';

const employeeData = {
  name: "Sample Tenant Employee Two",
  email: "emp2@emp.com",
  phone: "8000218569",
  employee_code: "SAM001-EMP2",
  alternate_phone: null,
  gender: "Female",
  address: "456 Market Road, Bangalore"
};

const shifts = [
  { id: 1, shift_time: "09:00:00", log_type: "IN" },
  { id: 2, shift_time: "18:00:00", log_type: "OUT" },
  { id: 3, shift_time: "14:00:00", log_type: "IN" },
  { id: 4, shift_time: "22:00:00", log_type: "OUT" },
  { id: 5, shift_time: "06:00:00", log_type: "IN" },
  { id: 6, shift_time: "15:00:00", log_type: "OUT" }
];

// Mock booking history data
const mockBookingHistory = [
  {
    id: 1,
    booking_date: "2024-01-15",
    shift_time: "09:00:00",
    log_type: "IN",
    status: "confirmed",
    created_at: "2024-01-10T10:00:00Z"
  },
  {
    id: 2,
    booking_date: "2024-01-16",
    shift_time: "18:00:00",
    log_type: "OUT",
    status: "confirmed",
    created_at: "2024-01-10T10:00:00Z"
  },
  {
    id: 3,
    booking_date: "2024-01-17",
    shift_time: "14:00:00",
    log_type: "IN",
    status: "cancelled",
    created_at: "2024-01-10T10:00:00Z"
  },
  {
    id: 4,
    booking_date: "2024-01-18",
    shift_time: "22:00:00",
    log_type: "OUT",
    status: "confirmed",
    created_at: "2024-01-10T10:00:00Z"
  },
  {
    id: 5,
    booking_date: "2024-01-19",
    shift_time: "06:00:00",
    log_type: "IN",
    status: "confirmed",
    created_at: "2024-01-10T10:00:00Z"
  }
];

export default function ProfilePage() {
  const [step, setStep] = useState('welcome');
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [bookingHistory, setBookingHistory] = useState([]);

  const restrictedDays = [0, 6];
  const monthsForward = 3;

  // Load booking history on component mount
  useEffect(() => {
    // In a real app, you would fetch this from an API
    setBookingHistory(mockBookingHistory);
  }, []);

  const handleBookingSubmit = async () => {
    if (selectedDates.length === 0 || !selectedShiftId) {
      alert('Please select dates and a shift');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    const selectedShift = shifts.find(shift => shift.id === selectedShiftId);
    const bookingData = {
      booking_dates: selectedDates,
      shift_id: selectedShiftId,
      employee_id: 2
    };

    console.log('Booking submitted:', bookingData);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(`Successfully booked ${selectedDates.length} date(s)!`);
      
      // Add new bookings to history
      const newBookings = selectedDates.map(date => ({
        id: Date.now() + Math.random(),
        booking_date: date,
        shift_time: selectedShift.shift_time,
        log_type: selectedShift.log_type,
        status: "confirmed",
        created_at: new Date().toISOString()
      }));
      
      setBookingHistory(prev => [...newBookings, ...prev]);
      setSelectedDates([]);
      setSelectedShiftId(null);
      setStep('welcome');

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }, 1000);
  };

  const handleNextToShift = () => {
    setStep('shift');
  };

  const handleBackToCalendar = () => {
    setStep('calendar');
    setSelectedShiftId(null);
  };

  const handleViewBookingHistory = () => {
    setStep('history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ProfileCard 
              {...employeeData} 
              onBookShift={() => setStep('calendar')} 
              onViewBookingHistory={handleViewBookingHistory}
            />
          </div>

          <div className="lg:col-span-2">
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3 mb-6 shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            )}

            {step === 'welcome' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Welcome, {employeeData.name}!
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  This is your employee profile. All your information is displayed on the left card.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-blue-900 text-lg">Book Your Shifts</h3>
                    </div>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Use the booking feature to schedule your shifts across multiple dates. Select a date range and choose your preferred shift time.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-6 h-6 text-green-600" />
                      <h3 className="font-semibold text-green-900 text-lg">Flexible Scheduling</h3>
                    </div>
                    <p className="text-sm text-green-700 leading-relaxed">
                      Choose from multiple shift times with both check-in and check-out options. Plan your work schedule easily.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <History className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-purple-900 text-lg">Booking History</h3>
                    </div>
                    <p className="text-sm text-purple-700 leading-relaxed">
                      View your past and upcoming bookings. Track your schedule and manage your shifts efficiently.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3 text-lg">Instructions</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">1.</span>
                      <span>Click the <strong>Book Shift</strong> button on the left to start</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">2.</span>
                      <span>Select a date range on the calendar (weekends are automatically excluded)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">3.</span>
                      <span>Choose your preferred shift time with IN or OUT type</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">4.</span>
                      <span>Submit your booking and you're all set!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">5.</span>
                      <span>View your <strong>Booking History</strong> to see all your scheduled shifts</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {step === 'calendar' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Date Range</h2>
                  <p className="text-gray-600">
                    Click on two dates to select a range. Restricted days will be automatically excluded.
                  </p>
                </div>
                <MultiDateCalendar
                  selectedDates={selectedDates}
                  onDateSelect={setSelectedDates}
                  restrictedDays={restrictedDays}
                  monthsForward={monthsForward}
                  onNext={handleNextToShift}
                />
              </div>
            )}

            {step === 'shift' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Your Shift</h2>
                  <p className="text-gray-600">
                    Choose the shift time that works best for you.
                  </p>
                </div>
                <ShiftSelector
                  shifts={shifts}
                  selectedShiftId={selectedShiftId}
                  onShiftSelect={setSelectedShiftId}
                  selectedDates={selectedDates}
                  onSubmit={handleBookingSubmit}
                  onBack={handleBackToCalendar}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}

            {step === 'history' && (
              <div>
                
                <BookingHistory
                  bookings={bookingHistory}
                  onBack={() => setStep('welcome')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}