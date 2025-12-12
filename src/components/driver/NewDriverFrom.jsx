import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Eye,
  Download,
  Trash2,
  FileText,
  User,
  Loader2,
  Building,
  AlertCircle,
} from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";
import {
  buildDriverFormData,
  buildDriverUpdateData,
  defaultFormData,
  documents,
  transformApiToFormData,
  getVendorNameById,
  validateField,
} from "./driverUtility";
import { downloadFile } from "../../utils/downloadUtils";
import { viewFile } from "../../utils/fileViewUtils";
import {
  createDriverThunk,
  updateDriverThunk,
} from "../../redux/features/manageDriver/driverThunks";
import { useDispatch } from "react-redux";
import { logDebug } from "../../utils/logger";
import { useVendorOptions } from "../../hooks/useVendorOptions";
import { validationRules } from "../../validations/core/helpers";

const DriverFormModal = ({
  isOpen,
  onClose,
  mode = "create", // create, edit, view
  driverData = null,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState(defaultFormData);
  const [activeTab, setActiveTab] = useState("personal");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState({});
  const [error, setError] = useState(null);
  const [previewContentType, setPreviewContentType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const vendors = useVendorOptions();
  const [errors, setErrors] = useState({}); // Add errors state
  const [touched, setTouched] = useState({}); // Add touched state for showing errors only
  // Initialize form data when mode or driverData changes
  useEffect(() => {
    if (mode === "create") {
      setFormData(defaultFormData);
      setErrors({});
      setTouched({});
    } else if (mode === "edit" || mode === "view") {
      if (driverData) {
        setFormData(transformApiToFormData(driverData));
        setErrors({});
        setTouched({});
      }
    }
    setActiveTab("personal");
  }, [mode, driverData]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    setFormData(defaultFormData);
    setError(null);
    setPreviewDoc(null);
    setPreviewContentType(null);
    setActiveTab("personal");
    onClose();
  };

  const validateFileField = (fileKey, file) => {
    // For view mode, no file validation needed
    if (mode === "view") return null;

    // For edit mode, file might already exist (has path)
    if (mode === "edit" && file && typeof file === "object" && file.path) {
      return null; // Existing file, no validation needed
    }

    // For create mode or new file upload
    return validationRules.validateFile(file, true);
  };

  // Handle input change with validation
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Mark field as touched
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Update form data
    const newFormData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };

    // Handle same address logic
    if (name === "isSameAddress" && checked) {
      newFormData.currentAddress = newFormData.permanentAddress;
      // Clear current address error if any
      setErrors((prev) => ({ ...prev, currentAddress: null }));
    }

    setFormData(newFormData);

    // Validate the field
    const error = validateField(name, value, newFormData);

    // Update errors state
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    // Special case: if permanent address changes and same address is checked, validate current address too
    if (name === "permanentAddress" && newFormData.isSameAddress) {
      const currentAddressError = validateField(
        "currentAddress",
        value,
        newFormData
      );
      setErrors((prev) => ({
        ...prev,
        currentAddress: currentAddressError,
      }));
    }
  };

  const handleFileChange = (fileKey, file) => {
    // Mark field as touched
    setTouched((prev) => ({ ...prev, [fileKey]: true }));

    // Validate file
    const error = validateFileField(fileKey, file);

    // Update errors state
    setErrors((prev) => ({
      ...prev,
      [fileKey]: error,
    }));

    // Update form data if no error
    if (!error) {
      setFormData((prev) => ({
        ...prev,
        [fileKey]: file,
      }));
    }
  };
  // Handle date input blur with validation
  const handleDateBlur = (e) => {
    const { name, value } = e.target;

    // Mark as touched
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate if it's an expiry date field
    if (name.includes("Expiry")) {
      const error = validationRules.validateFutureDate(value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    // Validate date of birth on blur
    if (name === "dateOfBirth") {
      const error = validationRules.validateDateOfBirth(value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Form validation before submission
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      // Skip validation for some fields in view mode
      if (mode === "view") return;

      // For required fields
      if (
        [
          "code",
          "name",
          "email",
          "mobileNumber",
          "dateOfBirth",
          "dateOfJoining",
          "permanentAddress",
          "currentAddress",
          "gender",
        ].includes(key)
      ) {
        const error = validateField(key, formData[key], formData);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }

      // For expiry dates (validate if they have value)
      if (key.includes("Expiry") && formData[key]) {
        const error = validationRules.validateFutureDate(formData[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }

      // For file fields (in create mode or if file is new in edit mode)
      if (documents.some((doc) => doc.fileKey === key)) {
        const file = formData[key];
        const error = validateFileField(key, file);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };
  const handleRemoveFile = (fileKey) => {
    setFormData((prev) => ({
      ...prev,
      [fileKey]: null,
    }));
  };

  const handleViewFile = async (file) => {
    viewFile({
      file,
      apiClient: API_CLIENT,
      setPreviewDoc,
      setPreviewContentType,
      setLoading: (v) => {
        if (file.path) {
          setLoadingDocs((prev) => ({ ...prev, [file.path]: v }));
        }
      },
      setError,
      apiUrlPrefix: "/v1/vehicles", // change for drivers/vendors/etc.
    });
  };
  // Function to download document
  const handleDownloadFile = (file, filename) => {
    downloadFile({
      file,
      filename,
      apiClient: API_CLIENT,
      setLoading: (v) => setLoadingDocs({ ...loadingDocs, [file.path]: v }),
      setError,
      apiUrlPrefix: "/v1/vehicles",
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Mark all fields as touched to show all errors
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form before submission
    if (!validateForm()) {
      setIsSubmitting(false);
      setError("Please fix all validation errors before submitting");
      return;
    }

    try {
      if (mode === "create") {
        const payload = buildDriverFormData(formData);

        const result = await dispatch(createDriverThunk(payload)).unwrap();

        if (onSubmitSuccess) {
          onSubmitSuccess("Driver created successfully!");
        }
        handleClose();

        // You can also use the result data if needed
        console.log("Created driver:", result);
      }

      if (mode === "edit") {
        logDebug(" this is the driver id on edit ", driverData.driver_id);

        const payload = buildDriverUpdateData(formData, driverData.driver_id);

        // ✅ Correct way - pass a single object with driverId and formData
        const result = await dispatch(
          updateDriverThunk({
            driverId: driverData.driver_id,
            formData: payload,
          })
        ).unwrap();

        if (onSubmitSuccess) {
          onSubmitSuccess("Driver updated successfully!");
        }
        handleClose();
      }
    } catch (err) {
      console.error("Error submitting form:", err);

      if (err.detail && Array.isArray(err.detail)) {
        const errorList = err.detail
          .map((error, index) => {
            const field = error.loc?.slice(1).join(".") || "Unknown field";
            return `${index + 1}. ${field}: ${error.msg}`;
          })
          .join("\n");

        setError(`Validation failed:\n${errorList}`);
      } else {
        setError(
          `Failed to ${mode === "create" ? "create" : "update"} driver. ${
            err.message || "Unknown error"
          }`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  const isReadOnly = mode === "view";

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-full p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {mode === "create"
                      ? "Add New Driver"
                      : mode === "edit"
                      ? "Edit Driver"
                      : "Driver Details"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {mode === "create"
                      ? "Create a new driver"
                      : mode === "edit"
                      ? `Editing: ${formData.name}`
                      : `Viewing: ${formData.name}`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error + ""}
                <button
                  onClick={() => setError(null)}
                  className="float-right text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            )}

            {/* Form Tabs */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-hidden flex flex-col"
            >
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setActiveTab("personal")}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "personal"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Personal Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("documents")}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "documents"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Documents
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    {/* Profile Image */}
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {formData.profileImage ? (
                          formData.profileImage instanceof File ? (
                            <img
                              src={URL.createObjectURL(formData.profileImage)}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : formData.profileImage.path ? (
                            <img
                              src={formData.profileImage.path}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-10 h-10 text-gray-400" />
                          )
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                      </div>
                      {!isReadOnly && (
                        <div>
                          <label className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded cursor-pointer hover:bg-blue-700">
                            Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileChange(
                                  "profileImage",
                                  e.target.files[0]
                                )
                              }
                            />
                          </label>
                          {formData.profileImage && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFile("profileImage")}
                              className="ml-2 text-xs text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Driver Code *
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={formData.code}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          required
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          required
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          required
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleInputChange} // Validate on blur too
                          disabled={isReadOnly}
                          required
                          className={`w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                            shouldShowError("email")
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {shouldShowError("email") && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            {errors.email}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          required
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                      {mode === "create" && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Password *
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          required
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Date of Joining *
                        </label>
                        <input
                          type="date"
                          name="dateOfJoining"
                          value={formData.dateOfJoining}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          required
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Vendor
                        </label>
                        {isReadOnly ? (
                          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded border border-gray-300">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                              {formData.vendor_id
                                ? getVendorNameById(formData.vendor_id)
                                : "No vendor assigned"}
                            </span>
                          </div>
                        ) : (
                          <select
                            name="vendor_id"
                            value={formData.vendor_id || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Vendor</option>
                            {vendors.map((vendor) => (
                              <option key={vendor.value} value={vendor.value}>
                                {vendor.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Permanent Address *
                        </label>
                        <textarea
                          name="permanentAddress"
                          value={formData.permanentAddress}
                          onChange={handleInputChange}
                          disabled={isReadOnly}
                          required
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Current Address *
                        </label>
                        <textarea
                          name="currentAddress"
                          value={formData.currentAddress}
                          onChange={handleInputChange}
                          disabled={isReadOnly || formData.isSameAddress}
                          required
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                        {!isReadOnly && (
                          <label className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              name="isSameAddress"
                              checked={formData.isSameAddress}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-xs text-gray-600">
                              Same as permanent address
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="grid grid-cols-2 gap-4">
                    {documents.map((doc) => {
                      const Icon = doc.icon;
                      const file = formData[doc.fileKey];
                      const hasFile = !!file;
                      const isLoading =
                        file && file.path && loadingDocs[file.path];

                      return (
                        <div
                          key={doc.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded bg-${doc.color}-50`}>
                                <Icon
                                  className={`w-4 h-4 text-${doc.color}-600`}
                                />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900">
                                  {doc.label}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  Required
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Document Fields */}
                          <div className="space-y-2 mb-3">
                            {doc.id === "alt_govt_id" && doc.typeKey && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  ID Type *
                                </label>
                                <select
                                  name={doc.typeKey}
                                  value={formData[doc.typeKey] || ""}
                                  onChange={handleInputChange}
                                  disabled={isReadOnly}
                                  required
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                >
                                  <option value="">Select ID Type</option>
                                  <option value="aadhar">Aadhar Card</option>
                                  <option value="pan">PAN Card</option>
                                  <option value="voter">Voter ID</option>
                                  <option value="passport">Passport</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                            )}

                            {doc.numberKey && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {doc.id === "alt_govt_id"
                                    ? "ID Number *"
                                    : "Number"}
                                </label>
                                <input
                                  type="text"
                                  name={doc.numberKey}
                                  value={formData[doc.numberKey] || ""}
                                  onChange={handleInputChange}
                                  disabled={isReadOnly}
                                  required={doc.id === "alt_govt_id"}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                />
                              </div>
                            )}

                            {doc.expiryKey && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Expiry Date
                                </label>
                                <input
                                  type="date"
                                  name="drivingLicenseExpiry"
                                  value={formData.drivingLicenseExpiry || ""}
                                  onChange={handleInputChange}
                                  onBlur={handleDateBlur} // Special blur handler for dates
                                  disabled={isReadOnly}
                                  className={`w-full px-2 py-1.5 text-xs border rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 ${
                                    shouldShowError("drivingLicenseExpiry")
                                      ? "border-red-300 focus:ring-red-500"
                                      : "border-gray-300"
                                  }`}
                                />
                                {shouldShowError("drivingLicenseExpiry") && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.drivingLicenseExpiry}
                                  </div>
                                )}
                              </div>
                            )}

                            {doc.dateKey && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  name={doc.dateKey}
                                  value={formData[doc.dateKey] || ""}
                                  onChange={handleInputChange}
                                  disabled={isReadOnly}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                />
                              </div>
                            )}

                            {doc.statusKey && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Status
                                </label>
                                <select
                                  name={doc.statusKey}
                                  value={formData[doc.statusKey] || "Pending"}
                                  onChange={handleInputChange}
                                  disabled={isReadOnly}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Verified">Verified</option>
                                  <option value="Rejected">Rejected</option>
                                  <option value="Approved">Approved</option>
                                </select>
                              </div>
                            )}
                          </div>

                          {/* File Upload/Display */}
                          <div className="border-t border-gray-200 pt-3">
                            {hasFile ? (
                              <div className="flex items-center justify-between bg-gray-50 rounded p-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-xs text-gray-700 truncate">
                                    {file instanceof File
                                      ? file.name
                                      : file.name || "Document.pdf"}
                                    {isLoading && (
                                      <span className="inline-flex items-center ml-2">
                                        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    type="button"
                                    onClick={() => handleViewFile(file)}
                                    disabled={isLoading}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="View"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDownloadFile(
                                        file,
                                        `${doc.label}.pdf`
                                      )
                                    }
                                    disabled={isLoading}
                                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Download"
                                  >
                                    <Download className="w-3.5 h-3.5 text-green-600" />
                                  </button>
                                  {!isReadOnly && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveFile(doc.fileKey)
                                      }
                                      className="p-1 hover:bg-gray-200 rounded"
                                      title="Remove"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <>
                                <label
                                  className={`flex items-center justify-center gap-2 w-full px-3 py-2 border-2 border-dashed rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors ${
                                    shouldShowError(doc.fileKey)
                                      ? "border-red-300 hover:border-red-400"
                                      : "border-gray-300"
                                  }`}
                                >
                                  <Upload className="w-4 h-4 text-gray-400" />
                                  <span className="text-xs text-gray-600">
                                    Upload File *
                                  </span>
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleFileChange(
                                        doc.fileKey,
                                        e.target.files?.[0]
                                      )
                                    }
                                    required
                                  />
                                </label>
                                {shouldShowError(doc.fileKey) && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors[doc.fileKey]}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex flex-col gap-3">
                {/* Error summary */}
                {Object.keys(errors).length > 0 && (
                  <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        Please fix {Object.keys(errors).length} validation
                        error(s)
                      </span>
                    </div>
                    <ul className="mt-2 text-xs text-red-600 list-disc pl-4">
                      {Object.entries(errors)
                        .slice(0, 3)
                        .map(([field, error]) => (
                          <li key={field} className="truncate">
                            {error}
                          </li>
                        ))}
                      {Object.keys(errors).length > 3 && (
                        <li>... and {Object.keys(errors).length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  {!isReadOnly && (
                    <button
                      type="submit"
                      disabled={isSubmitting || Object.keys(errors).length > 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {mode === "create" ? "Creating..." : "Saving..."}
                        </span>
                      ) : mode === "create" ? (
                        "Create Driver"
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Document Preview</h3>
              <button
                onClick={() => {
                  setPreviewDoc(null);
                  setPreviewContentType(null);
                  if (previewDoc.startsWith("blob:")) {
                    URL.revokeObjectURL(previewDoc);
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {previewContentType?.includes("pdf") ? (
                <iframe
                  src={previewDoc}
                  title="Document Preview"
                  className="w-full h-full min-h-[600px]"
                />
              ) : previewContentType?.includes("image") ? (
                <img
                  src={previewDoc}
                  alt="Document Preview"
                  className="w-full h-auto object-contain"
                />
              ) : previewContentType?.includes("text") ? (
                <iframe
                  src={previewDoc}
                  title="Document Preview"
                  className="w-full h-full min-h-[600px]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">
                    Preview not available for:{" "}
                    {previewContentType || "unknown type"}
                  </p>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = previewDoc;
                      link.download = "document";
                      link.click();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DriverFormModal;
