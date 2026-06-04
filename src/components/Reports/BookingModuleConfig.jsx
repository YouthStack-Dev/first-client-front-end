import {
  BOOKING_STATUS_OPTIONS,
  ROUTE_STATUS_OPTIONS,
} from "../../staticData/StaticReport";

const BookingModuleConfig = ({
  formData,
  handleChange,
  toggleArrayValue,
  handleSelectAll,
  loading,
}) => {
  return (
    <div className="space-y-6">
      {/* Booking Status */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Booking Status
          </label>
          <button
            type="button"
            onClick={() =>
              handleSelectAll("booking_status", BOOKING_STATUS_OPTIONS)
            }
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            disabled={loading}
          >
            {formData.booking_status.length === BOOKING_STATUS_OPTIONS.length
              ? "Select None"
              : "Select All"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {BOOKING_STATUS_OPTIONS.map((status) => (
            <label
              key={status}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.booking_status.includes(status)}
                onChange={() => toggleArrayValue("booking_status", status)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <span
                className={`text-sm ${loading ? "text-gray-400" : "text-gray-700"}`}
              >
                {status}
              </span>
            </label>
          ))}
        </div>
      </div>

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
                className={`text-sm ${loading ? "text-gray-400" : "text-gray-700"}`}
              >
                {status}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Include Unrouted */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.include_unrouted}
            onChange={(e) => handleChange("include_unrouted", e.target.checked)}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <span
            className={`text-sm font-medium ${loading ? "text-gray-400" : "text-gray-700"}`}
          >
            Include Unrouted Bookings
          </span>
        </label>
      </div>
    </div>
  );
};

export default BookingModuleConfig;
