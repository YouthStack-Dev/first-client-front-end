import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  Search,
  Trash2,
  Eye,
  Plus,
  Check,
  AlertCircle,
  Edit2,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectPolicies,
  policiesLoading,
  policiesLoaded,
  policiesError,
} from "../redux/features/Permissions/permissionsSlice";
import ReusableButton from "../components/ui/ReusableButton";
import { logDebug } from "../utils/logger";
import { fetchPoliciesThunk } from "../redux/features/Permissions/permissionsThunk";

const RoleForm = ({
  isOpen,
  onClose,
  onSubmit,
  mode = "create", // 'create', 'edit', or 'view'
  initialData = null,
  roleDetailsError = null,
}) => {
  const dispatch = useDispatch();

  // Redux selectors
  const policies = useSelector(selectPolicies);
  const loading = useSelector(policiesLoading);
  const loaded = useSelector(policiesLoaded);
  const policiesErrorState = useSelector(policiesError);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tenant_id: null,
    is_active: true,
    policy_ids: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [availablePolicies, setAvailablePolicies] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState([]);

  logDebug("the selected role in role form ", initialData);
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Fetch policies on mount if not loaded
  useEffect(() => {
    if (isOpen && !loaded) {
      const tenantId = initialData?.tenant_id || null;
      dispatch(fetchPoliciesThunk({ tenant_id: tenantId }));
    }
  }, [isOpen, loaded, dispatch, initialData?.tenant_id]);

  // Transform policies from Redux store to match expected format
  const transformPolicies = (apiPolicies) => {
    return apiPolicies.map((policy) => ({
      policy_id: policy.id || policy.policy_id,
      name: policy.name,
      description: policy.description || "",
      is_active: policy.is_active !== false,
      is_system_policy: policy.is_system_policy || false,
      tenant_id: policy.tenant_id,
      permissions: policy.permissions || [],
    }));
  };

  // Initialize form when modal opens or data changes
  useEffect(() => {
    if (!isOpen) return;

    if (policies && policies.length > 0) {
      const allPolicies = transformPolicies(policies);

      if (mode === "create") {
        // Clear everything for create mode
        setFormData({
          name: "",
          description: "",
          tenant_id: null,
          is_active: true,
          policy_ids: [],
        });
        setSelectedPolicies([]);
        setAvailablePolicies(allPolicies);
      } else if (initialData && (mode === "edit" || mode === "view")) {
        // Handle edit/view mode with initial data
        const selected =
          initialData.policies?.map((policy) => ({
            policy_id: policy.policy_id,
            name: policy.name,
            description: policy.description || "",
            is_active: policy.is_active !== false,
            is_system_policy: policy.is_system_policy || false,
            tenant_id: policy.tenant_id,
            permissions: policy.permissions || [],
          })) || [];

        const selectedIds = selected.map((p) => p.policy_id);

        setSelectedPolicies(selected);
        setAvailablePolicies(
          allPolicies.filter(
            (policy) => !selectedIds.includes(policy.policy_id)
          )
        );

        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
          tenant_id: initialData.tenant_id || null,
          is_active:
            initialData.is_active !== undefined ? initialData.is_active : true,
          policy_ids: selectedIds,
        });
      }
    }
  }, [isOpen, policies, mode, initialData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        tenant_id: null,
        is_active: true,
        policy_ids: [],
      });
      setSelectedPolicies([]);
      setAvailablePolicies([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  // Filter available policies based on search
  const filteredPolicies = availablePolicies.filter(
    (policy) =>
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPolicy = (policy) => {
    if (isViewMode) return;

    setSelectedPolicies((prev) => [...prev, policy]);
    setAvailablePolicies((prev) =>
      prev.filter((p) => p.policy_id !== policy.policy_id)
    );
    setFormData((prev) => ({
      ...prev,
      policy_ids: [...prev.policy_ids, policy.policy_id],
    }));
  };

  const handleRemovePolicy = (policyId) => {
    if (isViewMode) return;

    logDebug("Removing policy with ID:", policyId);

    const policyToRemove = selectedPolicies.find(
      (p) => p.policy_id === policyId
    );

    if (policyToRemove) {
      setSelectedPolicies((prev) =>
        prev.filter((p) => p.policy_id !== policyId)
      );
      setAvailablePolicies((prev) => [...prev, policyToRemove]);
      setFormData((prev) => ({
        ...prev,
        policy_ids: prev.policy_ids.filter((id) => id !== policyId),
      }));
    }
  };

  const handleInputChange = (field, value) => {
    if (isViewMode) return;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewMode) return onClose();

    const submitData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || "",
      is_active: formData.is_active,
      policy_ids: formData.policy_ids,
      ...(initialData?.role_id && { role_id: initialData.role_id }),
    };

    if (formData.tenant_id) {
      submitData.tenant_id = formData.tenant_id;
    }

    console.log("Submitting role data:", submitData);
    console.log("Policy IDs to submit:", submitData.policy_ids);
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isViewMode
                  ? "bg-gray-100"
                  : "bg-gradient-to-r from-blue-100 to-indigo-100"
              }`}
            >
              {isViewMode ? (
                <Eye className="w-5 h-5 text-gray-600" />
              ) : isEditMode ? (
                <Edit2 className="w-5 h-5 text-blue-600" />
              ) : (
                <Shield className="w-5 h-5 text-indigo-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isViewMode
                  ? "View Role Details"
                  : isEditMode
                  ? "Edit Role"
                  : "Create New Role"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isViewMode
                  ? "View role information and assigned policies"
                  : isEditMode
                  ? "Modify role details and assigned policies"
                  : "Define a new role and assign policies"}
              </p>
            </div>
          </div>
          <ReusableButton
            module="role"
            action="close"
            icon={X}
            title="Close Modal"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            size={20}
            showTooltip={false}
          />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Error Message from parent */}
              {roleDetailsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{roleDetailsError}</span>
                  </div>
                </div>
              )}

              {/* Policies Error */}
              {policiesErrorState && !loading && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>Failed to load policies: {policiesErrorState}</span>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Loading policies...</p>
                  </div>
                </div>
              )}

              {/* Basic Information Card */}
              {!loading && (
                <div
                  className={`rounded-xl p-6 border ${
                    isViewMode
                      ? "bg-gray-50 border-gray-200"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        disabled={isViewMode || loading}
                        className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          isViewMode || loading
                            ? "bg-gray-100 border-gray-300 text-gray-700"
                            : "bg-white border-gray-300"
                        }`}
                        placeholder="Enter role name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        disabled={isViewMode || loading}
                        rows={3}
                        className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          isViewMode || loading
                            ? "bg-gray-100 border-gray-300 text-gray-700"
                            : "bg-white border-gray-300"
                        }`}
                        placeholder="Enter role description"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) =>
                          handleInputChange("is_active", e.target.checked)
                        }
                        disabled={isViewMode || loading}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="is_active"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Active Role
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Policies Section */}
              {!loading && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {isCreateMode ? "Assign Policies" : "Assigned Policies"}
                    </h3>

                    {/* Search Bar - Only show in create/edit modes */}
                    {(isCreateMode || isEditMode) && (
                      <div className="mb-6">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search policies by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={loading}
                            className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                    )}

                    {/* Selected Policies */}
                    {selectedPolicies.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          {isViewMode
                            ? "Assigned Policies"
                            : "Selected Policies"}{" "}
                          ({selectedPolicies.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedPolicies.map((policy) => (
                            <div
                              key={policy.policy_id}
                              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-blue-900">
                                    {policy.name}
                                  </span>
                                  {policy.is_active ? (
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                                      <Check size={10} /> Active
                                    </span>
                                  ) : (
                                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded flex items-center gap-1">
                                      <AlertCircle size={10} /> Inactive
                                    </span>
                                  )}
                                  {policy.is_system_policy && (
                                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                      System
                                    </span>
                                  )}
                                </div>
                                {policy.description && (
                                  <p className="text-xs text-blue-700 mb-2">
                                    {policy.description}
                                  </p>
                                )}
                              </div>
                              {!isViewMode && (
                                <ReusableButton
                                  module="role"
                                  action="remove_policy"
                                  icon={Trash2}
                                  title={
                                    policy.is_system_policy && isEditMode
                                      ? "System policies cannot be removed"
                                      : "Remove policy"
                                  }
                                  onClick={() => {
                                    handleRemovePolicy(policy.policy_id);
                                    logDebug(
                                      "Remove policy from the role clicked",
                                      policy?.policy_id
                                    );
                                  }}
                                  className={`p-1 rounded transition-colors ml-2 ${
                                    policy.is_system_policy && isEditMode
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-red-500 hover:bg-red-100 hover:text-red-600"
                                  }`}
                                  disabled={
                                    policy.is_system_policy && isEditMode
                                  }
                                  size={16}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available Policies - Only show in create/edit modes */}
                    {(isCreateMode || isEditMode) &&
                      filteredPolicies.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Available Policies ({filteredPolicies.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                            {filteredPolicies.map((policy) => (
                              <div
                                key={policy.policy_id}
                                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                onClick={() => handleAddPolicy(policy)}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {policy.name}
                                    </span>
                                    {policy.is_active ? (
                                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                                        <Check size={10} /> Active
                                      </span>
                                    ) : (
                                      <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded flex items-center gap-1">
                                        <AlertCircle size={10} /> Inactive
                                      </span>
                                    )}
                                    {policy.is_system_policy && (
                                      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                        System
                                      </span>
                                    )}
                                  </div>
                                  {policy.description && (
                                    <p className="text-xs text-gray-600 mb-2">
                                      {policy.description}
                                    </p>
                                  )}
                                  <div className="mt-1">
                                    <span className="text-xs text-gray-500">
                                      {policy.permissions?.length || 0}{" "}
                                      permissions
                                    </span>
                                  </div>
                                </div>
                                <ReusableButton
                                  module="role"
                                  action="add_policy"
                                  icon={Plus}
                                  title="Add policy to role"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddPolicy(policy);
                                  }}
                                  className="text-gray-400 hover:text-gray-600 ml-2"
                                  size={16}
                                  showTooltip={true}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Empty States */}
                    {!loading &&
                      selectedPolicies.length === 0 &&
                      isViewMode && (
                        <div className="text-center py-8 text-gray-500">
                          <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm">
                            No policies assigned to this role
                          </p>
                        </div>
                      )}

                    {(isCreateMode || isEditMode) &&
                      !loading &&
                      filteredPolicies.length === 0 &&
                      searchTerm === "" &&
                      availablePolicies.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm">No policies available</p>
                        </div>
                      )}

                    {(isCreateMode || isEditMode) &&
                      !loading &&
                      filteredPolicies.length === 0 &&
                      searchTerm !== "" && (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm">
                            No policies found matching your search
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <ReusableButton
                  module="role"
                  action="cancel"
                  buttonName={isViewMode ? "Close" : "Cancel"}
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                  disabled={loading}
                  loading={loading}
                  loadingText="Cancelling..."
                  type="button"
                  showTooltip={false}
                />
                {!isViewMode && (
                  <ReusableButton
                    module="role"
                    action={isCreateMode ? "create" : "update"}
                    buttonName={isCreateMode ? "Create Role" : "Update Role"}
                    onClick={handleSubmit}
                    className="px-6 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    disabled={!formData.name.trim() || loading}
                    loading={loading}
                    loadingText={isCreateMode ? "Creating..." : "Updating..."}
                    type="submit"
                    showTooltip={false}
                  />
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;
