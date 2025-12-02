import React from "react";
import { Check } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const ModuleCard = ({
  module,
  moduleIndex,
  onToggleAction,
  onToggleAllActions,
  isLoading = false,
  isEditable = true,
  mode = "view",
}) => {
  // Determine if actions should be editable based on mode
  const shouldBeEditable = isEditable && (mode === "edit" || mode === "create");

  const getModuleStats = (module) => {
    const enabledCount = module.actions.filter(
      (action) => action.enabled
    ).length;
    const totalCount = module.actions.length;
    return { enabledCount, totalCount };
  };

  const stats = getModuleStats(module);

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col h-[400px]">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 border-b border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 w-full">
              <Skeleton circle width={32} height={32} />
              <div className="flex-1">
                <Skeleton width={120} height={20} />
                <Skeleton width={180} height={16} className="mt-1" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Skeleton width={80} height={16} />
            <div className="flex gap-1">
              <Skeleton width={40} height={24} />
              <Skeleton width={40} height={24} />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((action) => (
            <div key={action} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton circle width={20} height={20} />
                <Skeleton width={100} height={16} />
              </div>
              <Skeleton width={60} height={20} />
            </div>
          ))}
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <Skeleton width="100%" height={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 bg-white flex flex-col h-[400px]">
      {/* Module Header - Simplified */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">{module.module}</h3>
          {shouldBeEditable && ( // Use shouldBeEditable here
            <div className="flex gap-1">
              <button
                onClick={() => onToggleAllActions(moduleIndex, true)}
                className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded transition-colors border border-green-200"
              >
                All
              </button>
              <button
                onClick={() => onToggleAllActions(moduleIndex, false)}
                className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors border border-red-200"
              >
                None
              </button>
            </div>
          )}
        </div>

        {/* Module Stats */}
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-semibold text-green-600">
            {stats.enabledCount}
          </span>
          <span className="mx-1">/</span>
          <span>{stats.totalCount}</span>
          <span className="ml-1">permissions enabled</span>
        </div>

        {/* Mode Indicator */}
        <div className="mt-1 text-xs">
          <span
            className={`px-2 py-1 rounded-full ${
              mode === "create"
                ? "bg-blue-100 text-blue-800"
                : mode === "edit"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {mode === "create"
              ? "Create Mode"
              : mode === "edit"
              ? "Edit Mode"
              : "View Mode"}
          </span>
        </div>
      </div>

      {/* Scrollable Actions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {module.actions.map((action, actionIndex) => (
          <ActionItem
            key={action.id}
            action={action}
            moduleIndex={moduleIndex}
            actionIndex={actionIndex}
            onToggle={onToggleAction}
            isEditable={shouldBeEditable} // Use shouldBeEditable here
          />
        ))}
      </div>

      {/* Fixed Footer with Progress Bar */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex-shrink-0">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(stats.enabledCount / stats.totalCount) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Updated ActionItem with better disabled state
const ActionItem = ({
  action,
  moduleIndex,
  actionIndex,
  onToggle,
  isEditable,
}) => (
  <div
    className={`flex items-center justify-between p-3 rounded-lg border border-gray-100 ${
      isEditable
        ? "hover:bg-gray-50 transition-colors cursor-pointer"
        : "opacity-80"
    }`}
  >
    <div className="flex items-center gap-3 flex-1">
      <label
        className={`relative flex items-center ${
          isEditable ? "cursor-pointer" : "cursor-not-allowed"
        }`}
      >
        <input
          type="checkbox"
          checked={action.enabled}
          onChange={() => isEditable && onToggle(moduleIndex, actionIndex)}
          className="sr-only"
          disabled={!isEditable}
        />
        <div
          className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
            action.enabled
              ? "bg-blue-500 border-blue-500 text-white"
              : "border-gray-300 text-transparent"
          } ${!isEditable ? "opacity-60" : ""}`}
        >
          <Check size={14} />
        </div>
      </label>
      <span
        className={`text-sm font-medium text-gray-700 flex-1 ${
          !isEditable ? "opacity-60" : ""
        }`}
      >
        {action.name}
      </span>
    </div>

    {/* Status Badge */}
    <span
      className={`text-xs px-2 py-1 rounded-full ${
        action.enabled
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600"
      } ${!isEditable ? "opacity-60" : ""}`}
    >
      {action.enabled ? "Enabled" : "Disabled"}
    </span>
  </div>
);
