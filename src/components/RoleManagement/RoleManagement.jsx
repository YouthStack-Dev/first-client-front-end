import React, { useState } from "react";
import RoleCard from "./RoleCard";
import RoleForm from "./RoleForm";
import SearchBar from "./SearchBar";
import ToolBar from "../ui/ToolBar";
import { AssignedUsersModal } from "./AssignedUsersModal";
import UserAssignmentModal from "./UserAssignmentModal";
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Download,
  Users,
  FileText,
} from "lucide-react";
import {
  dummyRoledata,
  mockAllowedModules,
  staticEmployees,
} from "../../staticData/permissionModules";
import ReusableButton from "../ui/ReusableButton";

// Mock Policies Management component - replace with your actual component
import PoliciesManagement from "./PoliciesManagement";

const RoleManagement = () => {
  const [activeTab, setActiveTab] = useState("roles"); // "roles" or "policies"
  const [roles, setRoles] = useState(dummyRoledata);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showRoleFormModal, setShowRoleFormModal] = useState(false);
  const [showAssignedUsersModal, setShowAssignedUsersModal] = useState(false);
  const [showUserAssignmentModal, setShowUserAssignmentModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formMode, setFormMode] = useState("create");

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get assigned users for a role
  const getAssignedUsers = (role) => {
    return staticEmployees.filter((employee) =>
      role.assignedUsers.includes(employee.id)
    );
  };

  const handleAddRole = () => {
    setFormMode("create");
    setSelectedRole(null);
    setShowRoleFormModal(true);
  };

  const handleEditRole = (role) => {
    setFormMode("edit");
    setSelectedRole(role);
    setShowRoleFormModal(true);
  };

  const handleViewDetails = (role) => {
    setFormMode("view");
    setSelectedRole(role);
    setShowRoleFormModal(true);
  };

  // Convert permissions format for the modal form
  const convertPermissionsForForm = (permissions) => {
    const formattedPermissions = [];

    Object.keys(permissions).forEach((moduleKey) => {
      const modulePerms = permissions[moduleKey];
      const permObj = { moduleKey };

      if (modulePerms.view !== undefined) permObj.canRead = modulePerms.view;
      if (modulePerms.edit !== undefined) permObj.canWrite = modulePerms.edit;
      if (modulePerms.delete !== undefined)
        permObj.canDelete = modulePerms.delete;
      if (modulePerms.create !== undefined)
        permObj.canWrite = modulePerms.create || permObj.canWrite;

      formattedPermissions.push(permObj);
    });

    return formattedPermissions;
  };

  // Convert back to the original permissions format
  const convertPermissionsFromForm = (permissions) => {
    const originalFormat = {};

    permissions.forEach((perm) => {
      originalFormat[perm.moduleKey] = {
        view: Boolean(perm.canRead),
        edit: Boolean(perm.canWrite),
        delete: Boolean(perm.canDelete),
        create: Boolean(perm.canWrite),
      };
    });

    return originalFormat;
  };

  const handleSaveRole = (roleData) => {
    const now = new Date().toISOString();

    // Convert permissions back to original format
    const convertedPermissions = convertPermissionsFromForm(
      roleData.permissions
    );

    if (formMode === "create") {
      const newRole = {
        id: Math.max(0, ...roles.map((r) => r.id)) + 1,
        name: roleData.name,
        description: roleData.description,
        permissions: convertedPermissions,
        createdAt: now,
        updatedAt: now,
        isSystemLevel: false,
        isAssignable: roleData.isAssignable,
        assignedUsers: [],
      };
      setRoles([...roles, newRole]);
    } else {
      const updatedRole = {
        ...selectedRole,
        name: roleData.name,
        description: roleData.description,
        permissions: convertedPermissions,
        updatedAt: now,
        isAssignable: roleData.isAssignable,
      };
      setRoles(roles.map((r) => (r.id === selectedRole.id ? updatedRole : r)));
    }

    setShowRoleFormModal(false);
    setSelectedRole(null);
  };

  const handleDeleteRole = (role) => {
    if (
      window.confirm(`Are you sure you want to delete the role "${role.name}"?`)
    ) {
      setRoles(roles.filter((r) => r.id !== role.id));
    }
  };

  const handleDuplicateRole = (role) => {
    const newRole = {
      ...role,
      id: Math.max(0, ...roles.map((r) => r.id)) + 1,
      name: `${role.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSystemLevel: false,
      assignedUsers: [],
    };
    setRoles([...roles, newRole]);
  };

  // Handle viewing assigned users
  const handleViewAssignedUsers = (role) => {
    setSelectedRole(role);
    setShowAssignedUsersModal(true);
  };

  // Handle opening user assignment modal
  const handleAssignUsers = (role) => {
    setSelectedRole(role);
    setShowUserAssignmentModal(true);
  };

  // Handle assigning users to role
  const handleAssignUsersToRole = async (roleId, userIds) => {
    setRoles(
      roles.map((role) =>
        role.id === roleId
          ? {
              ...role,
              assignedUsers: [...new Set([...role.assignedUsers, ...userIds])],
              updatedAt: new Date().toISOString(),
            }
          : role
      )
    );

    alert(`Successfully assigned ${userIds.length} user(s) to the role`);
  };

  // Handle removing user from role
  const handleRemoveUserFromRole = (roleId, userId) => {
    setRoles(
      roles.map((role) =>
        role.id === roleId
          ? {
              ...role,
              assignedUsers: role.assignedUsers.filter((id) => id !== userId),
              updatedAt: new Date().toISOString(),
            }
          : role
      )
    );

    alert("User removed from role successfully");
  };

  const handleCancelForm = () => {
    setShowRoleFormModal(false);
    setSelectedRole(null);
  };

  const handleSync = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log("Roles synced");
      alert("Roles synchronized successfully!");
    }, 1000);
  };

  const handleExportRoles = () => {
    // Export functionality
    console.log("Exporting roles...");
    alert("Roles exported successfully!");
  };

  // Tab navigation component
  const TabNavigation = () => (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-6 pt-4">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("roles")}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
              activeTab === "roles"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Users size={18} />
            Role Management
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
              activeTab === "policies"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileText size={18} />
            Policies Management
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-white shadow-md overflow-auto">
      {/* Top Tab Navigation */}
      <TabNavigation />

      {/* Role Management Content */}
      {activeTab === "roles" && (
        <>
          <ToolBar
            leftElements={
              <div className="flex items-center gap-4 flex-wrap">
                {/* Search Bar with ReusableButton */}
                <div className="relative flex items-center">
                  <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    placeholder="Search roles by name or description..."
                  />
                  <ReusableButton
                    module="Roles"
                    action="search"
                    icon={Search}
                    title="Search roles"
                    onClick={() =>
                      console.log("Search triggered:", searchQuery)
                    }
                    className="ml-2 text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
                    size={18}
                    showTooltip={false}
                  />
                </div>

                {/* Sync Button */}
                <ReusableButton
                  module="role"
                  action="read"
                  icon={RefreshCw}
                  title="Synchronize roles "
                  buttonName="Sync"
                  onClick={handleSync}
                  loading={loading}
                  loadingText="Syncing..."
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm 
                           hover:bg-blue-600 flex items-center gap-2 transition-colors duration-200"
                  size={16}
                />
              </div>
            }
            rightElements={
              <div className="flex items-center gap-3">
                {/* Export Button */}
                <ReusableButton
                  module="role"
                  action="export"
                  icon={Download}
                  title="Export roles to CSV"
                  onClick={handleExportRoles}
                  className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 border border-gray-300"
                  size={18}
                />

                {/* Add New Role Button */}
                <ReusableButton
                  module="role"
                  action="create"
                  icon={Plus}
                  title="Create a new role"
                  buttonName="Add New Role"
                  onClick={handleAddRole}
                  className="flex-shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-lg 
                           hover:bg-indigo-700 transition-colors duration-200 ease-in-out 
                           flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  size={18}
                />
              </div>
            }
          />
          <div className="p-6">
            {/* Role Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-blue-600 font-semibold">Total Roles</div>
                <div className="text-2xl font-bold text-blue-800">
                  {roles.length}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-green-600 font-semibold">
                  Assignable Roles
                </div>
                <div className="text-2xl font-bold text-green-800">
                  {roles.filter((r) => r.isAssignable).length}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-purple-600 font-semibold">
                  System Roles
                </div>
                <div className="text-2xl font-bold text-purple-800">
                  {roles.filter((r) => r.isSystemLevel).length}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="text-orange-600 font-semibold">
                  Total Assignments
                </div>
                <div className="text-2xl font-bold text-orange-800">
                  {roles.reduce(
                    (sum, role) => sum + role.assignedUsers.length,
                    0
                  )}
                </div>
              </div>
            </div>

            {/* Role Cards Grid */}
            {filteredRoles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShieldCheck className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No roles found</h3>
                <p>
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Get started by creating your first role"}
                </p>
                {!searchQuery && (
                  <ReusableButton
                    module="Roles"
                    action="create"
                    icon={Plus}
                    title="Create your first role"
                    buttonName="Create First Role"
                    onClick={handleAddRole}
                    className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg 
                             hover:bg-indigo-700 transition-colors duration-200 
                             flex items-center justify-center gap-2 mx-auto"
                    size={18}
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredRoles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onEdit={handleEditRole}
                    onDelete={handleDeleteRole}
                    onDuplicate={handleDuplicateRole}
                    onAssignUsers={handleAssignUsers}
                    onViewAssignedUsers={handleViewAssignedUsers}
                    onView={handleViewDetails}
                  />
                ))}
              </div>
            )}

            {/* Role Form Modal */}
            <RoleForm
              isOpen={showRoleFormModal}
              onClose={handleCancelForm}
              onSubmit={handleSaveRole}
              allowedModules={mockAllowedModules}
              initialData={
                formMode === "edit" || formMode === "view"
                  ? {
                      name: selectedRole?.name || "",
                      description: selectedRole?.description || "",
                      permissions: convertPermissionsForForm(
                        selectedRole?.permissions || {}
                      ),
                      isAssignable: selectedRole?.isAssignable ?? true,
                    }
                  : null
              }
              mode={formMode}
            />

            {/* Assigned Users Modal */}
            <AssignedUsersModal
              role={selectedRole}
              isOpen={showAssignedUsersModal}
              onClose={() => setShowAssignedUsersModal(false)}
              assignedUsers={selectedRole ? getAssignedUsers(selectedRole) : []}
              onRemoveUser={handleRemoveUserFromRole}
            />

            {/* User Assignment Modal */}
            <UserAssignmentModal
              role={selectedRole}
              isOpen={showUserAssignmentModal}
              onClose={() => setShowUserAssignmentModal(false)}
              onAssign={handleAssignUsersToRole}
              employees={staticEmployees}
            />
          </div>
        </>
      )}

      {/* Policies Management Content */}
      {activeTab === "policies" && <PoliciesManagement />}
    </div>
  );
};

export default RoleManagement;
