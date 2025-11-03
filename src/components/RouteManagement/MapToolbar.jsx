import React from "react";

const MapToolbar = ({
  mode,
  selectedBookings,
  selectedRoutes,
  routeWidth,
  showRoutes,
  shortPath,
  totalDistance,
  onSave,
  onMerge,
  onRouteWidthChange,
  onToggleRoutes,
  onToggleShortPath,
}) => {
  const isSaveDisabled = mode === "suggestions" && selectedBookings === 0;
  const isMergeDisabled = mode === "saved" && selectedRoutes.size < 2;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            {/* Routes Toggle */}
            <button
              onClick={onToggleRoutes}
              className={`p-2 rounded-lg text-sm font-medium transition-all ${
                showRoutes
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={showRoutes ? "Hide Routes" : "Show Routes"}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </button>

            {/* Optimized Path - Suggestions Only */}
            {mode === "suggestions" && (
              <button
                onClick={onToggleShortPath}
                className={`p-2 rounded-lg text-sm font-medium transition-all ${
                  shortPath
                    ? "bg-green-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Optimized Shortest Path"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </button>
            )}

            {/* Line Width */}
            <select
              value={routeWidth}
              onChange={(e) => onRouteWidthChange(e.target.value)}
              className="px-2.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              title="Line Width"
            >
              <option value="thin">Thin</option>
              <option value="medium">Medium</option>
              <option value="thick">Thick</option>
            </select>

            {/* Distance Badge */}
            {totalDistance > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <span className="text-xs font-semibold text-blue-700">
                  {totalDistance.toFixed(1)} km
                </span>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Save - Suggestions Mode */}
            {mode === "suggestions" && (
              <button
                onClick={onSave}
                disabled={isSaveDisabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !isSaveDisabled
                    ? "bg-green-500 text-white shadow-sm hover:bg-green-600 hover:shadow active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                title="Save Route"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                <span>Save</span>
                {selectedBookings > 0 && (
                  <span className="bg-green-600 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold min-w-[20px] text-center">
                    {selectedBookings}
                  </span>
                )}
              </button>
            )}

            {/* Merge - Saved Mode */}
            {mode === "saved" && (
              <button
                onClick={onMerge}
                disabled={isMergeDisabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !isMergeDisabled
                    ? "bg-purple-500 text-white shadow-sm hover:bg-purple-600 hover:shadow active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                title="Merge Routes"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <span>Merge</span>
                {selectedRoutes.size > 0 && (
                  <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold min-w-[20px] text-center">
                    {selectedRoutes.size}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapToolbar;
