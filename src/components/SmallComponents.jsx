import { X } from "lucide-react";

export const Modal = ({ isOpen, onClose, children, title, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative shadow-xl cursor-move">
        <div className="modal-header flex justify-between items-center border-b pb-4">
          {title && <h2 className="text-xl font-bold">{title}</h2>}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* ✅ Form here */}
        <form onSubmit={onSubmit}>
          <div className="mt-4">{children}</div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const InputField = ({ label, type, option, ...props }) => {
  // Prevent non-numeric input for "tel" type
  const handleKeyDown = (e) => {
    if (type === "tel") {
      if (!/[\d\bArrowLeftArrowRightDelete]/.test(e.key)) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {type === "select" ? (
        // ✅ Render a select dropdown if type is "select"
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          {...props}
        >
          <option value="" disabled>
            Select an option
          </option>
          {option?.map((opt, index) => (
            <option key={index} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        // ✅ Render a normal input field otherwise
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          type={type}
          onKeyDown={handleKeyDown} // 🔥 Prevent letters in phone number
          maxLength={type === "tel" ? 10 : undefined} // 🔥 Restrict phone number to 10 digits
          pattern={type === "tel" ? "[0-9]{10}" : undefined} // 🔥 Ensure exactly 10 digits in validation
          inputMode={type === "tel" ? "numeric" : "text"} // 🔥 Optimize mobile keyboard
          {...props}
        />
      )}
    </div>
  );
};
