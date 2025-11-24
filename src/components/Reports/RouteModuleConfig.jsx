// RouteModuleConfig.jsx
import { ROUTE_STATUS_OPTIONS } from "../../staticData/StaticReport";

const RouteModuleConfig = ({
  formData,
  handleChange,
  toggleArrayValue,
  handleSelectAll,
  errors,
  loading,
}) => {
  return (
    <>
      {/* Route Status */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Route Status
          </label>
          <button
            type="button"
            onClick={() =>
              handleSelectAll("route_status", ROUTE_STATUS_OPTIONS)
            }
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            disabled={loading}
          >
            {formData.route_status.length === ROUTE_STATUS_OPTIONS.length
              ? "Select None"
              : "Select All"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ROUTE_STATUS_OPTIONS.map((status) => (
            <label
              key={status}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.route_status.includes(status)}
                onChange={() => toggleArrayValue("route_status", status)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <span
                className={`text-sm ${
                  loading ? "text-gray-400" : "text-gray-700"
                }`}
              >
                {status}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Route-specific fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Driver ID
          </label>
          <input
            type="number"
            min="0"
            value={formData.driver_id || ""}
            onChange={(e) => handleChange("driver_id", e.target.value)}
            placeholder="e.g., 123"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Vehicle Type
          </label>
          <select
            value={formData.vehicle_type || ""}
            onChange={(e) => handleChange("vehicle_type", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={loading}
          >
            <option value="">All Types</option>
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="van">Van</option>
            <option value="truck">Truck</option>
          </select>
        </div>
      </div>

      {/* Include Unrouted Bookings - Added for route module */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.include_unrouted}
            onChange={(e) => handleChange("include_unrouted", e.target.checked)}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <span
            className={`text-sm font-medium ${
              loading ? "text-gray-400" : "text-gray-700"
            }`}
          >
            Include Unrouted Bookings
          </span>
        </label>
      </div>

      {/* Route Performance Metrics */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          Route Performance Metrics
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.include_performance_metrics || false}
              onChange={(e) =>
                handleChange("include_performance_metrics", e.target.checked)
              }
              className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <span className="text-sm text-blue-700">
              Include Performance Metrics
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.include_route_optimization || false}
              onChange={(e) =>
                handleChange("include_route_optimization", e.target.checked)
              }
              className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <span className="text-sm text-blue-700">
              Include Route Optimization Data
            </span>
          </label>
        </div>
      </div>
    </>
  );
};

export default RouteModuleConfig;
