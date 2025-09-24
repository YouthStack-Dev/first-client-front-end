// components/PermissionPanel.jsx
import { useState } from "react";
import { Search, Filter, ChevronDown, ChevronRight, Check, Square } from "lucide-react";
import { categorizePermissions, permissionModules } from "../utils/permissionCategories";

export const PermissionPanel = ({ 
  selectedPermissions = [], 
  onPermissionToggle,
  permissions = permissionModules
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [filterAction, setFilterAction] = useState("all");

  // Use your categorization utility
  const categorized = categorizePermissions(permissions);

  // Group permissions by module within each category
  const getCategorizedModules = () => {
    const result = {};
    
    Object.keys(categorized).forEach(categoryKey => {
      const category = categorized[categoryKey];
      const modules = {};
      
      category.permissions.forEach(permission => {
        if (!modules[permission.module]) {
          modules[permission.module] = {
            module: permission.module,
            permissions: [],
            allSelected: false,
            partialSelected: false
          };
        }
        modules[permission.module].permissions.push(permission);
      });

      // Calculate selection states for each module
      Object.keys(modules).forEach(moduleName => {
        const modulePermissions = modules[moduleName].permissions;
        const selectedCount = modulePermissions.filter(p => 
          selectedPermissions.includes(p.permission_id)
        ).length;
        
        modules[moduleName].allSelected = selectedCount === modulePermissions.length;
        modules[moduleName].partialSelected = selectedCount > 0 && selectedCount < modulePermissions.length;
      });

      result[categoryKey] = {
        ...category,
        modules: Object.keys(modules)
          .sort()
          .map(key => modules[key])
      };
    });

    return result;
  };

  const categorizedModules = getCategorizedModules();

  // Filter categories and modules based on search
  const filteredCategories = Object.keys(categorizedModules)
    .map(categoryKey => {
      const category = categorizedModules[categoryKey];
      const filteredModules = category.modules.filter(module => {
        const moduleMatches = module.module.toLowerCase().includes(searchTerm.toLowerCase());
        const permissionMatches = module.permissions.some(permission => 
          permission.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          permission.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return moduleMatches || permissionMatches;
      });

      return {
        ...category,
        modules: filteredModules
      };
    })
    .filter(category => category.modules.length > 0);

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const toggleAllModulePermissions = (modulePermissions, select = true) => {
    modulePermissions.forEach(permission => {
      if (select && !selectedPermissions.includes(permission.permission_id)) {
        onPermissionToggle(permission.permission_id);
      } else if (!select && selectedPermissions.includes(permission.permission_id)) {
        onPermissionToggle(permission.permission_id);
      }
    });
  };

  const selectAllPermissions = (select = true) => {
    permissions.forEach(permission => {
      if (select && !selectedPermissions.includes(permission.permission_id)) {
        onPermissionToggle(permission.permission_id);
      } else if (!select && selectedPermissions.includes(permission.permission_id)) {
        onPermissionToggle(permission.permission_id);
      }
    });
  };

  const getActionColor = (action) => {
    const colors = {
      create: "bg-green-100 text-green-800 border-green-300",
      read: "bg-blue-100 text-blue-800 border-blue-300",
      update: "bg-yellow-100 text-yellow-800 border-yellow-300",
      delete: "bg-red-100 text-red-800 border-red-300"
    };
    return colors[action] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getActionIcon = (action) => {
    const icons = {
      create: "🆕",
      read: "📖",
      update: "✏️",
      delete: "🗑️"
    };
    return icons[action] || "⚡";
  };

  const formatModuleName = (module) => {
    return module.split('.')
      .map(part => part.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      )
      .join(' - ');
  };

  const getModuleIcon = (module) => {
    const icons = {
      booking: "📅",
      driver: "👨‍💼",
      employee: "👥",
      "route-booking": "🛣️",
      route: "🗺️",
      shift: "⏰",
      team: "👨‍👩‍👧‍👦",
      "admin.tenant": "🏢",
      vehicle: "🚗",
      "vehicle-type": "🔧",
      vendor: "🏪",
      "vendor-user": "👤",
      "weekoff-config": "📅",
      permissions: "🔐",
      policy: "📜",
      role: "🎭"
    };
    return icons[module] || "📁";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Permission Management</h2>
            <p className="text-gray-600">Manage module permissions for this role</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Modules</div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(categorizedModules).reduce((total, category) => total + category.modules.length, 0)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search modules or permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              <option value="create">Create Only</option>
              <option value="read">Read Only</option>
              <option value="update">Update Only</option>
              <option value="delete">Delete Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories and Modules */}
      <div className="p-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No modules found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map(category => (
              <div key={category.name} className="border border-gray-200 rounded-lg">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {expandedCategories[category.name] ? 
                          <ChevronDown size={24} /> : 
                          <ChevronRight size={24} />
                        }
                      </button>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {category.modules.length} modules • {
                              category.modules.reduce((total, module) => 
                                total + module.permissions.filter(p => selectedPermissions.includes(p.permission_id)).length, 0
                              )
                            } permissions selected
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modules Grid */}
                {expandedCategories[category.name] && (
  <div className="p-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {category.modules.map(module => (
        <div
          key={module.module}
          className="border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all duration-200 hover:shadow-lg bg-white"
        >
          {/* Module Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAllModulePermissions(module.permissions, !module.allSelected);
                  }}
                  className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                    module.allSelected 
                      ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                      : module.partialSelected
                        ? 'bg-blue-100 border-blue-300 text-blue-500'
                        : 'border-gray-300 text-transparent hover:border-blue-300 hover:bg-gray-100'
                  }`}
                >
                  {module.allSelected ? <Check size={12} /> : module.partialSelected ? <Square size={8} /> : null}
                </button>
                
                <span className="text-2xl">{getModuleIcon(module.module)}</span>
                
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                    {formatModuleName(module.module)}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {module.permissions.length} actions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions List - Improved Grid Layout */}
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              {module.permissions
                .filter(permission => filterAction === "all" || permission.action === filterAction)
                .map(permission => (
                <div
                  key={permission.permission_id}
                  className={`relative group rounded-lg p-2 cursor-pointer transition-all duration-200 border ${
                    selectedPermissions.includes(permission.permission_id)
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                  }`}
                  onClick={() => onPermissionToggle(permission.permission_id)}
                >
                  {/* Selection Indicator */}
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full border transition-colors ${
                    selectedPermissions.includes(permission.permission_id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300 group-hover:border-blue-300'
                  }`}>
                    {selectedPermissions.includes(permission.permission_id) && (
                      <Check size={8} className="text-white" />
                    )}
                  </div>

                  {/* Action Content */}
                  <div className="flex flex-col space-y-1">
                    {/* Icon and Action Name Row */}
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${getActionColor(permission.action)}`}>
                        {getActionIcon(permission.action)}
                      </div>
                      <span className="font-medium text-xs capitalize text-gray-800 truncate">
                        {permission.action}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-[10px] text-gray-600 leading-tight line-clamp-2">
                      {permission.description}
                    </p>
                    
                    {/* ID Badge */}
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[9px] text-gray-400 font-mono">
                        ID: {permission.permission_id}
                      </span>
                      <span className={`text-[9px] px-1 py-0.5 rounded ${
                        permission.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {permission.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty State for Filtered Actions */}
            {module.permissions.filter(permission => filterAction === "all" || permission.action === filterAction).length === 0 && (
              <div className="text-center py-4">
                <div className="text-gray-400 text-sm">No actions match current filter</div>
              </div>
            )}
          </div>

          {/* Module Footer */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 font-medium">
                <span className={selectedPermissions.some(p => module.permissions.map(mp => mp.permission_id).includes(p)) ? "text-blue-600" : "text-gray-500"}>
                  {module.permissions.filter(p => selectedPermissions.includes(p.permission_id)).length}
                </span>
                <span className="text-gray-400">/{module.permissions.length} selected</span>
              </span>
              
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAllModulePermissions(module.permissions, true);
                  }}
                  className="text-xs px-2 py-1 text-green-600 hover:text-green-800 font-medium hover:bg-green-50 rounded transition-colors"
                >
                  All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAllModulePermissions(module.permissions, false);
                  }}
                  className="text-xs px-2 py-1 text-red-600 hover:text-red-800 font-medium hover:bg-red-50 rounded transition-colors"
                >
                  None
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(module.permissions.filter(p => selectedPermissions.includes(p.permission_id)).length / module.permissions.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600">{selectedPermissions.length}</span> of{" "}
            <span className="font-medium">{permissions.length}</span> permissions selected across{" "}
            <span className="font-medium">
              {Object.values(categorizedModules).reduce((total, category) => 
                total + category.modules.filter(m => m.partialSelected || m.allSelected).length, 0
              )}
            </span> modules
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => selectAllPermissions(true)}
              className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Select All Permissions
            </button>
            <button
              onClick={() => selectAllPermissions(false)}
              className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};