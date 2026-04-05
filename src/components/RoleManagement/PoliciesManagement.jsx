import { FileText, Plus, Shield, Users, X, CheckCircle, AlertCircle } from "lucide-react";
import ToolBar from "../ui/ToolBar";
import { logDebug } from "../../utils/logger";
import { useEffect, useState, useMemo } from "react";
import { PolicyTable } from "./PolicyCard";
import { PolicyForm } from "../modals/PolicyFromModal";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import {
  policiesLoaded,
  policiesLoading,
  selectPolicies,
} from "../../redux/features/Permissions/permissionsSlice";
import {
  createPolicy,
  fetchPoliciesThunk,
  updatePolicy,
} from "../../redux/features/Permissions/permissionsThunk";
import { fetchCompaniesThunk } from "../../redux/features/company/companyThunks";
import {

  selectCompanies,
  selectCompaniesFetched,
} from "../../redux/features/company/companyslice";
import { API_CLIENT } from "../../Api/API_Client";
import { selectStyles } from "../../utils/helperutilities";


const Toast = ({ toast, onDismiss }) => {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div className={`
      fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]
      flex items-center gap-2.5 px-5 py-3
      border rounded-2xl shadow-lg text-[13px] font-semibold
      ${isSuccess
        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
        : "bg-rose-50 border-rose-200 text-rose-700"
      }
    `}>
      {isSuccess ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {toast.message}
      <button onClick={onDismiss} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
        <X size={12} />
      </button>
    </div>
  );
};

