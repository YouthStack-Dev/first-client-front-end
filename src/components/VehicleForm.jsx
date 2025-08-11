// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from 'react-redux';
// import Select from "react-select";
// import { getFilteredDrivers } from "../redux/features/manageDriver/driverApi";
// import { toast } from "react-toastify";
// import {
//   createVehicleThunk,
//   updateVehicleThunk,
// } from "../redux/features/manageVehicles/vehicleThunk";
// import { fetchVendors } from "../redux/features/manageVendors/vendorThunks";
// import { fetchVehicleTypes } from "../redux/features/managevehicletype/vehicleTypeThunks";

// const TABS = ["BASIC INFO", "CONTRACTS", "DOCUMENTS", "DRIVER"];

// const initialState = {
//   vendor_id: "", 
//   rc_expiry_date: "",
//   insurance_expiry_date: "",
//   permit_expiry_date: "",
//   pollution_expiry_date: "",
//   fitness_expiry_date: "",
//   tax_receipt_date: "",
//   rc_card_file: null,
//   insurance_file: null,
//   permit_file: null,
//   pollution_file: null,
//   fitness_file: null,
//   tax_receipt_file: null,
// };

// const VehicleForm = ({
//   onClose,
//   isEdit = false,
//   initialData = {},
//   vendors = [],
//   vehicleTypes = [],
// }) => {
//   const dispatch = useDispatch();

//   const [activeTab, setActiveTab] = useState(TABS[0]);
//   const [formData, setFormData] = useState({ ...initialState, ...initialData });
//   const [drivers, setDrivers] = useState([]);
//   const [loadingDrivers, setLoadingDrivers] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const { user } = useSelector((state) => state.auth);
//   const tenantId = user?.tenant_id || 1;

//   // useEffect(() => {
//   //   if (tenantId && vendors.length === 0) {
//   //     console.log(`📢 API Call: GET /vendors?skip=0&limit=100&tenant_id=${tenantId}`);
//   //     dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
//   //   }
//   // }, [tenantId, vendors.length, dispatch]);

//   // 🚗 Fetch vehicle types
//   // useEffect(() => {
//   //   if (!tenantId) return;
//   //   if (vehicleTypes.length === 0) {
//   //     console.log("🚗 Fetching vehicle types for tenant:", tenantId);
//   //     dispatch(fetchVehicleTypes(tenantId))
//   //       .unwrap()
//   //       .catch(() => {
//   //         toast.error('Failed to load vehicle types');
//   //       });
//   //   }
//   // }, [tenantId, vehicleTypes.length, dispatch]);

//   useEffect(() => {
//     if (formData.vendor_id) fetchDrivers(formData.vendor_id);
//     else setDrivers([]);
//   }, [formData.vendor_id]);

//   const fetchDrivers = async (vendorId) => {
//     setLoadingDrivers(true);
//     try {
//       const res = await getFilteredDrivers(vendorId, {
//         skip: 0,
//         limit: 100,
//         bgv_status: "",
//         search: "",
//       });
//       const driverList = Array.isArray(res?.data) ? res.data : [];
//       setDrivers(driverList);
//     } catch (error) {
//       console.error("❌ Error fetching drivers:", error);
//     } finally {
//       setLoadingDrivers(false);
//     }
//   };

//   const handleFileChange = (field) => (e) => {
//     const file = e.target.files[0];
//     setFormData((prev) => ({ ...prev, [field]: file }));
//   };

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     if (errors[field]) {
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }
//   };

//   // Validation methods per tab
//   const validateBasicInfo = () => {
//     const newErrors = {};
//     if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
//     if (!formData.vehicle_code) newErrors.vehicle_code = "Vehicle code is required";
//     if (!formData.reg_number) newErrors.reg_number = "Registration number is required";
//     if (!formData.status) newErrors.status = "Status is required";
//     return newErrors;
//   };

