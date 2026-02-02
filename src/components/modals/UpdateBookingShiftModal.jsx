import React, { useState } from "react";
import { X, Clock, LogIn, LogOut } from "lucide-react";
import { Modal } from "../SmallComponents";
import { API_CLIENT } from "../../Api/API_Client";
import endpoint from "../../Api/Endpoints";
import ErrorDisplay from "../ui/ErrorDisplay";

const UpdateBookingShiftModal = ({
  isOpen,
  onClose,
  onSuccess,
  booking,
  shifts = [],
}) => {
  const [selectedShiftId, setSelectedShiftId] = useState(booking?.shift_id || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const [error, setError] = useState(null);

  const filteredShifts = shifts.filter((shift) => {
    if (filterType === "ALL") return true;
    return shift.log_type === filterType;
  });

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleUpdate = async () => {
    if (!selectedShiftId) return;
    
    setIsSubmitting(true);
    setError(null); // Clear previous errors
    
    try {
      const response = await API_CLIENT.put(
        `${endpoint.updateBookingShift}${booking.booking_id}`,
        { shift_id: selectedShiftId }
      );

      if (response.data.success) {
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to update booking shift");
      }
    } catch (error) {
      console.error("Error updating booking shift:", error);
      // Set error state to display in modal - don't close modal
      setError(error.response?.data || error.message || "Failed to update booking shift");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Booking Shift"
      size="md"
      hideFooter={true}
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">Booking for:</p>
          <p className="font-semibold text-gray-900">
            {new Date(booking?.booking_date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Current Shift: {booking?.shift_time}</p>
        </div>

        {/* Error Display */}
        <ErrorDisplay 
          error={error} 
          title="Update Failed" 
          onClear={() => setError(null)}
        />

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select New Shift</h3>
          
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterType === "ALL" ? "bg-gray-800 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterType("IN")}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                filterType === "IN" ? "bg-green-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <LogIn className="w-4 h-4" />
              In
            </button>
            <button
              type="button"
              onClick={() => setFilterType("OUT")}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                filterType === "OUT" ? "bg-red-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <LogOut className="w-4 h-4" />
              Out
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {filteredShifts.map((shift) => (
              <button
                key={shift.shift_id}
                type="button"
                onClick={() => setSelectedShiftId(shift.shift_id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedShiftId === shift.shift_id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${shift.log_type === "IN" ? "bg-green-100" : "bg-red-100"}`}>
                      {shift.log_type === "IN" ? (
                        <LogIn className="w-5 h-5 text-green-600" />
                      ) : (
                        <LogOut className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{formatTime(shift.shift_time)}</p>
                      <p className="text-xs text-gray-500">{shift.log_type === "IN" ? "Check In" : "Check Out"}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={!selectedShiftId || isSubmitting || selectedShiftId === booking?.shift_id}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              !selectedShiftId || isSubmitting || selectedShiftId === booking?.shift_id
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            }`}
          >
            {isSubmitting ? "Updating..." : "Update Shift"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default UpdateBookingShiftModal;
