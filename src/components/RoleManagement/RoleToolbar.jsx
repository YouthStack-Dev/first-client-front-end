import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import ToolBar from '../ui/ToolBar';

const RoleToolbar = ({ onCreateClick, searchTerm, setSearchTerm }) => {
  return (
    <ToolBar
      title="Role Management"
      subtitle="Create and manage roles within your permissions"
      onAddClick={onCreateClick}
      addButtonLabel="Create Role"
      addButtonIcon={<Plus className="w-4 h-4" />}
      searchBar={
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      }
      leftElements={null} 
      rightElements={null} 
      mobileLayout="stacked"
      searchBarPriority={true}
      className="mb-6"
    />
  );
};

export default RoleToolbar;