//   const validateContracts = () => {
//     const newErrors = {};
//     if (!formData.vehicle_type_id) newErrors.vehicle_type_id = "Vehicle type is required";
//     return newErrors;
//   };

//   const validateDocuments = () => {
//     if (isEdit) return {};
//     const newErrors = {};
//     const requiredDocs = [
//       "rc_card_file",
//       "insurance_file",
//       "permit_file",
//       "pollution_file",
//       "fitness_file",
//       "tax_receipt_file",
//     ];
//     requiredDocs.forEach((doc) => {
//       if (!formData[doc] && !initialData[doc]) {
//         newErrors[doc] = "This document is required";
//       }
//     });
//     return newErrors;
//   };

//   const validateAllTabs = () => {
//     // Merge errors from all tabs
//     return {
//       ...validateBasicInfo(),
//       ...validateContracts(),
//       ...validateDocuments(),
//     };
//   };

//   const handleNext = (e) => {
//     e.preventDefault(); // ⬅ stops form submit
//     const newErrors = {};
//     if (activeTab === "BASIC INFO") Object.assign(newErrors, validateBasicInfo());
//     if (activeTab === "CONTRACTS") Object.assign(newErrors, validateContracts());
//     if (activeTab === "DOCUMENTS") Object.assign(newErrors, validateDocuments());

//     if (Object.keys(newErrors).length === 0) {
//       const index = TABS.indexOf(activeTab);
//       if (index < TABS.length - 1) {
//         setActiveTab(TABS[index + 1]);
//       }
//     } else {
//       setErrors(newErrors);
//     }
//   };

//   const handleBack = () => {
//     const index = TABS.indexOf(activeTab);
//     if (index > 0) setActiveTab(TABS[index - 1]);
//   };

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   const newErrors = validateAllTabs();

//   if (Object.keys(newErrors).length > 0) {
//     setErrors(newErrors);
//     // Switch to first tab containing an error
//     if (newErrors.vendor_id || newErrors.vehicle_code || newErrors.reg_number || newErrors.status) {
//       setActiveTab("BASIC INFO");
//     } else if (newErrors.vehicle_type_id) {
//       setActiveTab("CONTRACTS");
//     } else {
//       setActiveTab("DOCUMENTS");
//     }
//     toast.error("Please fix errors before submitting.");
//     return;
//   }

//   setIsSubmitting(true);

//   // Allowed keys per your API swagger doc (excluding vehicle_id and URL fields)
//   const allowedFields = [
//     "vehicle_code",
//     "reg_number",
//     "vehicle_type_id",
//     "status",
//     "description",
//     "driver_id",
//     "rc_expiry_date",
//     "insurance_expiry_date",
//     "permit_expiry_date",
//     "pollution_expiry_date",
//     "fitness_expiry_date",
//     "tax_receipt_date",
//     "rc_card_file",
//     "insurance_file",
//     "permit_file",
//     "pollution_file",
//     "fitness_file",
//     "tax_receipt_file",
//   ];

//   const formDataToSubmit = new FormData();

//   Object.entries(formData).forEach(([key, value]) => {
//     if (!allowedFields.includes(key)) return; // skip keys not allowed

//     if (
//       value instanceof File ||
//       typeof value === "string" ||
//       typeof value === "number" ||
//       typeof value === "boolean"
//     ) {
//       // Convert IDs to string for FormData
//       if (["vehicle_type_id", "driver_id"].includes(key)) {
//         formDataToSubmit.append(key, value ? value.toString() : "");
//       } else {
//         formDataToSubmit.append(key, value);
//       }
//     }
//   });

//   // DEBUG LOG
//   console.log("🚀 Submitting form data:");
//   for (const [key, val] of formDataToSubmit.entries()) {
//     console.log(`- ${key}:`, val);
//   }

