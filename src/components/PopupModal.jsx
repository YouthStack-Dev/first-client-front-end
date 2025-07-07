import React from 'react';

const SIZE_CLASSES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-6xl",
  full: "w-full max-w-none",
};

const PopupModal = ({ title, children, onClose, isOpen, size = "md" }) => {
  if (!isOpen) return null; // 👉 Prevent modal from showing when not needed

  const modalSize = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className={`bg-white p-6 rounded-lg shadow-lg w-full ${modalSize} relative`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default PopupModal;
