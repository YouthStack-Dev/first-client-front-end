import React, { useState, useEffect } from 'react';
import { X, Shield, Check, Eye, Plus, Edit, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';

const ACTION_ICONS = {
  view: Eye,
  create: Plus,
  edit: Edit,
  delete: Trash2
};

const ACTION_COLORS = {
  view: 'text-blue-600 bg-blue-100',
  create: 'text-green-600 bg-green-100',
  edit: 'text-yellow-600 bg-yellow-100',
  delete: 'text-red-600 bg-red-100'
};

const RoleForm = ({
  isOpen,
  onClose,
  onSubmit,
  allowedModules = [],
  moduleCategories = [],
  initialData = null,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const [selectedCategory, setSelectedCategory] = useState('all');

  // Initialize form with initialData when in edit mode
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        permissions: initialData.permissions || []
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
  }, [initialData, mode]);

  // Filter modules based on allowed modules
  const availableModules = allowedModules;

  // Prepare categories with counts
  const categories = [
    { id: 'all', name: 'All Modules', count: availableModules.length },
    ...moduleCategories.map(category => ({
      id: category.id,
      name: category.name,
      count: availableModules.filter(m => m.category === category.id).length
    }))
  ].filter(cat => cat.count > 0);

  const filteredModules = selectedCategory === 'all' 
    ? availableModules 
    : availableModules.filter(module => module.category === selectedCategory);

  const handlePermissionChange = (moduleId, action, checked) => {
    setFormData(prev => {
      const existingPermission = prev.permissions.find(p => p.moduleId === moduleId);
      
      if (existingPermission) {
        const updatedPermissions = prev.permissions.map(p => {
          if (p.moduleId === moduleId) {
            const actions = checked 
              ? [...new Set([...p.actions, action])] // Ensure no duplicates
              : p.actions.filter(a => a !== action);
            return { ...p, actions };
          }
          return p;
        }).filter(p => p.actions.length > 0);
        
        return { ...prev, permissions: updatedPermissions };
      } else if (checked) {
        return {
          ...prev,
          permissions: [...prev.permissions, { moduleId, actions: [action] }]
        };
      }
      
      return prev;
    });
  };

  const getModulePermission = (moduleId) => {
    return formData.permissions.find(p => p.moduleId === moduleId);
  };

  const hasAction = (moduleId, action) => {
    const permission = getModulePermission(moduleId);
    return permission?.actions.includes(action) || false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      isSystemRole: false
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
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
                {mode === 'create' 
                  ? 'Define role permissions within your allowed modules' 
                  : 'Update role permissions and details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-80px)]">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Role Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Role Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    id="role-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <label htmlFor="role-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    id="role-description"
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Role description"
                  />
                </div>
              </div>
            </div>

            {/* Module Permissions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Module Permissions</h3>
                <div className="text-sm text-gray-500">
                  {formData.permissions.length} of {availableModules.length} modules configured
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>

              {/* Permissions Legend */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Actions:</div>
                {Object.entries(ACTION_ICONS).map(([action, Icon]) => (
                  <div key={action} className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${ACTION_COLORS[action]}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-gray-600 capitalize">{action}</span>
                  </div>
                ))}
              </div>

              {/* Modules Permissions Grid */}
              <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {filteredModules.map(module => {
                  const permission = getModulePermission(module.id);
                  return (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {module.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {module.description}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded capitalize">
                          {module.category}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(ACTION_ICONS).map(([action, Icon]) => {
                          const isChecked = hasAction(module.id, action);
                          return (
                            <label
                              key={`${module.id}-${action}`}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                                isChecked
                                  ? 'border-purple-200 bg-purple-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                isChecked
                                  ? 'border-purple-500 bg-purple-500'
                                  : 'border-gray-300'
                              }`}>
                                {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <div className={`w-5 h-5 rounded flex items-center justify-center ${ACTION_COLORS[action]}`}>
                                <Icon className="w-3 h-3" />
                              </div>
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {action}
                              </span>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handlePermissionChange(module.id, action, e.target.checked)}
                                className="sr-only"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.name || formData.permissions.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {mode === 'create' ? 'Create Role' : 'Update Role'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

RoleForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  allowedModules: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string.isRequired
  })),
  moduleCategories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })),
  initialData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    permissions: PropTypes.arrayOf(PropTypes.shape({
      moduleId: PropTypes.string.isRequired,
      actions: PropTypes.arrayOf(PropTypes.string).isRequired
    }))
  }),
  mode: PropTypes.oneOf(['create', 'edit'])
};

RoleForm.defaultProps = {
  allowedModules: [],
  moduleCategories: [],
  initialData: null,
  mode: 'create'
};

export default RoleForm;