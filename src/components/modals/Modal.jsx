import React from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  size = 'md',
  children
}) => {
  if (!isOpen) return null;

  let sizeClass = 'max-w-screen-md';
  if (size === 'lg') sizeClass = 'max-w-screen-lg';
  else if (size === 'xl') sizeClass = 'max-w-screen-xl';
  else if (size === 'fullscreen') sizeClass = 'w-full h-full m-4';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-lg shadow-lg overflow-auto max-h-[95vh] w-full ${sizeClass}`}>
        <form onSubmit={onSubmit}>
          {/* Modal Header */}
          <div className="flex justify-between items-center border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {children}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {title.includes('Edit') ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
