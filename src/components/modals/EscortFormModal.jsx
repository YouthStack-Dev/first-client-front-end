// components/EscortFormModal.jsx
import React from "react";
import { X, Check } from "lucide-react";
import Select from "react-select";

const EscortFormModal = ({
  isOpen,
  onClose,
  mode,
  formData,
  errors,
  vendors,
  genderOptions,
  onChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" && "Create Escort"}
            {mode === "edit" && "Edit Escort"}
            {mode === "view" && "View Escort"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Vendor */}
            <div className="col-span-2">
              <FormField label="Vendor" required error={errors.vendor_id}>
                <Select
                  value={vendors.find((v) => v.value === formData.vendor_id)}
                  onChange={(selected) =>
                    onChange("vendor_id", selected?.value || null)
                  }
                  options={vendors}
                  isDisabled={mode === "view"}
                  placeholder="Select vendor..."
                  className={errors.vendor_id ? "border-red-500" : ""}
                />
              </FormField>
            </div>

            {/* Name */}
            <div className="col-span-2">
              <FormField label="Name" required error={errors.name}>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  disabled={mode === "view"}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter full name"
                />
              </FormField>
            </div>

            {/* Phone */}
            <div>
              <FormField label="Phone" required error={errors.phone}>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  disabled={mode === "view"}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+919876543210"
                />
              </FormField>
            </div>

            {/* Email */}
            <div>
              <FormField label="Email" error={errors.email}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  disabled={mode === "view"}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="email@example.com"
                />
              </FormField>
            </div>

            {/* Gender */}
            <div>
              <FormField label="Gender">
                <Select
                  value={genderOptions.find((g) => g.value === formData.gender)}
                  onChange={(selected) =>
                    onChange("gender", selected?.value || "")
                  }
                  options={genderOptions}
                  isDisabled={mode === "view"}
                  placeholder="Select gender..."
                  isClearable
                />
              </FormField>
            </div>

            {/* Address */}
            <div className="col-span-2">
              <FormField label="Address">
                <textarea
                  value={formData.address}
                  onChange={(e) => onChange("address", e.target.value)}
                  disabled={mode === "view"}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="Enter address"
                />
              </FormField>
            </div>

            {/* Checkboxes */}
            <div className="col-span-2 flex gap-6">
              <CheckboxField
                label="Is Active"
                checked={formData.is_active}
                onChange={(checked) => onChange("is_active", checked)}
                disabled={mode === "view"}
              />
              <CheckboxField
                label="Is Available"
                checked={formData.is_available}
                onChange={(checked) => onChange("is_available", checked)}
                disabled={mode === "view"}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mode === "view" ? "Close" : "Cancel"}
          </button>
          {mode !== "view" && (
            <button
              onClick={onSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check size={18} />
              {mode === "create" ? "Create" : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const FormField = ({ label, required = false, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const CheckboxField = ({ label, checked, onChange, disabled }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
    />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </label>
);

export default EscortFormModal;
