import React, { useState, useEffect, useMemo } from "react";
import { Upload, Download } from "lucide-react";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { fetchDriversThunk } from "../../redux/features/manageDriver/driverThunks";
import { fetchVehicleTypes } from "../../redux/features/managevehicletype/vehicleTypeThunks";
import {
  createVehicleThunk,
  updateVehicleThunk,
  fetchVehiclesThunk,
} from "../../redux/features/manageVehicles/vehicleThunk";
import { toast } from "react-toastify";
import { downloadFile } from "../../utils/downloadfile";

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
  is_active: true,
};

const fieldMapping = {
  vendor_id: "vendor",
  vehicle_type_id: "vehicle_type_id",
  driver_id: "driver_id",
  rc_number: "rc_number",
  rc_expiry_date: "rc_expiry_date",
  description: "description",
  insurance_file: "insurance_file",
  insurance_expiry_date: "insurance_expiry_date",
  permit_file: "permit_file",
  permit_expiry_date: "permit_expiry_date",
  puc_file: "puc_file",
  puc_expiry_date: "puc_expiry_date",
  fitness_file: "fitness_file",
  fitness_expiry_date: "fitness_expiry_date",
  tax_receipt_file: "tax_receipt_file",
  tax_receipt_date: "tax_receipt_date",
  is_active: "is_active",
};

