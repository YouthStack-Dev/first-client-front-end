import { useEffect, useState } from "react";

const ConfirmationModal = ({ 
  show, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!show) return;

    // Reset countdown when modal is shown
    setCountdown(10);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [show, onCancel]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl border border-red-200">
        <h3 className="text-xl font-semibold mb-4 text-red-700">{title}</h3>
        <p className="mb-6 text-gray-700">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition shadow"
          >
            Confirm
          </button>
        </div>

        <div className="mt-3 flex items-center justify-end">
          <span className="text-xs text-gray-500 mr-2">
            Auto closing in {countdown} seconds...
          </span>
          <div className="w-20 bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-red-500 h-1.5 rounded-full" 
              style={{ width: `${countdown * 10}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;