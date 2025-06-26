import React, { useState } from "react";

const AdjustmentPenaltyForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    entityType: "VEHICLE",
    vehicleId: "",
    dutyDate: "",
    adjustmentType: "",
    amount: "",
    comment: "",
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    onClose(); // You can replace this with actual submit logic
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Entity Type */}
      <div>
        <label className="block text-sm font-medium mb-1">Entity Type*</label>
        <div className="flex gap-4">
          {["VENDOR", "VEHICLE", "TRIP"].map((type) => (
            <label key={type} className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                name="entityType"
                value={type}
                checked={formData.entityType === type}
                onChange={() => handleChange("entityType", type)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Vehicle ID & Duty Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle Id*</label>
          <select
            value={formData.vehicleId}
            onChange={(e) => handleChange("vehicleId", e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="V001">V001</option>
            <option value="V002">V002</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duty Date*</label>
          <input
            type="date"
            value={formData.dutyDate}
            onChange={(e) => handleChange("dutyDate", e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
      </div>

      {/* Adjustment Type & Amount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Adjustment Type*</label>
          <select
            value={formData.adjustmentType}
            onChange={(e) => handleChange("adjustmentType", e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="Toll">Toll</option>
            <option value="Delay">Delay</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Adjustment Amount*</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <small className="text-xs text-gray-500">
            (Adjustment value is added to the Bill)
          </small>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium mb-1">Comment</label>
        <textarea
          rows={3}
          value={formData.comment}
          onChange={(e) => handleChange("comment", e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 border rounded"
          onClick={onClose}
        >
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Save
        </button>
      </div>
    </form>
  );
};

export default AdjustmentPenaltyForm;
