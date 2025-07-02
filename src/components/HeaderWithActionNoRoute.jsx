import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeaderWithActionNoRoute = ({
  title,
  buttonLabel,
  onButtonClick,
  showBackButton = false,
  extraButtons = [],
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-1">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Back</span>
            </button>
          )}
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {extraButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.onClick}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                btn.variant === 'gray'
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {btn.icon && <btn.icon size={16} />}
              <span className="text-sm">{btn.label}</span>
            </button>
          ))}

          {buttonLabel && onButtonClick && (
            <button
              onClick={onButtonClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm md:text-base">{buttonLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderWithActionNoRoute;
