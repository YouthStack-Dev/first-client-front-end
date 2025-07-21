export const AlertModal = ({ show, type, message, onClose }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
          <h2 className={`text-lg font-bold ${type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {type === 'error' ? 'Error' : 'Notice'}
          </h2>
          <p className="mt-2 text-gray-700">{message}</p>
          {onClose && (
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={onClose}
            >
              OK
            </button>
          )}
        </div>
      </div>
    );
  };
  