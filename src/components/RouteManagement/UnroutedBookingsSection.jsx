import React from "react";

const UnroutedBookingsSection = ({
  unroutedBookings = [],
  unroutedLoading = false,
  selectedBookings = new Set(), // Set of selected booking IDs
  onBookingSelect, // Function to handle booking selection
}) => {
  if (unroutedLoading) {
    return (
      <div className="p-4 border-b border-gray-200 bg-yellow-50">
        <div className="flex items-center gap-2 text-sm text-yellow-700">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
          Loading unrouted bookings...
        </div>
      </div>
    );
  }

  if (!unroutedBookings || unroutedBookings.length === 0) {
    return null;
  }

  const selectedCount = Array.from(selectedBookings).filter((id) =>
    unroutedBookings.some((booking) => booking.booking_id === id)
  ).length;

  return (
    <div className="border-b border-gray-200 bg-yellow-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Unrouted Bookings ({unroutedBookings.length})
            </h3>
            {selectedCount > 0 && (
              <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-medium">
                {selectedCount} selected
              </span>
            )}
          </div>
          <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
            Needs routing
          </span>
        </div>

        <div className="space-y-3">
          {unroutedBookings.map((booking) => (
            <UnroutedBookingCard
              key={`unrouted-${booking.booking_id}`}
              booking={booking}
              isSelected={selectedBookings.has(booking.booking_id)}
              onSelect={onBookingSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Separate component for individual booking card
const UnroutedBookingCard = ({ booking, isSelected, onSelect }) => {
  const handleCardClick = () => {
    if (onSelect) {
      onSelect(booking.booking_id);
    }
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation(); // Prevent card click when checkbox is clicked
    if (onSelect) {
      onSelect(booking.booking_id);
    }
  };

  return (
    <div
      className={`bg-white p-3 rounded-lg border shadow-sm cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-200"
          : "border-yellow-200 hover:border-yellow-300 hover:bg-yellow-25"
      }`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxClick}
            onClick={handleCheckboxClick}
            className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 cursor-pointer"
          />
          <span className="text-xs font-medium text-gray-500">
            #{booking.booking_id}
          </span>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            {booking.employee_code}
          </span>
        </div>
        {isSelected && (
          <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
            Selected
          </span>
        )}
      </div>

      <div className="text-sm text-gray-700 mb-2">
        <div className="font-medium truncate">{booking.pickup_location}</div>
      </div>

      <div className="text-xs text-gray-500">
        <div>
          Status:{" "}
          <span className="text-yellow-600 font-medium">{booking.status}</span>
        </div>
        {booking.reason && (
          <div className="truncate">Reason: {booking.reason}</div>
        )}
      </div>
    </div>
  );
};

export default UnroutedBookingsSection;
