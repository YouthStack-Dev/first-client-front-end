import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  XCircle,
  Key,
} from "lucide-react";

const BookingCard = ({
  booking,
  getStatusBadge,
  getShiftType,
  showLocationInfo,
  onCancelBooking,
  cancellationCutoffWindow = 60, // Default 60 minutes cutoff window
}) => {
  // Function to check if cancellation is allowed based on cutoff window
  const canCancelBooking = () => {
    // Only allow cancellation for "Request" status
    if (booking.status !== "Request") {
      return false;
    }

    // Get booking time (using static time for demo)
    const bookingTime = new Date(booking.booking_date);

    // For demo purposes, let's assume booking_time is in format "18:30"
    // You can replace this with your actual time field
    const [hours, minutes] = booking.shift_time
      ? booking.shift_time.split(":").map(Number)
      : [12, 40]; // Default static time

    // Set the booking datetime with the actual time
    bookingTime.setHours(hours, minutes, 0, 0);

    // Get current time
    const currentTime = new Date();

    // Calculate time difference in minutes
    const timeDifference = bookingTime.getTime() - currentTime.getTime();
    const minutesUntilBooking = timeDifference / (1000 * 60);

    // Allow cancellation only if we're before the cutoff window
    return minutesUntilBooking > cancellationCutoffWindow;
  };

  const canCancel = canCancelBooking();

  // Check if any OTP exists
  const hasAnyOTP =
    booking.escort_otp || booking.boarding_otp || booking.deboarding_otp;

  return (
    <div
      key={booking.booking_id}
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-50 rounded-lg border border-blue-200">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <p className="font-semibold text-gray-900">
              {new Date(booking.booking_date).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {/* Show booking time if available, otherwise use static time */}
                {booking.shift_time || "18:30"}
              </span>
              {getShiftType(booking.shift_id)}
            </div>

            {/* Show cancellation cutoff info */}
            {booking.status === "Request" && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  Cancellation allowed until {cancellationCutoffWindow} minutes
                  before booking
                </span>
              </div>
            )}

            {/* OTP Section - Show if any OTP exists */}
            {hasAnyOTP && (
              <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Key className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    OTPs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Escort OTP */}
                  {booking.escort_otp && (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-600">Escort OTP</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {booking.escort_otp}
                      </span>
                    </div>
                  )}

                  {/* Boarding OTP */}
                  {booking.boarding_otp && (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-600">
                        Boarding OTP
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {booking.boarding_otp}
                      </span>
                    </div>
                  )}

                  {/* Deboarding OTP */}
                  {booking.deboarding_otp && (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-600">
                        Deboarding OTP
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {booking.deboarding_otp}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Alternative: Show OTPs inline if you prefer a simpler layout */}
            {/* 
            {hasAnyOTP && (
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {booking.escort_otp && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">Escort:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {booking.escort_otp}
                    </span>
                  </div>
                )}
                {booking.boarding_otp && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">Boarding:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {booking.boarding_otp}
                    </span>
                  </div>
                )}
                {booking.deboarding_otp && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">Deboarding:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {booking.deboarding_otp}
                    </span>
                  </div>
                )}
              </div>
            )}
            */}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {getStatusBadge(booking.status)}
        </div>
      </div>

      {/* Location Info */}
      {showLocationInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">Pickup</p>
              <p className="text-xs text-gray-600 mt-1">
                {booking.pickup_location}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Navigation className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">Drop</p>
              <p className="text-xs text-gray-600 mt-1">
                {booking.drop_location}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
        <div className="flex gap-2">
          {canCancel ? (
            <button
              onClick={() => onCancelBooking(booking.booking_id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              <XCircle className="w-3 h-3" />
              Cancel
            </button>
          ) : (
            booking.status === "Request" && (
              <button
                disabled
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-400 border border-gray-200 rounded-md cursor-not-allowed"
                title={`Cancellation not allowed within ${cancellationCutoffWindow} minutes of booking time`}
              >
                <XCircle className="w-3 h-3" />
                Cancel
              </button>
            )
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <p className="text-xs text-gray-500">
            Booking ID: {booking.booking_id}
          </p>
          <p className="text-xs text-gray-500">
            Created: {new Date(booking.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
