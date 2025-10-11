import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HeaderWithActionNoRoute from "@components/HeaderWithActionNoRoute";
import {
  updateFormField,
  resetForm,
} from "../../redux/features/cutoff/cutoffSlice";
import { fetchCutoffsThunk, saveCutoffThunk } from "../../redux/features/cutoff/cutofftrunk";

const CutoffManagement = () => {
  const dispatch = useDispatch();
  const { formData, status, error, data } = useSelector((state) => state.cutoff);
  const { booking, cancellation } = formData;

  // Fetch cutoff on mount
  useEffect(() => {
    // console.log("CutoffManagement mounted, data:", data);
    if (!data) dispatch(fetchCutoffsThunk());
  }, [dispatch, data]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    // console.log(`Input changed: ${name} = ${value}`);
    dispatch(updateFormField({ name, value }));
  };

  const handleSave = () => {
    // console.log("Saving cutoff with formData:", formData);
    const bookingVal = parseFloat(booking);
    const cancellationVal = parseFloat(cancellation);

    if (isNaN(bookingVal) || isNaN(cancellationVal)) {
      alert("Please enter valid numeric values.");
      return;
    }
    if (bookingVal > cancellationVal) {
      alert("Booking cutoff must be less than or equal to cancellation cutoff.");
      return;
    }

    dispatch(saveCutoffThunk({ booking: bookingVal, cancellation: cancellationVal }));
  };

  const handleReset = () => {
    console.log("Resetting form");
    dispatch(resetForm());
  };

  // Display numeric values for saved data
  const displayBooking = data?.booking_cutoff
    ? parseFloat(data.booking_cutoff.split(":")[0])
    : 0;
  const displayCancellation = data?.cancel_cutoff
    ? parseFloat(data.cancel_cutoff.split(":")[0])
    : 0;

  return (
    <div className="space-y-6 p-4 w-full">
      <HeaderWithActionNoRoute title="Cutoff Management" extraButtons={[]} />

      {status === "loading" && <p className="text-gray-600">Loading...</p>}
      {status === "failed" && <p className="text-red-600">Error: {error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Booking Cutoff */}
            <div className="bg-white rounded-lg shadow p-4 border">
              <h3 className="text-blue-600 font-semibold mb-2">Booking Cutoff</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  name="booking"
                  min="0"
                  step="0.5"
                  value={booking}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Enter booking cutoff in hours"
                />
                <p className="text-sm text-gray-500">
                  Saved: <strong>{displayBooking}</strong> hours
                </p>
              </div>
            </div>

            {/* Cancellation Cutoff */}
            <div className="bg-white rounded-lg shadow p-4 border">
              <h3 className="text-blue-600 font-semibold mb-2">Cancellation Cutoff</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  name="cancellation"
                  min="0"
                  step="0.5"
                  value={cancellation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Enter cancellation cutoff in hours"
                />
                <p className="text-sm text-gray-500">
                  Saved: <strong>{displayCancellation}</strong> hours
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={handleReset}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={status === "saving"}
            >
              {status === "saving" ? "Saving..." : "Save Cutoffs"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CutoffManagement;
