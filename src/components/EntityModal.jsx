import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Building2,
  Lock,
  Save,
  MapPin,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPermissionsThunk } from "../redux/features/Permissions/permissionsThunk";
import CompanyAddressMap from "../companies/CompanyAddressMap";

const initialFormState = {
  company: {
    tenant_id: "",
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    is_active: true,
  },
  employee_email: "",
  employee_phone: "",
  employee_password: "",
  permissions: {},
};

const EntityModal = ({
  isOpen,
  onClose,
  entityType = "company",
  entityData,
  onSubmit,
  mode = "create",
}) => {
  const dispatch = useDispatch();
  const { permissions, loading, fetched } = useSelector(
    (state) => state.permissions
  );

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  // Fetch permissions
  useEffect(() => {
    if (isOpen && !fetched) dispatch(fetchPermissionsThunk());
  }, [isOpen, fetched, dispatch]);

  // Populate data when editing
  useEffect(() => {
    if (!isOpen || permissions.length === 0) return;

    console.log("🧭 entityData received in modal:", entityData);

    const groupedPermissions = {};
    permissions.forEach((p) => {
      if (!groupedPermissions[p.module]) groupedPermissions[p.module] = {};
      groupedPermissions[p.module][p.action] = {
        ...p,
        is_active:
          mode === "edit" && entityData?.permissions
            ? entityData.permissions.some(
                (ep) => ep.module === p.module && ep.action === p.action
              )
            : false,
      };
    });

    if (mode === "edit" && entityData) {
      setFormData({
        company: {
          tenant_id: entityData.company?.tenant_id || "",
          name: entityData.company?.name || "",
          address: entityData.company?.address || "",
          latitude: entityData.company?.latitude || "",
          longitude: entityData.company?.longitude || "",
          is_active: entityData.company?.is_active ?? true,
        },
        employee_email: entityData.employee_email || "",
        employee_phone: entityData.employee_phone || "",
        employee_password: "",
        permissions: groupedPermissions,
      });
    } else {
      setFormData({ ...initialFormState, permissions: groupedPermissions });
    }
  }, [entityData, permissions, isOpen, mode]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setErrors({});
      setStep(1);
    }
  }, [isOpen]);

  const handleInputChange = (section, field, value) => {
    if (section === "company") {
      setFormData((prev) => ({
        ...prev,
        company: { ...prev.company, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handlePermissionChange = (module, action, value) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: { ...prev.permissions[module][action], is_active: value },
        },
      },
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    Object.entries(formData.company).forEach(([key, value]) => {
      if (!value && key !== "is_active") newErrors[key] = `${key} is required`;
    });
    // ["employee_email", "employee_phone"].forEach((key) => {
    //   if (!formData[key]) newErrors[key] = `${key} is required`;
    // });
    if (mode === "create") {
      const password = formData.employee_password;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!password) newErrors.employee_password = "Password is required";
      else if (!passwordRegex.test(password))
        newErrors.employee_password =
          "Password must include uppercase, lowercase, number & special char";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const preparePayload = () => {
    const permission_ids = [];
    Object.values(formData.permissions).forEach((module) => {
      Object.values(module).forEach((action) => {
        if (action.is_active && action.permission_id)
          permission_ids.push(action.permission_id);
      });
    });

    return {
      tenant_id: formData.company.tenant_id,
      name: formData.company.name,
      address: formData.company.address,
      latitude: parseFloat(formData.company.latitude),
      longitude: parseFloat(formData.company.longitude),
      is_active: formData.company.is_active,
      employee_email: formData.employee_email,
      employee_phone: formData.employee_phone,
      employee_password: formData.employee_password,
      permission_ids: [...new Set(permission_ids)],
    };
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = preparePayload();
    onSubmit(payload);
  };

  // ✅ NEW: Wrapper for map's setFormData to ensure it updates the company object correctly
  const setCompanyData = useCallback((updater) => {
    setFormData((prev) => ({
      ...prev,
      company: typeof updater === "function" ? updater(prev.company) : updater,
    }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === "create" ? "Create" : "Edit"}{" "}
              {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="flex justify-center items-center px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center w-full max-w-lg">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-300"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                step === 2 ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === 2 ? "bg-blue-600 text-white" : "bg-gray-300"
              }`}
            >
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
              Company & Employee Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {["tenant_id", "name", "address", "latitude", "longitude"].map(
                (field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.replace(/_/g, " ")} *
                    </label>
                    <input
                      type={
                        field === "latitude" || field === "longitude"
                          ? "number"
                          : "text"
                      }
                      value={formData.company[field] || ""}
                      onChange={(e) =>
                        handleInputChange("company", field, e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors[field] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors[field] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[field]}
                      </p>
                    )}
                  </div>
                )
              )}
              {["employee_email", "employee_phone", "employee_password"].map(
                (field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field
                        .replace(/_/g, " ")
                        .replace("employee ", "Employee ")}{" "}
                      {mode === "create" ? "*" : ""}
                    </label>
                    <input
                      type={field.includes("password") ? "password" : "text"}
                      value={formData[field] || ""}
                      onChange={(e) =>
                        handleInputChange("employee", field, e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors[field] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors[field] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[field]}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.company.is_active}
                onChange={(e) =>
                  handleInputChange("company", "is_active", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Is Active</span>
            </div>

            {/* ✅ UPDATED: Pass setCompanyData as the functional updater for map */}
            <div className="mt-4">
              <CompanyAddressMap
                formData={formData.company}
                setFormData={setCompanyData}
                isReadOnly={false} // Allow editing; set to true for view-only if needed
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-800 border-b pb-2 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-blue-600" /> Permissions
            </h3>

            {loading ? (
              <p>Loading permissions...</p>
            ) : (
              // ✅ 4-column layout instead of 3
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(formData.permissions).map(
                  ([module, actions]) => (
                    <div
                      key={module}
                      className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <label className="block font-medium text-gray-800 mb-2">
                        {module}
                      </label>
                      <div className="space-y-2">
                        {Object.entries(actions).map(([action, data]) => (
                          <label key={action} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={data.is_active || false}
                              onChange={(e) =>
                                handlePermissionChange(
                                  module,
                                  action,
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />{" "}
                {mode === "create" ? "Create" : "Update"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EntityModal;
