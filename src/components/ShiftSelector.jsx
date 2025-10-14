import { Clock, LogIn, LogOut } from "lucide-react";
import { useState } from "react";

export default function ShiftSelector({
  shifts,
  selectedShiftId,
  onShiftSelect,
  selectedDates,
  onSubmit,
  onBack,
  isSubmitting,
}) {
  const [filterType, setFilterType] = useState("ALL");

  const filteredShifts = shifts.filter((shift) => {
    if (filterType === "ALL") return true;
    return shift.log_type === filterType;
  });

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Selected Dates
        </h3>
        <div className="flex flex-wrap gap-2 bg-gray-50 p-4 rounded-lg">
          {selectedDates.map((date) => (
            <span
              key={date}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          ))}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Shift</h3>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterType("ALL")}
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all
            ${
              filterType === "ALL"
                ? "bg-gray-800 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }
          `}
        >
          All Shifts
        </button>
        <button
          onClick={() => setFilterType("IN")}
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
            ${
              filterType === "IN"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }
          `}
        >
          <LogIn className="w-4 h-4" />
          Check In
        </button>
        <button
          onClick={() => setFilterType("OUT")}
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
            ${
              filterType === "OUT"
                ? "bg-red-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }
          `}
        >
          <LogOut className="w-4 h-4" />
          Check Out
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {filteredShifts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No shifts available</p>
        ) : (
          filteredShifts.map((shift) => (
            <button
              key={shift.shift_id}
              onClick={() => onShiftSelect(shift.shift_id)}
              className={`
                w-full p-4 rounded-lg border-2 transition-all text-left
                ${
                  selectedShiftId === shift.shift_id
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    p-2 rounded-lg
                    ${shift.log_type === "IN" ? "bg-green-100" : "bg-red-100"}
                  `}
                  >
                    {shift.log_type === "IN" ? (
                      <LogIn
                        className={`w-5 h-5 ${
                          shift.log_type === "IN"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      />
                    ) : (
                      <LogOut className={`w-5 h-5 text-red-600`} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {formatTime(shift.shift_time)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {shift.log_type === "IN"
                        ? "Check In Time"
                        : "Check Out Time"}
                    </p>
                  </div>
                </div>
                <div
                  className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${
                    shift.log_type === "IN"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }
                `}
                >
                  {shift.log_type}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!selectedShiftId || isSubmitting}
          className={`
            flex-1 py-3 rounded-lg font-semibold transition-all
            ${
              !selectedShiftId || isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
            }
          `}
        >
          {isSubmitting ? "Submitting..." : "Submit Booking"}
        </button>
      </div>
    </div>
  );
}
