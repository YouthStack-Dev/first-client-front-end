import React, { useState, useEffect ,useMemo } from "react";
import { Upload, Eye, Download } from "lucide-react";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import {fetchDriversThunk} from "../../redux/features/manageDriver/driverThunks";
import { fetchVehicleTypes } from "../../redux/features/managevehicletype/vehicleTypeThunks";

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

const DUMMY_DRIVERS = [
  { driver_id: "1", driver_name: "John Doe" },
  { driver_id: "2", driver_name: "Jane Smith" },
];

const VehicleForm = ({ isEdit = false, initialData = {}, onFormChange }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const sessionStr = sessionStorage.getItem("userPermissions");
  const session = sessionStr ? JSON.parse(sessionStr) : null;
  const loggedInVendor = session?.user?.vendor_user || null;
  const loggedInVendorId = loggedInVendor?.vendor_id || "";

  // Normalize initialData for edit (prefill form)
  useEffect(() => {
    console.log("VehicleForm: initialData received =>", initialData); // LOG initialData
    if (initialData && Object.keys(initialData).length > 0) {
      const normalized = {
        ...initialState,
        ...initialData,
        insurance_file: null,
        permit_file: null,
        puc_file: null,
        fitness_file: null,
        tax_receipt_file: null,
      };
      setFormData(normalized);
      console.log("VehicleForm: formData after prefill =>", normalized); // LOG formData
    }
  }, [initialData]);

  // Pre-fill vendor for vendor user
  useEffect(() => {
    if (loggedInVendorId && !formData.vendor_id) {
      setFormData((prev) => {
        const updated = { ...prev, vendor_id: loggedInVendorId };
        console.log("VehicleForm: prefilled vendor_id =>", updated.vendor_id); // LOG vendor_id
        return updated;
      });
    }
  }, [loggedInVendorId]);

  // Fetch vehicle types
  const { byId, allIds, loading } = useSelector((state) => state.vehicleType);
  const vehicleTypes = allIds.map((id) => byId[id]);

  useEffect(() => {
    if ( vehicleTypes.length === 0) {
      dispatch(fetchVehicleTypes());
    }
  }, [dispatch]);

    const { entities: driverEntities, ids: driverIds, loading: driversLoading } =
    useSelector((state) => state.drivers);

  useEffect(() => {
    if (driverIds.length === 0) dispatch(fetchDriversThunk());
  }, [dispatch]);

  const driverOptions = useMemo(() => {
    if (!driverEntities || !driverIds) return [];
    return driverIds.map((id) => ({
      value: driverEntities[id].driver_id,
      label: driverEntities[id].name,
    }));
  }, [driverEntities, driverIds]);

  const updateFormData = (updated) => {
    setFormData(updated);
    onFormChange?.(updated);
    console.log("VehicleForm: formData updated =>", updated); // LOG every update
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
      if (!formData[doc] && !initialData[`${doc.replace("_file", "_url")}`]) {
        newErrors[doc] = "This document is required";
      }
    });
    return newErrors;
  };

  const handleNext = () => {
    const newErrors =
      activeTab === "BASIC INFO" ? validateBasicInfo() : validateDocuments();
    if (Object.keys(newErrors).length === 0) {
      const index = TABS.indexOf(activeTab);
      if (index < TABS.length - 1) setActiveTab(TABS[index + 1]);
    } else {
      setErrors(newErrors);
      console.log("VehicleForm: validation errors =>", newErrors);
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

  const renderSearchableSelect = (label, field, options = [], required = false, disabled = false) => (
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
        isDisabled={disabled || loading}
      />
      {loading && <p className="text-gray-500 text-sm mt-1">Loading {label.toLowerCase()}...</p>}
      {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
    </div>
  );

  const renderFileWithExpiry = (label, fileField, expiryField) => {
    const existingFilePath = initialData[`${fileField.replace("_file", "_url")}`];
    const fileUrl = formData[fileField] instanceof File
      ? URL.createObjectURL(formData[fileField])
      : existingFilePath
      ? `/api/v1/vehicles/files/${existingFilePath}`
      : null;

    console.log(`File URL for ${fileField}:`, fileUrl);

    const handleUpload = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) handleFileChange(fileField, selectedFile);
    };

    const handleView = () => fileUrl && window.open(fileUrl, "_blank");
    const handleDownload = () => fileUrl && (window.location.href = fileUrl + "?download=true");
    const handleRemove = () => handleFileChange(fileField, null);

    return (
      <div className="border rounded-lg p-4 bg-gray-50 shadow-sm flex flex-col gap-3">
        <label className="block font-semibold text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 text-sm text-gray-700 bg-white border rounded px-3 py-2 truncate">
            {formData[fileField]?.name || existingFilePath ? "Existing File" : "No file chosen"}
          </div>
          <label htmlFor={`${fileField}-input`} className="flex items-center gap-1 bg-blue-100 text-blue-700 border border-blue-400 px-2 py-1 rounded cursor-pointer hover:bg-blue-200">
            <Upload size={16} />
          </label>
          <input type="file" id={`${fileField}-input`} className="hidden" onChange={handleUpload} />
          {fileUrl && (
            <>
              <button type="button" onClick={handleView} className="flex items-center gap-1 bg-green-100 text-green-700 border border-green-400 px-2 py-1 rounded hover:bg-green-200">
                <Eye size={16} />
              </button>
              <button type="button" onClick={handleDownload} className="flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-400 px-2 py-1 rounded hover:bg-gray-200">
                <Download size={16} />
              </button>
              <button type="button" onClick={handleRemove} className="flex items-center gap-1 bg-red-100 text-red-600 border border-red-400 px-2 py-1 rounded hover:bg-red-200">
                ❌
              </button>
            </>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Expiry Date</label>
          <input
            type="date"
            value={formData[expiryField] || initialData[expiryField] || ""}
            onChange={(e) => handleInputChange(expiryField, e.target.value)}
            className="w-full border rounded px-3 py-1.5 text-sm mt-1"
          />
        </div>
        {errors[fileField] && <p className="text-red-500 text-sm mt-1">{errors[fileField]}</p>}
      </div>
    );
  };

  return (
    <>
      <div className="flex space-x-6 border-b mb-4">
        {TABS.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`pb-2 font-medium ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}>
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
              loggedInVendor ? [{ value: loggedInVendor.vendor_id, label: loggedInVendor.name }] : [],
              true,
              !!loggedInVendor
            )}
            {renderSearchableSelect(
              "Vehicle Type",
              "vehicle_type_id",
              vehicleTypes?.map((t) => ({ value: t.id, label: t.name })) || [],
              true
            )}
            {renderField("RC Number", "rc_number", "text", true)}
            {renderField("RC Expiry Date", "rc_expiry_date", "date", true)}
             {renderSearchableSelect(
              "Driver",
              "driver_id",
              driverOptions,
              true,
              false,
              driversLoading
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

      <div className="flex justify-between mt-6">
        {activeTab !== "BASIC INFO" && (
          <button type="button" onClick={handleBack} className="border px-6 py-2 rounded">Back</button>
        )}
        {activeTab !== TABS[TABS.length - 1] && (
          <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded ml-auto">Next</button>
        )}
      </div>
    </>
  );
};

export default VehicleForm;
