import React from "react";
import { MapPin, Clock, Navigation, Trash2 } from "lucide-react";
import ReusableButton from "./ReusableButton";

const BookingCard = ({
  stop,
  index,
  isSelected = false,
  isDeleteDisabled = false,
  onBookingClick,
  onRemoveFromRoute,
  className = "",
}) => {
  const renderSafeValue = (value, fallback = "N/A") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "object") {
      if (value.name) return value.name;
      return JSON.stringify(value);
    }
    return value;
  };

  return (
    <div
      className={`bg-white rounded border p-2.5 transition-colors group cursor-pointer ${
        isSelected
          ? "border-purple-500 bg-purple-50"
          : "border-gray-200 hover:border-purple-300"
      } ${isDeleteDisabled ? "opacity-70" : ""} ${className}`}
      onClick={(e) => onBookingClick && onBookingClick(e, stop.booking_id)}
    >
      {/* Top Row */}
      <div className="flex items-center gap-2 mb-2">
        {/* Selection + Number */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 flex items-center justify-center">
            {isSelected && (
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            )}
          </div>
          <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
            {index + 1}
          </div>
        </div>

        {/* Employee Code */}
        <span className="font-semibold text-sm text-gray-900 flex-shrink-0">
          {renderSafeValue(stop.employee_code)}
        </span>

        {/* Status Badge */}
        {stop.status && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 flex-shrink-0">
            {stop.status}
          </span>
        )}

        <div className="flex-1 min-w-0"></div>

        {/* Est. Pickup Time */}
        {stop.estimated_pick_up_time && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-medium text-blue-600">
              {stop.estimated_pick_up_time}
            </span>
          </div>
        )}

        {/* Est. Distance */}
        {stop.estimated_distance && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Navigation className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">
              {stop.estimated_distance} km
            </span>
          </div>
        )}

        {/* Remove From Route Button */}
        {onRemoveFromRoute && (
          <div className="flex-shrink-0">
            <ReusableButton
              module="route"
              action="update"
              icon={Trash2}
              size={14}
              title={
                isDeleteDisabled
                  ? "Cannot remove - check route status or driver assignment"
                  : "Remove booking from route"
              }
              onClick={() => onRemoveFromRoute(stop.booking_id, stop)}
              disabled={isDeleteDisabled}
              className={`p-1 rounded ${
                isDeleteDisabled
                  ? "text-gray-400 cursor-not-allowed opacity-50"
                  : "text-orange-600 hover:text-orange-800 hover:bg-orange-50"
              }`}
            />
          </div>
        )}
      </div>

      {/* Pickup + Drop */}
      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex items-start gap-1">
          <MapPin className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {renderSafeValue(stop.pickup_location)}
          </span>
        </div>

        <div className="flex items-start gap-1">
          <MapPin className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {renderSafeValue(stop.drop_location)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
