// import React, { useState, useEffect } from "react";
// import RoleToolbar from "../components/RoleManagement/RoleToolbar";
// import RoleList from "../components/RoleManagement/RoleList";
// import RoleForm from "../components/RoleManagement/RoleForm";
// import { API_CLIENT } from "../Api/API_Client";
// import { useSelector } from "react-redux";
// import { selectPermissions } from "../redux/features/auth/authSlice";
// import { logDebug } from "../utils/logger";
// import UserAssignmentModal from "../components/RoleManagement/UserAssignmentModal";
// import { AssignedUsersModal } from "../components/RoleManagement/AssignedUsersModal";

// const RoleManagement = () => {
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [formLoading, setFormLoading] = useState(false);
  
//   // Modal state management
//   const [modals, setModals] = useState({
//     create: false,
//     assignment: false,
//     assignedUsers: false
//   });
//   const [selectedRole, setSelectedRole] = useState(null);

//   const allowedModules = useSelector(selectPermissions);

//   // Fetch roles from backend
//   const fetchRoles = async () => {
//     setLoading(true);
//     try {
//       const response = await API_CLIENT.get("api/roles/company-roles");
//       setRoles(response.data);
//       setError(null);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load roles");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRoles();
//   }, []);

//   const filteredRoles = roles.filter((role) =>
//     role.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Modal handlers
//   const openModal = (modalName, role = null) => {
//     setSelectedRole(role);
//     setModals(prev => ({ ...prev, [modalName]: true }));
//   };

//   const closeModal = (modalName) => {
//     setModals(prev => ({ ...prev, [modalName]: false }));
//     setSelectedRole(null);
//   };

//   const handleEditRole = (role) => {
//     console.log("Edit role", role);
//     // You can implement edit functionality here
//   };

//   const handleDeleteRole = (role) => {
//     console.log("Delete role", role);
//     // You can implement delete functionality here
//   };

//   const handleDuplicateRole = (role) => {
//     console.log("Duplicate role", role);
//     // You can implement duplicate functionality here
//   };

//   const handleAssignUsers = async (roleId, userIds) => {
//     try {
//       // Make API call to assign users to role
//       const response = await API_CLIENT.post(
//         `api/roles/${roleId}/assign-users`,
//         { userIds }
//       );
  
//       if (response.data.success) {
//         // Refresh roles data or update UI as needed
//         fetchRoles(); // or update state accordingly
//         alert("Users assigned successfully!");
//       } else {
//         console.error("Failed to assign users:", response.data.message);
//         alert("Failed to assign users: " + response.data.message);
//         throw new Error(response.data.message);
//       }
//     } catch (error) {
//       console.error("Error assigning users:", error);
//       throw error; // Re-throw to let the modal handle the error state
//     }
//   };
  

//   const handleCreateRole = async (newRole) => {
//     setFormLoading(true);
//     try {
//       logDebug("Creating role with data:", newRole);
      
//       // Format the permissions data properly for the backend
//       const formattedRole = {
//         name: newRole.name.trim(),
//         description: newRole.description.trim(),
//         isAssignable: newRole.isAssignable,
//         permissions: newRole.permissions.map(perm => ({
//           moduleKey: perm.moduleKey,
//           canRead: Boolean(perm.canRead),
//           canWrite: Boolean(perm.canWrite),
//           canDelete: Boolean(perm.canDelete)
//         }))
//       };

//       logDebug("Formatted role data for API:", formattedRole);
      
//       // Send the role data to your backend API
//       const response = await API_CLIENT.post("api/role-permissions", formattedRole);
      
//       logDebug("Role created successfully:", response.data);
      
//       // Refetch roles to get the updated list from the server
//       await fetchRoles();
      
//       // Close the form AFTER successful creation
//       closeModal('create');
//       setError(null); // Clear any previous errors
//     } catch (error) {
//       console.error("Error creating role:", error);
//       setError(error.response?.data?.message || "Failed to create role");
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <RoleToolbar
//         onCreateClick={() => openModal('create')}
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//       />

//       <div className="mt-4">
//         {loading && <p>Loading roles...</p>}
//         {error && <p className="text-red-500">Error: {error}</p>}

