import { FileText, Plus, UsersRound } from "lucide-react";
import ToolBar from "../ui/ToolBar";
import { logDebug } from "../../utils/logger";
import { useEffect, useState, useMemo } from "react";
import { PolicyTable } from "./PolicyCard";
import { PolicyForm } from "../modals/PolicyFromModal";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { selectPermissions } from "../../redux/features/auth/authSlice";
import {
  policiesError,
  policiesLoaded,
  policiesLoading,
  selectPolicies,
} from "../../redux/features/Permissions/permissionsSlice";
import {
  createPolicy,
  fetchPoliciesThunk,
  updatePolicy,
} from "../../redux/features/Permissions/permissionsThunk";

const PoliciesManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // "view" | "edit" | "create"
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [apiError, setApiError] = useState(null); // State for API errors

  const permission = useSelector(selectPermissions);
  const dispatch = useDispatch();
  const policies = useSelector(selectPolicies);
  const policiesLoadedStatus = useSelector(policiesLoaded);
  const policiesLoadingStatus = useSelector(policiesLoading);
  const policiesErrorStatus = useSelector(policiesError);

  useEffect(() => {
    if (!policiesLoadedStatus && !policiesLoadingStatus) {
      dispatch(fetchPoliciesThunk());
    }
  }, [dispatch, policiesLoadedStatus, policiesLoadingStatus]);

  // Clear API error when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      setApiError(null);
    }
  }, [isModalOpen]);

  // Prepare filter options for react-select
  const filterOptions = [
    { value: "all", label: "All Policies" },
    { value: "active", label: "Active Policies" },
    { value: "inactive", label: "Inactive Policies" },
  ];

  // Prepare searchable options for react-select (for policy selection)
  const policyOptions = useMemo(
    () =>
      policies.map((policy) => ({
        value: policy.id,
        label: policy.name,
        description: policy.description,
        policy, // Store the full policy object
      })),
    [policies]
  );

  const handleAddClick = () => {
    setModalMode("create");
    setSelectedPolicy(null);
    setApiError(null); // Clear any previous errors
    setIsModalOpen(true);
    logDebug("Add Policy button clicked", "Creating new policy");
  };

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setModalMode("view");
    setApiError(null); // Clear any previous errors
    setIsModalOpen(true);
    logDebug(`Viewing policy: ${policy.name} (ID: ${policy.policy_id})`);
  };

  const handleDelete = (policy) => {
    if (confirm(`Are you sure you want to delete "${policy.name}"?`)) {
      logDebug(`Deleted policy: ${policy.name}`);
      alert(`Deleted policy: ${policy.name}`);
    }
  };

  // Helper function to extract error message from backend response
  const extractErrorMessage = (error) => {
    // Handle different error formats
    if (error?.detail) {
      if (Array.isArray(error.detail)) {
        // Format: {"detail": [{"type": "...", "msg": "...", ...}]}
        return error.detail.map((item) => item.msg || item.type).join(", ");
      } else if (typeof error.detail === "string") {
        // Format: {"detail": "Error message"}
        return error.detail;
      }
    } else if (error?.message) {
      // Standard error message
      return error.message;
    } else if (typeof error === "string") {
      // Plain string error
      return error;
    }

    return "Something went wrong. Please try again.";
  };

  const handleSavePermissions = async (permissionsData, mode) => {
    // 🔁 Normalize data for backend
    const payload = {
      name: permissionsData.name,
      description: permissionsData.description ?? null,
      is_active: permissionsData.isActive ?? true,
      permission_ids: permissionsData.permission_ids || [],
    };

    try {
      let result;

      if (mode === "create") {
        logDebug("Creating new policy with payload:", payload);
        result = await dispatch(createPolicy(payload)).unwrap();

        // Refresh the policies list after successful creation
        await dispatch(fetchPoliciesThunk());

        alert("New policy created successfully!");
        // Close modal on success
        setIsModalOpen(false);
        setSelectedPolicy(null);
        setModalMode("view");
        setApiError(null);
      } else if (mode === "edit") {
        logDebug(`Updating policy: ${selectedPolicy.name}`);
        logDebug("Payload:", payload);

        // Ensure policyId is a number, not string "undefined"
        const policyId = selectedPolicy.policy_id;
        if (isNaN(policyId) || policyId === "undefined") {
          throw new Error("Invalid policy ID");
        }

        result = await dispatch(
          updatePolicy({
            policyId: Number(policyId), // Convert to number
            payload,
          })
        ).unwrap();

        // Refresh the policies list after successful update
        await dispatch(fetchPoliciesThunk());

        alert(`Permissions updated for ${selectedPolicy.name}`);
        // Close modal on success
        setIsModalOpen(false);
        setSelectedPolicy(null);
        setModalMode("view");
        setApiError(null);
      }
    } catch (error) {
      console.error("Policy save failed:", error);

      // Extract and set the error message
      const errorMessage = extractErrorMessage(error);
      setApiError(errorMessage);

      // Don't close the modal on error - let user see and fix the error
      // Only show alert if you want a popup too
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCloseModal = () => {
    logDebug("Policy form closed");
    setIsModalOpen(false);
    setSelectedPolicy(null);
    setModalMode("view");
    setApiError(null); // Clear errors when modal closes
  };

  const handleModeChange = (newMode) => {
    logDebug(`Mode changed to: ${newMode}`);
    setModalMode(newMode);
    setApiError(null); // Clear errors when mode changes
  };

  // Handle policy selection from react-select dropdown
  const handlePolicySelect = (selectedOption) => {
    if (selectedOption && selectedOption.policy) {
      handleEdit(selectedOption.policy);
    }
  };

  // Filter policies based on search query and selected filter
  const filteredPolicies = useMemo(() => {
    let result = policies.filter(
      (policy) =>
        policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.policy_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply additional filter if selected
    if (selectedFilter && selectedFilter.value !== "all") {
      result = result.filter((policy) => {
        if (selectedFilter.value === "active") return policy.is_active === true;
        if (selectedFilter.value === "inactive") {
          logDebug(" this is the   filter state ", selectedFilter);
          return policy.is_active === false;
        }
      });
    }

    return result;
  }, [policies, searchQuery, selectedFilter]);

  // Custom styles for react-select
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#eff6ff"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      "&:active": {
        backgroundColor: "#2563eb",
      },
    }),
  };

  // Helper function for creating new policy
  const handleCreateNew = () => {
    handleAddClick();
  };

  return (
    <div className="">
      <ToolBar
        module={"policy"}
        onAddClick={handleAddClick}
        addButtonLabel="Policy"
        className="p-4 bg-white border rounded shadow-sm mb-4"
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* React Select for quick policy search/selection */}
            <div className="w-full sm:w-64">
              <Select
                options={policyOptions}
                onChange={handlePolicySelect}
                placeholder="Select a policy..."
                isClearable
                isSearchable
                styles={selectStyles}
                className="text-sm"
                formatOptionLabel={({ label, description }) => (
                  <div className="py-1">
                    <div className="font-medium">{label}</div>
                    {description && (
                      <div className="text-xs text-gray-500 truncate">
                        {description}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>

            {/* React Select for filtering */}
            <div className="w-full sm:w-48">
              <Select
                options={filterOptions}
                value={selectedFilter}
                onChange={setSelectedFilter}
                placeholder="Filter by..."
                isClearable
                styles={selectStyles}
                className="text-sm"
                defaultValue={filterOptions[0]}
              />
            </div>
          </div>
        }
      />

      <div className="px-5">
        {filteredPolicies.length > 0 ? (
          <PolicyTable
            policies={filteredPolicies}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="text-gray-700 text-lg font-medium mb-2">
                {searchQuery || selectedFilter
                  ? "No policies found"
                  : "No policies available"}
              </div>
              <div className="text-gray-500 text-sm max-w-md mx-auto">
                {searchQuery || selectedFilter
                  ? "Try adjusting your search terms or filters"
                  : "Get started by creating your first policy"}
              </div>
              <button
                onClick={handleCreateNew}
                className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus className="mr-2" size={18} />
                Create New Policy
              </button>
            </div>
          </div>
        )}
      </div>

      <PolicyForm
        policy={selectedPolicy}
        isOpen={isModalOpen}
        onSave={handleSavePermissions}
        onClose={handleCloseModal}
        mode={modalMode}
        onModeChange={handleModeChange}
        apiError={apiError} // Pass API error to form
        clearApiError={() => setApiError(null)} // Function to clear error
      />
    </div>
  );
};

export default PoliciesManagement;
