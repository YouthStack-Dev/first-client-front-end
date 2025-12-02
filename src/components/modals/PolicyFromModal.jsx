import React, { useState, useEffect } from "react";
import { Save, X, Edit, Eye } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ModuleCard } from "../RoleManagement/ModuleCard";
import { logDebug } from "../../utils/logger";
import {
  dummyPermission,
  existingPermission,
} from "../../staticData/permissionModules";
import {
  transformPermissionsToModules,
  transformPermissionsToModulesWithDefaults,
} from "../../utils/permissionModules";

export const PolicyForm = ({
  policy,
  onSave,
  onClose,
  isOpen,
  mode,
  onModeChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [currentMode, setCurrentMode] = useState(mode);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  logDebug(`PolicyForm opened in ${currentMode} mode`);

  // Different permission sets for different modes
  const createModePermissions = [
    {
      module: "User Management",
      description: "Manage users and their roles",
      icon: "👥",
      actions: [
        { id: "user_create", name: "Create Users", enabled: false },
        { id: "user_read", name: "View Users", enabled: false },
        { id: "user_update", name: "Edit Users", enabled: false },
        { id: "user_delete", name: "Delete Users", enabled: false },
      ],
    },
    {
      module: "Content Management",
      description: "Manage website content",
      icon: "📝",
      actions: [
        { id: "content_create", name: "Create Content", enabled: false },
        { id: "content_read", name: "View Content", enabled: false },
        { id: "content_update", name: "Edit Content", enabled: false },
        { id: "content_delete", name: "Delete Content", enabled: false },
        { id: "content_publish", name: "Publish Content", enabled: false },
      ],
    },
  ];

  const viewEditPermissions = [
    {
      module: "User Management",
      description: "Manage users and their roles",
      icon: "👥",
      actions: [
        { id: "user_create", name: "Create Users", enabled: true },
        { id: "user_read", name: "View Users", enabled: true },
        { id: "user_update", name: "Edit Users", enabled: false },
        { id: "user_delete", name: "Delete Users", enabled: false },
      ],
    },
    {
      module: "Content Management",
      description: "Manage website content",
      icon: "📝",
      actions: [
        { id: "content_create", name: "Create Content", enabled: true },
        { id: "content_read", name: "View Content", enabled: true },
        { id: "content_update", name: "Edit Content", enabled: true },
        { id: "content_delete", name: "Delete Content", enabled: false },
        { id: "content_publish", name: "Publish Content", enabled: true },
      ],
    },
    {
      module: "Reports",
      description: "Access and generate reports",
      icon: "📊",
      actions: [
        { id: "report_view", name: "View Reports", enabled: true },
        { id: "report_export", name: "Export Reports", enabled: false },
        { id: "report_analytics", name: "Analytics", enabled: true },
      ],
    },
    {
      module: "Settings",
      description: "System configuration",
      icon: "⚙️",
      actions: [
        { id: "settings_general", name: "General Settings", enabled: false },
        { id: "settings_security", name: "Security Settings", enabled: false },
        { id: "settings_backup", name: "Backup & Restore", enabled: false },
      ],
    },
    {
      module: "Billing",
      description: "Manage payments and invoices",
      icon: "💰",
      actions: [
        { id: "billing_view", name: "View Billing", enabled: true },
        { id: "billing_edit", name: "Edit Billing", enabled: false },
        { id: "billing_export", name: "Export Invoices", enabled: true },
      ],
    },
    {
      module: "Analytics",
      description: "View system analytics",
      icon: "📈",
      actions: [
        { id: "analytics_view", name: "View Analytics", enabled: true },
        { id: "analytics_export", name: "Export Data", enabled: false },
      ],
    },
  ];

  const data = transformPermissionsToModules(dummyPermission);

  logDebug("Transformed prmission modules data:", data);

  const enabled = transformPermissionsToModulesWithDefaults(
    dummyPermission,
    existingPermission
  );

  logDebug("Enabled permission modules data:", enabled);
  // Reset and load permissions when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setPermissions([]);
      setCurrentMode(mode);
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
          isActive: policy.isActive !== undefined ? policy.isActive : true,
        });
      }

      const timer = setTimeout(() => {
        const permissionsToUse =
          mode === "create" ? createModePermissions : viewEditPermissions;
        setPermissions(permissionsToUse);
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, policy]);

  const handleSave = () => {
    const saveData = {
      ...formData,
      permissions: permissions,
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
    permissions.forEach((_, index) => toggleAllModuleActions(index, true));
  };

  const handleDisableAll = () => {
    if (currentMode !== "edit" && currentMode !== "create") return;
    permissions.forEach((_, index) => toggleAllModuleActions(index, false));
  };

  const handleResetToDefault = () => {
    if (currentMode !== "edit" && currentMode !== "create") return;
    const defaultPermissions =
      currentMode === "create" ? createModePermissions : viewEditPermissions;
    setPermissions([...defaultPermissions]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
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
              {/* Mode Toggle Buttons - Hide in create mode */}
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
            {/* Name Field - Takes more space */}
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

            {/* Status Toggle - Compact */}
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

            {/* Description Field - Compact textarea */}
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

        {/* Permissions Grid - This is now the scrollable area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Permissions Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((module, moduleIndex) => (
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
          {/* Quick Actions - Show in both edit AND create modes */}
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
