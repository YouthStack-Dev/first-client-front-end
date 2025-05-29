import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';

const HeaderWithAction = ({ title, buttonLabel, buttonRoute, showBackButton = false }) => {
  const navigate = useNavigate();

  const showButton = buttonLabel && buttonRoute;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)} // Navigates back to the previous page
              className="flex items-center gap-2 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Back</span>
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{title}</h1>
        </div>

        {showButton && (
          <button
            onClick={() => navigate(buttonRoute)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm md:text-base">{buttonLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default HeaderWithAction;
