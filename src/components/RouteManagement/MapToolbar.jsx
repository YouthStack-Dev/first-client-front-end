import React from "react";
import { Merge, Truck } from "lucide-react";

const MapToolbar = ({
  selectedRoutes,
  onMerge,
  onAssignVendor,
  isMerging = false,
}) => {
  return (
    <div className="bg-gray-50 border-b border-gray-300">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Side - Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Merge Button */}
            <button
              onClick={onMerge}
              disabled={selectedRoutes.size < 2 || isMerging}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                selectedRoutes.size >= 2 && !isMerging
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={
                selectedRoutes.size < 2
                  ? "Select at least 2 routes to merge"
                  : "Merge selected routes"
              }
            >
              <Merge className="w-4 h-4" />
              <span>
                {isMerging ? "Merging..." : `Merge (${selectedRoutes.size})`}
              </span>
            </button>

            {/* Assign Vendor Button */}
            <button
              onClick={onAssignVendor}
              disabled={selectedRoutes.size === 0}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                selectedRoutes.size > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={
                selectedRoutes.size === 0
                  ? "Select at least 1 route to assign vendor"
                  : "Assign vendor to selected routes"
              }
            >
              <Truck className="w-4 h-4" />
              <span>Assign Vendor ({selectedRoutes.size})</span>
            </button>
          </div>

          {/* Right Side - Selection Info */}
          <div className="flex items-center">
            {selectedRoutes.size > 0 && (
              <div className="text-xs text-gray-600 font-medium">
                {selectedRoutes.size} route
                {selectedRoutes.size !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapToolbar;
