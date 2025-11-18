// components/SelectedRouteOverlay.jsx
import React from "react";
import { X, MapPin, Users, Clock, Wifi } from "lucide-react";

const SelectedRouteOverlay = ({ route, onClose }) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-gray-900">{route.vehicleNumber}</h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                route.status === "On Time"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {route.status}
            </span>
            {route.isLoading && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Connecting...
              </span>
            )}
            {route.error && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                {route.error}
              </span>
            )}
            {route.hasLiveLocation && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                <Wifi className="w-3 h-3" />
                Live
              </span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {route.route}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {route.passengers} passengers
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                ETA: {route.eta}
              </span>
            </div>
            {route.hasLiveLocation && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Live location: {route.currentLocation.lat.toFixed(6)},{" "}
                {route.currentLocation.lng.toFixed(6)}
                {route.currentLocation.timestamp && (
                  <span className="text-gray-500 ml-2">
                    (updated:{" "}
                    {new Date(
                      route.currentLocation.timestamp
                    ).toLocaleTimeString()}
                    )
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SelectedRouteOverlay;
