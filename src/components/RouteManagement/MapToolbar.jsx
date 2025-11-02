import React from "react";
import { Route, Merge } from "lucide-react";

// Enhanced MapToolbar with optimization toggle
const MapToolbar = ({
  selectedClusters,
  routeWidth,
  showRoutes,
  onMergeClusters,
  onRouteWidthChange,
  onToggleRoutes,
  mergeOptimization,
  onToggleOptimization,
}) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleRoutes}
            className={`px-3 py-2 text-sm rounded-md ${
              showRoutes
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {showRoutes ? "Hide Routes" : "Show Routes"}
          </button>

          <select
            value={routeWidth}
            onChange={(e) => onRouteWidthChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="thin">Thin</option>
            <option value="medium">Medium</option>
            <option value="thick">Thick</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {/* Optimization Toggle */}
          <button
            onClick={onToggleOptimization}
            className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-md ${
              mergeOptimization
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            title={mergeOptimization ? "Optimization ON" : "Optimization OFF"}
          >
            <Route className="w-4 h-4" />
            <span>Optimize</span>
          </button>

          {/* Merge Button */}
          <button
            onClick={onMergeClusters}
            disabled={selectedClusters.size < 2}
            className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-md ${
              selectedClusters.size >= 2
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Merge className="w-4 h-4" />
            <span>Merge ({selectedClusters.size})</span>
          </button>
        </div>
      </div>

      {selectedClusters.size > 0 && (
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
          {selectedClusters.size} cluster(s) selected for merging
          {mergeOptimization && " with route optimization"}
        </div>
      )}
    </div>
  );
};
export default MapToolbar;
