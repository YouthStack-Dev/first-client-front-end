import React from "react";
import ReusableButton from "./ReusableButton";
import { Plus } from "lucide-react";

const ToolBar = ({
  module,
  title,
  subtitle,
  onAddClick,
  addButtonLabel,
  addButtonIcon,
  className = "",
  searchBar = null,
  leftElements = null,
  rightElements = null,
  mobileLayout = "stacked", // 'stacked' or 'compact'
  searchBarPriority = true, // Whether search bar takes priority on mobile
}) => {
  return (
    <div className={` shadow p-4 ${className}`}>
      {/* Header section */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          )}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      {/* Toolbar content - Responsive layout */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4">
        {/* Left side - Search and filters */}
        <div
          className={`flex-1 flex flex-col ${
            mobileLayout === "stacked"
              ? "gap-3"
              : "sm:flex-row sm:items-center gap-2"
          }`}
        >
          {searchBar && (
            <div
              className={`${searchBarPriority ? "flex-1 min-w-0" : "w-full"} ${
                mobileLayout === "compact" ? "sm:flex-1" : ""
              }`}
            >
              {searchBar}
            </div>
          )}

          {leftElements && (
            <div
              className={`flex flex-wrap items-center gap-2 ${
                mobileLayout === "stacked" ? "w-full" : ""
              }`}
            >
              {leftElements}
            </div>
          )}
        </div>

        {/* Right side - Actions and buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {rightElements}
          {onAddClick && (
            <ReusableButton
              module={module}
              action="create"
              buttonName={addButtonLabel}
              icon={Plus}
              title={`Create ${addButtonLabel}`}
              onClick={onAddClick}
              className="flex items-center gap-2 p-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolBar;
