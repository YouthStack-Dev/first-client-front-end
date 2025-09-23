import React from 'react';
import { LogOut } from 'lucide-react';

const SidebarFooter = ({ 
  isOpen, 
  handleLogout 
}) => {
  return (
    <div className="p-4 border-t border-sidebar-primary-700 bg-gradient-to-t from-sidebar-primary-800 to-sidebar-primary-900">
      <button
        onClick={handleLogout}
        className="flex items-center justify-center w-full px-4 py-3 bg-sidebar-danger-600 text-white rounded-xl hover:bg-sidebar-danger-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg"
      >
        <LogOut className="w-5 h-5" />
        {isOpen && <span className="ml-2">Logout</span>}
      </button>
    </div>
  );
};

export default React.memo(SidebarFooter);