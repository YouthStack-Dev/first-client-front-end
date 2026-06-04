import React from "react";
import { X, Check } from "lucide-react";

// ─── Internal helper: labelled input field ─────────────────────────────────────
const FormField = ({ label, required = false, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-app-text-secondary mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// ─── Component ─────────────────────────────────────────────────────────────────
const NodalPointFormModal = ({
  isOpen,
  onClose,
  mode,          // "create" | "edit"
  formData,
  errors = {},
  onChange,
  onSubmit,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  const isView = mode === "view";

  const inputClass = (hasError) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary focus:border-app-primary transition-colors ${
      isView
        ? "bg-app-tertiary text-app-text-muted"
        : "bg-app-surface text-app-text-primary"
    } ${hasError ? "border-red-500 focus:ring-red-500" : "border-app-border"}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-app-surface rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-app-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-sidebar-primary to-sidebar-secondary px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {mode === "create" && "Create Nodal Point"}
            {mode === "edit" && "Edit Nodal Point"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-app-secondary rounded transition-colors text-white"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {errors.server && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                {typeof errors.server === "string"
                  ? errors.server
                  : errors.server?.message || "An error occurred. Please try again."}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <FormField label="Hub Name" required error={errors.name}>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => onChange("name", e.target.value)}
                  disabled={isView}
                  className={inputClass(errors.name)}
                  placeholder="e.g. MG Road Hub"
                />
              </FormField>
            </div>

            {/* Address */}
            <div className="col-span-2">
              <FormField label="Address" error={errors.address}>
                <textarea
                  value={formData.address || ""}
                  onChange={(e) => onChange("address", e.target.value)}
                  disabled={isView}
                  rows={2}
                  className={`${inputClass(errors.address)} resize-none`}
                  placeholder="Street address of the hub"
                />
              </FormField>
            </div>

            {/* Latitude */}
            <div>
              <FormField label="Latitude" required error={errors.latitude}>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude ?? ""}
                  onChange={(e) =>
                    onChange("latitude", e.target.value === "" ? "" : parseFloat(e.target.value))
                  }
                  disabled={isView}
                  className={inputClass(errors.latitude)}
                  placeholder="e.g. 12.9716"
                />
              </FormField>
            </div>

            {/* Longitude */}
            <div>
              <FormField label="Longitude" required error={errors.longitude}>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude ?? ""}
                  onChange={(e) =>
                    onChange("longitude", e.target.value === "" ? "" : parseFloat(e.target.value))
                  }
                  disabled={isView}
                  className={inputClass(errors.longitude)}
                  placeholder="e.g. 77.5946"
                />
              </FormField>
            </div>

            {/* is_active — visible on edit only */}
            {mode === "edit" && (
              <div className="col-span-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={!!formData.is_active}
                      onChange={(e) => onChange("is_active", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-5 h-5 border rounded-md flex items-center justify-center transition-all duration-300 ${
                        formData.is_active
                          ? "bg-gradient-to-r from-sidebar-primary to-sidebar-secondary border-transparent"
                          : "bg-app-surface border-app-border group-hover:border-sidebar-secondary"
                      }`}
                    >
                      {formData.is_active && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
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
                  <span className="text-sm font-medium text-app-text-secondary">
                    Active
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-app-tertiary px-6 py-4 flex justify-end gap-3 border-t border-app-border">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-app-border text-app-text-secondary rounded-lg hover:bg-app-surface transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sidebar-primary to-sidebar-secondary text-white rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                <Check size={18} />
                {mode === "create" ? "Create" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodalPointFormModal;
