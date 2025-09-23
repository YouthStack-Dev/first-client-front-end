import React, { useState, useEffect } from "react";
import RoleToolbar from "../components/RoleManagement/RoleToolbar";
import RoleList from "../components/RoleManagement/RoleList";
import RoleForm from "../components/RoleManagement/RoleForm";
import { API_CLIENT } from "../Api/API_Client";
import { useSelector } from "react-redux";
import { selectPermissions } from "../redux/features/auth/authSlice";
import { logDebug } from "../utils/logger";
import UserAssignmentModal from "../components/RoleManagement/UserAssignmentModal";
import { AssignedUsersModal } from "../components/RoleManagement/AssignedUsersModal";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  
  // Modal state management
  const [modals, setModals] = useState({
    create: false,
    assignment: false,
    assignedUsers: false
  });
  const [selectedRole, setSelectedRole] = useState(null);

  const allowedModules = useSelector(selectPermissions);

  // Fetch roles from backend
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await API_CLIENT.get("api/roles/company-roles");
      setRoles(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Modal handlers
  const openModal = (modalName, role = null) => {
    setSelectedRole(role);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setSelectedRole(null);
  };

  const handleEditRole = (role) => {
    console.log("Edit role", role);
    // You can implement edit functionality here
  };

  const handleDeleteRole = (role) => {
    console.log("Delete role", role);
    // You can implement delete functionality here
  };

  const handleDuplicateRole = (role) => {
    console.log("Duplicate role", role);
    // You can implement duplicate functionality here
  };

  const handleAssignUsers = async (roleId, userIds) => {
    try {
      // Make API call to assign users to role
      const response = await API_CLIENT.post(
        `api/roles/${roleId}/assign-users`,
        { userIds }
      );
  
      if (response.data.success) {
        // Refresh roles data or update UI as needed
        fetchRoles(); // or update state accordingly
        alert("Users assigned successfully!");
      } else {
        console.error("Failed to assign users:", response.data.message);
        alert("Failed to assign users: " + response.data.message);
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error assigning users:", error);
      throw error; // Re-throw to let the modal handle the error state
    }
  };
  

  const handleCreateRole = async (newRole) => {
    setFormLoading(true);
    try {
      logDebug("Creating role with data:", newRole);
      
      // Format the permissions data properly for the backend
      const formattedRole = {
        name: newRole.name.trim(),
        description: newRole.description.trim(),
        isAssignable: newRole.isAssignable,
        permissions: newRole.permissions.map(perm => ({
          moduleKey: perm.moduleKey,
          canRead: Boolean(perm.canRead),
          canWrite: Boolean(perm.canWrite),
          canDelete: Boolean(perm.canDelete)
        }))
      };

      logDebug("Formatted role data for API:", formattedRole);
      
      // Send the role data to your backend API
      const response = await API_CLIENT.post("api/role-permissions", formattedRole);
      
      logDebug("Role created successfully:", response.data);
      
      // Refetch roles to get the updated list from the server
      await fetchRoles();
      
      // Close the form AFTER successful creation
      closeModal('create');
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error creating role:", error);
      setError(error.response?.data?.message || "Failed to create role");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-4">
      <RoleToolbar
        onCreateClick={() => openModal('create')}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="mt-4">
        {loading && <p>Loading roles...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <RoleList
            roles={filteredRoles}
            onEdit={handleEditRole}
            onDelete={handleDeleteRole}
            onDuplicate={handleDuplicateRole}
            onAssignUsers={(role) => openModal('assignment', role)}
            onViewAssignedUsers={(role) => openModal('assignedUsers', role)}
          />
        )}
      </div>

      {/* Create Role Modal */}
      <RoleForm
        isOpen={modals.create}
        onClose={() => closeModal('create')}
        onSubmit={handleCreateRole}
        allowedModules={allowedModules}
        mode="create"
        loading={formLoading}
      />

      {/* User Assignment Modal */}
      <UserAssignmentModal
        role={selectedRole}
        isOpen={modals.assignment}
        onClose={() => closeModal('assignment')}
        onAssign={handleAssignUsers}
      />

      {/* Assigned Users Modal */}
      <AssignedUsersModal
        role={selectedRole}
        isOpen={modals.assignedUsers}
        onClose={() => closeModal('assignedUsers')}
      />
    </div>
  );
};

export default RoleManagement;