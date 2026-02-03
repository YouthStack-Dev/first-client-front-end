// components/Vendor/VendorUserForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import {
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Lock,
  Building,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

import { API_CLIENT } from "../../Api/API_Client";
import { logDebug } from "../../utils/logger";
import endpoint from "../../Api/Endpoints";
import { useValidation } from "../../hooks/useValidation";
import { useRoleOptions } from "../../hooks/useRoles"; // Import the role hook
import { Modal } from "../SmallComponents";

const VendorUserForm = ({
  isOpen,
  onClose,
  mode = "view",
  initialData = null,
  vendors = [],
  onSuccess,
  refreshVendors = () => {},
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Use the validation hook
  const { errors, validateForm, clearError } = useValidation(
    "vendorUser",
    mode === "create" ? "create" : "edit"
  );

  // Fetch roles for dropdown
  const { options: roleOptions, loading: rolesLoading } = useRoleOptions(
    isOpen && (mode === "create" || mode === "edit" || mode === "view")
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vendor_id: "",
    role_id: "", // Add role_id to form data
    is_active: true,
    password: "",
  });

  // Initialize form when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Set form values from initialData
        setFormData({
          name: initialData.name || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          vendor_id: initialData.vendor_id || "",
          role_id: initialData.role_id || "", // Add role_id
          is_active:
            initialData.is_active !== undefined ? initialData.is_active : true,
          password: "", // Don't pre-fill password for security
        });

        // Find and set selected vendor
        if (initialData.vendor_id && vendors.length > 0) {
          const vendor = vendors.find(
            (v) =>
              v.id === initialData.vendor_id ||
              v.vendor_id === initialData.vendor_id
          );
          if (vendor) {
            setSelectedVendor({
              value: vendor.vendor_id,
              label: vendor.name || vendor.vendor_name || `Vendor ${vendor.id}`,
            });
          }
        }
      } else {
        // Reset form for create mode
        setFormData({
          name: "",
          email: "",
          phone: "",
          vendor_id: "",
          role_id: "", // Reset role_id
          is_active: true,
          password: "",
        });
        setSelectedVendor(null);
        setSelectedRole(null);
      }

      // Set edit mode based on modal mode prop
      setIsEditMode(mode === "create" || mode === "edit");
    }
  }, [isOpen, initialData, mode, vendors]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field when user starts typing
    clearError(name);
  };

  // Handle vendor selection
  const handleVendorSelect = (selectedOption) => {
    setSelectedVendor(selectedOption);
    setFormData((prev) => ({
      ...prev,
      vendor_id: selectedOption?.value || "",
    }));

    // Clear vendor error if exists
    clearError("vendor_id");
  };

  // Handle role selection
  const handleRoleSelect = (selectedOption) => {
    setSelectedRole(selectedOption);
    setFormData((prev) => ({
      ...prev,
      role_id: selectedOption?.value || "",
    }));

    // Clear role error if exists
    clearError("role_id");
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    logDebug("Submitting vendor user data:", formData);

    // Validate form using Zod schema
    const validationResult = validateForm(formData);

    if (!validationResult.isValid) {
      // Check if there are specific field errors
      const hasFieldErrors = Object.keys(validationResult.errors).some(
        (key) => key !== "general"
      );
      if (hasFieldErrors) {
        toast.error("Please fix the validation errors");
      } else if (validationResult.errors.general) {
        toast.error(validationResult.errors.general);
      }
      return;
    }

    setIsLoading(true);
    try {
      // Use validated data from Zod parsing
      const validatedData = validationResult.validatedData;

      // Prepare payload
      const payload = {
        ...validatedData,
        // Ensure vendor_id and role_id are numbers
        vendor_id: parseInt(validatedData.vendor_id) || validatedData.vendor_id,
        role_id: parseInt(formData.role_id) ? parseInt(formData.role_id) : null,
      };
      logDebug(" this is the vendor user subbmiting payloud", payload);
      let response;
      if (mode === "create") {
        response = await API_CLIENT.post(endpoint.VendorUser, payload);
      } else if (mode === "edit" && initialData?.id) {
        // For edit, remove password if it's empty string
        if (payload.password === "") {
          delete payload.password;
        }
        response = await API_CLIENT.put(
          `${endpoint.VendorUser}/${initialData.id}`,
          payload
        );
        toast.success("Vendor user updated successfully!");
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(response?.data);
      }

      // Refresh vendor list if function provided
      if (refreshVendors) {
        refreshVendors();
      }

      // Close modal
      onClose();
    } catch (error) {
      // Handle FastAPI-style validation errors (Pydantic errors in "detail" array)
      if (error.response?.data?.detail) {
        const validationErrors = error.response.data.detail;

        // Check if it's a list of validation errors
        if (Array.isArray(validationErrors)) {
          // Extract and display each validation error
          validationErrors.forEach((err) => {
            const fieldPath = err.loc || [];
            const field =
              fieldPath.length > 0
                ? fieldPath[fieldPath.length - 1]
                : "unknown_field";
            const message = err.msg || "Validation error";

            // Display error for specific field
            toast.error(`${field}: ${message}`);
          });
        }
        // Handle single error message (non-array detail)
        else if (typeof validationErrors === "string") {
          toast.error(validationErrors);
        }
        // Handle error object
        else if (validationErrors.message) {
          toast.error(validationErrors.message);
        }
      }
      // Handle non-FastAPI validation errors (legacy format)
      else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;

        // Extract and display each validation error
        validationErrors.forEach((err) => {
          const field = err.loc ? err.loc[err.loc.length - 1] : "unknown_field";
          const message = err.msg || "Validation error";

          // Display error for specific field
          toast.error(`${field}: ${message}`);
        });
      }
      // Fallback to general error message
      else {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to save vendor user";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle edit mode (for view mode)
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    clearError(); // Clear all errors
  };

  // Handle modal close
  const handleClose = () => {
    setIsEditMode(mode === "create" || mode === "edit");
    setShowPassword(false);
    setSelectedRole(null);
    onClose();
  };

  // Prepare modal title
  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Create Vendor User";
      case "edit":
        return "Edit Vendor User";
      case "view":
        return "Vendor User Details";
      default:
        return "Vendor User";
    }
  };

  // Determine if we should show the edit toggle in the Modal header
  const showEditToggle = mode === "view";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={getModalTitle()}
      size="md"
      mode={mode}
      isEditMode={isEditMode}
      onToggleEdit={mode === "view" ? toggleEditMode : null}
      showEditToggle={showEditToggle}
      isLoading={isLoading || rolesLoading}
      submitText={mode === "create" ? "Create" : "Save Changes"}
    >
      <div className="space-y-5">
        {/* Vendor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vendor <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
            <Select
              options={vendors}
              value={selectedVendor}
              onChange={handleVendorSelect}
              isDisabled={mode === "view" && !isEditMode}
              isSearchable={true}
              placeholder="Search and select vendor..."
              className="react-select-container"
              classNamePrefix="react-select"
              noOptionsMessage={() => "No vendors found"}
              styles={{
                control: (base) => ({
                  ...base,
                  paddingLeft: "2rem",
                  borderColor: errors.vendor_id ? "#ef4444" : "#d1d5db",
                  "&:hover": {
                    borderColor: errors.vendor_id ? "#ef4444" : "#9ca3af",
                  },
                }),
              }}
            />
          </div>
          {errors.vendor_id && (
            <p className="mt-1 text-sm text-red-600">{errors.vendor_id}</p>
          )}
        </div>

        {/* Role Selection (for create/edit/edit mode) */}
        {(mode === "create" ||
          mode === "edit" ||
          (mode === "view" && isEditMode)) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <Select
                options={roleOptions}
                value={selectedRole}
                onChange={handleRoleSelect}
                isLoading={rolesLoading}
                isDisabled={(mode === "view" && !isEditMode) || rolesLoading}
                placeholder={
                  rolesLoading ? "Loading roles..." : "Select a role..."
                }
                className="react-select-container"
                classNamePrefix="react-select"
                noOptionsMessage={() => "No roles found"}
                styles={{
                  control: (base) => ({
                    ...base,
                    paddingLeft: "2rem",
                    borderColor: errors.role_id ? "#ef4444" : "#d1d5db",
                    "&:hover": {
                      borderColor: errors.role_id ? "#ef4444" : "#9ca3af",
                    },
                  }),
                }}
              />
            </div>
            {errors.role_id && (
              <p className="mt-1 text-sm text-red-600">{errors.role_id}</p>
            )}
          </div>
        )}

        {/* Display role in view mode (non-edit) */}
        {mode === "view" && !isEditMode && selectedRole && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
              <Shield className="mr-2 text-gray-500 w-4 h-4" />
              <span className="text-gray-700">{selectedRole.label}</span>
            </div>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={mode === "view" && !isEditMode}
              className={`w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              } ${mode === "view" && !isEditMode ? "bg-gray-100" : ""}`}
              placeholder="Enter full name"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={mode === "view" && !isEditMode}
              className={`w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } ${mode === "view" && !isEditMode ? "bg-gray-100" : ""}`}
              placeholder="Enter email address"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={mode === "view" && !isEditMode}
              className={`w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } ${mode === "view" && !isEditMode ? "bg-gray-100" : ""}`}
              placeholder="Enter 10-digit phone number"
            />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Password (only for create mode or when editing) */}
        {(mode === "create" ||
          (mode === "view" && isEditMode) ||
          mode === "edit") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password{" "}
              {mode === "create" && <span className="text-red-500">*</span>}
              {mode !== "create" && (
                <span className="text-gray-500 text-xs">
                  {" "}
                  (Leave blank to keep current)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 pl-10 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={
                  mode === "create"
                    ? "Enter password"
                    : "Enter new password (optional)"
                }
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
        )}

        {/* Active Status */}
        {(mode === "create" ||
          mode === "edit" ||
          (mode === "view" && isEditMode)) && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              disabled={mode === "view" && !isEditMode}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="is_active"
              className="ml-2 block text-sm text-gray-700 flex items-center"
            >
              <CheckCircle className="mr-2 text-gray-400 w-4 h-4" />
              Active User
            </label>
          </div>
        )}

        {/* Display active status in view mode */}
        {mode === "view" && !isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                initialData?.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {initialData?.is_active ? (
                <>
                  <CheckCircle className="mr-2 w-4 h-4" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="mr-2 w-4 h-4" />
                  Inactive
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VendorUserForm;
