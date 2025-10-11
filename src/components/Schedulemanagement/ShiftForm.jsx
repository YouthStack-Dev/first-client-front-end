import React, { useState } from "react";
import { toast } from "react-toastify";

const ShiftForm = ({ initialData = {}, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    shift_code: "",
    log_type: "",
    shift_time: "",
    pickup_type: "",
    gender: "",
    waiting_time_minutes: 0,
    is_active: true,
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.shift_code) newErrors.shift_code = "Shift code is required";
    if (!formData.log_type) newErrors.log_type = "Log type is required";
    if (!formData.shift_time) newErrors.shift_time = "Shift time is required";
    if (
      formData.waiting_time_minutes === "" ||
      formData.waiting_time_minutes === undefined
    )
      newErrors.waiting_time_minutes = "Waiting time is required";
    if (!formData.pickup_type) newErrors.pickup_type = "Pickup type is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix all required fields");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit?.(formData); // ✅ use onSubmit
    }
  };

  const handleWaitingTimeChange = (value) => {
    if (value === "" || (value >= 0 && value <= 10)) {
      updateField("waiting_time_minutes", value === "" ? "" : Number(value));
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      {/* First Row: Shift Code and Log Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shift Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.shift_code}
            onChange={(e) => updateField("shift_code", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Enter Shift Code"
          />
          {errors.shift_code && (
            <p className="text-red-500 text-xs mt-1">{errors.shift_code}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Log Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.log_type}
            onChange={(e) => updateField("log_type", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="" disabled hidden>
              Select Log Type
            </option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>
          {errors.log_type && (
            <p className="text-red-500 text-xs mt-1">{errors.log_type}</p>
          )}
        </div>
      </div>

      {/* Second Row: Shift Time and Pickup Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shift Time (HH:MM) <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={formData.shift_time}
            onChange={(e) => updateField("shift_time", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {errors.shift_time && (
            <p className="text-red-500 text-xs mt-1">{errors.shift_time}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.pickup_type}
            onChange={(e) => updateField("pickup_type", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="" disabled hidden>
              Select Pickup Type
            </option>
            <option value="Pickup">Pickup</option>
             <option value="Nodal">Nodal</option>

          </select>
          {errors.pickup_type && (
            <p className="text-red-500 text-xs mt-1">{errors.pickup_type}</p>
          )}
        </div>
      </div>

      {/* Third Row: Gender and Waiting Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) => updateField("gender", e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="" disabled hidden>
              Select Gender
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Waiting Time (0–10 minutes) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={formData.waiting_time_minutes}
              onChange={(e) =>
                updateField("waiting_time_minutes", Number(e.target.value))
              }
              className="w-full accent-blue-600"
            />
            <input
              type="number"
              min="0"
              max="10"
              step="1"
              value={formData.waiting_time_minutes}
              onChange={(e) => handleWaitingTimeChange(e.target.value)}
              className="w-16 text-center border border-gray-300 rounded-md p-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="text-gray-600 text-sm">min</span>
          </div>
          {errors.waiting_time_minutes && (
            <p className="text-red-500 text-xs mt-1">
              {errors.waiting_time_minutes}
            </p>
          )}
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center mb-5">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => updateField("is_active", e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor="is_active"
          className="ml-2 text-sm font-medium text-gray-700"
        >
          Active
        </label>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ShiftForm;
