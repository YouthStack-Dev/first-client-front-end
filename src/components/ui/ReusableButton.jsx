import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { icons } from "lucide-react";

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
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

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
        ref={buttonRef}
        type={type}
        className={`inline-flex items-center justify-center rounded transition-all duration-200 ${className} ${
          disabled || loading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:scale-105"
        }`}
        onClick={handleClick}
        onMouseEnter={() => {
          if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setTooltipPos({
              top: rect.top - 8,
              left: rect.left + rect.width / 2,
            });
          }
          setShowTooltipState(true);
        }}
        onMouseLeave={() => setShowTooltipState(false)}
        disabled={disabled || loading}
        aria-label={title || buttonName}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current "></div>
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          <>
            {IconComponent && (
              <IconToUse size={size} className={buttonName ? "" : ""} />
            )}
            {buttonName && <span>{buttonName}</span>}
          </>
        )}
      </button>

      {/* Tooltip rendered in a portal so it escapes all stacking contexts */}
      {title && showTooltip && !loading && showTooltipState &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: "translate(-50%, -100%)",
              zIndex: 99999,
            }}
            className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg whitespace-nowrap pointer-events-none"
          >
            {title}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default ReusableButton;
