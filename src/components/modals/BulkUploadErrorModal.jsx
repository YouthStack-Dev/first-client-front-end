import React, { useEffect, useRef } from "react";
import { X, AlertCircle } from "lucide-react";

const BulkUploadErrorModal = ({ isOpen, onClose, errors }) => {
  const modalRef = useRef(null);

  /* ===============================
     ESCAPE KEY & BODY SCROLL LOCK
  ================================ */
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scroll
      
      // Focus modal for accessibility
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  /* ===============================
     CLICK OUTSIDE TO CLOSE
  ================================ */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  /* ===============================
     EMPTY STATE
  ================================ */
  if (!errors || errors.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          ref={modalRef}
          className="bg-white w-11/12 max-w-md rounded-lg shadow-lg p-6"
          tabIndex={-1}
        >
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No errors to display</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-5xl rounded-lg shadow-lg flex flex-col max-h-[90vh]"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking inside
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          <h3 id="modal-title" className="font-semibold text-lg">
            Bulk Upload Errors ({errors.length} {errors.length === 1 ? "row" : "rows"})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded p-1 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="overflow-auto p-4 flex-1">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold border-b-2 border-gray-300">
                    Row
                  </th>
                  <th className="px-3 py-2 text-left font-semibold border-b-2 border-gray-300">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold border-b-2 border-gray-300">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-semibold border-b-2 border-gray-300">
                    Errors
                  </th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-3 align-top font-medium text-gray-700">
                      {err.row || idx + 1}
                    </td>
                    <td className="px-3 py-3 align-top">
                      {err.employee_name || "-"}
                    </td>
                    <td className="px-3 py-3 align-top">
                      {err.email || "-"}
                    </td>
                    <td className="px-3 py-3 align-top">
                      {err.errors && err.errors.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 text-red-600">
                          {err.errors.map((msg, i) => (
                            <li key={i} className="leading-relaxed">
                              {msg}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 italic">No errors</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info Footer inside scrollable area */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <p>
              <strong>Tip:</strong> Fix the errors in your Excel file and try uploading again.
            </p>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-between items-center px-4 py-3 border-t flex-shrink-0 bg-gray-50">
          <p className="text-sm text-gray-600">
            Please correct the errors and re-upload
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadErrorModal;