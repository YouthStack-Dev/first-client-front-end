import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import { API_CLIENT } from "../../Api/API_Client";
import endpoint from "../../Api/Endpoints";
import { logDebug, logError } from "../../utils/logger";
import { Modal } from "../SmallComponents";
import ErrorDisplay from "../ui/ErrorDisplay";

const TeamModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  mode = "create",
  userType = "admin",
  tenantOptions = [],
  selectedTenant = null,
}) => {
  const [formData, setFormData] = useState({
    tenant_id: "",
    department: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTenantOption, setSelectedTenantOption] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Determine initial mode from props
  const initialMode = initialData?.mode || mode;
  const isViewMode = initialMode === "view";
  const isCreateMode = initialMode === "create";

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      // Reset edit mode when modal opens
      setIsEditMode(false);

      if ((isViewMode || !isCreateMode) && initialData) {
        // For view or edit modes with initial data
        setFormData({
          tenant_id: initialData.tenant_id || "",
          department: initialData.department || initialData.name || "",
          description: initialData.description || "",
        });

        // Set selected tenant option if editing/viewing
        if (initialData.tenant_id && tenantOptions.length > 0) {
          const tenantOption = tenantOptions.find(
            (opt) => opt.value === initialData.tenant_id
          );
          if (tenantOption) {
            setSelectedTenantOption(tenantOption);
          }
        }
      } else {
        // Reset form for create mode
        setFormData({
          tenant_id: userType === "admin" ? "" : selectedTenant || "",
          department: "",
          description: "",
        });
        setSelectedTenantOption(null);
      }
      setError(null);
    }
  }, [
    isOpen,
    initialData,
    userType,
    selectedTenant,
    tenantOptions,
    isViewMode,
    isCreateMode,
  ]);

  // Set tenant for non-admin users
  useEffect(() => {
    if (userType !== "admin" && selectedTenant && !formData.tenant_id) {
      setFormData((prev) => ({
        ...prev,
        tenant_id: selectedTenant,
      }));
    }
  }, [userType, selectedTenant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleTenantSelect = (selectedOption) => {
    setSelectedTenantOption(selectedOption);
    setFormData((prev) => ({
      ...prev,
      tenant_id: selectedOption ? selectedOption.value : "",
    }));
    // Clear error when user selects
    if (error) {
      setError(null);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.department.trim()) {
      setError({ detail: "Department name is required" });
      return;
    }

    // For admin users, tenant_id is required
    if (userType === "admin" && !formData.tenant_id) {
      setError({ detail: "Tenant selection is required" });
      return;
    }

    // For non-admin users, ensure tenant_id is set
    if (userType !== "admin" && !formData.tenant_id) {
      setError({
        detail: "Tenant information is missing. Please contact administrator.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.department.trim(),
        description: formData.description || "",
        tenant_id: formData.tenant_id,
      };

      const teamId = initialData?.team_id || initialData?.id;
      const url =
        isEditMode && teamId
          ? `${endpoint.createTeam}${teamId}`
          : endpoint.createTeam;

      const method = isEditMode ? "put" : "post";

      logDebug(`Submitting team ${isEditMode ? "update" : "create"}:`, payload);
      const { data } = await API_CLIENT[method](url, payload);

      toast.success(
        isEditMode ? "Team updated successfully" : "Team created successfully"
      );

      // Call success callback
      onSuccess?.(data);

      // If editing from view mode, go back to view mode
      if (isEditMode && isViewMode) {
        setIsEditMode(false);
        // Update form with new data
        if (data.data?.team) {
          const updatedTeam = data.data.team;
          setFormData({
            tenant_id: updatedTeam.tenant_id || "",
            department: updatedTeam.department || updatedTeam.name || "",
            description: updatedTeam.description || "",
          });
        }
      } else {
        // Close modal for create or normal edit
        onClose?.();
        // Reset form
        setFormData({
          tenant_id: "",
          department: "",
          description: "",
        });
        setSelectedTenantOption(null);
      }
    } catch (error) {
      logError("Error saving team:", error);

      // Handle error response
      const errorData = error.response?.data || {
        detail: error.message || "Failed to save team",
      };
      setError(errorData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset edit mode when closing
    setIsEditMode(false);
    onClose?.();
  };

  // Custom styles for react-select
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: error?.tenant_id || error?.detail ? "#ef4444" : "#d1d5db",
      borderRadius: "0.5rem",
      minHeight: "2.5rem",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.2)" : "none",
      "&:hover": {
        borderColor: error?.tenant_id || error?.detail ? "#ef4444" : "#9ca3af",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.5rem",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#e0f2fe"
        : state.isFocused
        ? "#f8fafc"
        : "#ffffff",
      color: state.isSelected ? "#0369a1" : "#0f172a",
      "&:active": {
        backgroundColor: "#e0f2fe",
      },
    }),
  };

  const getModalTitle = () => {
    if (isViewMode) {
      return isEditMode ? "Edit Team" : "View Team";
    }
    return isEditMode ? "Edit Team" : "Create New Team";
  };

  // Determine if we should show edit toggle button
  const showEditToggle = isViewMode && !isEditMode;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={isViewMode && !isEditMode ? undefined : handleSubmit}
      title={getModalTitle()}
      size="md"
      mode={isViewMode ? "view" : isEditMode ? "edit" : "create"}
      isEditMode={isEditMode}
      onToggleEdit={toggleEditMode}
      showEditToggle={showEditToggle}
      isLoading={isLoading}
      submitText={isEditMode ? "Update" : "Create"}
      hideFooter={isViewMode && !isEditMode}
    >
      <div className="space-y-4">
        {/* Error Display */}
        {error && (
          <ErrorDisplay
            error={error}
            title="Validation Error"
            onClear={() => setError(null)}
          />
        )}

        {/* Tenant Selection - Only for admin users */}
        {userType === "admin" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant <span className="text-red-500">*</span>
            </label>
            <Select
              options={tenantOptions}
              value={selectedTenantOption}
              onChange={handleTenantSelect}
              isSearchable={true}
              placeholder="Search and select tenant..."
              noOptionsMessage={() => "No tenants found"}
              styles={selectStyles}
              isDisabled={
                isLoading ||
                (isViewMode && !isEditMode) ||
                (isEditMode && !isCreateMode)
              }
            />
            {error?.tenant_id && (
              <p className="mt-1 text-sm text-red-600">{error.tenant_id}</p>
            )}
            {!error?.tenant_id && error?.detail && (
              <p className="mt-1 text-sm text-red-600">{error.detail}</p>
            )}
          </div>
        )}

        {/* Show tenant info for non-admin users */}
        {userType !== "admin" && selectedTenant && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Tenant ID:</span> {selectedTenant}
            </p>
          </div>
        )}

        {/* Department Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            disabled={isLoading || (isViewMode && !isEditMode)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
              error?.department || (error?.detail && !formData.department)
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter department name"
          />
          {error?.department && (
            <p className="mt-1 text-sm text-red-600">{error.department}</p>
          )}
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
            disabled={isLoading || (isViewMode && !isEditMode)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            placeholder="Enter team description (optional)"
          />
        </div>
      </div>
    </Modal>
  );
};

export default TeamModal;
