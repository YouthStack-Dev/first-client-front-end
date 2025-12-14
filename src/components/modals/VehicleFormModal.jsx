import { useState, useEffect } from "react";

export default function VehicleFormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData = {},
  isSubmitting,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    seats: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        seats: initialData.seats || "",
        is_active: initialData.is_active ?? true,
      });
    }
  }, [initialData]);

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vehicle type name is required.";
    }

    if (!formData.seats || formData.seats <= 0) {
      newErrors.seats = "Seats must be a positive number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmitClick = () => {
    if (!validateForm()) return;

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        {/* FORM FIELDS */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-medium">Vehicle Type Name *</label>
            <input
              type="text"
              name="name"
              className="w-full border p-2 rounded"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium">Description</label>
            <textarea
              name="description"
              className="w-full border p-2 rounded"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Seats */}
          <div>
            <label className="block font-medium">Seats *</label>
            <input
              type="number"
              name="seats"
              className="w-full border p-2 rounded"
              value={formData.seats}
              onChange={handleChange}
            />
            {errors.seats && (
              <p className="text-red-600 text-sm mt-1">{errors.seats}</p>
            )}
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <label>Active</label>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isSubmitting ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
