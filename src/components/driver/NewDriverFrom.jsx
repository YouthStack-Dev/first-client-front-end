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
} from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";
import {
  buildDriverFormData,
  buildDriverUpdateData,
  defaultFormData,
  documents,
  transformApiToFormData,
  getVendorNameById,
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
import { getTomorrowDate } from "../../validations/core/helpers";

const DriverFormModal = ({
  isOpen,
  onClose,
  mode = "create", // create, edit, view
  driverData = null,
  onSubmitSuccess,
  vendor,
}) => {
  const [formData, setFormData] = useState(defaultFormData);
  const [activeTab, setActiveTab] = useState("personal");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState({});
  const [error, setError] = useState(null);
  const [previewContentType, setPreviewContentType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  // Initialize form data when mode or driverData changes
  useEffect(() => {
    if (mode === "create") {
      setFormData(defaultFormData);
    } else if (mode === "edit" || mode === "view") {
      if (driverData) {
        setFormData(transformApiToFormData(driverData));
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "isSameAddress" && checked) {
      setFormData((prev) => ({
        ...prev,
        currentAddress: prev.permanentAddress,
      }));
    }
  };

  const handleFileChange = (fileKey, file) => {
    setFormData((prev) => ({
      ...prev,
      [fileKey]: file,
    }));
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
      setLoading: (v) =>
        setLoadingDocs((prev) => ({ ...prev, [file.path]: v })),
      setError,
      apiUrlPrefix: "/v1/vehicles",
    });
  };

  // basic info validation before moving to documents tab
  const canGoToDocuments = () => {
    const {
      code,
      name,
      gender,
      email,
      mobileNumber,
      password,
      dateOfBirth,
      dateOfJoining,
      permanentAddress,
      currentAddress,
    } = formData;

    if (!code?.trim()) return false;
    if (!name?.trim()) return false;
    if (!gender) return false;
    if (!email?.trim()) return false;
    if (!mobileNumber?.trim()) return false;
    if (mode === "create" && !password?.trim()) return false;
    if (!dateOfBirth) return false;
    if (!dateOfJoining) return false;
    if (!permanentAddress?.trim()) return false;
    if (!currentAddress?.trim()) return false;
    return true;
  };

  // documents validation before submit
  const validateDocuments = () => {
    const missing = [];

    documents.forEach((doc) => {
      if (doc.numberKey && !formData[doc.numberKey]) {
        missing.push(`${doc.label} number`);
      }
      if (doc.fileKey && !formData[doc.fileKey]) {
        missing.push(`${doc.label} file`);
      }
      if (doc.id === "alt_govt_id" && doc.typeKey && !formData[doc.typeKey]) {
        missing.push("Alternate Government ID type");
      }
      if (doc.expiryKey && !formData[doc.expiryKey]) {
        missing.push(`${doc.label} expiry date`);
      }
    });

    if (missing.length > 0) {
      setError(
        `Please fill all required document fields:\n- ${missing.join("\n- ")}`
      );
      return false;
    }
    return true;
  };
  const formatBackendError = (err) => {
    logDebug("Backend error:", err);

    const detail = err?.detail || err?.data?.detail;

    /* -----------------------------
     * 1️⃣ FastAPI / Pydantic validation errors
     * ----------------------------- */
    if (Array.isArray(detail)) {
      const header = "Submission failed due to the following errors:";
      const lines = detail.map((d, idx) => {
        const path =
          Array.isArray(d.loc) && d.loc.length > 1
            ? d.loc.slice(1).join(".")
            : "unknown_field";

        const msg = d.msg || "Invalid value";
        const inputVal =
          typeof d.input !== "undefined" ? ` (received: ${d.input})` : "";

        return `${idx + 1}. ${path}: ${msg}${inputVal}`;
      });

      return `${header}\n${lines.join("\n")}`;
    }

    /* -----------------------------
     * 2️⃣ Duplicate / Business logic errors
     * ----------------------------- */
    if (detail?.error_code === "DUPLICATE_RESOURCE") {
      const baseMessage =
        detail.message || "Resource already exists with the same values";

      const conflicts = detail?.details?.conflicting_fields;

      if (conflicts && typeof conflicts === "object") {
        const fields = Object.entries(conflicts)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");

        return `${baseMessage}\nConflicting fields → ${fields}`;
      }

      return baseMessage;
    }

    /* -----------------------------
     * 3️⃣ Generic backend message
     * ----------------------------- */
    if (detail?.message) {
      return detail.message;
    }

    if (err?.message) {
      return err.message;
    }

    return "An unknown error occurred while submitting the form.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!canGoToDocuments()) {
      setError("Please complete all basic information before submitting.");
      setActiveTab("personal");
      return;
    }

    if (!validateDocuments()) {
      setActiveTab("documents");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const payload = buildDriverFormData(formData);
        const result = await dispatch(createDriverThunk(payload)).unwrap();

        if (onSubmitSuccess) {
          onSubmitSuccess("Driver created successfully!");
        }
        handleClose();
        console.log("Created driver:", result);
      }

      if (mode === "edit") {
        logDebug(" this is the driver id on edit ", driverData.driver_id);

        const payload = buildDriverUpdateData(formData, driverData.driver_id);

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
      const formatted = formatBackendError(err);
      setError(formatted);
    } finally {
      setIsSubmitting(false);
    }
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
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm whitespace-pre-line">
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
                    onClick={() => {
                      if (!canGoToDocuments()) {
                        setError(
                          "Please complete all basic information before going to Documents."
                        );
                        setActiveTab("personal");
                        return;
                      }
                      setError(null);
                      setActiveTab("documents");
                    }}
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
                          <option value="">Select</option>
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
                          disabled={isReadOnly}
                          required
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          name="mobileNumber"
                          max={10}
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
                          Vendor *
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
                            required
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
                                    : "Number *"}
                                </label>
                                <input
                                  type="text"
                                  name={doc.numberKey}
                                  value={formData[doc.numberKey] || ""}
                                  onChange={handleInputChange}
                                  disabled={isReadOnly}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                />
                              </div>
                            )}

                            {doc.expiryKey && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Expiry Date *
                                </label>
                                <input
                                  type="date"
                                  name={doc.expiryKey}
                                  min={getTomorrowDate()}
                                  value={formData[doc.expiryKey] || ""}
                                  onChange={handleInputChange}
                                  disabled={isReadOnly}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                />
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
                                  {/* Only allowed values from backend enum */}
                                  <option value="Pending">Pending</option>
                                  <option value="Approved">Approved</option>
                                  <option value="Rejected">Rejected</option>
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
                                      : file.name || "Document"}
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
                              !isReadOnly && (
                                <label className="flex items-center justify-center gap-2 w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
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
                                        e.target.files[0]
                                      )
                                    }
                                  />
                                </label>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
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
                    disabled={isSubmitting}
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
                  className="w-full h-full min-h=[600px]"
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
