// components/modal/NoInternetModal.jsx
import React from "react";

const NoInternetModal = ({ onRetry ,message }) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
      <h2 className="text-2xl font-semibold text-red-600 mb-3">🚨 Server Unreachable</h2>
      <p className="text-gray-700 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded"
      >
        Retry
      </button>
    </div>
  </div>
);

export default NoInternetModal;
