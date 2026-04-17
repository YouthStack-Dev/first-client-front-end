// components/EscortFormModal.jsx
import React from "react";
import { X, Check } from "lucide-react";
import Select from "react-select";
import { logDebug } from "../../utils/logger";

// components/EscortFormModal.jsx - Update the component
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
  isSubmitting, // Add this prop
}) => {
  if (!isOpen) return null;

  // logDebug(" this is the error in model ,", errors);

  // Custom Select styles to match theme
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: errors.vendor_id ? "#ef4444" : "#e2e8f0",
      borderRadius: "0.5rem",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(56, 189, 248, 0.2)" : "none",
      borderWidth: "1px",
      "&:hover": {
        borderColor: errors.vendor_id ? "#ef4444" : "#0284c7",
      },
      backgroundColor: mode === "view" ? "#f8fafc" : "#ffffff",
      minHeight: "2.5rem",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#e0f2fe"
        : state.isFocused
        ? "#f8fafc"
        : "#ffffff",
      color: state.isSelected ? "#0369a1" : "#0f172a",
      "&:active": {
        backgroundColor: "#e0f2fe",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#0f172a",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#94a3b8",
    }),
    input: (base) => ({
      ...base,
      color: "#0f172a",
    }),
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-app-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-app-border">
        <div className="bg-gradient-to-r from-sidebar-primary to-sidebar-secondary px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {mode === "create" && "Create Escort"}
            {mode === "edit" && "Edit Escort"}
            {mode === "view" && "View Escort"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-app-secondary rounded transition-colors   text-white"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4">
          {/* Display server error at the top */}
          {errors.server && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                {typeof errors.server === "string"
                  ? errors.server
                  : errors.server?.message ||
                    "An error occurred. Please try again."}
              </p>
            </div>
          )}

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
                  styles={customSelectStyles}
                  classNamePrefix="select"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary focus:border-app-primary transition-colors ${
                    mode === "view"
                      ? "bg-app-tertiary text-app-text-muted"
                      : "bg-app-surface text-app-text-primary"
                  } ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-app-border"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary focus:border-app-primary transition-colors ${
                    mode === "view"
                      ? "bg-app-tertiary text-app-text-muted"
                      : "bg-app-surface text-app-text-primary"
                  } ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-app-border"
                  }`}
                  placeholder="+919876543210"
                />
              </FormField>
            </div>

            {/* Email */}
            <div>
              <FormField label="Email" required error={errors.email}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  disabled={mode === "view"}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary focus:border-app-primary transition-colors ${
                    mode === "view"
                      ? "bg-app-tertiary text-app-text-muted"
                      : "bg-app-surface text-app-text-primary"
                  } ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-app-border"
                  }`}
                  placeholder="email@example.com"
                />
              </FormField>
            </div>

            {/* Password (create only, optional) */}
            {mode === "create" && (
              <div>
                <FormField label="Password (Optional)" error={errors.password}>
                  <input
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) => onChange("password", e.target.value)}
                    disabled={mode === "view"}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary focus:border-app-primary transition-colors ${
                      mode === "view"
                        ? "bg-app-tertiary text-app-text-muted"
                        : "bg-app-surface text-app-text-primary"
                    } ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-app-border"
                    }`}
                    placeholder="Leave blank to use phone number"
                    autoComplete="new-password"
                  />
                </FormField>
              </div>
            )}

            {/* Gender */}
            <div>
              <FormField label="Gender" required error={errors.gender}>
                <Select
                  value={genderOptions.find((g) => g.value === formData.gender)}
                  onChange={(selected) =>
                    onChange("gender", selected?.value || "")
                  }
                  options={genderOptions}
                  isDisabled={mode === "view"}
                  placeholder="Select gender..."
                  isClearable
                  styles={customSelectStyles}
                  classNamePrefix="select"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary focus:border-app-primary transition-colors resize-none ${
                    mode === "view"
                      ? "bg-app-tertiary text-app-text-muted"
                      : "bg-app-surface text-app-text-primary"
                  } border-app-border`}
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
        <div className="sticky bottom-0 bg-app-tertiary px-6 py-4 flex justify-end gap-3 border-t border-app-border">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-app-border text-app-text-secondary rounded-lg hover:bg-app-surface transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === "view" ? "Close" : "Cancel"}
          </button>
          {mode !== "view" && (
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sidebar-primary to-sidebar-secondary text-white rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Check size={18} />
                  {mode === "create" ? "Create" : "Save Changes"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const FormField = ({ label, required = false, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-app-text-secondary mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const CheckboxField = ({ label, checked, onChange, disabled }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <div className="relative flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`w-5 h-5 border rounded-md flex items-center justify-center transition-all duration-300 ${
          disabled
            ? "bg-app-tertiary border-app-border opacity-50"
            : checked
            ? "bg-gradient-to-r from-sidebar-primary to-sidebar-secondary border-transparent"
            : "bg-app-surface border-app-border group-hover:border-sidebar-secondary"
        }`}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </div>
    <span
      className={`text-sm font-medium ${
        disabled ? "text-app-text-muted" : "text-app-text-secondary"
      }`}
    >
      {label}
    </span>
  </label>
);

export default EscortFormModal;
