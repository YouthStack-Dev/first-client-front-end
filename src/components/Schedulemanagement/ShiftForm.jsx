import React, { useState } from "react";
import InputField from "../InputField";

const ShiftForm = ({
  initialData = { shiftType: "", hour: "", minute: "", shiftCategoryId: "" },
  categories = [],
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState(initialData);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
  };

  // Prepare shift type options
  const shiftTypeOptions = [
    { label: "LOGIN", value: "LOGIN" },
    { label: "LOGOUT", value: "LOGOUT" }
  ];

  // Prepare category options
  const categoryOptions = categories.map((cat) => ({ 
    label: cat.name, 
    value: cat.id 
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Shift Type */}
      <InputField
        label="Shift Type"
        name="shiftType"
        type="select"
        value={formData.shiftType}
        onChange={(e) => setFormData((prev) => ({ ...prev, shiftType: e.target.value }))}
        options={shiftTypeOptions}
        required
      />

      {/* Hour */}
      <InputField
        label="Hour"
        name="hour"
        type="number"
        value={formData.hour}
        onChange={(e) => setFormData((prev) => ({ ...prev, hour: e.target.value }))}
        min={0}
        max={23}
        required
      />

      {/* Minute */}
      <InputField
        label="Minute"
        name="minute"
        type="number"
        value={formData.minute}
        onChange={(e) => setFormData((prev) => ({ ...prev, minute: e.target.value }))}
        min={0}
        max={59}
        required
      />

      {/* Shift Category */}
      <InputField
        label="Shift Category"
        name="shiftCategoryId"
        type="select"
        value={formData.shiftCategoryId}
        onChange={(e) => setFormData((prev) => ({ ...prev, shiftCategoryId: e.target.value }))}
        options={categoryOptions}
        required
      />

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default ShiftForm;