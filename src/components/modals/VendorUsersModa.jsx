import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import {
  X,
  Edit2,
  CheckCircle,
  XCircle,
  Save,
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
  Building,
  Eye,
  EyeOff,
} from "lucide-react";

import { API_CLIENT } from "../../Api/API_Client";
import { logError, logDebug } from "../../utils/logger";
import endpoint from "../../Api/Endpoints";

const VendorUsersModal = ({
  isOpen,
  onClose,
  mode = "view", // 'view', 'create', 'edit'
  initialData = null,
  vendors = [], // Array of vendor objects for dropdown
  onSuccess,
  refreshVendors = () => {}, // Function to refresh vendor list if needed
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vendor_id: "",
    is_active: true,
    password: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});

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
              value: vendor.id || vendor.vendor_id,
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
          is_active: true,
          password: "",
        });
        setSelectedVendor(null);
      }

      // Clear errors when modal opens
      setErrors({});

      // Set edit mode based on modal mode prop
      setIsEditMode(mode === "create" || mode === "edit");
    }
  }, [isOpen, initialData, mode, vendors]);

  // Convert vendors to react-select options
  useEffect(() => {
    if (vendors && vendors.length > 0) {
      const options = vendors.map((vendor) => ({
        value: vendor.id || vendor.vendor_id,
        label: vendor.name || vendor.vendor_name || `Vendor ${vendor.id}`,
        ...vendor,
      }));
      setVendorOptions(options);
    }
  }, [vendors]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle vendor selection
  const handleVendorSelect = (selectedOption) => {
    setSelectedVendor(selectedOption);
    setFormData((prev) => ({
      ...prev,
      vendor_id: selectedOption?.value || "",
    }));

    // Clear vendor error if exists
    if (errors.vendor_id) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.vendor_id;
        return newErrors;
      });
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Vendor validation
    if (!formData.vendor_id) {
      newErrors.vendor_id = "Vendor is required";
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone must be 10 digits";
    }

    // Password validation for create mode
    if (mode === "create" && !formData.password) {
      newErrors.password = "Password is required";
    } else if (mode === "create" && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Prepare payload
      const payload = {
        ...formData,
        vendor_id: parseInt(formData.vendor_id) || formData.vendor_id,
        is_active: formData.is_active === true || formData.is_active === "true",
      };

      logDebug("Submitting vendor user data:", payload);

      let response;
      if (mode === "create") {
        response = await API_CLIENT.post(endpoint.createVendorUser, payload);
        toast.success("Vendor user created successfully!");
      } else if (mode === "edit" && initialData?.id) {
        // For edit, don't send password if empty (for partial updates)
        if (!payload.password) {
          delete payload.password;
        }
        response = await API_CLIENT.put(
          `${endpoint.updateVendorUser}/${initialData.id}`,
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
      logError("Error saving vendor user:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to save vendor user";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle edit mode (for view mode)
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    // Clear errors when toggling edit mode
    setErrors({});
  };

  // Handle modal close
  const handleClose = () => {
    setIsEditMode(mode === "create" || mode === "edit");
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Building className="mr-2 h-5 w-5 text-gray-600" />
            {mode === "create"
              ? "Create Vendor User"
              : mode === "edit"
              ? "Edit Vendor User"
              : "Vendor User Details"}
          </h2>

          <div className="flex items-center space-x-2">
            {/* Edit button for view mode */}
            {mode === "view" && (
              <button
                onClick={toggleEditMode}
                className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                  isEditMode
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isEditMode ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Edit</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Vendor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <Select
                  options={vendorOptions}
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

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            {(mode === "create" ||
              mode === "edit" ||
              (mode === "view" && isEditMode)) && (
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span>Saving...</span>
                  </>
                ) : mode === "create" ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create User</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorUsersModal;
