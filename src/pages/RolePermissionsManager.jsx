import React, { useState, useEffect } from 'react';
// import 'https://cdn.tailwindcss.com/2.2.19/tailwind.min.css';

const RolePermissionsEditor = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Admin',
      permissions: {
        Dashboard: { view: true, edit: true },
        Users: { view: true, edit: true, delete: true },
        Settings: { view: true, configure: true },
      },
    },
    {
      id: 2,
      name: 'Editor',
      permissions: {
        Dashboard: { view: true, edit: false },
        Users: { view: true, edit: true, delete: false },
        Settings: { view: false, configure: false },
      },
    },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState({
    Dashboard: { view: false, edit: false },
    Users: { view: false, edit: false, delete: false },
    Settings: { view: false, configure: false },
  });
  const [activeModule, setActiveModule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const modules = {
    Dashboard: ['view', 'edit'],
    Users: ['view', 'edit', 'delete'],
    Settings: ['view', 'configure'],
  };

  const handleAddRole = () => {
    if (!roleName) return;
    setIsLoading(true);
    setTimeout(() => {
      const newRole = {
        id: roles.length + 1,
        name: roleName,
        permissions,
      };
      setRoles([...roles, newRole]);
      setSuccessMessage('Role added successfully!');
      resetForm();
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 500);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setPermissions(role.permissions);
    setIsAdding(false);
  };

  const handleUpdateRole = () => {
    if (!editingRole || !roleName) return;
    setIsLoading(true);
    setTimeout(() => {
      setRoles(
        roles.map((role) =>
          role.id === editingRole.id ? { ...role, name: roleName, permissions } : role
        )
      );
      setSuccessMessage('Role updated successfully!');
      resetForm();
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 500);
  };

  const handleDeleteRole = (id) => {
    setIsLoading(true);
    setTimeout(() => {
      setRoles(roles.filter((role) => role.id !== id));
      setSuccessMessage('Role deleted successfully!');
      setShowDeleteConfirm(null);
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 500);
  };

  const handlePermissionChange = (module, subModule) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [subModule]: !prev[module][subModule],
      },
    }));
  };

  const handleToggleAllPermissions = (module) => {
    setPermissions((prev) => {
      const allSelected = modules[module].every((subModule) => prev[module][subModule]);
      return {
        ...prev,
        [module]: Object.fromEntries(
          modules[module].map((subModule) => [subModule, !allSelected])
        ),
      };
    });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingRole(null);
    setRoleName('');
    setPermissions({
      Dashboard: { view: false, edit: false },
      Users: { view: false, edit: false, delete: false },
      Settings: { view: false, configure: false },
    });
    setActiveModule(null);
  };

  const toggleModule = (module) => {
    setActiveModule(activeModule === module ? null : module);
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        Role & Permissions Management
      </h2>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this role?</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDeleteRole(showDeleteConfirm)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdding || editingRole ? (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {editingRole ? 'Edit Role' : 'Add New Role'}
          </h3>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter Role Name"
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              disabled={isLoading}
            />
            <div className="space-y-3">
              {Object.keys(modules).map((module) => (
                <div key={module} className="border border-gray-200 rounded-md">
                  <button
                    type="button"
                    onClick={() => toggleModule(module)}
                    className="w-full text-left p-3 font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md flex justify-between items-center"
                    disabled={isLoading}
                  >
                    <span>{module}</span>
                    <span>{activeModule === module ? '▲' : '▼'}</span>
                  </button>
                  {activeModule === module && (
                    <div className="p-3 bg-white rounded-b-md">
                      <button
                        onClick={() => handleToggleAllPermissions(module)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 mb-2"
                        title="Toggle all permissions for this module"
                      >
                        {modules[module].every((subModule) => permissions[module][subModule])
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>
                      <div className="flex flex-wrap gap-4">
                        {modules[module].map((subModule) => (
                          <label
                            key={subModule}
                            className="flex items-center gap-2 cursor-pointer"
                            title={`Toggle ${subModule} permission for ${module}`}
                          >
                            <input
                              type="checkbox"
                              checked={permissions[module][subModule]}
                              onChange={() => handlePermissionChange(module, subModule)}
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
                              disabled={isLoading}
                            />
                            <span className="capitalize text-gray-700">{subModule}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={editingRole ? handleUpdateRole : handleAddRole}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400"
                disabled={isLoading || !roleName}
              >
                {isLoading ? 'Processing...' : editingRole ? 'Update Role' : 'Add Role'}
              </button>
              <button
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition disabled:bg-gray-400"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setIsAdding(true)}
            className="mb-6 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Role
          </button>
          <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
            {roles.map((role) => (
              <div key={role.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                    <div className="mt-2 space-y-1">
                      {Object.entries(role.permissions).map(([module, perms]) => (
                        <div key={module} className="text-sm text-gray-600">
                          <span className="font-medium">{module}:</span>{' '}
                          {Object.entries(perms)
                            .filter(([, value]) => value)
                            .map(([key]) => key)
                            .join(', ') || 'None'}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition flex items-center"
                      title="Edit this role"
                      disabled={isLoading}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(role.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition flex items-center"
                      title="Delete this role"
                      disabled={isLoading}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissionsEditor;