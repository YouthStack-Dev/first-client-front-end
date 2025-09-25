import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const AssignEntityModal = ({ isOpen, onClose, sourceEntity, onSave }) => {
  const initialFormData = {
    tenant_id: "",
    admin_email: "",
    admin_name: "",
    admin_password: "",
    admin_phone: "",
    email: "",
    name: "",
    phone: "",
    vendor_code: "",
    is_active: true,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  // Update tenant_id automatically when sourceEntity changes
  useEffect(() => {
    if (sourceEntity?.tenant_id && formData.tenant_id !== sourceEntity.tenant_id) {
      if (process.env.NODE_ENV === "development") {
        console.log("AssignEntityModal - setting tenant_id:", sourceEntity.tenant_id);
      }
      setFormData((prev) => ({
        ...prev,
        tenant_id: sourceEntity.tenant_id,
      }));
    }
  }, [sourceEntity?.tenant_id]);

  // Reset form on modal close
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d+\-()\s]{7,20}$/;

    if (!formData.name) newErrors.name = "Vendor name is required";
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid vendor email";
    if (!emailRegex.test(formData.admin_email)) newErrors.admin_email = "Invalid admin email";
    if (formData.email && formData.admin_email && formData.email === formData.admin_email) {
      newErrors.admin_email = "Admin email must be different from vendor email";
    }
    if (!phoneRegex.test(formData.phone)) newErrors.phone = "Invalid vendor phone";
    if (!phoneRegex.test(formData.admin_phone)) newErrors.admin_phone = "Invalid admin phone";
    if (!formData.admin_password) newErrors.admin_password = "Admin password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold">
            Assign Vendor to Company: {sourceEntity?.name || "N/A"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Tenant ID (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tenant ID</label>
            <input
              type="text"
              name="tenant_id"
              value={formData.tenant_id}
              readOnly
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
            />
            <input type="hidden" name="tenant_id" value={formData.tenant_id} />
          </div>

          {/* Vendor & Admin fields */}
          {[
            { label: "Vendor Name", name: "name", type: "text" },
            { label: "Vendor Email", name: "email", type: "email" },
            { label: "Vendor Phone", name: "phone", type: "text" },
            { label: "Vendor Code", name: "vendor_code", type: "text" },
            { label: "Admin Name", name: "admin_name", type: "text" },
            { label: "Admin Email", name: "admin_email", type: "email" },
            { label: "Admin Phone", name: "admin_phone", type: "text" },
            { label: "Admin Password", name: "admin_password", type: "password" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm ${
                  errors[field.name] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors[field.name] && (
                <p className="text-xs text-red-500 mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* Active Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Assign Vendor
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignEntityModal;
