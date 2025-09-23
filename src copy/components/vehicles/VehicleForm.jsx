import React, { useState, useRef } from "react";
import { ChevronDown, X, Search, Check, Upload, FileText, Calendar, AlertCircle, CheckCircle, ArrowLeft, ArrowRight, Save } from "lucide-react";
import Select from "../ui/Select";

const initialState = {
  vendor_id: "",
  vehicle_code: "",
  reg_number: "",
  status: "",
  vehicle_type_id: "",
  driver_id: "",
  description: "",
  rc_expiry_date: "",
  insurance_expiry_date: "",
  permit_expiry_date: "",
  pollution_expiry_date: "",
  fitness_expiry_date: "",
  tax_receipt_date: "",
  rc_card_file: null,
  insurance_file: null,
  permit_file: null,
  pollution_file: null,
  fitness_file: null,
  tax_receipt_file: null,
};

const TABS = ["BASIC INFO", "DOCUMENTS"];


// Dummy data
const DUMMY_VENDORS = [
  { value: "1", label: "Tata Motors Ltd." },
  { value: "2", label: "Mahindra & Mahindra" },
  { value: "3", label: "Ashok Leyland" },
  { value: "4", label: "Bajaj Auto" },
];

const DUMMY_DRIVERS = [
  { value: "1", label: "Rajesh Kumar - +91 9876543210" },
  { value: "2", label: "Suresh Babu - +91 8765432109" },
  { value: "3", label: "Priya Sharma - +91 7654321098" },
  { value: "4", label: "Vikram Singh - +91 6543210987" },
];

const DUMMY_VEHICLE_TYPES = [
  { value: "1", label: "Truck" },
  { value: "2", label: "Trailer" },
  { value: "3", label: "Container" },
  { value: "4", label: "Mini Truck" },
];

