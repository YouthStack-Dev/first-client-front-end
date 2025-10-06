// import React, { useState } from "react";
// import FormField from "./FormField";
// import { toast } from "react-toastify";

// const ShiftForm = ({ formData, setFormData, onCancel, onSave }) => {
//   const [errors, setErrors] = useState({});

//   const {
//     shiftCode = "",
//     shiftType = "",
//     hours = "",
//     minutes = "",
//     days = [],
//     waitingTime = "",
//     pickOn = "",
//     gender = "",
//     isActive = true,
//   } = formData;

//   const hourOptions = Array.from({ length: 13 }, (_, i) => i);
//   const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);
//   const waitingTimeOptions = Array.from({ length: 10 }, (_, i) => i + 1);
//   const dayOptions = [
//     "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
//   ];

//   const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

//   const toggleDay = (day) => {
//     setFormData(prev => ({
//       ...prev,
//       days: prev.days?.includes(day) 
//         ? prev.days.filter(d => d !== day) 
//         : [...(prev.days || []), day],
//     }));
//   };

//   // ✅ Validate all required fields
//   const validateForm = () => {
//     const newErrors = {};
//     if (!shiftCode) newErrors.shiftCode = "Shift code is required";
//     if (!shiftType) newErrors.shiftType = "Shift type is required";
//     if (hours === "" || minutes === "") newErrors.timings = "Shift time is required";
//     if (!waitingTime) newErrors.waitingTime = "Waiting time is required";
//     if (!pickOn) newErrors.pickOn = "Pickup type is required";
//     if (!gender) newErrors.gender = "Gender is required";
//     if (!days || days.length === 0) newErrors.days = "At least one day must be selected";

//     setErrors(newErrors);

//     if (Object.keys(newErrors).length > 0) {
//       toast.error("Please fix all required fields");
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = () => {
//     if (validateForm()) onSave();
//   };

//   return (
//     <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-6">
//       {/* Main Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <FormField label="Shift Code" name="shiftCode" required error={errors.shiftCode}>
//           <input
//             type="text"
//             value={shiftCode}
//             onChange={(e) => updateField("shiftCode", e.target.value)}
//             className="w-full border px-3 py-2 rounded-md focus:ring focus:border-blue-400"
//             placeholder="Enter shift code"
//           />
//         </FormField>

//         <FormField label="Shift Type" name="shiftType" required error={errors.shiftType}>
//           <select
//             value={shiftType}
//             onChange={(e) => updateField("shiftType", e.target.value)}
//             className="w-full border px-3 py-2 rounded-md focus:ring focus:border-blue-400"
//           >
//             <option value="" disabled hidden>Select Type</option>
//             <option value="login">Login</option>
//             <option value="logout">Logout</option>
//           </select>
//         </FormField>

//         <FormField label="Shift Time" name="timings" required error={errors.timings}>
//           <div className="flex gap-4">
//             <select
//               value={hours}
//               onChange={(e) => updateField("hours", Number(e.target.value))}
//               className="flex-1 border px-3 py-2 rounded-md focus:ring focus:border-blue-400"
//             >
//               <option value="" disabled hidden>Hours</option>
//               {hourOptions.map(hr => <option key={hr} value={hr}>{hr} hr</option>)}
//             </select>
//             <select
//               value={minutes}
//               onChange={(e) => updateField("minutes", Number(e.target.value))}
//               className="flex-1 border px-3 py-2 rounded-md focus:ring focus:border-blue-400"
//             >
//               <option value="" disabled hidden>Minutes</option>
//               {minuteOptions.map(min => <option key={min} value={min}>{min} min</option>)}
//             </select>
//           </div>
//         </FormField>

//         <FormField label="Waiting Time (mins)" name="waitingTime" required error={errors.waitingTime}>
//           <select
//             value={waitingTime}
//             onChange={(e) => updateField("waitingTime", Number(e.target.value))}
//             className="w-full border px-3 py-2 rounded-md focus:ring focus:border-blue-400"
//           >
//             <option value="" disabled hidden>Select Waiting Time</option>
//             {waitingTimeOptions.map(min => <option key={min} value={min}>{min} min</option>)}
//           </select>
//         </FormField>

//         <FormField label="Pick On" name="pickOn" required error={errors.pickOn}>
//           <select
//             value={pickOn}
//             onChange={(e) => updateField("pickOn", e.target.value)}
//             className="w-full border px-3 py-2 rounded-md focus:ring focus:border-blue-400"
//           >
//             <option value="" disabled hidden>Select Option</option>
//             <option value="pickup">Pickup</option>
//             <option value="nodal">Nodal</option>
//           </select>
//         </FormField>

//         <FormField label="Gender" name="gender" required error={errors.gender}>
//           <select
//             value={gender}
//             onChange={(e) => updateField("gender", e.target.value)}
//             className="w-full border px-3 py-2 rounded-md focus:ring focus:border-blue-400"
//           >
//             <option value="" disabled hidden>Select Gender</option>
//             <option value="female">Female</option>
//             <option value="male">Male</option>
//             <option value="any">Any</option>
//           </select>
//         </FormField>
//       </div>

//       {/* Days */}
//       <FormField label="Days" name="days" required error={errors.days}>
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 rounded-lg border">
//           {dayOptions.map(day => (
//             <label key={day} className="inline-flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 checked={days.includes(day)}
//                 onChange={() => toggleDay(day)}
//                 className="form-checkbox h-4 w-4 text-blue-600"
//               />
//               <span className="capitalize text-sm">{day}</span>
//             </label>
//           ))}
//         </div>
//       </FormField>

//       {/* Status */}
//       <FormField label="Status" name="isActive">
//         <label className="inline-flex items-center space-x-3">
//           <input
//             type="checkbox"
//             checked={isActive}
//             onChange={(e) => updateField("isActive", e.target.checked)}
//             className="form-checkbox h-5 w-5 text-green-600"
//           />
//           <span className="text-sm text-gray-700">{isActive ? "Active" : "Inactive"}</span>
//         </label>
//       </FormField>

//       {/* Actions */}
//       <div className="flex justify-end gap-3 pt-4 border-t">
//         <button onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancel</button>
//         <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">Save</button>
//       </div>
//     </div>
//   );
// };

// export default ShiftForm;