//   try {
//     if (isEdit) {
//       await dispatch(
//         updateVehicleThunk({
//           vehicle_id: initialData?.vehicle_id,
//           vendor_id: Number(formData.vendor_id),
//           payload: formDataToSubmit,
//         })
//       ).unwrap();
//       toast.success("Vehicle updated successfully");
//     } else {
//       await dispatch(
//         createVehicleThunk({
//           vendorId: formData.vendor_id,
//           formData: formDataToSubmit,
//         })
//       ).unwrap();
//       toast.success("Vehicle created successfully");
//     }
//     onClose?.();
//   } catch (err) {
//     console.error("❌ Submission failed:", err);
//     toast.error("Something went wrong during submission.");
//   } finally {
//     setIsSubmitting(false);
//   }
// };


//   const renderField = (label, field, type = "text", placeholder = "", required = false) => (
//     <div>
//       <label className="block font-medium mb-1">
//         {label} {required && "*"}
//       </label>
//       <input
//         type={type}
//         value={formData[field]}
//         onChange={(e) => handleInputChange(field, e.target.value)}
//         placeholder={placeholder}
//         className="w-full border px-3 py-2 rounded"
//       />
//       {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
//     </div>
//   );

//   const renderSearchableSelect = (
//     label,
//     field,
//     options = [],
//     required = false,
//     loading = false
//   ) => (
//     <div>
//       <label className="block font-medium mb-1">
//         {label} {required && "*"}
//       </label>
//       <Select
//         options={options}
//         value={options.find((opt) => opt.value === formData[field]) || null}
//         onChange={(selected) => handleInputChange(field, selected ? selected.value : "")}
//         isSearchable
//         isClearable
//         isLoading={loading}
//         placeholder={`Select ${label}`}
//         className="react-select-container"
//         classNamePrefix="react-select"
//       />
//       {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
//     </div>
//   );

//   const renderStatusSelect = () => (
//     <div>
//       <label className="block font-medium mb-1">Status *</label>
//       <select
//         value={formData.status}
//         onChange={(e) => handleInputChange("status", e.target.value)}
//         className="w-full border px-3 py-2 rounded"
//       >
//         {formData.status === "" && <option value="">Select Status</option>}
//         <option value="ACTIVE">Active</option>
//         <option value="INACTIVE">Inactive</option>
//       </select>
//       {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
//     </div>
//   );

//   const renderFileWithExpiry = (label, fileField, expiryField) => {
//     const existingFileUrl = initialData?.[fileField] || null;
//     const newFile = formData[fileField];
//     const newFileUrl = newFile instanceof File ? URL.createObjectURL(newFile) : null;

//     return (
//       <div className="col-span-1 space-y-2">
//         <label className="block font-semibold mb-1">{label}</label>

//         {isEdit && existingFileUrl && !newFile && (
//           <div className="flex items-center gap-3 mb-2">
//             <a href={existingFileUrl} target="_blank" className="text-blue-600 underline text-sm" rel="noreferrer">
//               View
//             </a>
//             <a href={existingFileUrl} download className="text-green-600 underline text-sm">
//               Download
//             </a>
//           </div>
//         )}

//         {newFileUrl && (
//           <div className="flex items-center gap-3 mb-2">
//             <a href={newFileUrl} target="_blank" className="text-blue-600 underline text-sm" rel="noreferrer">
//               View
//             </a>
//             <a href={newFileUrl} download={newFile.name} className="text-green-600 underline text-sm">
//               Download
//             </a>
//           </div>
//         )}

//         <input type="file" onChange={handleFileChange(fileField)} className="border rounded px-3 py-2 text-sm" />
//         {errors[fileField] && <p className="text-red-500 text-sm">{errors[fileField]}</p>}
//         <input
//           type="date"
//           value={formData[expiryField] || ""}
//           onChange={(e) => handleInputChange(expiryField, e.target.value)}
//           className="w-full border rounded px-3 py-2 text-sm"
//         />
//       </div>
//     );
//   };

