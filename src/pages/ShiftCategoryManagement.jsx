// import React, { useState } from "react";
// import axios from 'axios';
// import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute";

// const ShiftCategoryManagement = () => {
//   const [bookingCutOffEmployee, setBookingCutOffEmployee] = useState(0);
//   const [cancellationCutOffEmployee, setCancellationCutOffEmployee] = useState(0);

//   const [formValues, setFormValues] = useState({
//     booking: "0",
//     cancellation: "0",
//   });

//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormValues((prev) => ({ ...prev, [name]: value }));

//     // Live validation
//     if (name === "booking" && parseFloat(value) > parseFloat(formValues.cancellation)) {
//       setErrors((prev) => ({
//         ...prev,
//         booking: "Booking cutoff must be <= cancellation cutoff",
//       }));
//     } else if (name === "cancellation" && parseFloat(value) < parseFloat(formValues.booking)) {
//       setErrors((prev) => ({
//         ...prev,
//         cancellation: "Cancellation cutoff must be >= booking cutoff",
//       }));
//     } else {
//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     }
//   };

//   const handleSave = () => {
//     const b = parseFloat(formValues.booking);
//     const c = parseFloat(formValues.cancellation);

//     const newErrors = {};
//     if (isNaN(b) || b < 0) newErrors.booking = "Enter a valid non-negative number";
//     if (isNaN(c) || c < 0) newErrors.cancellation = "Enter a valid non-negative number";
//     if (b > c) {
//       newErrors.booking = "Booking cutoff must be <= cancellation cutoff";
//       newErrors.cancellation = "Cancellation cutoff must be >= booking cutoff";
//     }

//     setErrors(newErrors);
//     if (Object.keys(newErrors).length > 0) return;

//     setBookingCutOffEmployee(b);
//     setCancellationCutOffEmployee(c);
//     alert("Cutoffs saved!");
//   };

//   return (
//     <div className="space-y-6 p-4 w-full">
//       <HeaderWithActionNoRoute title="Cutoff Management" extraButtons={[]} />

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <div className="bg-white rounded-lg shadow p-4 border">
//           <h3 className="text-blue-600 font-semibold mb-2">Booking Cutoff</h3>
//           <div className="space-y-2">
//             <input
//               type="number"
//               name="booking"
//               min="0"
//               step="0.5"
//               value={formValues.booking}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded px-3 py-2"
//               placeholder="Enter booking cutoff in hours"
//             />
//             {errors.booking && (
//               <p className="text-sm text-red-600">{errors.booking}</p>
//             )}
//             <p className="text-sm text-gray-500">
//               Current: <strong>{bookingCutOffEmployee}</strong> hours
//             </p>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-4 border">
//           <h3 className="text-blue-600 font-semibold mb-2">Cancellation Cutoff</h3>
//           <div className="space-y-2">
//             <input
//               type="number"
//               name="cancellation"
//               min="0"
//               step="0.5"
//               value={formValues.cancellation}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded px-3 py-2"
//               placeholder="Enter cancellation cutoff in hours"
//             />
//             {errors.cancellation && (
//               <p className="text-sm text-red-600">{errors.cancellation}</p>
//             )}
//             <p className="text-sm text-gray-500">
//               Current: <strong>{cancellationCutOffEmployee}</strong> hours
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-end mt-4">
//         <button
//           onClick={handleSave}
//           className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//         >
//           Save Cutoffs
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ShiftCategoryManagement;
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute";
import {
  fetchCutoffData,
  saveCutoffData,
} from "../redux/features/Category/shiftCategoryThunks";
import {
  updateFormField,
  resetForm,
} from "../redux/features/Category/shiftCategorySlice";

const ShiftCategoryManagement = () => {
  const dispatch = useDispatch();

  const {
    formData,
    editingId,
    status,
    error,
    data,
  } = useSelector((state) => state.shiftCategory);

  const { booking, cancellation } = formData;

  useEffect(() => {
    dispatch(fetchCutoffData());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormField({ name, value }));
  };

  const handleSave = () => {
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

    dispatch(
      saveCutoffData({
        id: editingId,
        booking_cutoff: bookingVal,
        cancellation_cutoff: cancellationVal,
      })
    );
  };

  return (
    <div className="space-y-6 p-4 w-full">
      <HeaderWithActionNoRoute title="Cutoff Management" extraButtons={[]} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              Saved: <strong>{formData.booking}</strong> hours
            </p>
          </div>
        </div>

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
              Saved: <strong>{formData.cancellation}</strong> hours
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={status === 'saving'}
        >
          {status === 'saving' ? 'Saving...' : 'Save Cutoffs'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">Error: {error}</p>}

      {/* {data && (
        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded">
          <h4 className="font-semibold mb-2 text-gray-700">🔍 Raw Cutoff API Data</h4>
          <pre className="text-sm text-gray-800">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )} */}
    </div>
  );
};

export default ShiftCategoryManagement;
