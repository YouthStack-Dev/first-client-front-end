import React, { useState, useEffect } from "react";
import { X, Shield, Search, Trash2, Eye, Plus } from "lucide-react";

const RoleForm = ({
  isOpen,
  onClose,
  onSubmit,
  mode = "create", // 'create', 'edit', or 'view'
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: null,
    tenant_id: null,
    is_system_role: false,
    is_active: true,
    policy_ids: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [availablePolicies, setAvailablePolicies] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState([]);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Mock policies data - replace with your actual API call
  const mockPolicies = [
    {
      id: "POL-001",
      name: "Data Privacy Policy",
      description: "GDPR compliance policy",
    },
    {
      id: "POL-002",
      name: "Remote Work Policy",
      description: "Guidelines for remote work",
    },
    {
      id: "POL-003",
      name: "Code of Conduct",
      description: "Employee behavior standards",
    },
    {
      id: "POL-004",
      name: "Security Policy",
      description: "Information security guidelines",
    },
    {
      id: "POL-005",
      name: "Access Control Policy",
      description: "System access permissions",
    },
    {
      id: "POL-006",
      name: "Data Retention Policy",
      description: "Data storage and deletion rules",
    },
  ];

  useEffect(() => {
    if (initialData && (isEditMode || isViewMode)) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || null,
        tenant_id: initialData.tenant_id || null,
        is_system_role: initialData.is_system_role || false,
        is_active:
          initialData.is_active !== undefined ? initialData.is_active : true,
        policy_ids: initialData.policy_ids || [],
      });

      // Set selected policies based on policy_ids
      const selected = mockPolicies.filter((policy) =>
        initialData.policy_ids?.includes(policy.id)
      );
      setSelectedPolicies(selected);
    } else if (isCreateMode) {
      setFormData({
        name: "",
        description: null,
        tenant_id: null,
        is_system_role: false,
        is_active: true,
        policy_ids: [],
      });
      setSelectedPolicies([]);
    }

    // Set available policies (all policies minus selected ones)
    setAvailablePolicies(mockPolicies);
  }, [initialData, mode, isEditMode, isViewMode, isCreateMode]);

  // Filter available policies based on search
  const filteredPolicies = availablePolicies.filter(
    (policy) =>
      policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPolicy = (policy) => {
    if (isViewMode) return;

    setSelectedPolicies((prev) => [...prev, policy]);
    setAvailablePolicies((prev) => prev.filter((p) => p.id !== policy.id));
    setFormData((prev) => ({
      ...prev,
      policy_ids: [...prev.policy_ids, policy.id],
    }));
  };

  const handleRemovePolicy = (policyId) => {
    if (isViewMode) return;

    const policyToRemove = selectedPolicies.find((p) => p.id === policyId);
    if (policyToRemove) {
      setSelectedPolicies((prev) => prev.filter((p) => p.id !== policyId));
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
      ...formData,
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
    };

    console.log("Submitting role data:", submitData);
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isViewMode
                  ? "bg-gray-500"
                  : "bg-gradient-to-br from-purple-500 to-indigo-600"
              }`}
            >
              {isViewMode ? (
                <Eye className="w-5 h-5 text-white" />
              ) : (
                <Shield className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isCreateMode && "Create New Role"}
                {isEditMode && "Edit Role"}
                {isViewMode && "View Role Details"}
              </h2>
              <p className="text-sm text-gray-500">
                {isCreateMode &&
                  "Define role basic information and assign policies"}
                {isEditMode && "Update role information and policies"}
                {isViewMode && "View role information and assigned policies"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Basic Information Card */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Name{" "}
                      {!isViewMode && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      required={!isViewMode}
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      readOnly={isViewMode}
                      className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        isViewMode
                          ? "bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed"
                          : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      placeholder="e.g., Content Manager, System Administrator"
                    />
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      readOnly={isViewMode}
                      className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        isViewMode
                          ? "bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed"
                          : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      placeholder="Brief description of this role"
                    />
                  </div>

                  {/* System Role Toggle */}
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="is_system_role"
                      checked={formData.is_system_role}
                      onChange={(e) =>
                        handleInputChange("is_system_role", e.target.checked)
                      }
                      disabled={isViewMode}
                      className={`w-4 h-4 border-gray-300 rounded ${
                        isViewMode
                          ? "bg-gray-200 cursor-not-allowed"
                          : "text-blue-600 focus:ring-blue-500"
                      }`}
                    />
                    <label
                      htmlFor="is_system_role"
                      className={`text-sm font-medium ${
                        isViewMode ? "text-gray-500" : "text-gray-700"
                      }`}
                    >
                      System Role
                    </label>
                  </div>

                  {/* Active Status Toggle */}
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) =>
                        handleInputChange("is_active", e.target.checked)
                      }
                      disabled={isViewMode}
                      className={`w-4 h-4 border-gray-300 rounded ${
                        isViewMode
                          ? "bg-gray-200 cursor-not-allowed"
                          : "text-blue-600 focus:ring-blue-500"
                      }`}
                    />
                    <label
                      htmlFor="is_active"
                      className={`text-sm font-medium ${
                        isViewMode ? "text-gray-500" : "text-gray-700"
                      }`}
                    >
                      Active Role
                    </label>
                  </div>
                </div>
              </div>

              {/* Policies Section */}
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
                          placeholder="Search policies by name, ID or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Selected Policies - Show in all modes */}
                  {selectedPolicies.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        {isViewMode ? "Assigned Policies" : "Selected Policies"}{" "}
                        ({selectedPolicies.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedPolicies.map((policy) => (
                          <div
                            key={policy.id}
                            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-blue-900">
                                  {policy.name}
                                </span>
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                  {policy.id}
                                </span>
                              </div>
                              {policy.description && (
                                <p className="text-xs text-blue-700 mt-1">
                                  {policy.description}
                                </p>
                              )}
                            </div>
                            {!isViewMode && (
                              <button
                                type="button"
                                onClick={() => handleRemovePolicy(policy.id)}
                                className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Policies - Only show in create/edit modes */}
                  {(isCreateMode || isEditMode) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Available Policies ({filteredPolicies.length})
                      </h4>
                      {filteredPolicies.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm">
                            {searchTerm
                              ? "No policies found matching your search"
                              : "No policies available"}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                          {filteredPolicies.map((policy) => (
                            <div
                              key={policy.id}
                              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={() => handleAddPolicy(policy)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {policy.name}
                                  </span>
                                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    {policy.id}
                                  </span>
                                </div>
                                {policy.description && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {policy.description}
                                  </p>
                                )}
                              </div>
                              <Plus size={16} className="text-gray-400" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* View Mode - Show message if no policies */}
                  {isViewMode && selectedPolicies.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">
                        No policies assigned to this role
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {selectedPolicies.length} policies assigned
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  {isViewMode ? "Close" : "Cancel"}
                </button>
                {!isViewMode && (
                  <button
                    type="submit"
                    disabled={!formData.name.trim()}
                    className="px-6 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    {isCreateMode ? "Create Role" : "Update Role"}
                  </button>
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
