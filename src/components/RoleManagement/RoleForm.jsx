import React, { useState, useEffect } from 'react';
import { X, Shield, Check, Search } from 'lucide-react';
import PropTypes from 'prop-types';

const ACTIONS = [
  { key: 'canRead', label: 'View', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'canWrite', label: 'Edit', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { key: 'canDelete', label: 'Delete', color: 'bg-red-100 text-red-700 border-red-200' },
];

const RoleForm = ({ isOpen, onClose, onSubmit, allowedModules = [], initialData = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({ name: '', description: '', permissions: [], isAssignable: true   });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        permissions: initialData.permissions || [],
        isAssignable: initialData.isAssignable ?? true  // ✅ keep existing or default true
      });
    } else {
      setFormData({ name: '', description: '', permissions: [], isAssignable: true });
    }
  }, [initialData, mode]);

  // Only show modules that are NOT restricted and filter by search term
  const modulesToShow = allowedModules?.filter(m => !m.isRestricted)
    .filter(m => 
      m.moduleKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handlePermissionChange = (moduleKey, actionKey, checked) => {
    setFormData(prev => {
      const existing = prev.permissions.find(p => p.moduleKey === moduleKey);
      
      if (existing) {
        const updatedPermissions = prev.permissions.map(p => {
          if (p.moduleKey === moduleKey) {
            return { ...p, [actionKey]: checked };
          }
          return p;
        });
        return { ...prev, permissions: updatedPermissions };
      } else if (checked) {
        return { 
          ...prev, 
          permissions: [...prev.permissions, { moduleKey, [actionKey]: true }] 
        };
      }
      return prev;
    });
  };

  const getPermission = (moduleKey, actionKey) => {
    const perm = formData.permissions.find(p => p.moduleKey === moduleKey);
    return perm?.[actionKey] || false;
  };

  const handleSubmit = e => {
    e.preventDefault();
    
    // Ensure permissions are properly formatted
    const formattedPermissions = formData.permissions.map(perm => ({
      moduleKey: perm.moduleKey,
      canRead: Boolean(perm.canRead),
      canWrite: Boolean(perm.canWrite),
      canDelete: Boolean(perm.canDelete)
    }));
  
    const roleData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      isAssignable: formData.isAssignable,
      permissions: formattedPermissions
    };
  
    console.log("Role data being submitted:", roleData);
    
    onSubmit(roleData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Create New Role' : 'Edit Role'}
              </h2>
              <p className="text-sm text-gray-500">
                {mode === 'create' ? 'Define role permissions' : 'Update role permissions'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-80px)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Role Info - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter role name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of this role"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isAssignable"
                checked={formData.isAssignable}
                onChange={(e) => setFormData(prev => ({ ...prev, isAssignable: e.target.checked }))}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="isAssignable" className="text-sm text-gray-700">
                Role is assignable to users
              </label>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Module Permissions Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Module Permissions</h3>
              
              {modulesToShow.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No modules found matching your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modulesToShow.map((module) => {
                    const modulePerm = formData.permissions.find(p => p.moduleKey === module.moduleKey) || {};
                    const displayName = module.name || module.moduleKey.replace(/_/g, ' ');

                    return (
                      <div key={module.moduleKey} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
                        {/* Module Header */}
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-sm font-medium text-gray-900 leading-tight">
                            {displayName}
                          </h4>
                        </div>

                        {/* Permission Toggles - Compact */}
                        <div className="space-y-2">
                          {ACTIONS.map((action) => {
                            if (!module[action.key]) return null;

                            const isChecked = modulePerm[action.key] ?? false;

                            return (
                              <label
                                key={action.key}
                                className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-50 cursor-pointer"
                              >
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handlePermissionChange(module.moduleKey, action.key, e.target.checked)}
                                    className="sr-only"
                                  />
                                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                                    isChecked 
                                      ? 'bg-purple-600 border-purple-600' 
                                      : 'border-gray-300 bg-white'
                                  }`}>
                                    {isChecked && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                </div>
                                <span className="text-xs font-medium text-gray-700">{action.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mode === 'create' ? 'Create Role' : 'Update Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default RoleForm;