//  return (
//     <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === "Enter" && e.preventDefault()} className="space-y-6">
//       {/* Tabs */}
//       <div className="flex space-x-6 border-b mb-4">
//         {TABS.map((tab) => (
//           <button
//             key={tab}
//             type="button"
//             onClick={() => setActiveTab(tab)}
//             className={`pb-2 font-medium ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         {activeTab === "BASIC INFO" && (
//           <>
//             {renderSearchableSelect(
//               "Vendor",
//               "vendor_id",
//               vendors.map((v) => ({ value: v.vendor_id, label: v.vendor_name })),
//               true
//             )}
//             {renderField("Vehicle Code", "vehicle_code", "text", "", true)}
//             {renderField("Registration Number", "reg_number", "text", "", true)}
//             {renderStatusSelect()}
//           </>
//         )}

//         {activeTab === "CONTRACTS" && (
//           <>
//             {renderSearchableSelect(
//               "Vehicle Type",
//               "vehicle_type_id",
//               vehicleTypes.map((vt) => ({ value: vt.vehicle_type_id, label: vt.name })),
//               true
//             )}
//             {renderField("Description", "description", "text", "")}
//           </>
//         )}

//         {activeTab === "DOCUMENTS" && (
//           <div className="col-span-2 grid grid-cols-2 gap-4">
//             {renderFileWithExpiry("RC Card", "rc_card_file", "rc_expiry_date")}
//             {renderFileWithExpiry("Insurance", "insurance_file", "insurance_expiry_date")}
//             {renderFileWithExpiry("Permit", "permit_file", "permit_expiry_date")}
//             {renderFileWithExpiry("Pollution", "pollution_file", "pollution_expiry_date")}
//             {renderFileWithExpiry("Fitness", "fitness_file", "fitness_expiry_date")}
//             {renderFileWithExpiry("Tax Receipt", "tax_receipt_file", "tax_receipt_date")}
//           </div>
//         )}

//         {activeTab === "DRIVER" && (
//           <>
//             {renderSearchableSelect(
//               "Driver",
//               "driver_id",
//               drivers.map((d) => ({ value: d.driver_id, label: d.name })),
//               false,
//               loadingDrivers
//             )}
//           </>
//         )}
//       </div>

