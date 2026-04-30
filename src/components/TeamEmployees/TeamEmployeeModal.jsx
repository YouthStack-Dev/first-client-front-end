import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ErrorDisplay from "../ui/ErrorDisplay";
import TeamsMap from "./TeamsMap";
import { fetchTeam } from "../../redux/features/user/userTrunk";
import { createEmployeeThunk, updateEmployeeThunk } from "../../redux/features/employees/employeesThunk";
import { logDebug } from "../../utils/logger";
import { API_CLIENT } from "../../Api/API_Client";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";

// ── Role filter rules ──────────────────────────────────────────────────────
// SuperAdmin → Admin + Employee system roles + all tenant-specific roles
// Company Admin → only tenant-specific roles (tenant_id matches)
const filterRoles = (roles = [], isSuperAdmin = false, tenantId = null) => {
  if (isSuperAdmin) {
    return roles.filter((r) => {
      // Allow system roles: Admin and Employee only
      if (r.is_system_role) {
        return ["Admin", "Employee"].includes(r.name);
      }
      // Allow all tenant-specific roles
      return true;
    });
  }
  // Company admin → only their tenant's non-system roles
  return roles.filter((r) => r.tenant_id === tenantId && !r.is_system_role);
};

const TeamEmployeeModal = ({
  isOpen,
  onClose,
  mode = "create",
  employeeData = null,
  onSuccess,
  tenantId = null,
}) => {
  const dispatch    = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isSuperAdmin = currentUser?.type === "admin";

  const [formData, setFormData] = useState({
    name:                     "",
    email:                    "",
    phone:                    "",
    alternate_phone:          "",
    employee_code:            "",
    gender:                   "",
    password:                 "",
    special_needs:            "",
    special_needs_start_date: "",
    special_needs_end_date:   "",
    address:                  "",
    latitude:                 "",
    longitude:                "",
    landmark:                 "",
    team_id:                  "",
    tenant_id:                "",
    is_active:                true,
    is_app_active:            true,
    role_id:                  "",
  });

  const [errors,             setErrors]             = useState(null);
  const [isEditing,          setIsEditing]          = useState(false);
  const [isSubmitting,       setIsSubmitting]       = useState(false);
  const [departments,        setDepartments]        = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [showPassword,       setShowPassword]       = useState(false);

  // ── Role states ────────────────────────────────────────────────────────
  const [roles,        setRoles]        = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // ── Fetch departments ──────────────────────────────────────────────────
  useEffect(() => {
    const loadDepartments = async () => {
      if (!isOpen) return;
      if (!tenantId) {
        setDepartments([]);
        return;
      }
      setLoadingDepartments(true);
      try {
        const data = await fetchTeam(tenantId);
        logDebug("Fetched departments:", data);
        setDepartments(data || []);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };
    loadDepartments();
  }, [isOpen, tenantId]);

  // ── Fetch roles — only in view/edit mode ──────────────────────────────
  // SuperAdmin → GET /iam/roles/?tenant_id=IBM001 then filter Admin+Employee+tenant roles
  // Company admin → GET /iam/roles/?tenant_id=IBM001 then filter tenant-only roles
  useEffect(() => {
    const loadRoles = async () => {
      if (!isOpen || mode !== "view") return;
      if (!tenantId) {
        setRoles([]);
        return;
      }
      setLoadingRoles(true);
      try {
        const response = await API_CLIENT.get("/iam/roles/", {
          params: { tenant_id: tenantId },
        });
        const allRoles = response.data?.data?.items || [];
        const filtered = filterRoles(allRoles, isSuperAdmin, tenantId);
        logDebug("Filtered roles:", filtered);
        setRoles(filtered);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    };
    loadRoles();
  }, [isOpen, mode, tenantId, isSuperAdmin]);

  // ── Initialize form data ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (employeeData) {
      setFormData({
        name:                     employeeData.name                     || "",
        email:                    employeeData.email                    || "",
        phone:                    employeeData.phone                    || "",
        alternate_phone:          employeeData.alternate_phone          || "",
        employee_code:            employeeData.employee_code            || "",
        gender:                   employeeData.gender                   || "",
        password:                 employeeData.password                 || "",
        special_needs:            employeeData.special_needs            || "",
        special_needs_start_date: employeeData.special_needs_start_date || "",
        special_needs_end_date:   employeeData.special_needs_end_date   || "",
        address:                  employeeData.address                  || "",
        latitude:                 employeeData.latitude                 || "",
        longitude:                employeeData.longitude                || "",
        landmark:                 employeeData.landmark                 || "",
        team_id:                  employeeData.team_id                  || "",
        tenant_id:                employeeData.tenant_id || tenantId   || "",
        is_active:                employeeData.is_active                ?? true,
        is_app_active:            employeeData.is_app_active            ?? true,
        role_id:                  employeeData.role_id                  || "",
      });
    } else {
      setFormData({
        name:                     "",
        email:                    "",
        phone:                    "",
        alternate_phone:          "",
        employee_code:            "",
        gender:                   "",
        password:                 "",
        special_needs:            "",
        special_needs_start_date: "",
        special_needs_end_date:   "",
        address:                  "",
        latitude:                 "",
        longitude:                "",
        landmark:                 "",
        team_id:                  "",
        tenant_id:                tenantId || "",
        is_active:                true,
        is_app_active:            true,
        role_id:                  "",
      });
    }
    setIsEditing(false);
    setErrors(null);
    setShowPassword(false);
  }, [isOpen, employeeData, tenantId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleDepartmentChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      team_id: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleRoleChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      role_id: selectedOption ? selectedOption.value : "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim())    newErrors.name    = "Name is required";
    if (!formData.email?.trim())   newErrors.email   = "Email is required";
    if (!formData.phone?.trim())   newErrors.phone   = "Phone is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.team_id)         newErrors.team_id = "Department is required";

    if (mode === "create" || (isEditing && formData.password)) {
      const password  = formData.password;
      const hasUpper  = /[A-Z]/.test(password);
      const hasLower  = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (!password || password.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        newErrors.password =
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
      }
    }

    if (formData.special_needs && formData.special_needs_start_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(formData.special_needs_start_date) < today) {
        newErrors.special_needs_start_date = "Special needs start date cannot be in the past";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors({ detail: Object.values(newErrors).join(", ") });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const sanitizedData = {
          ...formData,
          team_id:      formData.team_id ? parseInt(formData.team_id, 10) : null,
          special_needs:            formData.special_needs            || null,
          special_needs_start_date: formData.special_needs_start_date || null,
          special_needs_end_date:   formData.special_needs_end_date   || null,
          is_active:     formData.is_active,
          is_app_active: formData.is_app_active,
        };
        delete sanitizedData.role_id;
        Object.keys(sanitizedData).forEach((key) => {
          if (sanitizedData[key] === "") sanitizedData[key] = null;
        });

        await dispatch(createEmployeeThunk(sanitizedData)).unwrap();
        toast.success("Employee created successfully!");
        if (onSuccess) onSuccess();
        onClose();

      } else if (isEditing && employeeData?.employee_id) {
        const diffData = {};

        Object.keys(formData).forEach((key) => {
          const original = employeeData[key] === undefined ? "" : employeeData[key];
          const current  = formData[key]      === undefined ? "" : formData[key];

          if (typeof current === "boolean") {
            if (current !== original) diffData[key] = current;
            return;
          }
          if (current !== original) {
            diffData[key] = current === "" ? null : current;
          }
        });

        if ("team_id" in diffData) {
          diffData.team_id = diffData.team_id ? parseInt(diffData.team_id, 10) : null;
        }
        if ("role_id" in diffData) {
          diffData.role_id = diffData.role_id ? parseInt(diffData.role_id, 10) : null;
        }
        ["special_needs", "special_needs_start_date", "special_needs_end_date"].forEach((key) => {
          if (key in diffData && diffData[key] === "") diffData[key] = null;
        });

        if (Object.keys(diffData).length === 0) {
          toast.info("No changes to update");
          setIsEditing(false);
          setIsSubmitting(false);
          return;
        }

        // ✅ Capture the result from API
        const result = await dispatch(
          updateEmployeeThunk({ employeeId: employeeData.employee_id, employeeData: diffData })
        ).unwrap();
        console.log("UPDATE RESULT:", result);

        // ✅ Update formData with fresh data from API response
        const updatedEmployee = result?.data?.employee || null;
        if (updatedEmployee) {
          setFormData({
            name:                     updatedEmployee.name                     || "",
            email:                    updatedEmployee.email                    || "",
            phone:                    updatedEmployee.phone                    || "",
            alternate_phone:          updatedEmployee.alternate_phone          || "",
            employee_code:            updatedEmployee.employee_code            || "",
            gender:                   updatedEmployee.gender                   || "",
            password:                 "",
            special_needs:            updatedEmployee.special_needs            || "",
            special_needs_start_date: updatedEmployee.special_needs_start_date || "",
            special_needs_end_date:   updatedEmployee.special_needs_end_date   || "",
            address:                  updatedEmployee.address                  || "",
            latitude:                 updatedEmployee.latitude                 || "",
            longitude:                updatedEmployee.longitude                || "",
            landmark:                 updatedEmployee.landmark                 || "",
            team_id:                  updatedEmployee.team_id                  || "",
            tenant_id:                updatedEmployee.tenant_id || tenantId    || "",
            is_active:                updatedEmployee.is_active                ?? true,
            is_app_active:            updatedEmployee.is_app_active            ?? true,
            role_id:                  updatedEmployee.role_id                  || "",
          });
        }

        toast.success("Employee updated successfully!");
        setIsEditing(false);
        if (onSuccess) onSuccess(updatedEmployee);
        // ✅ Don't close — stay open so user sees fresh data
      }
    } catch (error) {
      console.error("Submission error:", error);
      const msg = typeof error === "string" ? error : error.message || "Failed to save employee";
      setErrors({ detail: msg });
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (employeeData) {
      setFormData({
        name:                     employeeData.name                     || "",
        email:                    employeeData.email                    || "",
        phone:                    employeeData.phone                    || "",
        alternate_phone:          employeeData.alternate_phone          || "",
        employee_code:            employeeData.employee_code            || "",
        gender:                   employeeData.gender                   || "",
        password:                 employeeData.password                 || "",
        special_needs:            employeeData.special_needs            || "",
        special_needs_start_date: employeeData.special_needs_start_date || "",
        special_needs_end_date:   employeeData.special_needs_end_date   || "",
        address:                  employeeData.address                  || "",
        latitude:                 employeeData.latitude                 || "",
        longitude:                employeeData.longitude                || "",
        landmark:                 employeeData.landmark                 || "",
        team_id:                  employeeData.team_id                  || "",
        tenant_id:                employeeData.tenant_id || tenantId   || "",
        is_active:                employeeData.is_active                ?? true,
        is_app_active:            employeeData.is_app_active            ?? true,
        role_id:                  employeeData.role_id                  || "",
      });
    }
    setErrors(null);
  };

  const isReadOnly = mode === "view" && !isEditing;

  const Toggle = ({ label, fieldName }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => !isReadOnly && handleToggleChange(fieldName)}
          disabled={isReadOnly}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
            ${formData[fieldName] ? "bg-blue-600" : "bg-gray-300"}
            ${isReadOnly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
            ${formData[fieldName] ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
        <span className="text-sm text-gray-600">
          {formData[fieldName] ? "Yes" : "No"}
        </span>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === "create" ? "Add Employee" : isEditing ? "Edit Employee" : "View Employee"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Sticky Error */}
        {errors && (
          <div className="sticky top-[81px] z-20 bg-white px-6 py-2 border-b">
            <ErrorDisplay error={errors} onClear={() => setErrors(null)} />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input type="text" name="name" value={formData.name}
                onChange={handleInputChange} disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="Enter name" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input type="email" name="email" value={formData.email}
                onChange={handleInputChange} disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="Enter email" />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input type="tel" name="phone" value={formData.phone}
                onChange={handleInputChange} disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="Enter phone number" />
            </div>

            {/* Employee Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
              <input type="text" name="employee_code" value={formData.employee_code}
                onChange={handleInputChange} disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="Enter employee code" />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="gender" value={formData.gender}
                onChange={handleInputChange} disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Alternate Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
              <input type="tel" name="alternate_phone" value={formData.alternate_phone}
                onChange={handleInputChange} disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="Enter alternate phone" />
            </div>

            {/* Password — create & edit */}
            {(mode === "create" || isEditing) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password" value={formData.password}
                    onChange={handleInputChange} disabled={isReadOnly}
                    className={`w-full border rounded px-3 py-2 pr-10 ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Enter password"
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <Select
                value={
                  formData.team_id
                    ? departments.find((d) => (d.team_id || d.id) === formData.team_id)
                      ? { value: formData.team_id, label: departments.find((d) => (d.team_id || d.id) === formData.team_id)?.name || "" }
                      : null
                    : null
                }
                onChange={handleDepartmentChange}
                options={departments.map((d) => ({ value: d.team_id || d.id, label: d.name }))}
                isDisabled={isReadOnly || loadingDepartments}
                isLoading={loadingDepartments}
                isClearable
                placeholder={!tenantId ? "No tenant selected" : loadingDepartments ? "Loading departments..." : "Select department"}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                    "&:hover": { borderColor: state.isFocused ? "#3b82f6" : "#9ca3af" },
                    backgroundColor: isReadOnly ? "#f3f4f6" : "white",
                    cursor: isReadOnly ? "not-allowed" : "default",
                  }),
                }}
              />
            </div>

            {/* ✅ Role — view/edit mode only, fetched & filtered by role rules */}
            {mode === "view" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                  {isSuperAdmin && (
                    <span className="ml-1 text-xs text-gray-400 normal-case font-normal">
                      (Admin, Employee & tenant roles)
                    </span>
                  )}
                </label>
                <Select
                  value={
                    formData.role_id
                      ? roles.find((r) => r.role_id === formData.role_id || r.role_id === parseInt(formData.role_id))
                        ? {
                            value: formData.role_id,
                            label: roles.find((r) => r.role_id === formData.role_id || r.role_id === parseInt(formData.role_id))?.name || "",
                          }
                        : null
                      : null
                  }
                  onChange={handleRoleChange}
                  options={roles.map((r) => ({ value: r.role_id, label: r.name }))}
                  isDisabled={isReadOnly || loadingRoles}
                  isLoading={loadingRoles}
                  isClearable
                  placeholder={
                    !tenantId        ? "No tenant selected"  :
                    loadingRoles     ? "Loading roles..."    :
                    roles.length === 0 ? "No roles available" :
                                       "Select role"
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                      "&:hover": { borderColor: state.isFocused ? "#3b82f6" : "#9ca3af" },
                      backgroundColor: isReadOnly ? "#f3f4f6" : "white",
                      cursor: isReadOnly ? "not-allowed" : "default",
                    }),
                  }}
                />
                {/* Hint for company admin */}
                {!isSuperAdmin && !loadingRoles && roles.length === 0 && tenantId && (
                  <p className="text-xs text-amber-600 mt-1">
                    No tenant-specific roles found. Create a role for this tenant first.
                  </p>
                )}
              </div>
            )}

            {/* Special Needs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Needs</label>
              <select name="special_needs" value={formData.special_needs}
                onChange={handleInputChange} disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}>
                <option value="">None</option>
                <option value="Wheelchair">Wheelchair</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Special Needs Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Needs Start Date</label>
              <input type="date" name="special_needs_start_date"
                value={formData.special_needs_start_date}
                onChange={handleInputChange}
                disabled={isReadOnly || !formData.special_needs}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full border rounded px-3 py-2 ${isReadOnly || !formData.special_needs ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Special Needs End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Needs End Date</label>
              <input type="date" name="special_needs_end_date"
                value={formData.special_needs_end_date}
                onChange={handleInputChange}
                disabled={isReadOnly || !formData.special_needs}
                className={`w-full border rounded px-3 py-2 ${isReadOnly || !formData.special_needs ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Active toggle */}
            <Toggle label="Employee Active"     fieldName="is_active"     />

            {/* App Active toggle */}
            <Toggle label="App Access" fieldName="is_app_active" />

          </div>

          {/* Address */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
            <TeamsMap formData={formData} setFormData={setFormData} isReadOnly={isReadOnly} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          {mode === "create" && (
            <>
              <button onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2">
                {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                Create Employee
              </button>
            </>
          )}

          {mode === "view" && !isEditing && (
            <>
              <button onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                Close
              </button>
              <button onClick={handleEdit}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors">
                Edit
              </button>
            </>
          )}

          {mode === "view" && isEditing && (
            <>
              <button onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-2">
                {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamEmployeeModal;