import { useState } from "react";
import ProfileCard from "../components/ProfileCard";
import { Calendar, Clock, History } from "lucide-react";
import MultiDateCalendar from "@components/MultiDateCalendar";
import ShiftSelector from "@components/ShiftSelector";
import BookingHistory from "@components/BookingHistory";
import { useLocation } from "react-router-dom";
import { logDebug } from "../utils/logger";

export default function BookingManagement() {
  const [step, setStep] = useState("welcome"); // 'welcome', 'calendar', 'shift', 'history'
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation(); // ✅ This is what you were missing
  const { employee } = location.state || {}; // safely extract employee

  logDebug("Employee in BookingManagement:", employee);

  // Example data (replace with real data)
  const restrictedDays = [0, 6]; // Sunday (0) and Saturday (6)
  const monthsForward = 3;
  const shifts = [
    {
      id: 1,
      name: "Morning Shift",
      startTime: "09:00",
      endTime: "17:00",
      type: "IN",
    },
    {
      id: 2,
      name: "Evening Shift",
      startTime: "14:00",
      endTime: "22:00",
      type: "OUT",
    },
    {
      id: 3,
      name: "Night Shift",
      startTime: "22:00",
      endTime: "06:00",
      type: "IN",
    },
  ];
  const bookingHistory = []; // Your booking history data

  // 🟦 Book shift handler
  const handleBookShift = () => {
    setStep("calendar");
    setSelectedDates([]);
    setSelectedShiftId(null);
  };

  // 🟪 Booking history handler
  const handleBookingHistory = () => {
    setStep("history");
  };

  // Navigation handlers
  const handleNextToShift = () => {
    if (selectedDates.length >= 1) {
      setStep("shift");
    }
  };

  const handleBackToCalendar = () => {
    setStep("calendar");
  };

  const handleBackToWelcome = () => {
    setStep("welcome");
  };

  // Booking submission handler
  const handleBookingSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Your booking submission logic here
      console.log("Booking details:", {
        employeeId: employee.employee_id,
        dates: selectedDates,
        shiftId: selectedShiftId,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // After successful booking, go back to welcome or show success message
      setStep("welcome");
      setSelectedDates([]);
      setSelectedShiftId(null);
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <ProfileCard
            name={employee.name}
            email={employee.email}
            phone={employee.phone}
            alternate_phone={employee.alternate_phone}
            employee_code={employee.employee_code}
            gender={employee.gender}
            address={employee.address}
            onBookShift={handleBookShift}
            onViewBookingHistory={handleBookingHistory}
          />
        </div>

        {/* Right Column - Dynamic Content */}
        <div className="lg:col-span-3">
          {step === "welcome" && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome, {employee.name}!
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                This is your employee profile. All your information is displayed
                on the left card.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-blue-900 text-lg">
                      Book Your Shifts
                    </h3>
                  </div>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Use the booking feature to schedule your shifts across
                    multiple dates. Select a date range and choose your
                    preferred shift time.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-green-600" />
                    <h3 className="font-semibold text-green-900 text-lg">
                      Flexible Scheduling
                    </h3>
                  </div>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Choose from multiple shift times with both check-in and
                    check-out options. Plan your work schedule easily.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <History className="w-6 h-6 text-purple-600" />
                    <h3 className="font-semibold text-purple-900 text-lg">
                      Booking History
                    </h3>
                  </div>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    View your past and upcoming bookings. Track your schedule
                    and manage your shifts efficiently.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg">
                  Instructions
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>
                      Click the <strong>Book Shift</strong> button on the left
                      to start
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>
                      Select a date range on the calendar (weekends are
                      automatically excluded)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>
                      Choose your preferred shift time with IN or OUT type
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>Submit your booking and you're all set!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">5.</span>
                    <span>
                      View your <strong>Booking History</strong> to see all your
                      scheduled shifts
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {step === "calendar" && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Select Date Range
                </h2>
                <p className="text-gray-600">
                  Click on two dates to select a range. Restricted days will be
                  automatically excluded.
                </p>
              </div>
              <MultiDateCalendar
                selectedDates={selectedDates}
                onDateSelect={setSelectedDates}
                restrictedDays={restrictedDays}
                monthsForward={monthsForward}
                onNext={handleNextToShift}
                onBack={handleBackToWelcome}
              />
            </div>
          )}

          {step === "shift" && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Select Your Shift
                </h2>
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

          {step === "history" && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <BookingHistory
                bookings={bookingHistory}
                onBack={handleBackToWelcome}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