//         {!loading && !error && (
//           <RoleList
//             roles={filteredRoles}
//             onEdit={handleEditRole}
//             onDelete={handleDeleteRole}
//             onDuplicate={handleDuplicateRole}
//             onAssignUsers={(role) => openModal('assignment', role)}
//             onViewAssignedUsers={(role) => openModal('assignedUsers', role)}
//           />
//         )}
//       </div>

//       {/* Create Role Modal */}
//       <RoleForm
//         isOpen={modals.create}
//         onClose={() => closeModal('create')}
//         onSubmit={handleCreateRole}
//         allowedModules={allowedModules}
//         mode="create"
//         loading={formLoading}
//       />

//       {/* User Assignment Modal */}
//       <UserAssignmentModal
//         role={selectedRole}
//         isOpen={modals.assignment}
//         onClose={() => closeModal('assignment')}
//         onAssign={handleAssignUsers}
//       />

//       {/* Assigned Users Modal */}
//       <AssignedUsersModal
//         role={selectedRole}
//         isOpen={modals.assignedUsers}
//         onClose={() => closeModal('assignedUsers')}
//       />
//     </div>
//   );
// };

// export default RoleManagement;


// pages/RoleManagement.jsx
import { useState } from "react";
import { PermissionPanel } from "../components/PermissionPanel";
import { permissionModules } from "../utils/permissionCategories";
// import { PermissionPanel } from "../components/PermissionPanel";
// import { permissionModules } from "../data/permissionModules";

const RoleManagement = () => {
  // State to track selected permission IDs
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Method to handle permission toggle
  const onPermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => {
      // If permission is already selected, remove it
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      }
      // Otherwise, add it to the selection
      else {
        return [...prev, permissionId];
      }
    });
  };

  // Optional: Method to set specific permissions (for pre-seeding)
  const setPermissions = (permissionIds) => {
    setSelectedPermissions(permissionIds);
  };

  // Optional: Method to clear all permissions
  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  // Optional: Method to select all permissions
  const selectAllPermissions = () => {
    const allPermissionIds = permissionModules.map(permission => permission.permission_id);
    setSelectedPermissions(allPermissionIds);
  };

  // Optional: Method to check if a specific permission is selected
  const isPermissionSelected = (permissionId) => {
    return selectedPermissions.includes(permissionId);
  };

  // Optional: Get selected permission objects for display
  const getSelectedPermissionObjects = () => {
    return permissionModules.filter(permission => 
      selectedPermissions.includes(permission.permission_id)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Role Permissions Management</h1>
          <p className="text-gray-600">Configure permissions for this role</p>
        </div>

        {/* Control Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={selectAllPermissions}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Select All Permissions
          </button>
          <button
            onClick={clearAllPermissions}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Clear All Permissions
          </button>
          <button
            onClick={() => setPermissions([1, 2, 5, 6])} // Example: Basic read permissions
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Set Basic Permissions
          </button>
        </div>

        {/* Permission Panel */}
        <PermissionPanel
          selectedPermissions={selectedPermissions}
          onPermissionToggle={onPermissionToggle}
        />

        {/* Debug/Preview Section */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Selected Permissions ({selectedPermissions.length})
          </h3>
          
          {selectedPermissions.length === 0 ? (
            <p className="text-gray-500">No permissions selected</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getSelectedPermissionObjects().map(permission => (
                  <div key={permission.permission_id} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium capitalize">
                          {permission.module}.{permission.action}
                        </span>
                        <p className="text-sm text-gray-600">{permission.description}</p>
                      </div>
                      <button
                        onClick={() => onPermissionToggle(permission.permission_id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      ID: {permission.permission_id} • {permission.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* JSON Preview */}
              <details className="mt-4">
                <summary className="cursor-pointer font-medium text-gray-700">
                  JSON Data (for API submission)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                  {JSON.stringify({
                    permission_ids: selectedPermissions,
                    total_selected: selectedPermissions.length,
                    permissions: getSelectedPermissionObjects().map(p => ({
                      id: p.permission_id,
                      module: p.module,
                      action: p.action
                    }))
                  }, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {/* Save/Cancel Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => {
              // Here you would typically send selectedPermissions to your API
              console.log('Saving permissions:', selectedPermissions);
              alert(`Saving ${selectedPermissions.length} permissions for this role`);
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;