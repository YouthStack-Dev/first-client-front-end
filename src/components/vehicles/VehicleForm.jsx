import React, { useState } from "react";
import Select from "react-select";
import { logDebug } from "../../utils/logger";

const TABS = ["BASIC INFO", "DOCUMENTS"];

const initialState = {
  vendor_id: "",
  vehicle_code: "",
  reg_number: "",
  status: "",
  vehicle_type_id: "",
  driver_id: "", // Added driver_id field
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

// Dummy data
const DUMMY_VENDORS = [
  { vendor_id: "1", vendor_name: "Vendor A" },
  { vendor_id: "2", vendor_name: "Vendor B" },
  { vendor_id: "3", vendor_name: "Vendor C" },
];

const DUMMY_DRIVERS = [
  { driver_id: "1", driver_name: "John Doe" },
  { driver_id: "2", driver_name: "Jane Smith" },
  { driver_id: "3", driver_name: "Mike Johnson" },
];

const DUMMY_VEHICLE_TYPES = [
  { vehicle_type_id: "1", name: "Truck" },
  { vehicle_type_id: "2", name: "Trailer" },
  { vehicle_type_id: "3", name: "Container" },
];

const VehicleForm = ({
  onClose,
  isEdit = false,
  initialData = {},
}) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [formData, setFormData] = useState({ ...initialState, ...initialData });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, [field]: file }));
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

  // Validation methods per tab
  const validateBasicInfo = () => {
    const newErrors = {};
    if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
    if (!formData.vehicle_code) newErrors.vehicle_code = "Vehicle code is required";
    if (!formData.reg_number) newErrors.reg_number = "Registration number is required";
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.driver_id) newErrors.driver_id = "Driver is required"; // Added driver validation
    return newErrors;
  };

  const validateDocuments = () => {
    if (isEdit) return {};
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
    logDebug("  Vehicle Form submitted:", formData);
    const newErrors = validateAllTabs();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Switch to first tab containing an error
      if (newErrors.vendor_id || newErrors.vehicle_code || newErrors.reg_number || newErrors.status || newErrors.driver_id) {
        setActiveTab("BASIC INFO");
      } else {
        setActiveTab("DOCUMENTS");
      }
      alert("Please fix errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      alert(isEdit ? "Vehicle updated successfully!" : "Vehicle created successfully!");
      onClose?.();
    }, 1000);
  };

  const renderField = (label, field, type = "text", placeholder = "", required = false) => (
    <div>
      <label className="block font-medium mb-1">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        value={formData[field] || ""}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full border px-3 py-2 rounded"
      />
      {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
    </div>
  );

  const renderSearchableSelect = (
    label,
    field,
    options = [],
    required = false,
    loading = false
  ) => (
    <div>
      <label className="block font-medium mb-1">
        {label} {required && "*"}
      </label>
      <Select
        options={options}
        value={options.find((opt) => opt.value === formData[field]) || null}
        onChange={(selected) => handleInputChange(field, selected ? selected.value : "")}
        isSearchable
        isClearable
        isLoading={loading}
        placeholder={`Select ${label}`}
        className="react-select-container"
        classNamePrefix="react-select"
      />
      {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
    </div>
  );

  const renderStatusSelect = () => (
    <div>
      <label className="block font-medium mb-1">Status *</label>
      <select
        value={formData.status || ""}
        onChange={(e) => handleInputChange("status", e.target.value)}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">Select Status</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </select>
      {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
    </div>
  );

  const renderFileWithExpiry = (label, fileField, expiryField) => {
    const existingFileUrl = initialData?.[fileField] || null;
    const newFile = formData[fileField];
    const newFileUrl = newFile instanceof File ? URL.createObjectURL(newFile) : null;
  
    return (
      <div className="col-span-1 space-y-2">
        <label className="block font-semibold mb-1">{label}</label>
        
        <div className="flex flex-col gap-3">
          {/* File Upload Section */}
          <div className="flex flex-col gap-2">
            {isEdit && existingFileUrl && !newFile && (
              <div className="flex items-center gap-3">
                <a href={existingFileUrl} target="_blank" className="text-blue-600 underline text-sm" rel="noreferrer">
                  View
                </a>
                <a href={existingFileUrl} download className="text-green-600 underline text-sm">
                  Download
                </a>
              </div>
            )}
  
            {newFileUrl && (
              <div className="flex items-center gap-3">
                <a href={newFileUrl} target="_blank" className="text-blue-600 underline text-sm" rel="noreferrer">
                  View
                </a>
                <a href={newFileUrl} download={newFile.name} className="text-green-600 underline text-sm">
                  Download
                </a>
              </div>
            )}
  
            <input 
              type="file" 
              onChange={handleFileChange(fileField)} 
              className="border rounded px-3 py-1.5 text-sm w-full" 
            />
            {errors[fileField] && <p className="text-red-500 text-sm">{errors[fileField]}</p>}
          </div>
  
          {/* Expiry Date Section */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Expiry Date</label>
            <input
              type="date"
              value={formData[expiryField] || ""}
              onChange={(e) => handleInputChange(expiryField, e.target.value)}
              className="w-full border rounded px-3 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Tabs */}
      <div className="flex space-x-6 border-b mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-2 font-medium ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {activeTab === "BASIC INFO" && (
          <>
            {renderSearchableSelect(
              "Vendor",
              "vendor_id",
              DUMMY_VENDORS.map((v) => ({ value: v.vendor_id, label: v.vendor_name })),
              true
            )}
            {renderField("Vehicle Code", "vehicle_code", "text", "", true)}
            {renderField("Registration Number", "reg_number", "text", "", true)}
            {renderStatusSelect()}
            {renderSearchableSelect(
              "Driver",
              "driver_id",
              DUMMY_DRIVERS.map((d) => ({ value: d.driver_id, label: d.driver_name })),
              true
            )}
          </>
        )}

        {activeTab === "DOCUMENTS" && (
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {renderFileWithExpiry("RC Card", "rc_card_file", "rc_expiry_date")}
            {renderFileWithExpiry("Insurance", "insurance_file", "insurance_expiry_date")}
            {renderFileWithExpiry("Permit", "permit_file", "permit_expiry_date")}
            {renderFileWithExpiry("Pollution", "pollution_file", "pollution_expiry_date")}
            {renderFileWithExpiry("Fitness", "fitness_file", "fitness_expiry_date")}
            {renderFileWithExpiry("Tax Receipt", "tax_receipt_file", "tax_receipt_date")}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        {activeTab !== "BASIC INFO" && (
          <button type="button" onClick={handleBack} className="border px-6 py-2 rounded">
            Back
          </button>
        )}
        {activeTab !== TABS[TABS.length - 1] ? (
          <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded ml-auto">
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 text-white px-6 py-2 rounded ml-auto disabled:bg-green-400"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </>
  );
};

export default VehicleForm;