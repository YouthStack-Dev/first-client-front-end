import { Plus, Users, Shield, Search, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { MODULES } from "../staticData/Modules";
import RoleForm from '../components/roleAndPermissions/RoleForm';
import { useState } from 'react';

const RoleManagement = () => { 

    const [showCreateForm, setShowCreateForm] = useState(false);

   const   allowedModules= [ 'vehicle-management',
        'driver-management',
        'real-time-tracking',
        'route-optimization',
        'maintenance-scheduling',
        'fuel-management',
        'fleet-analytics',
        'compliance-reports'
      ]
    const moduleCategories = MODULES.reduce((acc, module) => {  
        if (!acc[module.category]) {
            acc[module.category] = [];
        }
        acc[module.category].push(module);
        return acc;
    })
const handleCreateRole = (roleData) => {
    // Handle role creation logic here  
    console.log("Role created:", roleData);     
    setShowCreateForm(false);   
}          

const availableModules = MODULES.filter(module => 
    allowedModules.includes(module.id)
  );
const categories = [
    { id: 'all', name: 'All Modules', count: availableModules.length },
    { id: 'employee', name: 'Employee Management', count: availableModules.filter(m => m.category === 'employee').length },
    { id: 'transport', name: 'Transport', count: availableModules.filter(m => m.category === 'transport').length },
    { id: 'routes', name: 'Routes', count: availableModules.filter(m => m.category === 'routes').length },
    { id: 'analytics', name: 'Analytics', count: availableModules.filter(m => m.category === 'analytics').length },
    { id: 'settings', name: 'Settings', count: availableModules.filter(m => m.category === 'settings').length }
  ].filter(cat => cat.count > 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Role & User Management</h2>
                        <p className="text-sm text-gray-500">Create roles and manage user access within your permissions</p>
                    </div>
                    <button
                     onClick={() => setShowCreateForm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Role</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                    <button
                        className="px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
                    >
                        Roles (3)
                    </button>
                    <button
                        className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Users (0)
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search roles..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Role Card 1 */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Administrator</h3>
                                <p className="text-sm text-gray-500 mb-3">Full access to all features and settings</p>
                            </div>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-medium text-gray-700 mb-2">Permissions (8)</p>
                                <div className="flex flex-wrap gap-1">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Vehicle Management
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Driver Management
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Tracking
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        +5 more
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                <span className="text-xs text-gray-500">
                                    Created 01/15/2024
                                </span>
                                <div className="flex items-center space-x-1">
                                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                                        <Eye className="w-3 h-3" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-yellow-600 transition-colors">
                                        <Edit className="w-3 h-3" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Card 2 */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Fleet Manager</h3>
                                <p className="text-sm text-gray-500 mb-3">Access to fleet operations and reporting</p>
                            </div>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-medium text-gray-700 mb-2">Permissions (6)</p>
                                <div className="flex flex-wrap gap-1">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Vehicle Management
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Maintenance
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Reports
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        +3 more
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                <span className="text-xs text-gray-500">
                                    Created 02/20/2024
                                </span>
                                <div className="flex items-center space-x-1">
                                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                                        <Eye className="w-3 h-3" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-yellow-600 transition-colors">
                                        <Edit className="w-3 h-3" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Card 3 */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Driver</h3>
                                <p className="text-sm text-gray-500 mb-3">Basic access for drivers</p>
                            </div>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-medium text-gray-700 mb-2">Permissions (2)</p>
                                <div className="flex flex-wrap gap-1">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Tracking
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Routes
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                <span className="text-xs text-gray-500">
                                    Created 03/05/2024
                                </span>
                                <div className="flex items-center space-x-1">
                                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                                        <Eye className="w-3 h-3" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-yellow-600 transition-colors">
                                        <Edit className="w-3 h-3" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RoleForm
  isOpen={showCreateForm}
  onClose={() => setShowCreateForm(false)}
  onSubmit={handleCreateRole}
  allowedModules={allowedModules}
  moduleCategories={categories}
  mode="create"
/>
        </div>
    )
}

export default RoleManagement;