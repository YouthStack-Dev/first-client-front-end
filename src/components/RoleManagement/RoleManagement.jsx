import React, { useEffect, useState, useMemo } from "react";
import RoleCard from "./RoleCard";
import RoleForm from "./RoleForm";
import SearchBar from "./SearchBar";
import ToolBar from "../ui/ToolBar";
import Select from "react-select";

import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Users,
  FileText,
  Shield,
} from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import PoliciesManagement from "./PoliciesManagement";
import {
  createRole,
  fetchRolesThunk,
  updateRole,
} from "../../redux/features/Permissions/permissionsThunk";
import { fetchCompaniesThunk } from "../../redux/features/company/companyThunks";
import { useDispatch, useSelector } from "react-redux";
import {
  selectRoles,
  rolesLoading,
  rolesLoaded,
  rolesError,
} from "../../redux/features/Permissions/permissionsSlice";
import {
  selectCompanies,
  selectCompaniesFetched,
} from "../../redux/features/company/companyslice";
import { API_CLIENT } from "../../Api/API_Client";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import { selectStyles } from "../../utils/helperutilities";

const RoleManagement = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncToast, setSyncToast] = useState(null);

  const dispatch = useDispatch();

  // ── Current user & SuperAdmin check ──
  const currentUser  = useSelector(selectCurrentUser);
  const isSuperAdmin = currentUser?.type === "admin";

  // ── Redux: roles ──
  const roles     = useSelector(selectRoles);
  const isLoading = useSelector(rolesLoading);
  const isLoaded  = useSelector(rolesLoaded);
  const error     = useSelector(rolesError);

  // ── Redux: companies (SuperAdmin tenant dropdown) ──
  const companies        = useSelector(selectCompanies);
  const companiesFetched = useSelector(selectCompaniesFetched);

  // ── SuperAdmin: selected tenant & its roles ──
  const [selectedTenant,     setSelectedTenant]     = useState(null);
  const [tenantRoles,        setTenantRoles]        = useState([]);
  const [tenantRolesLoading, setTenantRolesLoading] = useState(false);
  const [tenantRolesError,   setTenantRolesError]   = useState(null);

  // ── Modal states ──
  const [showRoleFormModal,  setShowRoleFormModal]  = useState(false);
  const [selectedRole,       setSelectedRole]       = useState(null);
  const [formMode,           setFormMode]           = useState("create");
  const [roleDetailedData,   setRoleDetailedData]   = useState(null);
  const [roleDetailsLoading, setRoleDetailsLoading] = useState(false);
  const [roleDetailsError,   setRoleDetailsError]   = useState(null);
  const [modalDataReady,     setModalDataReady]     = useState(false);
  const [formError,          setFormError]          = useState(null);
  const [isSubmitting,       setIsSubmitting]       = useState(false);

  // ── Fetch roles on load ──
  useEffect(() => {
    if (!isLoaded && !isLoading) {
      dispatch(fetchRolesThunk());
    }
  }, [dispatch, isLoaded, isLoading]);

  // ── Fetch companies when SuperAdmin is on roles tab ──
  useEffect(() => {
    if (isSuperAdmin && activeTab === "roles" && !companiesFetched) {
      dispatch(fetchCompaniesThunk());
    }
  }, [isSuperAdmin, activeTab, companiesFetched, dispatch]);

  // ── Fetch roles for a specific tenant (SuperAdmin only) ──
  const fetchTenantRoles = async (tenantId) => {
    try {
      setTenantRolesLoading(true);
      setTenantRolesError(null);
      setTenantRoles([]);
      const response = await API_CLIENT.get("/iam/roles/", {
        params: { tenant_id: tenantId },
      });
      setTenantRoles(response.data?.data?.items || []);
    } catch (err) {
      setTenantRolesError(
        err.response?.data?.detail?.message ||
          err.message ||
          "Failed to fetch tenant roles"
      );
    } finally {
      setTenantRolesLoading(false);
    }
  };

  // ── Handle tenant selection ──
  const handleTenantSelect = (option) => {
    setSelectedTenant(option);
    setSearchQuery("");
    setTenantRolesError(null);
    if (option) {
      fetchTenantRoles(option.value);
    } else {
      setTenantRoles([]);
    }
  };

  // ── Tenant options for react-select ──
  const tenantOptions = useMemo(
    () =>
      (companies || []).map((c) => ({
        value: c.tenant_id,
        label: c.name,
        tenant: c,
      })),
    [companies]
  );

  // ── Active roles: tenant-scoped for SuperAdmin, own roles otherwise ──
  const activeRoles = useMemo(() => {
    if (isSuperAdmin && selectedTenant) return tenantRoles;
    return roles || [];
  }, [isSuperAdmin, selectedTenant, tenantRoles, roles]);

  // ── Can edit/delete a role ──
  const canEditRole = (role) => {
    if (isSuperAdmin) return true;
    return !role.is_system_role;
  };

  // ── Filter roles for search ──
  const filteredRoles = useMemo(
    () =>
      (activeRoles || []).filter(
        (role) =>
          role.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (role.description &&
            role.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [activeRoles, searchQuery]
  );

  // ── Fetch detailed role data (for edit/view) ──
  const fetchRoleDetails = async (roleId) => {
    setRoleDetailsLoading(true);
    setRoleDetailsError(null);
    setModalDataReady(false);

    try {
      const response = await API_CLIENT.get(`/iam/roles/${roleId}`);
      if (response.data && response.data.success) {
        setRoleDetailedData(response.data.data);
        setModalDataReady(true);
        return response.data.data;
      } else {
        throw new Error(response.data?.message || "Failed to fetch role details");
      }
    } catch (error) {
      console.error("Error fetching role details:", error);
      setRoleDetailsError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch role details"
      );
      setModalDataReady(true);
      return null;
    } finally {
      setRoleDetailsLoading(false);
    }
  };

  // ── Modal open handlers ──
  const handleAddRole = () => {
    setFormMode("create");
    setSelectedRole(null);
    setRoleDetailedData(null);
    setRoleDetailsError(null);
    setRoleDetailsLoading(false);
    setModalDataReady(true);
    setFormError(null);
    setShowRoleFormModal(true);
  };

  const handleEditRole = async (role) => {
    if (!canEditRole(role)) return;
    setFormMode("edit");
    setSelectedRole(role);
    setRoleDetailedData(null);
    setRoleDetailsError(null);
    setFormError(null);
    setModalDataReady(false);
    await fetchRoleDetails(role.role_id);
    setShowRoleFormModal(true);
  };

  const handleViewDetails = async (role) => {
    setFormMode("view");
    setSelectedRole(role);
    setRoleDetailedData(null);
    setRoleDetailsError(null);
    setFormError(null);
    setModalDataReady(false);
    await fetchRoleDetails(role.role_id);
    setShowRoleFormModal(true);
  };

  const handleViewAssignedUsers = (role) => setSelectedRole(role);
  const handleAssignUsers       = (role) => setSelectedRole(role);

  // ── ✅ Resolved tenantId ──
  // SuperAdmin + tenant selected → selectedTenant.value (e.g. "IBM001")
  // SuperAdmin + no tenant       → null (system roles have no tenant)
  // Regular admin                → their own tenant_id from token
  const resolvedTenantId =
    isSuperAdmin
      ? selectedTenant?.value ?? null
      : currentUser?.tenant_id ?? null;

  // ── Save role (create / edit) ──
  const handleSaveRole = async (roleData) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      // ✅ Always inject tenant_id from resolvedTenantId — never rely on formData
      const payload = {
        ...roleData,
        ...(resolvedTenantId && { tenant_id: resolvedTenantId }),
      };

      console.log("Final payload:", payload); // 🔍 remove after confirmed working

      if (formMode === "create") {
        await dispatch(createRole(payload)).unwrap();
        handleCancelForm();
        if (isSuperAdmin && selectedTenant) {
          fetchTenantRoles(selectedTenant.value);
        } else {
          dispatch(fetchRolesThunk());
        }
      } else {
        if (!selectedRole?.role_id) throw new Error("Role ID is required for update");
        await dispatch(
          updateRole({ roleId: selectedRole.role_id, payload })
        ).unwrap();
        handleCancelForm();
        if (isSuperAdmin && selectedTenant) {
          fetchTenantRoles(selectedTenant.value);
        } else {
          dispatch(fetchRolesThunk());
        }
      }
    } catch (error) {
      const errorMessage =
        error?.message || error?.details || "An unexpected error occurred";
      setFormError(errorMessage);
      console.error("Role operation failed:", error);
      if (error?.errors) console.log("Field errors:", error.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = (role) => {
    if (!canEditRole(role)) return;
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      // dispatch(deleteRoleThunk(role.role_id));
    }
  };

  const handleDuplicateRole = (role) => {
    // TODO: dispatch(duplicateRoleThunk(role.role_id)) once the endpoint exists
    console.warn("handleDuplicateRole: not yet implemented", role.role_id);
  };

  const handleCancelForm = () => {
    setShowRoleFormModal(false);
    setSelectedRole(null);
    setRoleDetailedData(null);
    setRoleDetailsError(null);
    setRoleDetailsLoading(false);
    setModalDataReady(false);
    setFormError(null);
  };

  // ── Sync ──
  const handleSync = () => {
    setSyncLoading(true);
    const syncPromise =
      isSuperAdmin && selectedTenant
        ? fetchTenantRoles(selectedTenant.value)
        : dispatch(fetchRolesThunk());

    Promise.resolve(syncPromise)
      .then(() => {
        setSyncToast({ type: "success", message: "Roles synchronized successfully!" });
        setTimeout(() => setSyncToast(null), 3000);
      })
      .catch(() => {
        setSyncToast({ type: "error", message: "Sync failed. Please try again." });
        setTimeout(() => setSyncToast(null), 3000);
      })
      .finally(() => setSyncLoading(false));
  };

  const getFormData = () => roleDetailedData || selectedRole;

  // ── Tab navigation ──
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

  // ── Loading / error states ──
  if (isLoading && !isLoaded) {
    return (
      <div className="flex-1 bg-white shadow-md overflow-x-hidden overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
          <p className="mt-2 text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-white shadow-md overflow-x-hidden overflow-y-auto flex items-center justify-center">
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
    <div className="flex-1 bg-white shadow-md overflow-x-hidden overflow-y-auto">

      {/* Sync toast */}
      {syncToast && (
        <div
          className={`
            fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]
            flex items-center gap-2.5 px-5 py-3
            border rounded-2xl shadow-lg text-[13px] font-semibold
            ${syncToast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
            }
          `}
        >
          {syncToast.message}
          <button
            onClick={() => setSyncToast(null)}
            className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      )}

      <TabNavigation />

      {activeTab === "roles" && (
        <>
          <ToolBar
            leftElements={
              <div className="flex items-center gap-4 flex-wrap">
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
                    onClick={() => console.log("Search triggered:", searchQuery)}
                    className="ml-2 text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
                    size={18}
                    showTooltip={false}
                  />
                </div>

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

                {/* SuperAdmin only: tenant dropdown */}
                {isSuperAdmin && (
                  <div className="flex items-center gap-2">
                    <div className="w-56">
                      <Select
                        options={tenantOptions}
                        value={selectedTenant}
                        onChange={handleTenantSelect}
                        placeholder="System roles..."
                        isClearable
                        isSearchable
                        isLoading={!companiesFetched}
                        styles={selectStyles}
                        className="text-sm"
                        formatOptionLabel={({ label, tenant }) => (
                          <div className="py-0.5">
                            <div className="font-medium text-sm">{label}</div>
                            <div className="text-xs text-gray-400">{tenant?.tenant_id}</div>
                          </div>
                        )}
                      />
                    </div>
                    {selectedTenant ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 whitespace-nowrap">
                        <Users size={11} />
                        {selectedTenant.label}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 whitespace-nowrap">
                        <Shield size={11} />
                        System
                      </span>
                    )}
                  </div>
                )}

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

            {/* Tenant roles loading */}
            {isSuperAdmin && selectedTenant && tenantRolesLoading && (
              <div className="text-center py-12 text-gray-400">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent mb-3" />
                <p className="text-sm">Loading roles for {selectedTenant.label}...</p>
              </div>
            )}

            {/* Tenant roles error */}
            {isSuperAdmin && tenantRolesError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-4">
                {tenantRolesError}
                <button
                  onClick={() => fetchTenantRoles(selectedTenant.value)}
                  className="ml-3 underline text-red-600 hover:text-red-800"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Role cards */}
            {!(isSuperAdmin && selectedTenant && tenantRolesLoading) && (
              filteredRoles.length === 0 ? (
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
                      onEdit={canEditRole(role) ? handleEditRole : null}
                      onDelete={canEditRole(role) ? handleDeleteRole : null}
                      onDuplicate={handleDuplicateRole}
                      onAssignUsers={handleAssignUsers}
                      onViewAssignedUsers={handleViewAssignedUsers}
                      onView={handleViewDetails}
                      isLocked={!canEditRole(role)}
                      isSuperAdmin={isSuperAdmin}
                    />
                  ))}
                </div>
              )
            )}

            {/* Full-screen loading overlay for role details fetch */}
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

            {/* Role Form Modal */}
            {showRoleFormModal && modalDataReady && (
              <RoleForm
                isOpen={showRoleFormModal}
                onClose={handleCancelForm}
                onSubmit={handleSaveRole}
                mode={formMode}
                initialData={getFormData()}
                roleDetailsError={roleDetailsError}
                formError={formError}
                isSubmitting={isSubmitting}
                isSystemRole={isSuperAdmin && !selectedTenant}
                isSuperAdmin={isSuperAdmin}
                tenantId={resolvedTenantId}
              />
            )}
          </div>
        </>
      )}

      {activeTab === "policies" && <PoliciesManagement />}
    </div>
  );
};

export default RoleManagement;