//       <div className="flex justify-between mt-6">
//         {activeTab !== "BASIC INFO" && (
//           <button type="button" onClick={handleBack} className="border px-6 py-2 rounded">
//             Back
//           </button>
//         )}
//         <div className="flex space-x-4">
//           {activeTab === TABS[TABS.length - 1] ? (
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`bg-blue-600 text-white px-6 py-2 rounded ${
//                 isSubmitting ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             >
//               {isSubmitting ? "Submitting..." : isEdit ? "Update Vehicle" : "Save Vehicle"}
//             </button>
//           ) : (
//             <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded">
//               Next
//             </button>
//           )}
//         </div>
//       </div>
//     </form>
//   );
// };

// export default VehicleForm;


import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import Select from "react-select";
import { getFilteredDrivers } from "../redux/features/manageDriver/driverApi";
import { toast } from "react-toastify";
import {
  createVehicleThunk,
  updateVehicleThunk,
} from "../redux/features/manageVehicles/vehicleThunk";
import { fetchVendors } from "../redux/features/manageVendors/vendorThunks";
import { fetchVehicleTypes } from "../redux/features/managevehicletype/vehicleTypeThunks";

const TABS = ["BASIC INFO", "DOCUMENTS"];

const initialState = {
  vendor_id: "", 
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
  vehicle_type_id: "",
  description: "",
  driver_id: "",
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

  const { user } = useSelector((state) => state.auth);
  const tenantId = user?.tenant_id || 1;

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

  // Validation methods per tab
  const validateBasicInfo = () => {
    const newErrors = {};
    if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
    if (!formData.vehicle_code) newErrors.vehicle_code = "Vehicle code is required";
    if (!formData.reg_number) newErrors.reg_number = "Registration number is required";
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.vehicle_type_id) newErrors.vehicle_type_id = "Vehicle type is required";
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

  const handleNext = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (activeTab === "BASIC INFO") Object.assign(newErrors, validateBasicInfo());
    if (activeTab === "DOCUMENTS") Object.assign(newErrors, validateDocuments());

    if (Object.keys(newErrors).length === 0) {
      const index = TABS.indexOf(activeTab);
      if (index < TABS.length - 1) {
        setActiveTab(TABS[index + 1]);
      }
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

    const newErrors = validateAllTabs();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.vendor_id || newErrors.vehicle_code || newErrors.reg_number || newErrors.status || newErrors.vehicle_type_id) {
        setActiveTab("BASIC INFO");
      } else {
        setActiveTab("DOCUMENTS");
      }
      toast.error("Please fix errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    const allowedFields = [
      "vehicle_code",
      "reg_number",
      "vehicle_type_id",
      "status",
      "description",
      "driver_id",
      "rc_expiry_date",
      "insurance_expiry_date",
      "permit_expiry_date",
      "pollution_expiry_date",
      "fitness_expiry_date",
      "tax_receipt_date",
      "rc_card_file",
      "insurance_file",
      "permit_file",
      "pollution_file",
      "fitness_file",
      "tax_receipt_file",
    ];

    const formDataToSubmit = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (!allowedFields.includes(key)) return;

      if (
        value instanceof File ||
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        if (["vehicle_type_id", "driver_id"].includes(key)) {
          formDataToSubmit.append(key, value ? value.toString() : "");
        } else {
          formDataToSubmit.append(key, value);
        }
      }
    });

    console.log("🚀 Submitting form data:");
    for (const [key, val] of formDataToSubmit.entries()) {
      console.log(`- ${key}:`, val);
    }

    try {
      if (isEdit) {
        await dispatch(
          updateVehicleThunk({
            vehicle_id: initialData?.vehicle_id,
            vendor_id: Number(formData.vendor_id),
            payload: formDataToSubmit,
          })
        ).unwrap();
        toast.success("Vehicle updated successfully");
      } else {
        await dispatch(
          createVehicleThunk({
            vendorId: formData.vendor_id,
            formData: formDataToSubmit,
          })
        ).unwrap();
        toast.success("Vehicle created successfully");
      }
      onClose?.();
    } catch (err) {
      console.error("❌ Submission failed:", err);
      toast.error("Something went wrong during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <a href={existingFileUrl} target="_blank" className="text-blue-600 underline text-sm" rel="noreferrer">
              View
            </a>
            <a href={existingFileUrl} download className="text-green-600 underline text-sm">
              Download
            </a>
          </div>
        )}

        {newFileUrl && (
          <div className="flex items-center gap-3 mb-2">
            <a href={newFileUrl} target="_blank" className="text-blue-600 underline text-sm" rel="noreferrer">
              View
            </a>
            <a href={newFileUrl} download={newFile.name} className="text-green-600 underline text-sm">
              Download
            </a>
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
            {renderSearchableSelect(
              "Vendor",
              "vendor_id",
              vendors.map((v) => ({ value: v.vendor_id, label: v.vendor_name })),
              true
            )}
            {renderField("Vehicle Code", "vehicle_code", "text", "", true)}
            {renderField("Registration Number", "reg_number", "text", "", true)}
            {renderStatusSelect()}
            {renderSearchableSelect(
              "Vehicle Type",
              "vehicle_type_id",
              vehicleTypes.map((vt) => ({ value: vt.vehicle_type_id, label: vt.name })),
              true
            )}
            {renderField("Description", "description", "text", "")}
            {renderSearchableSelect(
              "Driver",
              "driver_id",
              drivers.map((d) => ({ value: d.driver_id, label: d.name })),
              false,
              loadingDrivers
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
        <div className="flex space-x-4">
          {activeTab === TABS[TABS.length - 1] ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 text-white px-6 py-2 rounded ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
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