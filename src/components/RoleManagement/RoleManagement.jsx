import React, { useEffect, useState } from "react";
import RoleCard from "./RoleCard";
import RoleForm from "./RoleForm";
import SearchBar from "./SearchBar";
import ToolBar from "../ui/ToolBar";

import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Download,
  Users,
  FileText,
} from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import PoliciesManagement from "./PoliciesManagement";
import {
  createRole,
  fetchRolesThunk,
  updateRole,
} from "../../redux/features/Permissions/permissionsThunk";
import { useDispatch, useSelector } from "react-redux";
import {
  selectRoles,
  rolesLoading,
  rolesLoaded,
  rolesError,
} from "../../redux/features/Permissions/permissionsSlice";
import { logDebug } from "../../utils/logger";
import { API_CLIENT } from "../../Api/API_Client";

const RoleManagement = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);

  const dispatch = useDispatch();

  // Select data from Redux store
  const roles = useSelector(selectRoles);
  const isLoading = useSelector(rolesLoading);
  const isLoaded = useSelector(rolesLoaded);
  const error = useSelector(rolesError);

  // Modal states
  const [showRoleFormModal, setShowRoleFormModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formMode, setFormMode] = useState("create");
  const [roleDetailedData, setRoleDetailedData] = useState(null);
  const [roleDetailsLoading, setRoleDetailsLoading] = useState(false);
  const [roleDetailsError, setRoleDetailsError] = useState(null);
  const [modalDataReady, setModalDataReady] = useState(false);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Filter roles for search
  const filteredRoles = roles?.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description &&
        role.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Fetch role details from backend
  const fetchRoleDetails = async (roleId) => {
    setRoleDetailsLoading(true);
    setRoleDetailsError(null);
    setModalDataReady(false);

    try {
      const response = await API_CLIENT.get(`/v1/iam/roles/${roleId}`);

      if (response.data && response.data.success) {
        setRoleDetailedData(response.data.data);
        setModalDataReady(true);
        return response.data.data;
      } else {
        throw new Error(
          response.data?.message || "Failed to fetch role details"
        );
      }
    } catch (error) {
      console.error("Error fetching role details:", error);
      setRoleDetailsError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch role details"
      );
      setModalDataReady(true); // Ready to show modal with error
      return null;
    } finally {
      setRoleDetailsLoading(false);
    }
  };

  // Handle Add Role - No loading needed
  const handleAddRole = () => {
    setFormMode("create");
    setSelectedRole(null);
    setRoleDetailedData(null);
    setRoleDetailsError(null);
    setRoleDetailsLoading(false);
    setModalDataReady(true); // Data is ready immediately for create mode
    setShowRoleFormModal(true);
  };

  // Handle Edit Role - fetch then open modal
  const handleEditRole = async (role) => {
    setFormMode("edit");
    setSelectedRole(role);
    setRoleDetailedData(null);
    setRoleDetailsError(null);
    setModalDataReady(false);

    // 1) fetch details
    await fetchRoleDetails(role.role_id);
    // 2) open modal after data is ready flag is set in fetchRoleDetails
    setShowRoleFormModal(true);
  };

  // Handle View Details - fetch then open modal
  const handleViewDetails = async (role) => {
    setFormMode("view");
    setSelectedRole(role);
    setRoleDetailedData(null);
    setRoleDetailsError(null);
    setModalDataReady(false);

    await fetchRoleDetails(role.role_id);
    setShowRoleFormModal(true);
  };

  // Handle viewing assigned users
  const handleViewAssignedUsers = (role) => {
    setSelectedRole(role);
  };

  // Handle opening user assignment modal
  const handleAssignUsers = (role) => {
    setSelectedRole(role);
  };

  useEffect(() => {
    // Fetch roles only if they haven't been loaded yet
    if (!isLoaded && !isLoading) {
      dispatch(fetchRolesThunk());
      logDebug(" this is the roles ", roles);
    }
  }, [dispatch, isLoaded, isLoading, roles]);

  const handleSaveRole = async (roleData) => {
    setIsSubmitting(true);
    setFormError(null); // Clear previous errors

    try {
      if (formMode === "create") {
        const response = await dispatch(createRole(roleData)).unwrap();
        console.log("Role created successfully:", response);
        handleCancelForm();
      } else {
        if (!selectedRole?.role_id) {
          throw new Error("Role ID is required for update");
        }

        const response = await dispatch(
          updateRole({
            roleId: selectedRole.role_id,
            payload: roleData,
          })
        ).unwrap();

        console.log("Role updated successfully:", response);
        handleCancelForm();
      }
    } catch (error) {
      // Extract error message from the rejected value
      const errorMessage =
        error?.message || error?.details || "An unexpected error occurred";

      setFormError(errorMessage);
      console.error("Role operation failed:", error);

      // You might also want to extract specific field errors
      if (error?.errors) {
        // Handle field-specific errors if your API returns them
        console.log("Field errors:", error.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteRole = (role) => {
    if (
      window.confirm(`Are you sure you want to delete the role "${role.name}"?`)
    ) {
      // dispatch(deleteRoleThunk(role.id));
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
    // dispatch(createRoleThunk(newRole));
  };

  const handleCancelForm = () => {
    setShowRoleFormModal(false);
    setSelectedRole(null);
    setRoleDetailedData(null);
    setRoleDetailsError(null);
    setRoleDetailsLoading(false);
    setModalDataReady(false);
  };

  const handleSync = () => {
    setSyncLoading(true);
    dispatch(fetchRolesThunk()).finally(() => {
      setSyncLoading(false);
      alert("Roles synchronized successfully!");
    });
  };

  const handleExportRoles = () => {
    console.log("Exporting roles...");
    alert("Roles exported successfully!");
  };

  // Prepare data for RoleForm
  const getFormData = () => {
    if (roleDetailedData) {
      return roleDetailedData;
    }
    return selectedRole;
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

  // Show loading state for initial roles loading
  if (isLoading && !isLoaded) {
    return (
      <div className="flex-1 bg-white shadow-md overflow-auto flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
          <p className="mt-2 text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 bg-white shadow-md overflow-auto flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-600 font-semibold">Error loading roles</div>
          <p className="text-gray-600 mt-2">{error}</p>
          <ReusableButton
            module="role"
            action="read"
            icon={RefreshCw}
            title="Retry loading roles"
            buttonName="Retry"
            onClick={() => dispatch(fetchRolesThunk())}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
          />
        </div>
      </div>
    );
  }

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
                  title="Synchronize roles"
                  buttonName="Sync"
                  onClick={handleSync}
                  loading={syncLoading}
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
                  buttonName="Role"
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
                    (sum, role) => sum + (role.assignedUsers?.length || 0),
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
                    module="role"
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
                    key={role.role_id}
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

            {/* Loading overlay when fetching role details */}
            {roleDetailsLoading && (
              <div className="fixed inset-0 z-50 bg-white bg-opacity-90 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-lg shadow-xl">
                  <RefreshCw className="h-12 w-12 animate-spin mx-auto text-indigo-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Loading Role Details
                  </h3>
                  <p className="text-gray-600">
                    Please wait while we fetch the role information...
                  </p>
                </div>
              </div>
            )}

            {/* Role Form Modal - Only show when data is ready */}
            {showRoleFormModal && modalDataReady && (
              <RoleForm
                isOpen={showRoleFormModal}
                onClose={handleCancelForm}
                onSubmit={handleSaveRole}
                mode={formMode}
                initialData={getFormData()}
                roleDetailsError={roleDetailsError}
                formError={formError} // Pass the error to display in form
                isSubmitting={isSubmitting} // Pass loading state
              />
            )}
          </div>
        </>
      )}

      {/* Policies Management Content */}
      {activeTab === "policies" && <PoliciesManagement />}
    </div>
  );
};

export default RoleManagement;