const PoliciesManagement = () => {
  const [searchQuery,     setSearchQuery]     = useState("");
  const [selectedPolicy,  setSelectedPolicy]  = useState(null);
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [modalMode,       setModalMode]       = useState("view");
  const [selectedFilter,  setSelectedFilter]  = useState(null);
  const [apiError,        setApiError]        = useState(null);

  // ✅ Toast state replaces all alert() calls (3 instances removed)
  const [toast, setToast] = useState(null);

  const dispatch = useDispatch();

  // ── Current user & SuperAdmin check ──
  const currentUser  = useSelector(selectCurrentUser);
  const isSuperAdmin = currentUser?.type === "admin";

  // ── Redux: policies ──
  // Named selectors — each returns a primitive or stable reference.
  const policies              = useSelector(selectPolicies);
  const policiesLoadedStatus  = useSelector(policiesLoaded);
  const policiesLoadingStatus = useSelector(policiesLoading);

  // ── Redux: companies (SuperAdmin tenant dropdown) ──
  // ✅ selectCompanies (renamed from selectCompaniesFromRedux in companySlice)
  // companiesFetched persists in Redux across navigation — no duplicate fetches.
  const companies        = useSelector(selectCompanies);
  const companiesFetched = useSelector(selectCompaniesFetched);

  // ── SuperAdmin: selected tenant & its policies ──
  const [selectedTenant,        setSelectedTenant]        = useState(null);
  const [tenantPolicies,        setTenantPolicies]        = useState([]);
  const [tenantPoliciesLoading, setTenantPoliciesLoading] = useState(false);
  const [tenantPoliciesError,   setTenantPoliciesError]   = useState(null);

  // ── Fetch policies on load ──
  useEffect(() => {
    if (!policiesLoadedStatus && !policiesLoadingStatus) {
      dispatch(fetchPoliciesThunk());
    }
  }, [dispatch, policiesLoadedStatus, policiesLoadingStatus]);

  // ── Fetch companies for SuperAdmin ──
  // companiesFetched lives in Redux → skipped on every re-visit after first load.
  useEffect(() => {
    if (isSuperAdmin && !companiesFetched) {
      dispatch(fetchCompaniesThunk());
    }
  }, [isSuperAdmin, companiesFetched, dispatch]);

  // ── Clear API error when modal opens ──
  useEffect(() => {
    if (isModalOpen) setApiError(null);
  }, [isModalOpen]);

  // ── Toast helper — auto-dismisses after 3s ──
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch policies for selected tenant ──
  const fetchTenantPolicies = async (tenantId) => {
    try {
      setTenantPoliciesLoading(true);
      setTenantPoliciesError(null);
      setTenantPolicies([]);
      const response = await API_CLIENT.get("/iam/policies/", {
        params: { tenant_id: tenantId },
      });
      setTenantPolicies(response.data?.data?.items || []);
    } catch (err) {
      setTenantPoliciesError(
        err.response?.data?.detail?.message ||
          err.message ||
          "Failed to fetch tenant policies"
      );
    } finally {
      setTenantPoliciesLoading(false);
    }
  };

  // ── Handle tenant selection ──
  const handleTenantSelect = (option) => {
    setSelectedTenant(option);
    setSearchQuery("");
    setTenantPoliciesError(null);
    if (option) {
      fetchTenantPolicies(option.value);
    } else {
      setTenantPolicies([]);
    }
  };

  // ── Tenant options ──
  const tenantOptions = useMemo(
    () =>
      (companies || []).map((c) => ({
        value: c.tenant_id,
        label: c.name,
        tenant: c,
      })),
    [companies]
  );

  // ── Active policies ──
  const activePolicies = useMemo(() => {
    if (isSuperAdmin && selectedTenant) return tenantPolicies;
    return policies || [];
  }, [isSuperAdmin, selectedTenant, tenantPolicies, policies]);

  const isSystemPolicy = isSuperAdmin && !selectedTenant;

  const filterOptions = [
    { value: "all",      label: "All Policies"      },
    { value: "active",   label: "Active Policies"   },
    { value: "inactive", label: "Inactive Policies" },
  ];

  const policyOptions = useMemo(
    () =>
      (activePolicies || []).map((policy) => ({
        value:       policy.policy_id,
        label:       policy.name,
        description: policy.description,
        policy,
      })),
    [activePolicies]
  );

  const filteredPolicies = useMemo(() => {
    let result = (activePolicies || []).filter((policy) => {
      const query = searchQuery.toLowerCase();
      return (
        policy.name?.toLowerCase().includes(query) ||
        policy.description?.toLowerCase().includes(query) ||
        String(policy.policy_id).includes(query)
      );
    });

    if (selectedFilter && selectedFilter.value !== "all") {
      result = result.filter((policy) => {
        if (selectedFilter.value === "active")   return policy.is_active === true;
        if (selectedFilter.value === "inactive") return policy.is_active === false;
        return true;
      });
    }

    return result;
  }, [activePolicies, searchQuery, selectedFilter]);

  const handleAddClick = () => {
    setModalMode("create");
    setSelectedPolicy(null);
    setApiError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setModalMode("view");
    setApiError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (policy) => {
    if (!confirm(`Are you sure you want to delete "${policy.name}"?`)) return;
    try {
      await API_CLIENT.delete(`/iam/policies/${policy.policy_id}`);
      if (isSuperAdmin && selectedTenant) {
        fetchTenantPolicies(selectedTenant.value);
      } else {
        dispatch(fetchPoliciesThunk());
      }
      // ✅ FIXED: was alert() — now a non-blocking toast
      showToast("success", `Policy "${policy.name}" deleted successfully.`);
    } catch (err) {
      // ✅ FIXED: was alert() — now a non-blocking toast
      showToast(
        "error",
        err.response?.data?.detail?.message || err.message || "Failed to delete policy"
      );
    }
  };

  const extractErrorMessage = (error) => {
    if (error?.detail) {
      if (Array.isArray(error.detail))
        return error.detail.map((i) => i.msg || i.type).join(", ");
      if (typeof error.detail === "string") return error.detail;
      if (error.detail?.message) return error.detail.message;
    }
    if (error?.message) return error.message;
    if (typeof error === "string") return error;
    return "Something went wrong. Please try again.";
  };

  const handleSavePermissions = async (permissionsData, mode) => {
    const payload = {
      name:           permissionsData.name,
      description:    permissionsData.description ?? null,
      is_active:      permissionsData.isActive ?? true,
      permission_ids: permissionsData.permission_ids || [],
    };

    if (isSuperAdmin) {
      if (selectedTenant) {
        payload.tenant_id       = selectedTenant.value;
        payload.is_system_policy = false;
      } else {
        payload.is_system_policy = true;
      }
    }
    // Tenant admin: backend reads tenant_id from token automatically

    try {
      if (mode === "create") {
        logDebug("Creating new policy with payload:", payload);
        await dispatch(createPolicy(payload)).unwrap();

        if (isSuperAdmin && selectedTenant) {
          await fetchTenantPolicies(selectedTenant.value);
        } else {
          await dispatch(fetchPoliciesThunk());
        }

        // ✅ FIXED: was alert() — now a non-blocking toast
        showToast("success", "New policy created successfully!");
        setIsModalOpen(false);
        setSelectedPolicy(null);
        setModalMode("view");
        setApiError(null);

      } else if (mode === "edit") {
        const policyId = selectedPolicy?.policy_id;
        if (!policyId) throw new Error("Invalid policy ID");

        await dispatch(
          updatePolicy({ policyId: Number(policyId), payload })
        ).unwrap();

        if (isSuperAdmin && selectedTenant) {
          await fetchTenantPolicies(selectedTenant.value);
        } else {
          await dispatch(fetchPoliciesThunk());
        }

        // ✅ FIXED: was alert() — now a non-blocking toast
        showToast("success", `Policy "${selectedPolicy.name}" updated successfully!`);
        setIsModalOpen(false);
        setSelectedPolicy(null);
        setModalMode("view");
        setApiError(null);
      }
    } catch (error) {
      console.error("Policy save failed:", error);
      const errorMessage = extractErrorMessage(error);
      setApiError(errorMessage);
      // ✅ FIXED: was alert(`Error: ${errorMessage}`) — error is already shown
      // inline via apiError prop on PolicyForm, so no toast needed here.
      // Showing both alert + inline error was redundant and confusing.
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPolicy(null);
    setModalMode("view");
    setApiError(null);
  };

  const handleModeChange = (newMode) => {
    setModalMode(newMode);
    setApiError(null);
  };

  const handlePolicySelect = (selectedOption) => {
    if (selectedOption?.policy) handleEdit(selectedOption.policy);
  };

  return (
    <div className="">

      {/* ✅ Toast — replaces all 3 alert() calls */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <ToolBar
        module="policy"
        leftElements={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="w-full sm:w-64">
              <Select
                options={policyOptions}
                onChange={handlePolicySelect}
                placeholder="Select a policy..."
                isClearable
                isSearchable
                styles={selectStyles}
                className="text-sm"
                formatOptionLabel={({ label, description }) => (
                  <div className="py-1">
                    <div className="font-medium">{label}</div>
                    {description && (
                      <div className="text-xs text-gray-500 truncate">
                        {description}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                options={filterOptions}
                value={selectedFilter}
                onChange={setSelectedFilter}
                placeholder="Filter by..."
                isClearable
                styles={selectStyles}
                className="text-sm"
                defaultValue={filterOptions[0]}
              />
            </div>
          </div>
        }
        rightElements={
          <div className="flex items-center gap-3">

            {/* ── SuperAdmin only: tenant dropdown ── */}
            {isSuperAdmin && (
              <div className="flex items-center gap-2">
                <div className="w-56">
                  <Select
                    options={tenantOptions}
                    value={selectedTenant}
                    onChange={handleTenantSelect}
                    placeholder="System policies..."
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

            <button
              onClick={handleAddClick}
              className="flex-shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-lg 
                         hover:bg-indigo-700 transition-colors duration-200 
                         flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm font-medium"
            >
              <Plus size={16} />
              Policy
            </button>
          </div>
        }
      />

      <div className="px-5">
        {/* Tenant policies loading */}
        {isSuperAdmin && selectedTenant && tenantPoliciesLoading && (
          <div className="text-center py-12 text-gray-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent mb-3" />
            <p className="text-sm">
              Loading policies for {selectedTenant.label}...
            </p>
          </div>
        )}

        {/* Tenant policies error */}
        {isSuperAdmin && tenantPoliciesError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-4">
            {tenantPoliciesError}
            <button
              onClick={() => fetchTenantPolicies(selectedTenant.value)}
              className="ml-3 underline text-red-600 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {!(isSuperAdmin && selectedTenant && tenantPoliciesLoading) &&
          (filteredPolicies.length > 0 ? (
            <PolicyTable
              policies={filteredPolicies}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isSuperAdmin={isSuperAdmin}
            />
          ) : (
            <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-gray-700 text-lg font-medium mb-2">
                  {searchQuery || selectedFilter
                    ? "No policies found"
                    : "No policies available"}
                </div>
                <div className="text-gray-500 text-sm max-w-md mx-auto">
                  {searchQuery || selectedFilter
                    ? "Try adjusting your search terms or filters"
                    : "Get started by creating your first policy"}
                </div>
                <button
                  onClick={handleAddClick}
                  className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus className="mr-2" size={18} />
                  Create New Policy
                </button>
              </div>
            </div>
          ))}
      </div>

      <PolicyForm
      policy={selectedPolicy}
      isOpen={isModalOpen}
      onSave={handleSavePermissions}
      onClose={handleCloseModal}
      mode={modalMode}
      onModeChange={handleModeChange}
      apiError={apiError}
      clearApiError={() => setApiError(null)}
      isSuperAdmin={isSuperAdmin}
      isSystemPolicy={isSystemPolicy}
      selectedTenant={selectedTenant}
      tenantId={                              // ✅ ADD THIS
        isSuperAdmin
          ? selectedTenant?.value ?? null     // SuperAdmin → from dropdown
          : currentUser?.tenant_id ?? null    // Regular admin → from token
      }
    />
    </div>
  );
};

export default PoliciesManagement;