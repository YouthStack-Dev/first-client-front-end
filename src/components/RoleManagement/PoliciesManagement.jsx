import { UsersRound } from "lucide-react";
import ToolBar from "../ui/ToolBar";
import SearchBar from "./SearchBar";
import { logDebug } from "../../utils/logger";
import { useEffect, useState, useMemo } from "react";
import { PolicyCard } from "./PolicyCard";
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
import { fetchPoliciesThunk } from "../../redux/features/Permissions/permissionsThunk";

const PoliciesManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // "view" | "edit" | "create"
  const [selectedFilter, setSelectedFilter] = useState(null);

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
    setIsModalOpen(true);
    logDebug("Add Policy button clicked", "Creating new policy");
  };

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setModalMode("view");
    setIsModalOpen(true);
    logDebug(`Viewing policy: ${policy.name} (ID: ${policy.id})`);
  };

  const handleDelete = (policy) => {
    if (confirm(`Are you sure you want to delete "${policy.name}"?`)) {
      logDebug(`Deleted policy: ${policy.name}`);
      alert(`Deleted policy: ${policy.name}`);
    }
  };

  const handleSavePermissions = (permissions, mode) => {
    if (mode === "create") {
      logDebug("Creating new policy with permissions:", permissions);
      alert("New policy created successfully!");
    } else {
      logDebug(`Saving permissions for: ${selectedPolicy.name}`);
      logDebug("Permissions data:", permissions);
      alert(`Permissions updated for ${selectedPolicy.name}`);
    }

    setIsModalOpen(false);
    setSelectedPolicy(null);
    setModalMode("view");
  };

  const handleCloseModal = () => {
    logDebug("Policy form closed");
    setIsModalOpen(false);
    setSelectedPolicy(null);
    setModalMode("view");
  };

  const handleModeChange = (newMode) => {
    logDebug(`Mode changed to: ${newMode}`);
    setModalMode(newMode);
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

  return (
    <div className="">
      <ToolBar
        module={"policy"}
        onAddClick={handleAddClick}
        addButtonLabel="Policy"
        addButtonIcon={<UsersRound size={16} />}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
        {filteredPolicies.map((policy) => (
          <PolicyCard
            key={policy.policy_id}
            policy={policy}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}

        {filteredPolicies.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 text-lg">
              {searchQuery || selectedFilter
                ? `No policies found matching your criteria`
                : "No policies available"}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              {searchQuery || selectedFilter
                ? "Try adjusting your search terms or filters"
                : "Create your first policy to get started"}
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
      />
    </div>
  );
};

export default PoliciesManagement;
