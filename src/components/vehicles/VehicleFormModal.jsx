import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Upload,
  Download,
  Loader2,
  Car,
  Eye,
  Trash2,
  Building,
  FileText,
} from "lucide-react";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { API_CLIENT } from "../../Api/API_Client";
import { viewFile } from "../../utils/fileViewUtils";
import { downloadFile } from "../../utils/downloadUtils";

import { vehicleTypeSelectors } from "../../redux/features/managevehicletype/vehicleTypeSlice";
import {
  createVehicleThunk,
  updateVehicleThunk,
  fetchVehiclesThunk,
} from "../../redux/features/manageVehicles/vehicleThunk";
import { fetchVehicleTypesThunk } from "../../redux/features/managevehicletype/vehicleTypeThunks";
import {
  NewfetchDriversThunk,
  driversSelectors,
} from "../../redux/features/manageDriver/newDriverSlice";

import { useVendorOptions } from "../../hooks/useVendorOptions";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";

import {
  defaultVehicleFormData,
  vehicleDocuments,
  transformVehicleApiToFormData,
  buildVehicleFormData,
  buildVehicleUpdateData,
} from "./vehicleUtility";

/* ====================================================== */
const TABS = ["basic", "documents"];
/* ====================================================== */


/* ===== DATE VALIDATION ===== */
const isFutureDate = (value) => {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(value) > today;
};

/* ===== FORM VALIDATION ===== */
const validateVehicleForm = ({ formData, isVendorUser, mode }) => {
  if (!isVendorUser && !formData.vendor_id) {
    return "Vendor is required";
  }

  if (!formData.vehicle_type_id) {
    return "Vehicle type is required";
  }

  if (!formData.driver_id) {
    return "Driver is required";
  }

  if (!formData.rc_number || formData.rc_number.trim().length < 4) {
    return "RC number is required";
  }

  if (!formData.rc_expiry_date) {
    return "RC expiry date is required";
  }

  if (!isFutureDate(formData.rc_expiry_date)) {
    return "RC expiry date must be in the future";
  }

  if (mode === "create") {
    for (const doc of vehicleDocuments) {
      const file = formData[doc.fileKey];
      const expiry = formData[doc.expiryKey];

      if (!file) {
        return `${doc.label} file is required`;
      }

      if (!expiry) {
        return `${doc.label} expiry date is required`;
      }

      if (!isFutureDate(expiry)) {
        return `${doc.label} expiry date must be in the future`;
      }
    }
  }

  return null;
};


const VehicleFormModal = ({
  isOpen,
  onClose,
  mode = "create",
  vehicleData = null,
  onSubmitSuccess,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const vendors = useVendorOptions();

  const isVendorUser = user?.type === "vendor";
  const isReadOnly = mode === "view";

  /* ================= STATE ================= */
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState(defaultVehicleFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ===== Document view / download state ===== */
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewContentType, setPreviewContentType] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState({});
  const [error, setError] = useState(null);

  /* ================= VENDOR ================= */
  const vendorIdFromUser =
    user?.vendor_user?.vendor_id || user?.vendor_id || null;

  const effectiveVendorId = isVendorUser
    ? vendorIdFromUser
    : formData.vendor_id;

  /* ================= PREFILL ================= */
  useEffect(() => {
    if (mode === "create") {
      setFormData({
        ...defaultVehicleFormData,
        is_active: true,
        vendor_id: isVendorUser ? null : "",
      });
    } else if ((mode === "edit" || mode === "view") && vehicleData) {
      setFormData(transformVehicleApiToFormData(vehicleData));
    }
    setActiveTab("basic");
  }, [mode, vehicleData, isVendorUser]);

  /* ================= VEHICLE TYPES ================= */
  const vehicleTypes = useSelector(vehicleTypeSelectors.selectAll);

  const vehicleTypeOptions = useMemo(
    () =>
      vehicleTypes
        .filter((t) => t.is_active)
        .map((t) => ({
          value: t.vehicle_type_id,
          label: t.name,
        })),
    [vehicleTypes]
  );

  useEffect(() => {
    if (effectiveVendorId) {
      dispatch(fetchVehicleTypesThunk({ vendor_id: effectiveVendorId }));
    }
  }, [dispatch, effectiveVendorId]);

  /* ================= DRIVERS ================= */
  const drivers = useSelector(driversSelectors.selectAll);

  useEffect(() => {
    if (effectiveVendorId) {
      dispatch(NewfetchDriversThunk({ vendor_id: effectiveVendorId }));
    }
  }, [dispatch, effectiveVendorId]);

  const driverOptions = useMemo(
    () =>
      drivers.map((d) => ({
        value: d.driver_id,
        label: d.name,
      })),
    [drivers]
  );

  /* ================= HANDLERS ================= */
  const handleChange = (field, value) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleFileChange = (field, file) =>
    setFormData((p) => ({ ...p, [field]: file }));

  /* ===== Secure VIEW ===== */
  const handleViewFile = (file) => {
    viewFile({
      file,
      apiClient: API_CLIENT,
      apiUrlPrefix: "/v1/vehicles",
      setPreviewDoc,
      setPreviewContentType,
      setError,
      setLoading: (v) =>
        file?.path &&
        setLoadingDocs((p) => ({ ...p, [file.path]: v })),
    });
  };

  /* ===== Secure DOWNLOAD ===== */
  const handleDownloadFile = (file, filename) => {
    downloadFile({
      file,
      filename,
      apiClient: API_CLIENT,
      apiUrlPrefix: "/v1/vehicles",
      setError,
      setLoading: (v) =>
        file?.path &&
        setLoadingDocs((p) => ({ ...p, [file.path]: v })),
    });
  };

  /* ================= DOCUMENT CARD ================= */
  const renderDocumentCard = (doc) => {
    const file = formData[doc.fileKey];
    const Icon = doc.icon;
    const isLoading = file?.path && loadingDocs[file.path];

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
            <span className="text-xs truncate flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              {file instanceof File ? file.name : file.name}
              {isLoading && (
                <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
              )}
            </span>

            <div className="flex gap-1">
              <button type="button" onClick={() => handleViewFile(file)}>
                <Eye className="w-4 h-4 text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDownloadFile(file, file.name || "document")
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
                accept=".pdf,.jpg,.jpeg,.png"
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

     const validationError = validateVehicleForm({
      formData,
      isVendorUser,
      mode,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await dispatch(
          createVehicleThunk(
            buildVehicleFormData({
              ...formData,
              ...(isVendorUser ? {} : { vendor_id: formData.vendor_id }),
            })
          )
        ).unwrap();
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
                {/* Vendor – ONLY FOR NON-VENDOR USERS */}
                {!isVendorUser && (
                  <div>
                    <label className="text-xs font-medium">Vendor *</label>
                    {isReadOnly ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded border">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {
                            vendors.find(
                              (v) => v.value === formData.vendor_id
                            )?.label
                          }
                        </span>
                      </div>
                    ) : (
                      <select
                        value={formData.vendor_id || ""}
                        onChange={(e) =>
                          handleChange("vendor_id", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border rounded"
                      >
                        <option value="">Select Vendor</option>
                        {vendors.map((v) => (
                          <option key={v.value} value={v.value}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

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
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">Driver *</label>
                  <Select
                    options={driverOptions}
                    value={driverOptions.find(
                      (o) => o.value === formData.driver_id
                    )}
                    onChange={(v) => handleChange("driver_id", v?.value)}
                    isDisabled={isReadOnly}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">RC Number *</label>
                  <input
                    className="border p-2 rounded w-full"
                    value={formData.rc_number}
                    onChange={(e) =>
                      handleChange("rc_number", e.target.value)
                    }
                    disabled={isReadOnly}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">
                    RC Expiry Date *
                  </label>
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

                <div className="col-span-3">
                  <label className="text-xs font-medium">Description</label>
                  <textarea
                    className="border p-2 rounded w-full"
                    rows={3}
                    value={formData.description || ""}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    disabled={isReadOnly}
                  />
                </div>

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

      {/* ===== PREVIEW MODAL ===== */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between">
              <h3 className="text-lg font-semibold">Document Preview</h3>
              <button
                onClick={() => {
                  if (previewDoc.startsWith("blob:")) {
                    URL.revokeObjectURL(previewDoc);
                  }
                  setPreviewDoc(null);
                  setPreviewContentType(null);
                }}
              >
                <X />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              {previewContentType?.includes("pdf") ? (
                <iframe src={previewDoc} className="w-full h-[600px]" />
              ) : previewContentType?.includes("image") ? (
                <img
                  src={previewDoc}
                  className="w-full object-contain"
                  alt="Preview"
                />
              ) : (
                <iframe src={previewDoc} className="w-full h-[600px]" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VehicleFormModal;
