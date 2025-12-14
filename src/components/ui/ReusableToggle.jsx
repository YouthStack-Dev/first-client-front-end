// components/ReusableToggle.jsx
import React from "react";

const ReusableToggle = ({
  module,
  action,
  isActive,
  onToggle,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  size = "md",
  disabled = false,
  showLabels = false,
}) => {
  const sizeClasses = {
    sm: "h-5 w-9",
    md: "h-6 w-11",
    lg: "h-7 w-14",
  };

  const handleToggle = () => {
    if (!disabled) {
      onToggle();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-full
          ${isActive ? "bg-green-500" : "bg-gray-300"}
          ${sizeClasses[size]}
          transition-colors duration-200 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500
        `}
        data-module={module}
        data-action={action}
        data-state={isActive ? "active" : "inactive"}
      >
        <span
          className={`
            inline-block bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out
            ${isActive ? "translate-x-4" : "translate-x-0"}
            ${size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6"}
            ${
              isActive
                ? size === "sm"
                  ? "translate-x-4"
                  : size === "md"
                  ? "translate-x-5"
                  : "translate-x-7"
                : "translate-x-0.5"
            }
          `}
        />
      </button>

      {showLabels && (
        <span
          className={`text-sm font-medium ${
            isActive ? "text-green-700" : "text-gray-600"
          }`}
        >
          {isActive ? activeLabel : inactiveLabel}
        </span>
      )}
    </div>
  );
};

export default ReusableToggle;
