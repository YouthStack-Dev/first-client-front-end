import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import ErrorDisplay from "../ui/ErrorDisplay";
import TeamsMap from "./TeamsMap";
import { fetchTeam } from "../../redux/features/user/userTrunk";
import { createEmployeeThunk, updateEmployeeThunk } from "../../redux/features/employees/employeesThunk";
import { logDebug } from "../../utils/logger";

const TeamEmployeeModal = ({
  isOpen,
  onClose,
  mode = "create", // "create" | "view"
  employeeData = null,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    alternate_phone: "",
    employee_code: "",
    gender: "",
    password: "",
    special_needs: "",
    special_needs_start_date: "",
    special_needs_end_date: "",
    address: "",
    latitude: "",
    longitude: "",
    landmark: "",
    team_id: "",
    tenant_id: "",
  });

  const [errors, setErrors] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Fetch departments when modal opens
  useEffect(() => {
    const loadDepartments = async () => {
      if (isOpen) {
        setLoadingDepartments(true);
        try {
          const departmentsData = await fetchTeam();
          logDebug("Fetched departments:", departmentsData);
          setDepartments(departmentsData || []);
        } catch (error) {
          console.error("Failed to fetch departments:", error);
          setDepartments([]);
        } finally {
          setLoadingDepartments(false);
        }
      }
    };
    loadDepartments();
  }, [isOpen]);

  // Initialize form data when modal opens or employeeData changes
  useEffect(() => {
    if (isOpen) {
      if (employeeData) {
        setFormData({
          name: employeeData.name || "",
          email: employeeData.email || "",
          phone: employeeData.phone || "",
          alternate_phone: employeeData.alternate_phone || "",
          employee_code: employeeData.employee_code || "",
          gender: employeeData.gender || "",
          password: employeeData.password || "",
          special_needs: employeeData.special_needs || "",
          special_needs_start_date: employeeData.special_needs_start_date || "",
          special_needs_end_date: employeeData.special_needs_end_date || "",
          address: employeeData.address || "",
          latitude: employeeData.latitude || "",
          longitude: employeeData.longitude || "",
          landmark: employeeData.landmark || "",
          team_id: employeeData.team_id || "",
          tenant_id: employeeData.tenant_id || "",
        });
      } else {
        // Reset for create mode
        setFormData({
          name: "",
          email: "",
          phone: "",
          alternate_phone: "",
          employee_code: "",
          gender: "",
          password: "",
          special_needs: "",
          special_needs_start_date: "",
          special_needs_end_date: "",
          address: "",
          latitude: "",
          longitude: "",
          landmark: "",
          team_id: "",
          tenant_id: "",
        });
      }
      setIsEditing(false);
      setErrors(null);
    }
  }, [isOpen, employeeData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (selectedOption) => {
    logDebug("Selected department:", selectedOption);
    setFormData((prev) => ({ 
      ...prev, 
      team_id: selectedOption ? selectedOption.value : "" 
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.team_id) newErrors.team_id = "Department is required";
    
    // Password complexity validation
    if (mode === "create" || (isEditing && formData.password)) {
      const password = formData.password;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (password.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        newErrors.password = "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";
      }
    }

    // Special Needs Validation
    if (formData.special_needs) {
      if (formData.special_needs_start_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(formData.special_needs_start_date);
        if (startDate < today) {
          newErrors.special_needs_start_date = "Special needs start date cannot be in the past";
        }
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
        // Sanitize data for creation - include everything
        const sanitizedData = {
          ...formData,
          team_id: formData.team_id ? parseInt(formData.team_id, 10) : null,
          special_needs: formData.special_needs || null,
          special_needs_start_date: formData.special_needs_start_date || null,
          special_needs_end_date: formData.special_needs_end_date || null,
        };

        // Ensure empty strings are null
        Object.keys(sanitizedData).forEach(key => {
          if (sanitizedData[key] === "") {
            sanitizedData[key] = null;
          }
        });

        await dispatch(createEmployeeThunk(sanitizedData)).unwrap();
        toast.success("Employee created successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else if (isEditing && employeeData?.employee_id) {
        // Partial update logic: send only changed fields
        const diffData = {};
        
        Object.keys(formData).forEach(key => {
          // Never send password during update based on user request
          if (key === 'password') return;
          
          // Compare with original data to find changes
          const originalValue = employeeData[key] === undefined ? "" : employeeData[key];
          const currentValue = formData[key] === undefined ? "" : formData[key];
          
          if (currentValue !== originalValue) {
            diffData[key] = currentValue === "" ? null : currentValue;
          }
        });

        // Special handling for team_id if it's among changes
        if ('team_id' in diffData) {
          diffData.team_id = diffData.team_id ? parseInt(diffData.team_id, 10) : null;
        }
        
        // Ensure specific enums/dates are null if empty in diff
        ['special_needs', 'special_needs_start_date', 'special_needs_end_date'].forEach(key => {
          if (key in diffData && diffData[key] === "") {
            diffData[key] = null;
          }
        });

        if (Object.keys(diffData).length === 0) {
          toast.info("No changes to update");
          setIsEditing(false);
          setIsSubmitting(false);
          return;
        }

        await dispatch(updateEmployeeThunk({ 
          employeeId: employeeData.employee_id, 
          employeeData: diffData 
        })).unwrap();
        
        toast.success("Employee updated successfully!");
        setIsEditing(false);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ detail: typeof error === 'string' ? error : (error.message || "Failed to save employee") });
      toast.error(typeof error === 'string' ? error : (error.message || "Failed to save employee"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset to original data
    if (employeeData) {
      setFormData({
        name: employeeData.name || "",
        email: employeeData.email || "",
        phone: employeeData.phone || "",
        alternate_phone: employeeData.alternate_phone || "",
        employee_code: employeeData.employee_code || "",
        gender: employeeData.gender || "",
        password: employeeData.password || "",
        special_needs: employeeData.special_needs || "",
        special_needs_start_date: employeeData.special_needs_start_date || "",
        special_needs_end_date: employeeData.special_needs_end_date || "",
        address: employeeData.address || "",
        latitude: employeeData.latitude || "",
        longitude: employeeData.longitude || "",
        landmark: employeeData.landmark || "",
        team_id: employeeData.team_id || "",
        tenant_id: employeeData.tenant_id || "",
      });
    }
    setErrors(null);
  };

  const isReadOnly = mode === "view" && !isEditing;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === "create"
              ? "Add Team Employee"
              : isEditing
              ? "Edit Team Employee"
              : "View Team Employee"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sticky Error Display */}
        {errors && (
          <div className="sticky top-[81px] z-20 bg-white px-6 py-2 border-b">
            <ErrorDisplay
              error={errors}
              onClear={() => setErrors(null)}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">

          {/* Basic Info Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${
                  isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                placeholder="Enter name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${
                  isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${
                  isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Code
              </label>
              <input
                type="text"
                name="employee_code"
                value={formData.employee_code}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${
                  isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                placeholder="Enter employee code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${
                  isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternate Phone
              </label>
              <input
                type="tel"
                name="alternate_phone"
                value={formData.alternate_phone}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${
                  isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                placeholder="Enter alternate phone"
              />
            </div>

            {mode === "create" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`w-full border rounded px-3 py-2 ${
                    isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder="Enter password"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <Select
                value={
                  formData.team_id
                    ? departments.find((dept) => (dept.team_id || dept.id) === formData.team_id)
                      ? {
                          value: formData.team_id,
                          label: departments.find((dept) => (dept.team_id || dept.id) === formData.team_id)?.name || ""
                        }
                      : null
                    : null
                }
                onChange={handleDepartmentChange}
                options={departments.map((dept) => ({
                  value: dept.team_id || dept.id,
                  label: dept.name,
                }))}
                isDisabled={isReadOnly || loadingDepartments}
                isLoading={loadingDepartments}
                isClearable
                placeholder="Select department"
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                    '&:hover': {
                      borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
                    },
                    backgroundColor: isReadOnly ? '#f3f4f6' : 'white',
                    cursor: isReadOnly ? 'not-allowed' : 'default',
                  }),
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Needs
              </label>
              <select
                name="special_needs"
                value={formData.special_needs}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full border rounded px-3 py-2 ${
                  isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                <option value="">None</option>
                <option value="Wheelchair">Wheelchair</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Other">Other</option>
              </select>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Needs Start Date
              </label>
              <input
                type="date"
                name="special_needs_start_date"
                value={formData.special_needs_start_date}
                onChange={handleInputChange}
                disabled={isReadOnly || !formData.special_needs}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full border rounded px-3 py-2 ${
                  (isReadOnly || !formData.special_needs) ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Needs End Date
              </label>
              <input
                type="date"
                name="special_needs_end_date"
                value={formData.special_needs_end_date}
                onChange={handleInputChange}
                disabled={isReadOnly || !formData.special_needs}
                className={`w-full border rounded px-3 py-2 ${
                  (isReadOnly || !formData.special_needs) ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>

          {/* Address Section with Map */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Address Information
            </h3>
            <TeamsMap
              formData={formData}
              setFormData={setFormData}
              isReadOnly={isReadOnly}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          {mode === "create" && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                Create Employee
              </button>
            </>
          )}

          {mode === "view" && !isEditing && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Edit
              </button>
            </>
          )}

          {mode === "view" && isEditing && (
            <>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
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