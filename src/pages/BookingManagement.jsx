import { useEffect, useState } from "react";
import ProfileCard from "../components/ProfileCard";
import { Calendar, Clock, History } from "lucide-react";
import MultiDateCalendar from "@components/MultiDateCalendar";
import ShiftSelector from "@components/ShiftSelector";
import BookingHistory from "@components/BookingHistory";
import { useLocation, useSearchParams } from "react-router-dom";
import { logDebug } from "../utils/logger";
import { API_CLIENT } from "../Api/API_Client";
import endpoint from "../Api/Endpoints";
import { useDispatch, useSelector } from "react-redux";
import { selectAllShifts } from "../redux/features/shift/shiftSlice";
import { fetchShiftTrunk } from "../redux/features/shift/shiftTrunk";
import { bookingSchema } from "../validations/bookingValidation";
import { fetchEmployeesThunk } from "../redux/features/employees/employeesThunk";
import UpdateBookingShiftModal from "../components/modals/UpdateBookingShiftModal";
import { toast } from "react-toastify"; // ✅ added

export default function BookingManagement() {
  const [step, setStep] = useState("welcome");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [restrictedDays, setRestrictedDays] = useState([]);
  const [restrictedDates, setRestrictedDates] = useState([]);
  const [bookingHistoryData, setBookingHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isErrorHistory, setIsErrorHistory] = useState(false);
  const [errorMessageHistory, setErrorMessageHistory] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedBookingForUpdate, setSelectedBookingForUpdate] = useState(null);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const teamId = searchParams.get("teamId");
  const [employee, setEmployee] = useState(location.state?.employee || null);

  const dispatch = useDispatch();
  const shifts = useSelector(selectAllShifts);
  const employeesLoading = useSelector((state) => state.employees.loading);
  const teamEmployees = useSelector((state) =>
    teamId ? state.employees.entities : {}
  );

  // Booking History Filters State
  const [bookingFilters, setBookingFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    status: "",
    shiftType: "",
    availableStatuses: [],
    availableDates: [],
    availableShiftTypes: ["1", "2"],
  });

  const convertWeekOffToRestrictedDays = (weekoffConfig) => {
    const dayMapping = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const restricted = [];
    Object.keys(dayMapping).forEach((day) => {
      if (weekoffConfig[day] === true) {
        restricted.push(dayMapping[day]);
      }
    });

    logDebug("Converted restricted days:", restricted);
    return restricted;
  };

  useEffect(() => {
    logDebug("This is the shifts from slice", shifts);
    if (!shifts || shifts.length === 0) {
      dispatch(fetchShiftTrunk());
    }
  }, [shifts, dispatch]);

  useEffect(() => {
    if (!employee && teamId && employeeId) {
      const employeeFromStore = Object.values(teamEmployees).find(
        (emp) => emp.employee_id.toString() === employeeId.toString()
      );

      if (employeeFromStore) {
        setEmployee(employeeFromStore);
      } else if (!employeesLoading) {
        dispatch(fetchEmployeesThunk({ team_id: teamId }));
      }
    }
  }, [employee, teamId, employeeId, teamEmployees, employeesLoading, dispatch]);

  useEffect(() => {
    if (!employee && employeeId && !employeesLoading) {
      const employeeFromStore = Object.values(teamEmployees).find(
        (emp) => emp.employee_id.toString() === employeeId.toString()
      );
      if (employeeFromStore) {
        setEmployee(employeeFromStore);
      }
    }
  }, [teamEmployees, employeeId, employee, employeesLoading]);

  const fetchWeekOffs = async () => {
    try {
      const response = await API_CLIENT.get(
        `${endpoint.getWeekOff}${employee.employee_id}`
      );

      logDebug("Week off response:", response.data.data.weekoff_config);

      if (response.data.success && response.data.data.weekoff_config) {
        const weekoffConfig = response.data.data.weekoff_config;
        const convertedRestrictedDays = convertWeekOffToRestrictedDays(weekoffConfig);
        setRestrictedDays(convertedRestrictedDays);
        setRestrictedDates(["2024-12-25", "2024-01-01", "2024-07-04"]);
      }
    } catch (error) {
      console.error("Error fetching week offs:", error);
      setRestrictedDays([0, 6]);
    }
  };

  const fetchBookingHistory = async (date = null) => {
    if (!employee?.employee_id) return;

    setIsLoadingHistory(true);
    setIsErrorHistory(false);

    try {
      const bookingDate = date || bookingFilters.date;
      const response = await API_CLIENT.get(
        `${endpoint.booking}employee?booking_date=${bookingDate}&employee_id=${employee.employee_id}`
      );

      logDebug("Booking history response:", response.data);

      if (response.data.success) {
        const bookings = response.data.data || [];
        setBookingHistoryData(bookings);

        const availableDates = [
          ...new Set(bookings.map((booking) => booking.booking_date)),
        ].sort();
        const availableStatuses = [
          ...new Set(bookings.map((booking) => booking.status)),
        ];

        setBookingFilters((prev) => ({
          ...prev,
          availableDates,
          availableStatuses,
        }));

        logDebug(`Loaded ${bookings.length} bookings for date: ${bookingDate}`);
      } else {
        throw new Error(response.data.message || "Failed to fetch booking history");
      }
    } catch (error) {
      console.error("Error fetching booking history:", error);
      setIsErrorHistory(true);
      setErrorMessageHistory(
        error.response?.data?.message ||
          error.message ||
          "Failed to load booking history"
      );
      setBookingHistoryData([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleBookingFilterChange = (filterType, value) => {
    setBookingFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));

    if (filterType === "date" && value) {
      fetchBookingHistory(value);
    }
  };

  const handleClearBookingFilters = () => {
    setBookingFilters((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0],
      status: "",
      shiftType: "",
    }));
    fetchBookingHistory(new Date().toISOString().split("T")[0]);
  };

  const filteredBookingHistory = bookingHistoryData.filter((booking) => {
    const matchesStatus =
      !bookingFilters.status || booking.status === bookingFilters.status;
    const matchesShiftType =
      !bookingFilters.shiftType ||
      booking.shift_id.toString() === bookingFilters.shiftType;

    return matchesStatus && matchesShiftType;
  });

  useEffect(() => {
    if (employee?.employee_id) {
      fetchWeekOffs();
      if (step === "history") {
        fetchBookingHistory();
      }
    }
  }, [employee?.employee_id]);

  useEffect(() => {
    if (step === "history" && employee?.employee_id) {
      fetchBookingHistory();
    }
  }, [step, employee?.employee_id]);

  const handleBookShift = () => {
    setStep("calendar");
    setSelectedDates([]);
    setSelectedShiftId(null);
    setErrors([]);
  };

  const handleBookingHistory = () => {
    setStep("history");
  };

  const handleUpdateBookingClick = (booking) => {
    setSelectedBookingForUpdate(booking);
    setIsUpdateModalOpen(true);
  };

  const handleNextToShift = () => {
    if (selectedDates.length >= 1) {
      setStep("shift");
      setErrors([]);
    }
  };

  const handleBackToCalendar = () => {
    setStep("calendar");
    setErrors([]);
  };

  const handleBackToWelcome = () => {
    setStep("welcome");
    setSelectedDates([]);
    setSelectedShiftId(null);
    setErrors([]);
  };

  const handleBookingSubmit = async () => {
    setIsSubmitting(true);
    setErrors([]);

    const payload = {
      employee_id: employee.employee_id,
      booking_dates: selectedDates,
      shift_id: selectedShiftId,
    };

    logDebug("this is the booking submitting data", payload);

    const result = bookingSchema.safeParse(payload);
    if (!result.success) {
      const validationErrors = result.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await API_CLIENT.post(endpoint.booking, payload);
      console.log("Booking successful:", response.data);

      setSelectedDates([]);
      setSelectedShiftId(null);
      setStep("welcome");

      // ✅ Show API message in toast
      toast.success(response.data.message || "Booking confirmed successfully!");

      if (step === "history") {
        fetchBookingHistory();
      }
    } catch (error) {
      console.error("Booking failed:", error);
      const errorMessage =
        error.response?.data?.detail?.message ||
        error.response?.data?.message ||
        "Booking failed. Please try again.";
      setErrors([errorMessage]);

      // ✅ Show error toast
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderErrors = () => {
    if (errors.length === 0) return null;

    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">
          Please fix the following errors:
        </h3>
        <ul className="list-disc list-inside space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="text-red-700 text-sm">
              {error}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (employeesLoading && !employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading employee details...</p>
      </div>
    );
  }

  if (!employee && !employeesLoading) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Employee Not Found</h2>
        <p className="text-gray-600 mb-6">
          We couldn't find the employee details for the ID provided in the URL.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <ProfileCard
            name={employee?.name || "Employee Name"}
            email={employee?.email || "email@example.com"}
            phone={employee?.phone || "N/A"}
            alternate_phone={employee?.alternate_phone || "N/A"}
            employee_code={employee?.employee_code || "N/A"}
            gender={employee?.gender || "N/A"}
            address={employee?.address || "N/A"}
            onBookShift={handleBookShift}
            onViewBookingHistory={handleBookingHistory}
            step={step}
            onBack={
              step === "shift" ? handleBackToCalendar :
              step === "calendar" || step === "history" ? handleBackToWelcome :
              undefined
            }
          />
        </div>

        {/* Right Column - Dynamic Content */}
        <div className="lg:col-span-3">
          {step === "welcome" && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome, {employee?.name || "Employee"}!
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
                      Click the <strong>Book Shift</strong> button on the left to start
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>
                      Select a date range on the calendar (your configured week
                      off days are automatically excluded)
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
                  Click on two dates to select a range. Your week off days and
                  holidays will be automatically excluded.
                </p>
              </div>
              {renderErrors()}
              <MultiDateCalendar
                restrictedDates={restrictedDates}
                selectedDates={selectedDates}
                onDateSelect={setSelectedDates}
                restrictedDays={restrictedDays}
                monthsForward={3}
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
              {renderErrors()}
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
            <BookingHistory
              bookings={filteredBookingHistory}
              onBack={handleBackToWelcome}
              filters={bookingFilters}
              onFilterChange={handleBookingFilterChange}
              onClearFilters={handleClearBookingFilters}
              isLoading={isLoadingHistory}
              isError={isErrorHistory}
              errorMessage={errorMessageHistory}
              emptyMessage="No bookings found for the selected date."
              title="My Booking History"
              showLocationInfo={true}
              onUpdateBooking={handleUpdateBookingClick}
            />
          )}

          {isUpdateModalOpen && selectedBookingForUpdate && (
            <UpdateBookingShiftModal
              isOpen={isUpdateModalOpen}
              onClose={() => {
                setIsUpdateModalOpen(false);
                setSelectedBookingForUpdate(null);
              }}
              booking={selectedBookingForUpdate}
              shifts={shifts}
              onSuccess={() => fetchBookingHistory()}
            />
          )}
        </div>
      </div>
    </div>
  );
}