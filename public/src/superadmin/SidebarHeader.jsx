import React from 'react';
import { Crown, Pin, PinOff } from 'lucide-react';

const SidebarHeader = ({ 
  isOpen, 
  isPinned, 
  togglePin, 
  isMobile,
  platformName 
}) => {
  return (
    <div className="p-5 border-b border-sidebar-primary-700 flex items-center justify-between bg-gradient-to-r from-sidebar-primary-800 to-sidebar-primary-900">
      {isOpen && (
        <>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Crown className="w-6 h-6 text-sidebar-warning-400 mr-3" />
              {platformName}
            </h2>
            <span className="text-sm text-sidebar-primary-300 mt-1">Super Admin Portal</span>
          </div>
          {!isMobile && (
            <button
              onClick={togglePin}
              className="text-sidebar-primary-300 hover:text-sidebar-warning-400 transition-colors p-2 rounded-lg hover:bg-sidebar-primary-700"
              title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            >
              {isPinned ? (
                <Pin className="w-5 h-5" />
              ) : (
                <PinOff className="w-5 h-5" />
              )}
            </button>
          )}
        </>
      )}
      {!isOpen && (
        <div className="w-10 h-10 bg-sidebar-warning-500 rounded-xl flex items-center justify-center mx-auto">
          <Crown className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );
};

export default React.memo(SidebarHeader);