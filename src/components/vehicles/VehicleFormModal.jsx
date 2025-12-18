import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Upload,
  Download,
  FileText,
  Loader2,
  Car,
  Eye,
  Trash2,
  Building,
} from "lucide-react";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { vehicleTypeSelectors } from "../../redux/features/managevehicletype/vehicleTypeSlice";
import {
  createVehicleThunk,
  updateVehicleThunk,
  fetchVehiclesThunk,
} from "../../redux/features/manageVehicles/vehicleThunk";
import { fetchVehicleTypesThunk } from "../../redux/features/managevehicletype/vehicleTypeThunks";
import { NewfetchDriversThunk,driversSelectors } from "../../redux/features/manageDriver/newDriverSlice";

import { useVendorOptions } from "../../hooks/useVendorOptions";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { downloadFile } from "../../utils/downloadfile";

import {
  defaultVehicleFormData,
  vehicleDocuments,
  transformVehicleApiToFormData,
  buildVehicleFormData,
  buildVehicleUpdateData,
} from "./vehicleUtility";

/* ======================================================
   CONSTANTS
====================================================== */
const TABS = ["basic", "documents"];

const selectStyles = {
  control: (base) => ({ ...base, minHeight: 38 }),
};

/* ======================================================
   COMPONENT
====================================================== */
const VehicleFormModal = ({
  isOpen,
  onClose,
  mode = "create", // create | edit | view
  vehicleData = null,
  onSubmitSuccess,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const vendors = useVendorOptions();

  const isVendorUser = user?.type === "vendor";
  const isReadOnly = mode === "view";

  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState(defaultVehicleFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  /* ================= PREFILL ================= */
 useEffect(() => {
  if (mode === "create") {
    setFormData({
      ...defaultVehicleFormData,
      is_active: true,
      ...(isVendorUser ? { vendor_id: user.vendor_id } : {}),
    });
  } else if ((mode === "edit" || mode === "view") && vehicleData) {
    setFormData(transformVehicleApiToFormData(vehicleData));
  }

  setActiveTab("basic");
}, [mode, vehicleData, isVendorUser, user?.vendor_id]);


  /* ================= VEHICLE TYPES ================= */
 const vehicleTypes = useSelector(vehicleTypeSelectors.selectAll);

const vehicleTypeOptions = useMemo(
  () =>
    vehicleTypes
      .filter((t) => t.is_active) // optional
      .map((t) => ({
        value: t.vehicle_type_id,
        label: t.name,
      })),
  [vehicleTypes]
);


useEffect(() => {
  if (formData.vendor_id) {
    dispatch(
      fetchVehicleTypesThunk({
        vendor_id: formData.vendor_id,
      })
    );
  }
}, [dispatch, formData.vendor_id]);


  /* ================= DRIVERS ================= */
const drivers = useSelector(driversSelectors.selectAll);

  useEffect(() => {
    if (formData.vendor_id) {
      dispatch( 
   NewfetchDriversThunk({ 
   vendor_id: formData.vendor_id, 
  }) 
 );
    }
  }, [dispatch, formData.vendor_id]);

const driverOptions = useMemo(
  () =>
    drivers.map((d) => ({
      value: d.driver_id,
      label: d.name,
    })),
  [drivers]
);


  /* ================= HANDLERS ================= */
  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    setFormData((p) => ({ ...p, [field]: file }));
  };

  /* ================= DOCUMENT CARD ================= */
  const renderDocumentCard = (doc) => {
    const file = formData[doc.fileKey];
    const Icon = doc.icon;

    return (
      <div key={doc.id} className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold">{doc.label}</span>
        </div>

        <label className="text-xs font-medium">Expiry Date *</label>
        <input
          type="date"
          value={formData[doc.expiryKey] || ""}
          onChange={(e) => handleChange(doc.expiryKey, e.target.value)}
          disabled={isReadOnly}
          className="w-full border px-2 py-1 text-xs rounded mb-2"
        />

        {file ? (
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
            <span className="text-xs truncate">
              {file instanceof File ? file.name : file.name}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() =>
                  file instanceof File
                    ? window.open(URL.createObjectURL(file))
                    : window.open(file.path, "_blank")
                }
              >
                <Eye className="w-4 h-4 text-blue-600" />
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    file instanceof File ? file : file.path,
                    file.name
                  )
                }
              >
                <Download className="w-4 h-4 text-green-600" />
              </button>
              {!isReadOnly && (
                <button
                  onClick={() =>
                    setFormData((p) => ({ ...p, [doc.fileKey]: null }))
                  }
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          </div>
        ) : (
          !isReadOnly && (
            <label className="flex gap-2 justify-center border-2 border-dashed p-2 rounded cursor-pointer">
              <Upload className="w-4 h-4" />
              <span className="text-xs">Upload File *</span>
              <input
                type="file"
                hidden
                onChange={(e) =>
                  handleFileChange(doc.fileKey, e.target.files[0])
                }
              />
            </label>
          )
        )}
      </div>
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await dispatch(createVehicleThunk(buildVehicleFormData(formData))).unwrap();
        toast.success("Vehicle created successfully");
      } else {
        await dispatch(
          updateVehicleThunk({
            vehicle_id: formData.vehicle_id,
            data: buildVehicleUpdateData(formData),
          })
        ).unwrap();
        toast.success("Vehicle updated successfully");
      }

      dispatch(fetchVehiclesThunk());
      onSubmitSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Vehicle operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  /* ================= RENDER ================= */
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
          {/* HEADER */}
          <div className="p-4 border-b flex justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">
                {mode === "create"
                  ? "Add Vehicle"
                  : mode === "edit"
                  ? "Edit Vehicle"
                  : "Vehicle Details"}
              </h2>
            </div>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* TABS */}
          <div className="border-b flex">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 ${
                  activeTab === t
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {t === "basic" ? "Basic Info" : "Documents"}
              </button>
            ))}
          </div>

          {/* BODY */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            {activeTab === "basic" && (
              <div className="grid grid-cols-3 gap-4">
                {/* Vendor */}
                <div>
                  <label className="text-xs font-medium">Vendor *</label>
                  {isReadOnly ? (
                    <div className="flex gap-2 items-center p-2 border rounded bg-gray-50">
                      <Building size={14} />
                      {vendors.find((v) => v.value === formData.vendor_id)?.label}
                    </div>
                  ) : (
                    <Select
                      options={vendors}
                      value={vendors.find(
                        (v) => v.value === formData.vendor_id
                      )}
                      onChange={(opt) =>
                        handleChange("vendor_id", opt?.value)
                      }
                      isDisabled={isVendorUser}
                    />
                  )}
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="text-xs font-medium">Vehicle Type *</label>
                  <Select
                    options={vehicleTypeOptions}
                    value={vehicleTypeOptions.find(
                      (o) => o.value === formData.vehicle_type_id
                    )}
                    onChange={(v) =>
                      handleChange("vehicle_type_id", v?.value)
                    }
                    isDisabled={isReadOnly}
                    placeholder="Vehicle Type"
                  />
                </div>

                {/* Driver */}
                <div>
                  <label className="text-xs font-medium">Driver *</label>
                  <Select
                    options={driverOptions}
                    value={driverOptions.find(
                      (o) => o.value === formData.driver_id
                    )}
                    onChange={(v) => handleChange("driver_id", v?.value)}
                    isDisabled={isReadOnly}
                    placeholder="Driver"
                  />
                </div>

                {/* RC Number */}
                <div>
                  <label className="text-xs font-medium">RC Number *</label>
                  <input
                    className="border p-2 rounded w-full"
                    placeholder="RC Number"
                    value={formData.rc_number}
                    onChange={(e) =>
                      handleChange("rc_number", e.target.value)
                    }
                    disabled={isReadOnly}
                  />
                </div>

                {/* RC Expiry Date */}
                <div>
                  <label className="text-xs font-medium">RC Expiry Date *</label>
                  <input
                    type="date"
                    className="border p-2 rounded w-full"
                    value={formData.rc_expiry_date || ""}
                    onChange={(e) =>
                      handleChange("rc_expiry_date", e.target.value)
                    }
                    disabled={isReadOnly}
                  />
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <label className="text-xs font-medium">Description</label>
                  <textarea
                    className="border p-2 rounded w-full resize-none"
                    placeholder="Description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    disabled={isReadOnly}
                    rows={3}
                    style={{ minHeight: '80px' }}
                  />
                </div>

                {/* Active */}
                <div className="col-span-3 flex items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      disabled={isReadOnly}
                      onChange={(e) =>
                        handleChange("is_active", e.target.checked)
                      }
                    />
                    Active
                  </label>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="grid grid-cols-2 gap-4">
                {vehicleDocuments.map(renderDocumentCard)}
              </div>
            )}

            {!isReadOnly && (
              <div className="mt-6 text-right">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : mode === "create" ? (
                    "Create Vehicle"
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default VehicleFormModal;