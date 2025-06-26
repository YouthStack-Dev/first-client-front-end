// components/toll/ManualTollForm.jsx
import React, { useState } from "react";

const ManualTollForm = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    tollName: "",
    date: "",
    entityType: "",
    entityId: "",
    amount: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="space-y-4">
      <input name="tollName" placeholder="Toll Name" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="date" type="date" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="entityType" placeholder="Entity Type" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="entityId" placeholder="Cab Display ID" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="amount" placeholder="Amount" onChange={handleChange} className="w-full border p-2 rounded" />

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
      </div>
    </div>
  );
};

export default ManualTollForm;
