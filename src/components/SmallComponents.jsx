import React from "react";
import { X, Edit2, XCircle } from "lucide-react";

/**
 * Reusable Modal Component with form, save/cancel buttons, and edit mode support
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.title - Modal title
 * @param {string} props.size - Modal size: 'sm', 'md', 'lg', 'xl', 'fullscreen'
 * @param {string} props.mode - Modal mode: 'view', 'create', 'edit'
 * @param {boolean} props.isEditMode - Whether edit mode is active
 * @param {Function} props.onToggleEdit - Function to toggle edit mode
 * @param {boolean} props.showEditToggle - Whether to show edit toggle button
 * @param {boolean} props.isLoading - Whether form is submitting
 * @param {string} props.submitText - Custom submit button text
 * @param {string} props.cancelText - Custom cancel button text
 * @param {string} props.closeText - Custom close button text
 * @param {boolean} props.hideFooter - Whether to hide footer buttons
 * @param {string} props.headerClassName - Custom header class
 * @param {string} props.bodyClassName - Custom body class
 * @param {string} props.footerClassName - Custom footer class
 * @param {boolean} props.disableBackdropClose - Whether to disable closing by clicking backdrop
 */
export const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  children,
  title,
  size = "md",
  mode = "view",
  isEditMode = false,
  onToggleEdit = null,
  showEditToggle = false,
  isLoading = false,
  submitText = "Save",
  cancelText = "Cancel",
  closeText = "Close",
  hideFooter = false,
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  disableBackdropClose = false,
}) => {
  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    fullscreen: "w-full h-full m-4",
  };

  // Determine if we should show action buttons
  const showActions = mode === "create" || mode === "edit" || isEditMode;

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !disableBackdropClose) {
      onClose();
    }
  };

  // Handle form submit with loading state
  const handleSubmit = (e) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }

    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-lg overflow-auto max-h-[95vh] w-full ${
          sizeClasses[size] || sizeClasses.md
        }`}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div
            className={`bg-gradient-to-r from-app-primary to-app-secondary px-6 py-4 flex justify-between items-center ${headerClassName}`}
          >
            <div className="flex items-center space-x-3">
              {title && (
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              )}

              {/* Edit Mode Badge */}
              {mode === "view" && isEditMode && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Edit2 className="mr-1 w-3 h-3" />
                  Editing
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Edit Toggle Button */}
              {showEditToggle && onToggleEdit && (
                <button
                  type="button"
                  onClick={onToggleEdit}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                    isEditMode
                      ? "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400"
                      : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
                  }`}
                >
                  {isEditMode ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Edit</span>
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </>
                  )}
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="text-white hover:text-gray-200 disabled:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className={`p-6 ${bodyClassName}`}>
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            {children}
          </div>

          {/* Footer - Conditionally rendered */}
          {!hideFooter && (
            <div
              className={`flex justify-end gap-3 px-6 py-3 border-t bg-app-tertiary ${footerClassName}`}
            >
              {/* Cancel Button - Shown for create, edit, or view with edit mode */}
              {(showActions || (mode === "view" && isEditMode)) && (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {cancelText}
                </button>
              )}

              {/* Save Button - Shown for create, edit, or view with edit mode */}
              {showActions && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center space-x-2 disabled:bg-blue-400 ${
                    isLoading ? "cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{submitText}</span>
                </button>
              )}

              {/* Close Button - Shown only for View Mode without editing */}
              {mode === "view" && !isEditMode && !showActions && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  {closeText}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// ✅ InputField Component
export const InputField = ({ label, type = "text", option = [], ...props }) => {
  const handleKeyDown = (e) => {
    if (type === "tel") {
      if (!/[\d\bArrowLeftArrowRightDelete]/.test(e.key)) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {type === "select" ? (
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          {...props}
        >
          <option value="" disabled>
            Select an option
          </option>
          {option.map((opt, index) => (
            <option key={index} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          onKeyDown={handleKeyDown}
          maxLength={type === "tel" ? 10 : undefined}
          pattern={type === "tel" ? "[0-9]{10}" : undefined}
          inputMode={type === "tel" ? "numeric" : "text"}
          {...props}
        />
      )}
    </div>
  );
};

// // Simple modal without edit mode
// <Modal
//   isOpen={isOpen}
//   onClose={handleClose}
//   onSubmit={handleSubmit}
//   title="Simple Modal"
//   size="md"
// >
//   <div>Your content here</div>
// </Modal>

// // View mode with edit toggle
// <Modal
//   isOpen={isOpen}
//   onClose={handleClose}
//   onSubmit={handleSubmit}
//   title="View Item"
//   mode="view"
//   isEditMode={isEditMode}
//   onToggleEdit={toggleEditMode}
//   showEditToggle={true}
// >
//   <div>View content here</div>
// </Modal>

// // Create/Edit mode
// <Modal
//   isOpen={isOpen}
//   onClose={handleClose}
//   onSubmit={handleSubmit}
//   title="Create Item"
//   mode="create"
//   isLoading={isLoading}
//   submitText="Create Item"
// >
//   <div>Form content here</div>
// </Modal>

// // Modal with custom styling
// <Modal
//   isOpen={isOpen}
//   onClose={handleClose}
//   onSubmit={handleSubmit}
//   title="Custom Modal"
//   headerClassName="bg-red-600"
//   bodyClassName="bg-gray-50"
//   footerClassName="bg-gray-100"
//   disableBackdropClose={true}
// >
//   <div>Custom styled content</div>
// </Modal>
