// components/ServerDownModal.jsx
import React from "react";

const ServerDownModal = ({ onRetry }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4 text-red-600">🚨 Server Down</h2>
        <p className="mb-4">Unable to connect to the backend server.</p>
        <button
          onClick={onRetry}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default ServerDownModal;
