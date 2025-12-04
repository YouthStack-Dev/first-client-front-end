import React, { useState } from "react";
import { icons } from "lucide-react";
import { logDebug } from "../../utils/logger";

const DefaultIcon = icons.AlertCircle || icons.Info;

const ReusableButton = ({
  module,
  action,
  icon: IconComponent,
  title,
  buttonName,
  onClick,
  size = 16,
  className = "text-sidebar-danger-600 hover:text-sidebar-danger-700 transition-colors",
  disabled = false,
  loading = false,
  loadingText = "Loading...",
  type = "button",
  showTooltip = true,
}) => {
  const [showTooltipState, setShowTooltipState] = useState(false);

  // Don't render if module or action is not provided
  if (!module || !action) {
    return null;
  }

  const getPermissions = () => {
    const userPermissions = sessionStorage.getItem("userPermissions");
    if (userPermissions) {
      try {
        const { permissions } = JSON.parse(userPermissions) || [];
        return permissions || [];
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        return [];
      }
    }
    return [];
  };

  const permissions = getPermissions();

  const hasPermission = () => {
    const modulePermission = permissions.find((p) => p.module === module);
    return modulePermission?.action.includes(action);
  };

  const handleClick = (e) => {
    if (onClick && !loading && !disabled) {
      onClick(e);
    }
  };

  const IconToUse = IconComponent || DefaultIcon;

  if (!hasPermission()) {
    return null;
  }

  return (
    <div className="relative inline-flex">
      <button
        type={type}
        className={`inline-flex items-center justify-center rounded transition-all duration-200 ${className} ${
          disabled || loading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:scale-105"
        }`}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
        disabled={disabled || loading}
        aria-label={title || buttonName}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          <>
            {IconComponent && (
              <IconToUse size={size} className={buttonName ? "mr-2" : ""} />
            )}
            {buttonName && <span>{buttonName}</span>}
          </>
        )}
      </button>

      {/* Custom Tailwind Tooltip */}
      {title && showTooltip && !loading && (
        <div
          className={`absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap transition-all duration-150 ${
            showTooltipState
              ? "opacity-100 visible scale-100"
              : "opacity-0 invisible scale-95"
          } z-50 pointer-events-none`}
          role="tooltip"
        >
          {title}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default ReusableButton;
