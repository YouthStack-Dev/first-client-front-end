// components/SelectedRouteOverlay.jsx
import React from "react";
import { X, MapPin, Users, Clock, Wifi, User, Truck, Navigation } from "lucide-react";

const SelectedRouteOverlay = ({ route, onClose }) => {
  const vehicleNumber  = route.vehicle?.rc_number || "Unknown Vehicle";
  const driverName     = route.driver?.name || "Unknown Driver";
  const status         = route.status || "Ongoing";

  // ── From summary ──────────────────────────────────────────────────────────
  const distanceKm    = route.summary?.total_distance_km ?? null;
  const timeMinutes   = route.summary?.total_time_minutes ?? null;
  const etaLabel      = timeMinutes != null ? `${timeMinutes} min` : "—";
  const distanceLabel = distanceKm  != null ? `${distanceKm} km`  : "—";

  // ── From stops ────────────────────────────────────────────────────────────
  const stops          = route.stops || [];
  const passengerCount = stops.length;
  const firstStop      = stops[0];
  const pickupLocation = firstStop?.pickup_location || "—";
  const dropLocation   = firstStop?.drop_location   || "—";
  const pickupTime     = firstStop?.estimated_pick_up_time || null;
  const employees      = stops.map((s) => s.employee_name).filter(Boolean);

  const statusColors = {
    "On Time":         "bg-green-100 text-green-700",
    "Ongoing":         "bg-blue-100 text-blue-700",
    "Delayed":         "bg-red-100 text-red-700",
    "Driver Assigned": "bg-purple-100 text-purple-700",
    "Completed":       "bg-gray-100 text-gray-600",
    "Scheduled":       "bg-amber-100 text-amber-700",
  };
  const statusClass = statusColors[status] || "bg-gray-100 text-gray-600";

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Status color bar */}
      <div className={`h-1 w-full ${
        status === "Delayed"         ? "bg-red-400"    :
        status === "Ongoing"         ? "bg-blue-400"   :
        status === "On Time"         ? "bg-emerald-400":
        status === "Driver Assigned" ? "bg-purple-400" :
        "bg-gray-300"
      }`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-2">

            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <h4 className="font-bold text-gray-900 text-sm">{vehicleNumber}</h4>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass}`}>
                {status}
              </span>
              {route.isLoading && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Connecting…
                </span>
              )}
              {route.hasLiveLocation && !route.isLoading && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  <Wifi className="w-3 h-3" />
                  Live
                </span>
              )}
              {route.error && !route.hasLiveLocation && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                  Location error
                </span>
              )}
            </div>

            {/* Driver */}
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {driverName}
            </p>

            {/* Pickup → Drop */}
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="truncate text-gray-700 font-medium">{pickupLocation}</p>
                <p className="text-gray-400 truncate">→ {dropLocation}</p>
              </div>
            </div>

            {/* Stats: passengers · distance · ETA */}
            <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                {passengerCount} {passengerCount === 1 ? "passenger" : "passengers"}
              </span>
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-gray-400" />
                {distanceLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {etaLabel}
                {pickupTime && (
                  <span className="text-gray-400 ml-1">· pickup {pickupTime}</span>
                )}
              </span>
            </div>

            {/* Passenger name chips */}
            {employees.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {employees.map((name, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            {/* Live coordinates */}
            {route.hasLiveLocation && route.currentLocation && (
              <p className="text-xs text-emerald-600 font-mono bg-emerald-50 px-2 py-1 rounded-lg">
                ● {route.currentLocation.lat.toFixed(5)}, {route.currentLocation.lng.toFixed(5)}
                {route.currentLocation.timestamp && (
                  <span className="text-gray-400 ml-2 font-sans">
                    · {new Date(route.currentLocation.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </p>
            )}

            {/* No live location */}
            {!route.hasLiveLocation && !route.isLoading && (
              <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                ⚠ Location not available — showing static position
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectedRouteOverlay;