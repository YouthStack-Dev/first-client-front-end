import React, { useState, useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createVendorThunk, updateVendorThunk } from "../../redux/features/vendors/vendorThunk"; // make sure update thunk exists

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d+\-()\s]{7,20}$/;

const AssignEntityModal = ({ isOpen, onClose, sourceEntity, onSaveSuccess }) => {
  const dispatch = useDispatch();
  const creating = useSelector((state) => state.vendor.creating);

  const initialFormData = {
    tenant_id: "",
    admin_email: "",
    admin_name: "",
    admin_password: "",
    admin_phone: "",
    email: "",
    name: "",
    phone: "",
    vendor_code: "",
    is_active: true,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);

  const isEditMode = !!sourceEntity?.vendor_id; // determine edit vs add

  const fields = useMemo(
    () => [
      { label: "Vendor Name", name: "name", type: "text" },
      { label: "Vendor Email", name: "email", type: "email" },
      { label: "Vendor Phone", name: "phone", type: "text" },
      { label: "Vendor Code", name: "vendor_code", type: "text" },
      { label: "Admin Name", name: "admin_name", type: "text" },
      { label: "Admin Email", name: "admin_email", type: "email" },
      { label: "Admin Phone", name: "admin_phone", type: "text" },
      { label: "Admin Password", name: "admin_password", type: "password" },
    ],
    []
  );

  // Prefill form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        tenant_id: sourceEntity?.tenant_id || "",
        name: sourceEntity?.name || "",
        email: sourceEntity?.email || "",
        phone: sourceEntity?.phone || "",
        vendor_code: sourceEntity?.vendor_code || "",
        is_active: sourceEntity?.is_active ?? true,
        admin_name: sourceEntity?.admin_name || "",
        admin_email: sourceEntity?.admin_email || "",
        admin_phone: sourceEntity?.admin_phone || "",
        admin_password: "", // always empty for security
      });
      setErrors({});
      setTimeout(() =>
        modalRef.current?.querySelector("input:not([readonly])")?.focus(),
        0
      );
    }
  }, [isOpen, sourceEntity]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

const validate = () => {
  const newErrors = {};

  if (isEditMode) {
    // ✅ Edit mode (fields used in update payload)
    if (!formData.name) newErrors.name = "Vendor name is required";
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid vendor email";
    if (!phoneRegex.test(formData.phone)) newErrors.phone = "Invalid vendor phone";
    // if (!formData.admin_name) newErrors.admin_name = "Admin name is required";
  } else {
    // ✅ Create mode (full validation)
    if (!formData.name) newErrors.name = "Vendor name is required";
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid vendor email";
    if (!emailRegex.test(formData.admin_email)) newErrors.admin_email = "Invalid admin email";
    if (formData.email && formData.admin_email && formData.email === formData.admin_email) {
      newErrors.admin_email = "Admin email must be different from vendor email";
    }
    if (!phoneRegex.test(formData.phone)) newErrors.phone = "Invalid vendor phone";
    if (!phoneRegex.test(formData.admin_phone)) newErrors.admin_phone = "Invalid admin phone";
    if (!formData.admin_password) newErrors.admin_password = "Admin password is required";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      let result;
      if (isEditMode) {
        result = await dispatch(updateVendorThunk({ vendorId: sourceEntity.vendor_id, formData })).unwrap();
      } else {
        result = await dispatch(createVendorThunk(formData)).unwrap();
      }

      // Immediately update parent component vendor list
      if (onSaveSuccess) onSaveSuccess(result);

      onClose();
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to save vendor:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      role="dialog"
      aria-modal="true"
      ref={modalRef}
    >
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold">
            {isEditMode ? "Update Vendor" : "Assign Vendor"}: {sourceEntity?.name || "N/A"}
          </h2>
          <button onClick={onClose} aria-label="Close modal">
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tenant ID</label>
            <input
              type="text"
              name="tenant_id"
              value={formData.tenant_id}
              readOnly
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
            />
          </div>

          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm ${
                  errors[field.name] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors[field.name] && (
                <p className="text-xs text-red-500 mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            disabled={creating}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={creating}
          >
            {isEditMode ? "Update Vendor" : "Assign Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignEntityModal;
