import React, { useState } from "react";
import { Upload, Eye, Download } from "lucide-react";
import Select from "react-select";

const TABS = ["BASIC INFO", "DOCUMENTS"];

const initialState = {
  vendor_id: "",
  vehicle_type_id: "",
  rc_number: "",
  driver_id: "",
  description: "",
  rc_expiry_date: "",
  insurance_expiry_date: "",
  permit_expiry_date: "",
  puc_expiry_date: "",
  fitness_expiry_date: "",
  tax_receipt_date: "",
  insurance_file: null,
  permit_file: null,
  puc_file: null,
  fitness_file: null,
  tax_receipt_file: null,
};

const DUMMY_VENDORS = [
  { vendor_id: "1", vendor_name: "Vendor A" },
  { vendor_id: "2", vendor_name: "Vendor B" },
];

const DUMMY_DRIVERS = [
  { driver_id: "1", driver_name: "John Doe" },
  { driver_id: "2", driver_name: "Jane Smith" },
];

const DUMMY_VEHICLE_TYPES = [
  { vehicle_type_id: "1", name: "Truck" },
  { vehicle_type_id: "2", name: "Trailer" },
];

const VehicleForm = ({ isEdit = false, initialData = {}, onFormChange }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [formData, setFormData] = useState({ ...initialState, ...initialData });
  const [errors, setErrors] = useState({});

  const updateFormData = (updated) => {
    setFormData(updated);
    onFormChange?.(updated);
  };

  const handleInputChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    updateFormData(updated);
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleFileChange = (field, file) => {
    const updated = { ...formData, [field]: file };
    updateFormData(updated);
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateBasicInfo = () => {
    const newErrors = {};
    if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
    if (!formData.vehicle_type_id) newErrors.vehicle_type_id = "Vehicle Type is required";
    if (!formData.rc_number) newErrors.rc_number = "RC Number is required";
    if (!formData.driver_id) newErrors.driver_id = "Driver is required";
    return newErrors;
  };

  const validateDocuments = () => {
    if (isEdit) return {};
    const requiredDocs = [
      "insurance_file",
      "permit_file",
      "puc_file",
      "fitness_file",
      "tax_receipt_file",
    ];
    const newErrors = {};
    requiredDocs.forEach((doc) => {
      if (!formData[doc] && !initialData[doc]) {
        newErrors[doc] = "This document is required";
      }
    });
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = activeTab === "BASIC INFO" ? validateBasicInfo() : validateDocuments();
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

  const renderField = (label, field, type = "text", required = false) => (
    <div>
      <label className="block font-medium mb-1">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        value={formData[field] || ""}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
    </div>
  );

  const renderSearchableSelect = (label, field, options = [], required = false) => (
    <div>
      <label className="block font-medium mb-1">
        {label} {required && "*"}
      </label>
      <Select
        options={options}
        value={options.find((opt) => opt.value === formData[field]) || null}
        onChange={(selected) => handleInputChange(field, selected?.value || "")}
        isSearchable
        placeholder={`Select ${label}`}
      />
      {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
    </div>
  );

  /** ✅ Updated Horizontal Layout for Documents **/
  const renderFileWithExpiry = (label, fileField, expiryField) => {
    const file = formData[fileField];
    const fileUrl =
      file instanceof File
        ? URL.createObjectURL(file)
        : typeof file === "string"
        ? file
        : null;

    const handleUpload = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) handleFileChange(fileField, selectedFile);
    };

    const handleView = () => {
      if (fileUrl) window.open(fileUrl, "_blank");
    };

    const handleDownload = () => {
      if (fileUrl) {
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = file.name || `${label}.pdf`;
        a.click();
      }
    };

    const handleRemove = () => {
      handleFileChange(fileField, null);
    };

    return (
      <div className="border rounded-lg p-4 bg-gray-50 shadow-sm flex flex-col gap-3">
        <label className="block font-semibold text-gray-700">{label}</label>

        {/* File + Actions Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 text-sm text-gray-700 bg-white border rounded px-3 py-2 truncate">
            {file ? file.name || "Existing File" : "No file chosen"}
          </div>

          <label
            htmlFor={`${fileField}-input`}
            className="flex items-center gap-1 bg-blue-100 text-blue-700 border border-blue-400 px-2 py-1 rounded cursor-pointer hover:bg-blue-200"
          >
            <Upload size={16} />
          </label>
          <input
            type="file"
            id={`${fileField}-input`}
            className="hidden"
            onChange={handleUpload}
          />

          {file && (
            <>
              <button
                type="button"
                onClick={handleView}
                className="flex items-center gap-1 bg-green-100 text-green-700 border border-green-400 px-2 py-1 rounded hover:bg-green-200"
              >
                <Eye size={16} />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-400 px-2 py-1 rounded hover:bg-gray-200"
              >
                <Download size={16} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1 bg-red-100 text-red-600 border border-red-400 px-2 py-1 rounded hover:bg-red-200"
              >
                ❌
              </button>
            </>
          )}
        </div>

        {/* Expiry Date */}
        <div>
          <label className="text-sm font-medium text-gray-600">Expiry Date</label>
          <input
            type="date"
            value={formData[expiryField] || ""}
            onChange={(e) => handleInputChange(expiryField, e.target.value)}
            className="w-full border rounded px-3 py-1.5 text-sm mt-1"
          />
        </div>

        {/* Error */}
        {errors[fileField] && (
          <p className="text-red-500 text-sm mt-1">{errors[fileField]}</p>
        )}
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
            className={`pb-2 font-medium ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-2 gap-4">
        {activeTab === "BASIC INFO" && (
          <>
            {renderSearchableSelect(
              "Vendor",
              "vendor_id",
              DUMMY_VENDORS.map((v) => ({
                value: v.vendor_id,
                label: v.vendor_name,
              })),
              true
            )}
            {renderSearchableSelect(
              "Vehicle Type",
              "vehicle_type_id",
              DUMMY_VEHICLE_TYPES.map((t) => ({
                value: t.vehicle_type_id,
                label: t.name,
              })),
              true
            )}
            {renderField("RC Number", "rc_number", "text", true)}
            {renderSearchableSelect(
              "Driver",
              "driver_id",
              DUMMY_DRIVERS.map((d) => ({
                value: d.driver_id,
                label: d.driver_name,
              })),
              true
            )}
            {renderField("Description", "description")}
          </>
        )}

        {activeTab === "DOCUMENTS" && (
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {renderFileWithExpiry("Insurance", "insurance_file", "insurance_expiry_date")}
            {renderFileWithExpiry("Permit", "permit_file", "permit_expiry_date")}
            {renderFileWithExpiry("PUC", "puc_file", "puc_expiry_date")}
            {renderFileWithExpiry("Fitness", "fitness_file", "fitness_expiry_date")}
            {renderFileWithExpiry("Tax Receipt", "tax_receipt_file", "tax_receipt_date")}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        {activeTab !== "BASIC INFO" && (
          <button
            type="button"
            onClick={handleBack}
            className="border px-6 py-2 rounded"
          >
            Back
          </button>
        )}
        {activeTab !== TABS[TABS.length - 1] && (
          <button
            type="button"
            onClick={handleNext}
            className="bg-blue-600 text-white px-6 py-2 rounded ml-auto"
          >
            Next
          </button>
        )}
      </div>
    </>
  );
};

export default VehicleForm;
