import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, User, Mail, Phone, Hash, Shield, Building2, Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  createVendorThunk,
  updateVendorThunk,
} from "../../redux/features/vendors/vendorThunk";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d+\-()\s]{7,20}$/;

const InputField = ({ label, name, type = "text", value, onChange, error, icon: Icon, readOnly = false, showToggle = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showToggle ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}
      </label>
      <div className={`relative flex items-center rounded-lg border transition-all duration-200 ${
        readOnly
          ? "bg-gray-50 border-gray-200"
          : error
          ? "border-red-400 bg-red-50 focus-within:ring-2 focus-within:ring-red-200"
          : "border-gray-200 bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
      }`}>
        {Icon && (
          <div className="pl-3 text-gray-400">
            <Icon size={15} />
          </div>
        )}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className={`w-full px-3 py-2.5 text-sm bg-transparent outline-none rounded-lg ${
            readOnly ? "text-gray-500 cursor-not-allowed" : "text-gray-800"
          }`}
        />
        {showToggle && !readOnly && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="pr-3 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

const AssignEntityModal = ({
  isOpen,
  onClose,
  sourceEntity,
  onSaveSuccess,
}) => {
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

  const isEditMode = !!sourceEntity?.vendor_id;

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
        admin_password: "",
      });
      setErrors({});
      setTimeout(
        () => modalRef.current?.querySelector("input:not([readonly])")?.focus(),
        0
      );
    }
  }, [isOpen, sourceEntity]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (isEditMode) {
      if (!formData.name) newErrors.name = "Vendor name is required";
      if (!emailRegex.test(formData.email)) newErrors.email = "Invalid vendor email";
      if (!phoneRegex.test(formData.phone)) newErrors.phone = "Invalid vendor phone";
    } else {
      if (!formData.name) newErrors.name = "Vendor name is required";
      if (!emailRegex.test(formData.email)) newErrors.email = "Invalid vendor email";
      if (!emailRegex.test(formData.admin_email)) newErrors.admin_email = "Invalid admin email";
      if (formData.email && formData.admin_email && formData.email === formData.admin_email)
        newErrors.admin_email = "Admin email must be different from vendor email";
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
      if (onSaveSuccess) onSaveSuccess(result);
      onClose();
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to save vendor:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
      role="dialog"
      aria-modal="true"
      ref={modalRef}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building2 size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {isEditMode ? "Update Vendor" : "Add Vendor"}
              </h2>
              <p className="text-xs text-gray-500">
                Tenant: <span className="font-medium text-gray-700">{sourceEntity?.name || formData.tenant_id || "N/A"}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Form Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Tenant ID — read only, full width */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={14} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant ID</span>
            </div>
            <p className="text-sm font-medium text-gray-700">{formData.tenant_id || "—"}</p>
          </div>

          {/* ── Vendor Info Card ── */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-blue-50 px-4 py-2.5 border-b border-blue-100">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Vendor Information</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <InputField
                label="Vendor Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                icon={User}
              />
              <InputField
                label="Vendor Code"
                name="vendor_code"
                value={formData.vendor_code}
                onChange={handleChange}
                error={errors.vendor_code}
                icon={Hash}
              />
              <InputField
                label="Vendor Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={Mail}
              />
              <InputField
                label="Vendor Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={Phone}
              />
            </div>
          </div>

          {/* ── Admin Info Card ── */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-purple-50 px-4 py-2.5 border-b border-purple-100">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Admin Information</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <InputField
                label="Admin Name"
                name="admin_name"
                value={formData.admin_name}
                onChange={handleChange}
                error={errors.admin_name}
                icon={User}
              />
              <InputField
                label="Admin Phone"
                name="admin_phone"
                value={formData.admin_phone}
                onChange={handleChange}
                error={errors.admin_phone}
                icon={Phone}
              />
              <InputField
                label="Admin Email"
                name="admin_email"
                type="email"
                value={formData.admin_email}
                onChange={handleChange}
                error={errors.admin_email}
                icon={Mail}
              />
              <InputField
                label="Admin Password"
                name="admin_password"
                type="password"
                value={formData.admin_password}
                onChange={handleChange}
                error={errors.admin_password}
                icon={Shield}
                showToggle={true}
              />
            </div>
          </div>

          {/* ── Active toggle ── */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Active Status</p>
              <p className="text-xs text-gray-500">Vendor will be {formData.is_active ? "active" : "inactive"} after saving</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, is_active: !p.is_active }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                formData.is_active ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                formData.is_active ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={creating}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            {creating && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isEditMode ? "Update Vendor" : "Add Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignEntityModal;