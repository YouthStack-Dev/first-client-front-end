// components/LiveRouteCard.jsx
import React from "react";
import { MapPin, Users, Clock, Wifi, CheckCircle2 } from "lucide-react";

const LiveRouteCard = ({
  route,
  isSelected,
  isFocused,
  onSelect,
  onFocus,
  hasLiveLocation,
  isLoading,
  error,
}) => {
  return (
    <div
      onClick={() => onSelect(route)}
      onDoubleClick={() => onFocus(route.id)}
      className={`p-6 cursor-pointer transition-all duration-200 relative ${
        isFocused
          ? "bg-blue-100 border-l-4 border-l-blue-600"
          : isSelected
          ? "bg-blue-50 border-l-4 border-l-blue-400"
          : "hover:bg-gray-50"
      }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-bold text-gray-900">{route.id}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                route.status === "On Time"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {route.status}
            </span>
            {hasLiveLocation && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                <Wifi className="w-3 h-3" />
                Live
              </span>
            )}
            {isLoading && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Updating...
              </span>
            )}
            {error && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                {error}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {route.vehicleNumber}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{route.route}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            <span>{route.passengers} passengers</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{route.eta}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">{route.driver}</p>
      </div>

      {isFocused && (
        <p className="text-xs text-blue-600 mt-2 font-medium">
          📍 Showing details on map
        </p>
      )}
    </div>
  );
};

export default LiveRouteCard;