const VehicleForm = ({
  isEdit = false,
  mode = "create", // "create", "edit", or "view"
  initialData = {},
  onFormChange,
  onClose,
}) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const isViewMode = mode === "view";

  const session = JSON.parse(sessionStorage.getItem("userPermissions") || "{}");
  const loggedInVendor = session?.user?.vendor_user || null;
  const loggedInVendorId = loggedInVendor?.vendor_id || "";

  // --- Prefill Data ---
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        ...initialState,
        ...initialData,
        vehicle_id: initialData.vehicle_id || "",
        insurance_file: null,
        permit_file: null,
        puc_file: null,
        fitness_file: null,
        tax_receipt_file: null,
      });
    }
  }, [initialData]);

  // --- Prefill vendor for vendor user ---
  useEffect(() => {
    if (loggedInVendorId && !formData.vendor_id) {
      setFormData((prev) => ({ ...prev, vendor_id: loggedInVendorId }));
    }
  }, [loggedInVendorId, formData.vendor_id]);

  // --- Fetch vehicle types ---
  const { byId, allIds, loading: vtLoading } = useSelector(
    (state) => state.vehicleType
  );
  const vehicleTypes = allIds.map((id) => byId[id] || {});

  useEffect(() => {
    if (vehicleTypes.length === 0) dispatch(fetchVehicleTypes());
  }, [dispatch, vehicleTypes.length]);

  // --- Fetch drivers ---
  const { entities: driverEntities, ids: driverIds } = useSelector(
    (state) => state.drivers || { entities: {}, ids: [] }
  );

  useEffect(() => {
    if ( driverIds.length === 0) dispatch(fetchDriversThunk());
  }, [dispatch]);

  const driverOptions = useMemo(() => {
    if (!driverEntities || !driverIds) return [];
    return driverIds.map((id) => ({
      value: driverEntities[id]?.driver_id || "",
      label: driverEntities[id]?.name || "",
    }));
  }, [driverEntities, driverIds]);

  const updateFormData = (updated) => {
    setFormData(updated);
    onFormChange?.(updated);
  };

  const handleInputChange = (field, value) => {
    updateFormData({ ...formData, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleFileChange = (field, file) => {
    updateFormData({ ...formData, [field]: file });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // --- Validation ---
  const validateBasicInfo = () => {
    const newErrors = {};
    if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
    if (!formData.vehicle_type_id)
      newErrors.vehicle_type_id = "Vehicle Type is required";
    if (!formData.rc_number) newErrors.rc_number = "RC Number is required";
    if (!formData.driver_id) newErrors.driver_id = "Driver is required";
    return newErrors;
  };

  const validateDocuments = () => {
    const requiredDocs = [
      "insurance_file",
      "permit_file",
      "puc_file",
      "fitness_file",
      "tax_receipt_file",
    ];
    const newErrors = {};
    requiredDocs.forEach((doc) => {
      if (
        !formData[doc] &&
        !initialData[`${doc.replace("_file", "_url")}`]
      ) {
        newErrors[doc] = "This document is required";
      }
    });
    return newErrors;
  };

  const handleNext = () => {
    const newErrors =
      activeTab === "BASIC INFO" ? validateBasicInfo() : validateDocuments();
    if (Object.keys(newErrors).length === 0) {
      const idx = TABS.indexOf(activeTab);
      if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1]);
    } else {
      setErrors(newErrors);
    }
  };

  const handleBack = () => {
    const idx = TABS.indexOf(activeTab);
    if (idx > 0) setActiveTab(TABS[idx - 1]);
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const allErrors = { ...validateBasicInfo(), ...validateDocuments() };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setActiveTab("BASIC INFO");
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      const backendKey = fieldMapping[key] || key;
      const value = formData[key];
      if (value instanceof File) {
        submitData.append(backendKey, value);
      } else if (typeof value === "boolean") {
        submitData.append(backendKey, value ? "true" : "false");
      } else if (value) {
        submitData.append(backendKey, value);
      }
    });

    try {
      if (isEdit) {
        const vehicleId = Number(formData.vehicle_id);
        if (!vehicleId) {
          toast.error("Vehicle ID is missing or invalid.");
          return;
        }
        await dispatch(
          updateVehicleThunk({ vehicle_id: formData.vehicle_id, data: submitData })
        ).unwrap();
        toast.success("✅ Vehicle updated successfully!");
      } else {
        await dispatch(createVehicleThunk(submitData)).unwrap();
        toast.success("✅ Vehicle created successfully!");
      }
      onClose?.();
      dispatch(fetchVehiclesThunk());
      onFormChange?.(formData);
    } catch (err) {
      console.error("❌ Vehicle operation failed:", err);
      const backendMessage =
        err?.response?.data?.detail || err?.detail || err?.message;
      toast.error(`❌ ${backendMessage}`);
    }
  };

  // --- Render helpers ---
  const renderField = (label, field, type = "text", required = false) => (
    <div>
      <label className="block font-medium mb-1">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        value={formData[field] || ""}
        onChange={(e) => handleInputChange(field, e.target.value)}
        disabled={isViewMode}
        className="w-full border rounded px-3 py-2 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      {errors[field] && (
        <p className="text-red-500 text-sm">{errors[field]}</p>
      )}
    </div>
  );

  const renderSelect = (label, field, options = [], required = false, disabled = false) => (
    <div>
      <label className="block font-medium mb-1">
        {label} {required && "*"}
      </label>
      <Select
        options={options}
        value={options.find((o) => o.value === formData[field]) || null}
        onChange={(s) => handleInputChange(field, s?.value || "")}
        isSearchable
        placeholder={`Select ${label}`}
        isDisabled={disabled || vtLoading || isViewMode}
      />
      {errors[field] && (
        <p className="text-red-500 text-sm">{errors[field]}</p>
      )}
    </div>
  );

  const renderFileWithExpiry = (label, fileField, expiryField) => {
    const existingFilePath =
      initialData?.[`${fileField.replace("_file", "_url")}`] || null;
    const fileName =
      formData[fileField]?.name ||
      (existingFilePath ? existingFilePath.split("/").pop() : "");
    const fileUrl =
      formData[fileField] instanceof File
        ? URL.createObjectURL(formData[fileField])
        : existingFilePath
        ? `/api/v1/vehicles/files/${existingFilePath}`
        : null;

    const handleUpload = (e) => {
      if (isViewMode) return;
      const file = e.target.files[0];
      if (file) handleFileChange(fileField, file);
    };

    const handleDownload = () => {
      const fileValue = formData[fileField];
      const fileName =
        fileValue?.name ||
        (existingFilePath ? existingFilePath.split("/").pop() : `${label}.pdf`);
      if (fileValue instanceof File) {
        const localUrl = URL.createObjectURL(fileValue);
        const link = document.createElement("a");
        link.href = localUrl;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(localUrl);
      } else if (existingFilePath) {
        downloadFile(existingFilePath, fileName);
      } else {
        toast.warn("No file available to download");
      }
    };

    const handleRemove = () => {
      if (!isViewMode) handleFileChange(fileField, null);
    };

    return (
      <div className="border rounded-lg p-4 bg-gray-50 shadow-sm flex flex-col gap-3">
        <label className="block font-semibold text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 text-sm text-gray-700 bg-white border rounded px-3 py-2 truncate">
            {fileName || "No file chosen"}
          </div>
          {!isViewMode && (
            <>
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
            </>
          )}
          {fileUrl && (
            <>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-400 px-2 py-1 rounded hover:bg-gray-200"
              >
                <Download size={16} />
              </button>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-1 bg-red-100 text-red-600 border border-red-400 px-2 py-1 rounded hover:bg-red-200"
                >
                  ❌
                </button>
              )}
            </>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Expiry Date</label>
          <input
            type="date"
            value={formData[expiryField] || initialData?.[expiryField] || ""}
            onChange={(e) => handleInputChange(expiryField, e.target.value)}
            disabled={isViewMode}
            className="w-full border rounded px-3 py-1.5 text-sm mt-1 bg-white disabled:bg-gray-100"
          />
        </div>

        {errors[fileField] && (
          <p className="text-red-500 text-sm mt-1">{errors[fileField]}</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="grid grid-cols-2 gap-4">
        {activeTab === "BASIC INFO" && (
          <>
            {renderSelect(
              "Vendor",
              "vendor_id",
              loggedInVendor
                ? [
                    { value: loggedInVendor.vendor_id, label: loggedInVendor.name },
                  ]
                : [],
              true,
              !!loggedInVendor
            )}
            {renderSelect(
              "Vehicle Type",
              "vehicle_type_id",
              vehicleTypes.map((t) => ({ value: t.id, label: t.name })),
              true
            )}
            {renderField("RC Number", "rc_number", "text", true)}
            {renderField("RC Expiry Date", "rc_expiry_date", "date", true)}
            {renderSelect("Driver", "driver_id", driverOptions, true)}
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

      <div className="flex justify-between mt-6">
        {activeTab !== TABS[0] && (
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

        {activeTab === TABS[TABS.length - 1] && (
          <div className="flex space-x-3 ml-auto">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                {isViewMode ? "Close" : "Cancel"}
              </button>
            )}
            {!isViewMode && (
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {isEdit ? "Update Vehicle" : "Create Vehicle"}
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  );
};

export default VehicleForm;
