import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import { dummyPermission } from "../../staticData/permissionModules";

const ACTIONS = [
  {
    key: "canRead",
    label: "View",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    key: "canWrite",
    label: "Edit",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    key: "canDelete",
    label: "Delete",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    key: "canCreate",
    label: "Create",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    key: "canExport",
    label: "Export",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    key: "canApprove",
    label: "Approve",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
];

const RoleForm = ({
  isOpen,
  onClose,
  onSubmit,
  allowedModules = [],
  initialData = null,
  mode = "create", // 'create', 'edit', or 'view'
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
    isAssignable: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState("all");

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  useEffect(() => {
    if (initialData && (mode === "edit" || mode === "view")) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        permissions: initialData.permissions || [],
        isAssignable: initialData.isAssignable ?? true,
      });
    } else if (mode === "create") {
      setFormData({
        name: "",
        description: "",
        permissions: [],
        isAssignable: true,
      });
    }
  }, [initialData, mode]);

  // Extract categories from modules
  const categories = [
    "all",
    ...new Set(allowedModules?.map((m) => m.category).filter(Boolean)),
  ];

  // Filter modules based on search and category
  const modulesToShow = allowedModules
    ?.filter((m) => !m.isRestricted)
    .filter(
      (m) =>
        m.moduleKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (m) => selectedCategory === "all" || m.category === selectedCategory
    );

  const toggleModuleExpansion = (moduleKey) => {
    if (isViewMode) return; // Disable expansion in view mode
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleKey)) {
        newSet.delete(moduleKey);
      } else {
        newSet.add(moduleKey);
      }
      return newSet;
    });
  };

  const handlePermissionChange = (moduleKey, actionKey, checked) => {
    if (isViewMode) return; // Disable permission changes in view mode
    setFormData((prev) => {
      const existing = prev.permissions.find((p) => p.moduleKey === moduleKey);

      if (existing) {
        const updatedPermissions = prev.permissions.map((p) => {
          if (p.moduleKey === moduleKey) {
            return { ...p, [actionKey]: checked };
          }
          return p;
        });
        return { ...prev, permissions: updatedPermissions };
      } else if (checked) {
        return {
          ...prev,
          permissions: [...prev.permissions, { moduleKey, [actionKey]: true }],
        };
      }
      return prev;
    });
  };

  const handleSelectAll = (moduleKey, availableActions) => {
    if (isViewMode) return; // Disable select all in view mode
    setFormData((prev) => {
      const existing = prev.permissions.find((p) => p.moduleKey === moduleKey);
      const allSelected = availableActions.every(
        (action) => existing?.[action.key] === true
      );

      if (allSelected) {
        // Deselect all
        const updatedPermissions = prev.permissions.filter(
          (p) => p.moduleKey !== moduleKey
        );
        return { ...prev, permissions: updatedPermissions };
      } else {
        // Select all available actions
        const newPermissions = { moduleKey };
        availableActions.forEach((action) => {
          newPermissions[action.key] = true;
        });

        const otherPermissions = prev.permissions.filter(
          (p) => p.moduleKey !== moduleKey
        );
        return {
          ...prev,
          permissions: [...otherPermissions, newPermissions],
        };
      }
    });
  };

  const getAvailableActions = (module) => {
    return ACTIONS.filter((action) => module[action.key]);
  };

  const getPermission = (moduleKey, actionKey) => {
    const perm = formData.permissions.find((p) => p.moduleKey === moduleKey);
    return perm?.[actionKey] || false;
  };

  const isModuleSelected = (moduleKey) => {
    const perm = formData.permissions.find((p) => p.moduleKey === moduleKey);
    return (
      perm && Object.keys(perm).some((key) => key !== "moduleKey" && perm[key])
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isViewMode) return onClose();

    // Extract only the permission IDs
    const permissionIds = (formData.permissions || []).map((perm) => perm.id);

    const roleData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || "",
      isAssignable: !!formData.isAssignable,
      permissions: permissionIds,
    };

    console.log("Role data being submitted:", roleData);

    onSubmit(roleData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col">
        {/* Header - Fixed */}
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
                {isCreateMode && "Define role permissions and access levels"}
                {isEditMode && "Update role permissions and access levels"}
                {isViewMode && "View role information and permissions"}
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

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Role Information Card */}
              <div
                className={`rounded-xl p-6 border ${
                  isViewMode
                    ? "bg-gray-50 border-gray-200"
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Role Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      readOnly={isViewMode}
                      className={`w-full px-4 py-3 text-sm border rounded-lg transition-all duration-200 ${
                        isViewMode
                          ? "bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed"
                          : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      placeholder="Brief description of this role's responsibilities"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="isAssignable"
                    checked={formData.isAssignable}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isAssignable: e.target.checked,
                      }))
                    }
                    disabled={isViewMode}
                    className={`w-4 h-4 border-gray-300 rounded ${
                      isViewMode
                        ? "bg-gray-200 cursor-not-allowed"
                        : "text-blue-600 focus:ring-blue-500"
                    }`}
                  />
                  <label
                    htmlFor="isAssignable"
                    className={`text-sm font-medium ${
                      isViewMode ? "text-gray-500" : "text-gray-700"
                    }`}
                  >
                    This role can be assigned to users
                  </label>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Module Permissions
                  </h3>

                  {/* Search and Filter Bar - Hide in view mode */}
                  {!isViewMode && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search modules by name or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      {categories.length > 1 && (
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category === "all" ? "All Categories" : category}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Module Permissions Grid - Scrollable Container */}
                  <div className="max-h-[400px] overflow-y-auto pr-2">
                    {modulesToShow.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-lg font-medium">No modules found</p>
                        <p className="text-sm">
                          Try adjusting your search terms or category filter
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-2">
                        {modulesToShow.map((module) => {
                          const availableActions = getAvailableActions(module);
                          const isExpanded = expandedModules.has(
                            module.moduleKey
                          );
                          const isModuleActive = isModuleSelected(
                            module.moduleKey
                          );
                          const displayName =
                            module.name || module.moduleKey.replace(/_/g, " ");

                          return (
                            <div
                              key={module.moduleKey}
                              className={`border rounded-xl p-4 transition-all duration-200 ${
                                isModuleActive
                                  ? "border-blue-300 bg-blue-50 shadow-sm"
                                  : "border-gray-200 bg-white hover:shadow-md"
                              } ${isViewMode ? "cursor-default" : ""}`}
                            >
                              {/* Module Header */}
                              <div
                                className={`flex justify-between items-start mb-3 ${
                                  isViewMode ? "" : "cursor-pointer"
                                }`}
                                onClick={() =>
                                  !isViewMode &&
                                  toggleModuleExpansion(module.moduleKey)
                                }
                              >
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                                    {displayName}
                                  </h4>
                                  {module.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                      {module.description}
                                    </p>
                                  )}
                                </div>
                                {!isViewMode && availableActions.length > 0 && (
                                  <button
                                    type="button"
                                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleModuleExpansion(module.moduleKey);
                                    }}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )}
                                  </button>
                                )}
                              </div>

                              {/* Quick Select All - Hide in view mode */}
                              {!isViewMode && availableActions.length > 0 && (
                                <div className="mb-3">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectAll(
                                        module.moduleKey,
                                        availableActions
                                      );
                                    }}
                                    className={`w-full text-xs px-3 py-1 rounded-lg border transition-colors ${
                                      isModuleActive
                                        ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                                    }`}
                                  >
                                    {isModuleActive
                                      ? "Deselect All"
                                      : "Select All"}
                                  </button>
                                </div>
                              )}

                              {/* Permission Actions - Show expanded by default in view mode */}
                              {(isExpanded || isViewMode) &&
                                availableActions.length > 0 && (
                                  <div
                                    className={`space-y-2 ${
                                      !isViewMode
                                        ? "max-h-32 overflow-y-auto pr-1"
                                        : ""
                                    }`}
                                  >
                                    {availableActions.map((action) => {
                                      const isChecked = getPermission(
                                        module.moduleKey,
                                        action.key
                                      );

                                      return (
                                        <div
                                          key={action.key}
                                          className={`flex items-center gap-3 p-2 rounded-lg ${
                                            isViewMode
                                              ? ""
                                              : "hover:bg-white cursor-pointer"
                                          }`}
                                          onClick={(e) => {
                                            if (!isViewMode) {
                                              e.stopPropagation();
                                              handlePermissionChange(
                                                module.moduleKey,
                                                action.key,
                                                !isChecked
                                              );
                                            }
                                          }}
                                        >
                                          <div className="relative flex-shrink-0">
                                            {isViewMode ? (
                                              <div
                                                className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                                                  isChecked
                                                    ? "bg-blue-600 border-blue-600"
                                                    : "border-gray-300 bg-gray-100"
                                                }`}
                                              >
                                                {isChecked && (
                                                  <Check className="w-3 h-3 text-white" />
                                                )}
                                              </div>
                                            ) : (
                                              <>
                                                <input
                                                  type="checkbox"
                                                  checked={isChecked}
                                                  onChange={(e) =>
                                                    handlePermissionChange(
                                                      module.moduleKey,
                                                      action.key,
                                                      e.target.checked
                                                    )
                                                  }
                                                  className="sr-only"
                                                />
                                                <div
                                                  className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-200 ${
                                                    isChecked
                                                      ? "bg-blue-600 border-blue-600"
                                                      : "border-gray-300 bg-white hover:border-gray-400"
                                                  }`}
                                                >
                                                  {isChecked && (
                                                    <Check className="w-3 h-3 text-white" />
                                                  )}
                                                </div>
                                              </>
                                            )}
                                          </div>
                                          <span
                                            className={`text-xs font-medium px-2 py-1 rounded-full border ${
                                              isChecked
                                                ? action.color
                                                : "bg-gray-100 text-gray-600 border-gray-200"
                                            }`}
                                          >
                                            {action.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                              {/* Summary when collapsed - Only show in edit/create mode */}
                              {!isExpanded && !isViewMode && isModuleActive && (
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-1">
                                    {availableActions
                                      .map((action) => {
                                        const isChecked = getPermission(
                                          module.moduleKey,
                                          action.key
                                        );
                                        return isChecked ? (
                                          <span
                                            key={action.key}
                                            className={`text-xs px-2 py-1 rounded-full border ${action.color}`}
                                          >
                                            {action.label}
                                          </span>
                                        ) : null;
                                      })
                                      .filter(Boolean)}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Footer - Fixed */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {modulesToShow.length} modules available •{" "}
                {
                  formData.permissions.filter((p) =>
                    Object.keys(p).some((key) => key !== "moduleKey" && p[key])
                  ).length
                }{" "}
                modules configured
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
