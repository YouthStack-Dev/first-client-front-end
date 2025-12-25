import React, { useState, useEffect } from "react";
import { Save, X, Edit, Eye } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ModuleCard } from "../RoleManagement/ModuleCard";
import { dummyPermission } from "../../staticData/permissionModules";
import { useSelector } from "react-redux";
import { selectPermissions } from "../../redux/features/auth/authSlice";
import { transformPermissionsForMode } from "../../utils/permissionModules";

export const PolicyForm = ({
  policy,
  onSave,
  onClose,
  isOpen,
  mode,
  onModeChange,
  apiError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [currentMode, setCurrentMode] = useState(mode);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const permission = useSelector(selectPermissions);

  // Get all available permissions from dummyPermission
  const allPermissions = dummyPermission;
  // Reset and load permissions when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);

      // Simulate loading delay
      setTimeout(() => {
        // Initialize form data based on mode and policy
        if (mode === "create") {
          setFormData({
            name: "",
            description: "",
            isActive: true,
          });
        } else if (policy) {
          setFormData({
            name: policy.name || "",
            description: policy.description || "",
            isActive: policy.is_active !== undefined ? policy.is_active : true,
          });
        }

        // Transform permissions based on mode
        const transformedPermissions = transformPermissionsForMode(
          mode,
          policy,
          allPermissions
        );
        setPermissions(transformedPermissions);
        setCurrentMode(mode);

        setIsLoading(false);
      }, 100); // Small delay for smooth transition
    }
  }, [isOpen, mode, policy]);

  const handleSave = () => {
    // Collect enabled permission IDs
    const enabledPermissionIds = permissions
      .flatMap((module) => module.actions)
      .filter((action) => action.enabled)
      .map((action) => action.permission_id);

    const saveData = {
      ...formData,
      permission_ids: enabledPermissionIds,
    };

    onSave(saveData, currentMode);
  };

  const toggleAction = (moduleIndex, actionIndex) => {
    // Allow toggling in both edit AND create modes
    if (currentMode !== "edit" && currentMode !== "create") return;

    const newPermissions = [...permissions];
    newPermissions[moduleIndex].actions[actionIndex].enabled =
      !newPermissions[moduleIndex].actions[actionIndex].enabled;
    setPermissions(newPermissions);
  };

  const toggleAllModuleActions = (moduleIndex, enable) => {
    // Allow toggling in both edit AND create modes
    if (currentMode !== "edit" && currentMode !== "create") return;

    const newPermissions = [...permissions];
    newPermissions[moduleIndex].actions.forEach((action) => {
      action.enabled = enable;
    });
    setPermissions(newPermissions);
  };

  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);

    // When switching to edit mode from view, keep the current permissions
    if (newMode === "edit") {
      // Permissions are already loaded, no need to reload
    }

    // When switching to view mode from edit, reload permissions from policy
    if (newMode === "view") {
      const transformedPermissions = transformPermissionsForMode("view");
      setPermissions(transformedPermissions);
    }

    onModeChange?.(newMode);
  };

  const handleInputChange = (field, value) => {
    if (currentMode !== "edit" && currentMode !== "create") return;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleActiveStatus = () => {
    if (currentMode !== "edit" && currentMode !== "create") return;

    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  const getTitle = () => {
    switch (currentMode) {
      case "create":
        return "Create New Policy";
      case "edit":
        return "Edit Policy";
      case "view":
      default:
        return "Policy Details";
    }
  };

  const getDescription = () => {
    switch (currentMode) {
      case "create":
        return "Configure permissions for the new policy";
      case "edit":
        return "Modify permissions for this policy";
      case "view":
      default:
        return "View policy permissions and details";
    }
  };

  // Quick actions for both create and edit modes
  const handleEnableAll = () => {
    if (currentMode !== "edit" && currentMode !== "create") return;

    const newPermissions = permissions.map((module) => ({
      ...module,
      actions: module.actions.map((action) => ({
        ...action,
        enabled: true,
      })),
    }));

    setPermissions(newPermissions);
  };

  const handleDisableAll = () => {
    if (currentMode !== "edit" && currentMode !== "create") return;

    const newPermissions = permissions.map((module) => ({
      ...module,
      actions: module.actions.map((action) => ({
        ...action,
        enabled: false,
      })),
    }));

    setPermissions(newPermissions);
  };

  const handleResetToDefault = () => {
    if (currentMode !== "edit" && currentMode !== "create") return;

    if (currentMode === "create") {
      // Reset to all disabled for create mode
      const newPermissions = permissions.map((module) => ({
        ...module,
        actions: module.actions.map((action) => ({
          ...action,
          enabled: false,
        })),
      }));
      setPermissions(newPermissions);
    } else if (currentMode === "edit") {
      // Reset to policy's original permissions
      const transformedPermissions = transformPermissionsForMode("view");
      setPermissions(transformedPermissions);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-red-700 text-sm">{apiError}</div>
          </div>
        )}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              {isLoading ? (
                <>
                  <Skeleton width={200} height={28} className="mb-2" />
                  <Skeleton width={150} height={20} className="mb-1" />
                  <Skeleton width={300} height={16} />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{getTitle()}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {getDescription()}
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Mode Toggle Buttons */}
              {!isLoading && currentMode === "view" && (
                <button
                  onClick={() => handleModeChange("edit")}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </button>
              )}
              {!isLoading && currentMode === "edit" && (
                <button
                  onClick={() => handleModeChange("view")}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <Eye size={16} />
                  View
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white hover:text-blue-100 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
                disabled={isLoading}
              >
                <X size={28} />
              </button>
            </div>
          </div>
        </div>

        {/* Compact Basic Information Section */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="flex items-center gap-4">
            {/* Name Field */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Policy Name *
              </label>
              {isLoading ? (
                <Skeleton height={36} />
              ) : (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={currentMode === "view"}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Enter policy name"
                />
              )}
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              {isLoading ? (
                <Skeleton height={36} width={100} />
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleActiveStatus}
                    disabled={currentMode === "view"}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      formData.isActive ? "bg-green-500" : "bg-gray-300"
                    } ${
                      currentMode === "view"
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.isActive ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-xs font-medium ${
                      formData.isActive ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              )}
            </div>

            {/* Description Field */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              {isLoading ? (
                <Skeleton height={36} />
              ) : (
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={currentMode === "view"}
                  rows={1}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 resize-none"
                  placeholder="Brief description"
                />
              )}
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Permissions Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {permissions.map((module, moduleIndex) => (
                <ModuleCard
                  key={moduleIndex}
                  module={module}
                  moduleIndex={moduleIndex}
                  onToggleAction={toggleAction}
                  onToggleAllActions={toggleAllModuleActions}
                  isLoading={isLoading}
                  isEditable={
                    currentMode === "edit" || currentMode === "create"
                  }
                  mode={currentMode}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t flex flex-col gap-4 flex-shrink-0">
          {/* Quick Actions */}
          {!isLoading &&
            (currentMode === "edit" || currentMode === "create") && (
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <h4 className="font-bold text-blue-900 text-sm mr-2 self-center">
                    Quick Actions:
                  </h4>
                  <button
                    onClick={handleEnableAll}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    Enable All
                  </button>
                  <button
                    onClick={handleDisableAll}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Disable All
                  </button>
                  <button
                    onClick={handleResetToDefault}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            )}

          {/* Main Footer Actions */}
          <div className="flex items-center justify-between">
            {isLoading ? (
              <div className="flex-1">
                <Skeleton width={200} height={20} />
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <span className="font-semibold">
                  {
                    permissions
                      .flatMap((m) => m.actions)
                      .filter((a) => a.enabled).length
                  }
                </span>
                <span> permissions enabled across </span>
                <span className="font-semibold">{permissions.length}</span>
                <span> modules</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              {isLoading ? (
                <>
                  <Skeleton width={120} height={40} />
                  <Skeleton width={140} height={40} />
                </>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all duration-200"
                  >
                    <X size={18} />
                    {currentMode === "view" ? "Close" : "Cancel"}
                  </button>
                  {(currentMode === "edit" || currentMode === "create") && (
                    <button
                      onClick={handleSave}
                      disabled={!formData.name.trim()} // Disable if name is empty
                      className="flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                      {currentMode === "create"
                        ? "Create Policy"
                        : "Save Changes"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
