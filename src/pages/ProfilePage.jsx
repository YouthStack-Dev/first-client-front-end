import { useState, useEffect, useCallback } from "react";
import ProfileCard from "@components/ProfileCard";
import MultiDateCalendar from "@components/MultiDateCalendar";
import ShiftSelector from "@components/ShiftSelector";
import BookingHistory from "@components/BookingHistory";
import UpdateBookingShiftModal from "@components/modals/UpdateBookingShiftModal";
import { Calendar, Clock, History } from "lucide-react";
import { API_CLIENT } from "../Api/API_Client";
import { useDispatch, useSelector } from "react-redux";
import { selectAllShifts } from "../redux/features/shift/shiftSlice";
import { logDebug } from "../utils/logger";
import { fetchShiftTrunk } from "../redux/features/shift/shiftTrunk";
import { bookingSchema } from "../validations/bookingValidation";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const [step, setStep] = useState("welcome");
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [errors, setErrors] = useState([]);
  const dispatch = useDispatch();
  const shifts = useSelector(selectAllShifts);
  const restrictedDays = [0, 6];
  const monthsForward = 3;
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [bookingFilters, setBookingFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    status: "",
    shiftType: "",
    availableStatuses: [],
    availableDates: [],
    availableShiftTypes: ["1", "2"],
  });
  const [bookingHistoryData, setBookingHistoryData] = useState([]);
  const [isErrorHistory, setIsErrorHistory] = useState(false);
  const [errorMessageHistory, setErrorMessageHistory] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedBookingToUpdate, setSelectedBookingToUpdate] = useState(null);

  const endpoint = {
    booking: "/bookings/",
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await API_CLIENT.get("/auth/me");
      if (response.data.success) {
        setUserProfile(response.data.data.user);
      } else {
        toast.error("Failed to load profile", { position: "top-right", autoClose: 5000 });
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      toast.error("Something went wrong while fetching profile", { position: "top-right", autoClose: 5000 });
    }
  }, []);

  const fetchBookingHistory = useCallback(
    async (date = null) => {
      if (!userProfile?.employee_id) {
        setIsErrorHistory(true);
        setErrorMessageHistory("Employee ID not found");
        return;
      }

      setIsLoadingHistory(true);
      setIsErrorHistory(false);
      setErrorMessageHistory("");

      try {
        const bookingDate = date || bookingFilters.date;
        const response = await API_CLIENT.get(
          `${endpoint.booking}employee?booking_date=${bookingDate}&employee_id=${userProfile?.employee_id}`
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
    },
    [userProfile?.employee_id, bookingFilters.date]
  );

  useEffect(() => {
    const initializeData = async () => {
      await fetchUserProfile();
      dispatch(fetchShiftTrunk());
    };

    initializeData();
  }, []);

  const renderErrors = () => null;

  const handleBookingSubmit = async () => {
    setIsSubmitting(true);
    setErrors([]);

    const payload = {
      employee_id: userProfile?.employee_id,
      booking_dates: selectedDates,
      shift_id: selectedShiftId,
    };

    logDebug(" this is the booking submitting data ", payload);

    const result = bookingSchema.safeParse(payload);
    if (!result.success) {
      result.error.errors.forEach((err) =>
        toast.error(`${err.path.join(".")}: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
        })
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await API_CLIENT.post(endpoint.booking, payload);

      toast.success(
        response.data?.message || "Booking confirmed successfully!",
        { position: "top-right", autoClose: 4000 }
      );

      setSelectedDates([]);
      setSelectedShiftId(null);
      setStep("welcome");

      if (step === "history") {
        fetchBookingHistory();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail?.message ||
        error.response?.data?.message ||
        "Booking failed. Please try again.";
      toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBookingHistory = bookingHistoryData.filter((booking) => {
    const matchesStatus =
      !bookingFilters.status || booking.status === bookingFilters.status;
    const matchesShiftType =
      !bookingFilters.shiftType ||
      booking.shift_id.toString() === bookingFilters.shiftType;

    return matchesStatus && matchesShiftType;
  });

  const handleNextToShift = () => {
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date", { position: "top-right", autoClose: 4000 });
      return;
    }
    setErrors([]);
    setStep("shift");
  };

  const handleBackToCalendar = () => {
    setStep("calendar");
    setSelectedShiftId(null);
    setErrors([]);
  };

  const handleViewBookingHistory = () => {
    setStep("history");
    setErrors([]);
    fetchBookingHistory();
  };

  const handleBackToWelcome = () => {
    setStep("welcome");
    setSelectedDates([]);
    setSelectedShiftId(null);
    setErrors([]);
  };

  // ✅ Fixed: directly calls fetchBookingHistory so cancel refresh works
  // even when the date value hasn't changed (useEffect wouldn't re-run)
  const handleBookingFilterChange = useCallback(
    (filterType, value) => {
      setBookingFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }));

      if (filterType === "date" && value) {
        fetchBookingHistory(value);
      }
    },
    [fetchBookingHistory]
  );

  const handleClearBookingFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    setBookingFilters((prev) => ({
      ...prev,
      date: today,
      status: "",
      shiftType: "",
    }));
    fetchBookingHistory(today);
  };

  const handleUpdateBookingClick = (booking) => {
    setSelectedBookingToUpdate(booking);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchBookingHistory(bookingFilters.date);
  };

  useEffect(() => {
    setErrors([]);
  }, [step]);

  // This useEffect now only handles initial load when profile becomes available
  // Cancel refresh is handled directly in handleBookingFilterChange
  useEffect(() => {
    if (bookingFilters.date && userProfile?.employee_id) {
      fetchBookingHistory(bookingFilters.date);
    }
  }, [userProfile?.employee_id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {renderErrors()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ProfileCard
              {...userProfile}
              onBookShift={() => setStep("calendar")}
              onViewBookingHistory={handleViewBookingHistory}
              step={step}
              onBack={
                step === "shift" ? handleBackToCalendar :
                step === "calendar" || step === "history" ? handleBackToWelcome :
                undefined
              }
            />
          </div>

          <div className="lg:col-span-2">
            {step === "welcome" && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Welcome, {userProfile?.name || "User"}!
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  This is your employee profile. All your information is
                  displayed on the left card.
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
                        View your <strong>Booking History</strong> to see all
                        your scheduled shifts
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {step === "calendar" && (
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Select Date Range
                  </h2>
                  <p className="text-gray-600">
                    Click on two dates to select a range. Restricted days will
                    be automatically excluded.
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

            {step === "shift" && (
              <div>
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
              <div>
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
              </div>
            )}
          </div>
        </div>
      </div>

      <UpdateBookingShiftModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={handleUpdateSuccess}
        booking={selectedBookingToUpdate}
        shifts={shifts}
      />
    </div>
  );
}