const VehicleForm = ({
  onClose,
  mode = "create", // "create", "edit", "view"
  initialData = {},
}) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [formData, setFormData] = useState({ ...initialState, ...initialData });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleRemoveFile = (field) => {
    setFormData((prev) => ({ ...prev, [field]: null }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateBasicInfo = () => {
    const newErrors = {};
    if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
    if (!formData.vehicle_code) newErrors.vehicle_code = "Vehicle code is required";
    if (!formData.reg_number) newErrors.reg_number = "Registration number is required";
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.driver_id) newErrors.driver_id = "Driver is required";
    return newErrors;
  };

  const validateDocuments = () => {
    if (isEditMode || isViewMode) return {};
    const newErrors = {};
    const requiredDocs = [
      "rc_card_file",
      "insurance_file",
      "permit_file",
      "pollution_file",
      "fitness_file",
      "tax_receipt_file",
    ];
    requiredDocs.forEach((doc) => {
      if (!formData[doc] && !initialData[doc]) {
        newErrors[doc] = "This document is required";
      }
    });
    return newErrors;
  };

  const validateAllTabs = () => {
    return {
      ...validateBasicInfo(),
      ...validateDocuments(),
    };
  };

  const handleNext = () => {
    if (isViewMode) {
      const index = TABS.indexOf(activeTab);
      if (index < TABS.length - 1) setActiveTab(TABS[index + 1]);
      return;
    }

    const newErrors = {};
    if (activeTab === "BASIC INFO") Object.assign(newErrors, validateBasicInfo());
    if (activeTab === "DOCUMENTS") Object.assign(newErrors, validateDocuments());

    if (Object.keys(newErrors).length === 0) {
      const index = TABS.indexOf(activeTab);
      if (index < TABS.length - 1) setActiveTab(TABS[index + 1]);
    } else {
      setErrors(newErrors);
    }
  };

  const handleBack = () => {
    const index = TABS.indexOf(activeTab);
    if (index > 0) setActiveTab(TABS[index - 1]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Vehicle Form submitted:", formData);
    const newErrors = validateAllTabs();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.vendor_id || newErrors.vehicle_code || newErrors.reg_number || newErrors.status || newErrors.driver_id) {
        setActiveTab("BASIC INFO");
      } else {
        setActiveTab("DOCUMENTS");
      }
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      alert(isEditMode ? "Vehicle updated successfully!" : "Vehicle created successfully!");
      onClose?.();
    }, 1000);
  };

  const renderField = (label, field, type = "text", placeholder = "", required = false) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && !isViewMode && <span className="text-red-500">*</span>}
      </label>
      {isViewMode ? (
        <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
          {formData[field] || "-"}
        </div>
      ) : (
        <input
          type={type}
          value={formData[field] || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
            errors[field] ? 'border-red-300' : 'border-gray-300'
          }`}
        />
      )}
      {errors[field] && (
        <p className="text-red-500 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors[field]}
        </p>
      )}
    </div>
  );

  const renderTextArea = (label, field, placeholder = "", required = false) => (
    <div className="space-y-2 col-span-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && !isViewMode && <span className="text-red-500">*</span>}
      </label>
      {isViewMode ? (
        <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 min-h-[80px]">
          {formData[field] || "-"}
        </div>
      ) : (
        <textarea
          value={formData[field] || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          rows="3"
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none ${
            errors[field] ? 'border-red-300' : 'border-gray-300'
          }`}
        />
      )}
      {errors[field] && (
        <p className="text-red-500 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors[field]}
        </p>
      )}
    </div>
  );

  const renderStatusSelect = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Status {!isViewMode && <span className="text-red-500">*</span>}
      </label>
      {isViewMode ? (
        <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            formData.status === 'ACTIVE' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {formData.status === 'ACTIVE' ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <X className="w-3 h-3 mr-1" />
                Inactive
              </>
            )}
          </span>
        </div>
      ) : (
        <select
          value={formData.status || ""}
          onChange={(e) => handleInputChange("status", e.target.value)}
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
            errors.status ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      )}
      {errors.status && (
        <p className="text-red-500 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {errors.status}
        </p>
      )}
    </div>
  );

  const renderFileWithExpiry = (label, fileField, expiryField) => {
    const existingFileUrl = initialData?.[fileField] || null;
    const newFile = formData[fileField];
    const newFileUrl = newFile instanceof File ? URL.createObjectURL(newFile) : null;
    const hasFile = existingFileUrl || newFile;
  
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-gray-600 mr-2" />
            <h4 className="font-medium text-gray-900">{label}</h4>
          </div>
          {!isViewMode && hasFile && (
            <button
              onClick={() => handleRemoveFile(fileField)}
              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {/* File Display/Upload Section */}
          <div className="space-y-3">
            {/* Existing File */}
            {existingFileUrl && !newFile && (
              <div className="flex items-center gap-3 p-3 bg-white rounded border">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700 flex-1">
                  {isViewMode ? "Document uploaded" : "Current file"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(existingFileUrl, '_blank')}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  <a 
                    href={existingFileUrl} 
                    download 
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    <Upload className="w-3 h-3" />
                    Download
                  </a>
                </div>
              </div>
            )}

            {/* New File */}
            {newFileUrl && (
              <div className="flex items-center gap-3 p-3 bg-white rounded border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700 flex-1">{newFile.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(newFileUrl, '_blank')}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  <a 
                    href={newFileUrl} 
                    download={newFile.name} 
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    <Upload className="w-3 h-3" />
                    Download
                  </a>
                </div>
              </div>
            )}

            {/* Upload Area */}
            {!isViewMode && (
              <div className="relative">
                <input 
                  type="file" 
                  onChange={handleFileChange(fileField)} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">
                    {hasFile ? "Replace file" : "Choose file or drag & drop"}
                  </span>
                </div>
              </div>
            )}

            {/* No File in View Mode */}
            {isViewMode && !hasFile && (
              <div className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg bg-gray-100">
                <span className="text-sm text-gray-500">No document uploaded</span>
              </div>
            )}

            {errors[fileField] && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors[fileField]}
              </p>
            )}
          </div>

          {/* Expiry Date Section */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 mr-1" />
              Expiry Date
            </label>
            {isViewMode ? (
              <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                {formData[expiryField] || "-"}
              </div>
            ) : (
              <input
                type="date"
                value={formData[expiryField] || ""}
                onChange={(e) => handleInputChange(expiryField, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const getModeConfig = () => {
    switch (mode) {
      case "view":
        return {
          title: "View Vehicle",
          subtitle: "Vehicle information and documents",
          icon: <Eye className="w-5 h-5" />,
          color: "bg-gray-600 hover:bg-gray-700"
        };
      case "edit":
        return {
          title: "Edit Vehicle",
          subtitle: "Update vehicle information and documents",
          icon: <Edit2 className="w-5 h-5" />,
          color: "bg-blue-600 hover:bg-blue-700"
        };
      default:
        return {
          title: "Add New Vehicle",
          subtitle: "Fill in the vehicle details and upload required documents",
          icon: <Save className="w-5 h-5" />,
          color: "bg-green-600 hover:bg-green-700"
        };
    }
  };

  const modeConfig = getModeConfig();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg text-white ${modeConfig.color.split(' ')[0]}`}>
            {modeConfig.icon}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {modeConfig.title}
          </h1>
        </div>
        <p className="text-gray-600">
          {modeConfig.subtitle}
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {activeTab === "BASIC INFO" && (
            <div className="grid grid-cols-2 gap-6">
              <Select
                label="Vendor"
                options={DUMMY_VENDORS}
                value={formData.vendor_id}
                onChange={(value) => handleInputChange("vendor_id", value)}
                placeholder="Select a vendor"
                searchable
                clearable
                required
                disabled={isViewMode}
                error={errors.vendor_id}
              />
              
              {renderField("Vehicle Code", "vehicle_code", "text", "Enter vehicle code", true)}
              {renderField("Registration Number", "reg_number", "text", "Enter registration number", true)}
              {renderStatusSelect()}
              
              <Select
                label="Vehicle Type"
                options={DUMMY_VEHICLE_TYPES}
                value={formData.vehicle_type_id}
                onChange={(value) => handleInputChange("vehicle_type_id", value)}
                placeholder="Select vehicle type"
                searchable
                clearable
                disabled={isViewMode}
                error={errors.vehicle_type_id}
              />

              <Select
                label="Driver"
                options={DUMMY_DRIVERS}
                value={formData.driver_id}
                onChange={(value) => handleInputChange("driver_id", value)}
                placeholder="Select a driver"
                searchable
                clearable
                required
                disabled={isViewMode}
                error={errors.driver_id}
              />

              {renderTextArea("Description", "description", "Enter vehicle description (optional)")}
            </div>
          )}

          {activeTab === "DOCUMENTS" && (
            <div className="grid grid-cols-2 gap-6">
              {renderFileWithExpiry("RC Card", "rc_card_file", "rc_expiry_date")}
              {renderFileWithExpiry("Insurance", "insurance_file", "insurance_expiry_date")}
              {renderFileWithExpiry("Permit", "permit_file", "permit_expiry_date")}
              {renderFileWithExpiry("Pollution Certificate", "pollution_file", "pollution_expiry_date")}
              {renderFileWithExpiry("Fitness Certificate", "fitness_file", "fitness_expiry_date")}
              {renderFileWithExpiry("Tax Receipt", "tax_receipt_file", "tax_receipt_date")}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <div>
            {activeTab !== "BASIC INFO" && (
              <button 
                type="button" 
                onClick={handleBack} 
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>
            
            {activeTab !== TABS[TABS.length - 1] ? (
              <button 
                type="button" 
                onClick={handleNext} 
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              !isViewMode && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex items-center px-6 py-2 text-white rounded-lg transition-colors ${modeConfig.color} disabled:opacity-50`}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    modeConfig.icon
                  )}
                  <span className="ml-2">
                    {isSubmitting ? "Submitting..." : isEditMode ? "Update" : "Submit"}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

            
    </div>
  );
};


export default VehicleForm;