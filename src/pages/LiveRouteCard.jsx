// components/LiveRouteCard.jsx
import React from "react";
import {
  Car,
  User,
  Navigation,
  Clock,
  Wifi,
  CheckCircle2,
  MapPin,
  Users,
} from "lucide-react";

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
  const handleCardClick = () => {
    onSelect(route);
  };

  const handleDoubleClick = () => {
    onFocus(route.route_id);
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower?.includes("assigned") || statusLower?.includes("on time")) {
      return "bg-green-100 text-green-700";
    }
    if (statusLower?.includes("delay") || statusLower?.includes("progress")) {
      return "bg-yellow-100 text-yellow-700";
    }
    if (statusLower?.includes("completed")) {
      return "bg-blue-100 text-blue-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div
      onClick={handleCardClick}
      onDoubleClick={handleDoubleClick}
      className={`p-3 cursor-pointer transition-all duration-150 relative ${
        isFocused
          ? "bg-blue-50 border-l-2 border-l-blue-600"
          : isSelected
          ? "bg-blue-50/50 border-l-2 border-l-blue-400"
          : "hover:bg-gray-50 border-l-2 border-l-transparent"
      }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
        </div>
      )}

      {/* Header Row: Route Code, Status, Live Indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900">
            {route.route_code}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(
              route.status
            )}`}
          >
            {route.status}
          </span>
        </div>

        {/* Live/Error indicators */}
        <div className="flex items-center gap-1">
          {hasLiveLocation && <Wifi className="w-3 h-3 text-green-500" />}
          {isLoading && (
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          )}
          {error && (
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
          )}
        </div>
      </div>

      {/* Main Info Row */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <Car className="w-3 h-3 text-gray-500" />
          <span className="text-sm font-semibold text-gray-900">
            {route.vehicle?.rc_number || "No Vehicle"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <User className="w-3 h-3" />
          <span>{route.driver?.name || "Unknown"}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-1 text-xs text-gray-600 mb-2">
        <div className="flex items-center gap-1">
          <Navigation className="w-3 h-3" />
          <span>{route.summary?.total_distance_km?.toFixed(1) || "0"}km</span>
        </div>

        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{route.summary?.total_time_minutes?.toFixed(0) || "0"}min</span>
        </div>

        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{route.stops?.length || 0}</span>
        </div>
      </div>

      {/* Vendor & Quick Info */}
      <div className="text-xs text-gray-500">
        <div className="truncate mb-1">
          <span className="font-medium">Vendor: </span>
          {route.vendor?.name || "N/A"}
        </div>

        {/* Focus indicator */}
        {isFocused && (
          <div className="flex items-center gap-1 text-blue-600 font-medium">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            Focused
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveRouteCard;
