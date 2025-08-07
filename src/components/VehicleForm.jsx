import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getFilteredDrivers } from "../redux/features/manageDriver/driverApi";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  createVehicleThunk,
  updateVehicleThunk, 
} from "../redux/features/manageVehicles/vehicleThunk";


const TABS = ["BASIC INFO", "CONTRACTS", "DOCUMENTS", "DRIVER"];

// Initial State
const initialState = {
  vendor_id: "",
  vehicle_code: "",
  reg_number: "",
  status: "",
  vehicle_type_id: "",
  description: "",
  driver_id: "",
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

const VehicleForm = ({
  onClose,
  isEdit = false,
  initialData = {},
  vendors = [],
  vehicleTypes = [],
}) => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [formData, setFormData] = useState({ ...initialState, ...initialData });
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch drivers
  useEffect(() => {
    if (formData.vendor_id) fetchDrivers(formData.vendor_id);
    else setDrivers([]);
  }, [formData.vendor_id]);

  const fetchDrivers = async (vendorId) => {
    setLoadingDrivers(true);
    try {
      const res = await getFilteredDrivers(vendorId, {
        skip: 0,
        limit: 100,
        bgv_status: "",
        search: "",
      });
      const driverList = Array.isArray(res?.data) ? res.data : [];
      // console.log("✅ Drivers fetched:", driverList);
      setDrivers(driverList);
    } catch (error) {
      console.error("❌ Error fetching drivers:", error);
    } finally {
      setLoadingDrivers(false);
    }
  };

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

  // Validations
  const validateBasicInfo = () => {
    const newErrors = {};
    if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
    if (!formData.vehicle_code) newErrors.vehicle_code = "Vehicle code is required";
    if (!formData.reg_number) newErrors.reg_number = "Registration number is required";
    if (!formData.status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateContracts = () => {
    const newErrors = {};
    if (!formData.vehicle_type_id) newErrors.vehicle_type_id = "Vehicle type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDocuments = () => {
    if (isEdit) return true; // ✅ Skip validation on edit
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentTab = () => {
    if (activeTab === "BASIC INFO") return validateBasicInfo();
    if (activeTab === "CONTRACTS") return validateContracts();
    if (activeTab === "DOCUMENTS") return validateDocuments();
    return true;
  };

  // Tab Navigation
  const handleNext = () => {
    // console.log(`➡️ Moving to next tab from: ${activeTab}`);
    if (validateCurrentTab()) {
      const index = TABS.indexOf(activeTab);
      if (index < TABS.length - 1) setActiveTab(TABS[index + 1]);
    }
  };

  const handleBack = () => {
    const index = TABS.indexOf(activeTab);
    if (index > 0) setActiveTab(TABS[index - 1]);
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("🔥 SUBMIT INITIATED");
    if (!validateCurrentTab()) {
      console.warn("⚠️ Validation failed");
      return;
    }
    setIsSubmitting(true);

    const formDataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (
        value instanceof File ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        formDataToSubmit.append(key, value);
      }
    });

    // console.log("📤 Submitting form data:");
    for (let [key, value] of formDataToSubmit.entries()) {
      // console.log(`${key}:`, value);
    }

    try {
      let response;
      if (isEdit) {
        response = await dispatch(
          updateVehicleThunk({
            vehicle_id: initialData?.vehicle_id,
            vendor_id: formData.vendor_id,
            payload: formDataToSubmit,
          })
        ).unwrap();
        toast.success("Vehicle updated successfully");
      } else {
        response = await dispatch(
          createVehicleThunk({
            vendorId: formData.vendor_id,
            formData: formDataToSubmit,
          })
        ).unwrap();
        toast.success("Vehicle created successfully");
      }
      // console.log("✅ API response:", response);
      onClose?.();
    } catch (err) {
      console.error("❌ Submission failed:", err);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Helpers
  const renderField = (label, field, type = "text", placeholder = "", required = false) => (
    <div>
      <label className="block font-medium mb-1">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        value={formData[field]}
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
        value={formData.status}
        onChange={(e) => handleInputChange("status", e.target.value)}
        className="w-full border px-3 py-2 rounded"
      >
        {formData.status === "" && <option value="">Select Status</option>}
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

        {isEdit && existingFileUrl && !newFile && (
          <div className="flex items-center gap-3 mb-2">
            <a href={existingFileUrl} target="_blank" className="text-blue-600 underline text-sm">View</a>
            <a href={existingFileUrl} download className="text-green-600 underline text-sm">Download</a>
          </div>
        )}

        {newFileUrl && (
          <div className="flex items-center gap-3 mb-2">
            <a href={newFileUrl} target="_blank" className="text-blue-600 underline text-sm">View</a>
            <a href={newFileUrl} download={newFile.name} className="text-green-600 underline text-sm">Download</a>
          </div>
        )}

        <input type="file" onChange={handleFileChange(fileField)} className="border rounded px-3 py-2 text-sm" />
        {errors[fileField] && <p className="text-red-500 text-sm">{errors[fileField]}</p>}
        <input
          type="date"
          value={formData[expiryField] || ""}
          onChange={(e) => handleInputChange(expiryField, e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()} className="space-y-6">
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
            {renderSearchableSelect("Vendor", "vendor_id", vendors.map((v) => ({ value: v.vendor_id, label: v.vendor_name })), true)}
            {renderField("Vehicle Code", "vehicle_code", "text", "", true)}
            {renderField("Registration Number", "reg_number", "text", "", true)}
            {renderStatusSelect()}
          </>
        )}

        {activeTab === "CONTRACTS" && (
          <>
            {renderSearchableSelect( "Vehicle Type", "vehicle_type_id",vehicleTypes.map((vt, index) => ({ value: index, label: vt.name  })), true )}
            {renderField("Description", "description", "text", "")}
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

        {activeTab === "DRIVER" && (
          <>
            {renderSearchableSelect("Driver", "driver_id", drivers.map((d) => ({ value: d.driver_id, label: d.name })), false, loadingDrivers)}
          </>
        )}
      </div>

      <div className="flex justify-between mt-6">
        {activeTab !== "BASIC INFO" && (
          <button type="button" onClick={handleBack} className="border px-6 py-2 rounded">
            Back
          </button>
        )}
        <div className="flex space-x-4">
          {activeTab === "DRIVER" ? (
            <button type="submit" disabled={isSubmitting} className={`bg-blue-600 text-white px-6 py-2 rounded ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}>
              {isSubmitting ? "Submitting..." : isEdit ? "Update Vehicle" : "Save Vehicle"}
            </button>
          ) : (
            <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded">
              Next
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default VehicleForm;
