// BookingModuleConfig.jsx
import { BOOKING_STATUS_OPTIONS } from "../../staticData/StaticReport";

const BookingModuleConfig = ({
  formData,
  toggleArrayValue,
  handleSelectAll,
  loading,
}) => {
  return (
    <>
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
    </>
  );
};

export default BookingModuleConfig;
