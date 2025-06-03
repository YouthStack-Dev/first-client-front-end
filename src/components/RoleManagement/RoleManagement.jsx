import React, { useState } from 'react';
import RoleList from './RoleList';
import RoleForm from './RoleForm';
import SearchBar from './SearchBar';
import { defaultPermissions } from './utils';
import { ShieldCheck } from 'lucide-react';

const RoleManagement = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: {
        Dashboard: { view: true, edit: true, create: true },
        Users: { view: true, edit: true, delete: true, create: true },
        Content: { view: true, edit: true, delete: true, create: true, publish: true },
        Settings: { view: true, configure: true, export: true },
        Reports: { view: true, export: true, schedule: true },
      },
    },
    {
      id: 2,
      name: 'Editor',
      description: 'Can edit content but cannot change system settings',
      permissions: {
        Dashboard: { view: true, edit: false, create: false },
        Users: { view: true, edit: false, delete: false, create: false },
        Content: { view: true, edit: true, delete: false, create: true, publish: false },
        Settings: { view: false, configure: false, export: false },
        Reports: { view: true, export: true, schedule: false },
      },
    },
    {
      id: 3,
      name: 'Viewer',
      description: 'Read-only access to content and reports',
      permissions: {
        Dashboard: { view: true, edit: false, create: false },
        Users: { view: false, edit: false, delete: false, create: false },
        Content: { view: true, edit: false, delete: false, create: false, publish: false },
        Settings: { view: false, configure: false, export: false },
        Reports: { view: true, export: false, schedule: false },
      },
    },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRole = () => {
    setCurrentRole({
      id: 0,
      name: '',
      description: '',
      permissions: defaultPermissions(),
    });
    setIsEditing(true);
  };

  const handleEditRole = (role) => {
    setCurrentRole({ ...role });
    setIsEditing(true);
  };

  const handleSaveRole = (role) => {
    if (role.id === 0) {
      const newRole = {
        ...role,
        id: Math.max(0, ...roles.map(r => r.id)) + 1,
      };
      setRoles([...roles, newRole]);
    } else {
      setRoles(roles.map(r => (r.id === role.id ? role : r)));
    }
    setIsEditing(false);
    setCurrentRole(null);
  };

  const handleDeleteRole = (id) => {
    setRoles(roles.filter(role => role.id !== id));
  };

  const handleDuplicateRole = (role) => {
    const newRole = {
      ...role,
      id: Math.max(0, ...roles.map(r => r.id)) + 1,
      name: `${role.name} (Copy)`,
    };
    setRoles([...roles, newRole]);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentRole(null);
  };

  return (
    <div className="w-full  bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="h-7 w-7 text-white" />
          <h1 className="text-xl font-bold text-white">Role & Permissions Manager</h1>
        </div>
      </div>

      {isEditing ? (
        <RoleForm
          role={currentRole}
          onSave={handleSaveRole}
          onCancel={handleCancel}
        />
      ) : (
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <button
              onClick={handleAddRole}
              className="flex-shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 ease-in-out flex items-center justify-center gap-2"
            >
              <span className="text-xl font-bold">+</span>
              <span>Add New Role</span>
            </button>
          </div>

          <RoleList
            roles={filteredRoles}
            onEdit={handleEditRole}
            onDelete={handleDeleteRole}
            onDuplicate={handleDuplicateRole}
          />
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
