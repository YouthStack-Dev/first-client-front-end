import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HeaderWithActionNoRoute from "@components/HeaderWithActionNoRoute";
import {
  updateFormField,
  resetForm,
} from "../../redux/features/cutoff/cutoffSlice";
import {
  fetchCutoffsThunk,
  saveCutoffThunk,
} from "../../redux/features/cutoff/cutofftrunk";
import {
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Shield,
} from "lucide-react";

const CutoffManagement = () => {
  const dispatch = useDispatch();
  const { formData, status, error, data } = useSelector(
    (state) => state.cutoff
  );
  const { booking, cancellation } = formData;

  useEffect(() => {
    if (!data) dispatch(fetchCutoffsThunk());
  }, [dispatch, data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormField({ name, value }));
  };

  const handleSave = () => {
    const bookingVal = parseFloat(booking);
    const cancellationVal = parseFloat(cancellation);

    if (isNaN(bookingVal) || isNaN(cancellationVal)) {
      return;
    }
    if (bookingVal > cancellationVal) {
      return;
    }

    dispatch(
      saveCutoffThunk({ booking: bookingVal, cancellation: cancellationVal })
    );
  };

  const handleReset = () => {
    dispatch(resetForm());
  };

  // Display numeric values for saved data
  const displayBooking = data?.booking_cutoff
    ? parseFloat(data.booking_cutoff.split(":")[0])
    : 0;
  const displayCancellation = data?.cancel_cutoff
    ? parseFloat(data.cancel_cutoff.split(":")[0])
    : 0;

  // Validation states
  const isBookingValid =
    !isNaN(parseFloat(booking)) && parseFloat(booking) >= 0;
  const isCancellationValid =
    !isNaN(parseFloat(cancellation)) && parseFloat(cancellation) >= 0;
  const isBookingLessThanCancellation =
    parseFloat(booking) <= parseFloat(cancellation);
  const isFormValid =
    isBookingValid && isCancellationValid && isBookingLessThanCancellation;
  const hasChanges =
    booking !== displayBooking.toString() ||
    cancellation !== displayCancellation.toString();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" mx-auto space-y-6">
        {/* Status Indicators */}
        {status === "loading" && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Loading cutoff settings...
            </span>
          </div>
        )}

        {status === "failed" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">
                Failed to load cutoff settings
              </p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {status === "saved" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">
                Cutoff settings saved successfully!
              </p>
              <p className="text-green-600 text-sm mt-1">
                Your changes have been applied.
              </p>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Information Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-blue-900 font-semibold text-lg mb-2">
                    About Cutoff Times
                  </h3>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    Cutoff times determine how far in advance employees can book
                    or cancel shifts. Booking cutoff must be earlier than
                    cancellation cutoff to allow sufficient notice.
                  </p>
                </div>
              </div>
            </div>

            {/* Cutoff Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Cutoff Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold">
                      Booking Cutoff
                    </h3>
                    <p className="text-gray-500 text-sm">
                      How far in advance shifts can be booked
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      name="booking"
                      min="0"
                      step="0.5"
                      value={booking}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        !isBookingValid
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter hours (e.g., 24.0)"
                    />
                    <div className="absolute right-3 top-3 text-gray-400">
                      hours
                    </div>
                  </div>

                  {!isBookingValid && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Please enter a valid positive number</span>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 text-sm font-medium">
                      Current Setting
                    </p>
                    <p className="text-gray-900 font-semibold text-lg">
                      {displayBooking} hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancellation Cutoff Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold">
                      Cancellation Cutoff
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Latest time to cancel a booked shift
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      name="cancellation"
                      min="0"
                      step="0.5"
                      value={cancellation}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        !isCancellationValid
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter hours (e.g., 12.0)"
                    />
                    <div className="absolute right-3 top-3 text-gray-400">
                      hours
                    </div>
                  </div>

                  {!isCancellationValid && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Please enter a valid positive number</span>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 text-sm font-medium">
                      Current Setting
                    </p>
                    <p className="text-gray-900 font-semibold text-lg">
                      {displayCancellation} hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Alert */}
            {!isBookingLessThanCancellation && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-amber-800 font-medium">
                    Invalid cutoff relationship
                  </p>
                  <p className="text-amber-600 text-sm mt-1">
                    Booking cutoff must be less than or equal to cancellation
                    cutoff.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleReset}
                disabled={!hasChanges || status === "saving"}
                className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Changes</span>
              </button>

              <button
                onClick={handleSave}
                disabled={!isFormValid || !hasChanges || status === "saving"}
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
              >
                {status === "saving" ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Changes will affect all future shift bookings and cancellations
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CutoffManagement;
