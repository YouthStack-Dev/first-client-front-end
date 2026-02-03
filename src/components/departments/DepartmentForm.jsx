// components/departments/DepartmentForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { API_CLIENT } from "../../Api/API_Client";
import { logDebug, logError } from "../../utils/logger";
import { fetchTeam } from "../../redux/features/user/userTrunk";
import { setDepartments } from "../../redux/features/user/userSlice";
import { useDispatch } from "react-redux";
import endpoint from "../../Api/Endpoints";
import { Modal } from "../SmallComponents";
// import Modal from "../Common/Modal"; // Import the reusable Modal

const DepartmentForm = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  mode = "create",
  companyOptions = [],
  selectedCompany = "",
  userType = "admin",
}) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  // Determine mode from initialData if not explicitly provided
  const currentMode = mode || (initialData ? "edit" : "create");
  const isEditMode = currentMode === "edit";

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
        });
      } else {
        // Reset form for create mode
        setFormData({ name: "", description: "" });
      }
    }
  }, [isOpen, isEditMode, initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Team name is required");
      return;
    }

    // For non-admin users, ensure we have a selected company
    if (userType !== "admin" && !selectedCompany) {
      toast.error("Company information is required");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare payload with company/tenant info
      const payload = {
        ...formData,
        tenant_id: selectedCompany, // Always include tenant_id
      };

      const urlpoint = isEditMode
        ? `${endpoint.createTeam}${initialData.department_id || initialData.id}`
        : endpoint.createTeam;

      const method = isEditMode ? "put" : "post";
      const { data } = await API_CLIENT[method](urlpoint, payload);

      toast.success(
        isEditMode
          ? "Department updated successfully"
          : "Department created successfully"
      );

      // Fetch and update departments
      const departments = await fetchTeam();
      dispatch(setDepartments(departments));

      // Call success callback
      onSuccess?.(data);

      // Close modal
      onClose?.();

      // Reset form
      setFormData({ name: "", description: "" });
    } catch (error) {
      logError("Error saving department:", error);

      // Handle error response
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to save department";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare modal title
  const getModalTitle = () => {
    return isEditMode ? "Edit Department" : "Create New Department";
  };

  // Get company name for display
  const getCompanyName = () => {
    if (!selectedCompany) return "";
    const company = companyOptions.find((opt) => opt.value === selectedCompany);
    return company ? ` (${company.label})` : "";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={getModalTitle()}
      size="sm"
      mode={currentMode}
      isLoading={isLoading}
      submitText={isEditMode ? "Update" : "Create"}
    >
      <div className="space-y-4">
        {/* Show company info for non-admin users or when company is selected */}
        {selectedCompany && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Company:</span>
              {getCompanyName() || ` (ID: ${selectedCompany})`}
            </p>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            placeholder="Enter department name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            placeholder="Enter department description (optional)"
          />
        </div>

        {/* Hidden field for company selection (for admin users) */}
        {userType === "admin" && selectedCompany && (
          <input type="hidden" name="tenant_id" value={selectedCompany} />
        )}
      </div>
    </Modal>
  );
};

export default DepartmentForm;
