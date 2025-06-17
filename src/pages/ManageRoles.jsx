import { useState } from "react";
import { CreateRoleForm } from "../components/modals/CreateRoleForm"
import { Plus, Users, Shield, Search, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { FLEET_MODULES } from "../staticData/Modules";

 const ManageRoles = () => { 
    const [showCreateRole, setShowCreateRole] = useState(false);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('roles');

  const currentClient = {
    id: 'client-1',
    name: 'John Smith',
    email: 'john@acmefleet.com',
    roleId: 'client-role',
    createdBy: 'super-admin',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'active',
    type: 'client',
    allowedModules: [
      'vehicle-management',
      'driver-management',
      'real-time-tracking',
      'route-optimization',
      'maintenance-scheduling',
      'fuel-management',
      'fleet-analytics',
      'compliance-reports'
    ],
    companyName: 'ACME Fleet Solutions',
    contactPerson: 'John Smith',
    phone: '+1 (555) 123-4567'
  };
  const handleCreateRole = (roleData) => {
    const newRole = {
      ...roleData,
      id: `role-${Date.now()}`,
      createdBy: currentClient.id,
      createdAt: new Date().toISOString()
    };
    setRoles(prev => [...prev, newRole]);
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getModuleName = (moduleId) => {
    return FLEET_MODULES.find(m => m.id === moduleId)?.name || moduleId;
  };

  const getAllowedModules = () => {
    return FLEET_MODULES.filter(module => currentClient.allowedModules.includes(module.id));
  };

    return(
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Role & User Management</h2>
              <p className="text-sm text-gray-500">Create roles and manage user access within your permissions</p>
            </div>
            <button
              onClick={() => setShowCreateRole(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Role</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'roles' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Roles ({roles.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Users ({users.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'roles' ? (
            filteredRoles.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
                <p className="text-gray-500 mb-4">
                  {roles.length === 0 ? "Create your first role to get started" : "Try adjusting your search criteria"}
                </p>
                {roles.length === 0 && (
                  <button
                    onClick={() => setShowCreateRole(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create First Role
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoles.map(role => (
                  <div key={role.id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{role.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">{role.description}</p>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Permissions ({role.permissions.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map(permission => (
                            <span
                              key={permission.moduleId}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {getModuleName(permission.moduleId)}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Created {new Date(role.createdAt).toLocaleDateString()}
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
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
              <p className="text-gray-500">Users will appear here once you create roles and assign them</p>
            </div>
          )}
        </div>
        <CreateRoleForm
        isOpen={showCreateRole}
        onClose={() => setShowCreateRole(false)}
        onSubmit={handleCreateRole}
        currentUser={currentClient}
      />
      </div>
    )
  }


  export default ManageRoles