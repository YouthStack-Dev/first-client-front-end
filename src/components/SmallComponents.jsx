import React from "react";
import { X } from "lucide-react";

// ✅ Modal Component with form & save/cancel buttons
export const Modal = ({ isOpen, onClose, onSubmit, children, title, size = "md" }) => {
  if (!isOpen) return null;

  let sizeClass = "max-w-screen-md";
  if (size === "lg") sizeClass = "max-w-screen-lg";
  else if (size === "xl") sizeClass = "max-w-screen-xl";
  else if (size === "fullscreen") sizeClass = "w-full h-full m-4";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-lg shadow-lg overflow-auto max-h-[95vh] w-full ${sizeClass}`}>
        <form onSubmit={onSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center border-b px-6 py-4">
            {title && <h2 className="text-lg font-semibold text-gray-800">{title}</h2>}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-3 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              Save
            </button>
          </div>
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
