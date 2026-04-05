import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Shield,
  Search,
  Trash2,
  Eye,
  Plus,
  Check,
  AlertCircle,
  Edit2,
} from "lucide-react";
import { logDebug } from "../../utils/logger";
import { useSelector, useDispatch } from "react-redux";
import { fetchPoliciesThunk } from "../../redux/features/Permissions/permissionsThunk";
import {
  selectPolicies,
  policiesLoading,
  policiesLoaded,
  policiesError,
} from "../../redux/features/Permissions/permissionsSlice";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const transformPolicies = (apiPolicies = []) =>
  apiPolicies.map((policy) => ({
    policy_id:        policy.id || policy.policy_id,
    name:             policy.name,
    description:      policy.description || "",
    is_active:        policy.is_active !== false,
    is_system_policy: policy.is_system_policy || false,
    tenant_id:        policy.tenant_id,
    permissions:      policy.permissions || [],
  }));

const EMPTY_FORM = {
  name:        "",
  description: "",
  tenant_id:   null,
  is_active:   true,
  policy_ids:  [],
};

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
    <div className="flex items-center gap-2">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  </div>
);

const PolicyBadge = ({ isActive, isSystemPolicy }) => (
  <div className="flex items-center gap-1">
    {isActive ? (
      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded flex items-center gap-1">
        <Check size={10} /> Active
      </span>
    ) : (
      <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1">
        <AlertCircle size={10} /> Inactive
      </span>
    )}
    {isSystemPolicy && (
      <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
        System
      </span>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
const RoleForm = ({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",       // 'create' | 'edit' | 'view'
  initialData  = null,
  roleDetailsError = null,
  formError    = null,
  isSubmitting = false,
  isSuperAdmin = false,
  isSystemRole = false,
  tenantId     = null,   // SuperAdmin → selectedTenant.value | Regular admin → currentUser.tenant_id
}) => {
  const dispatch = useDispatch();

  // ── Redux ──────────────────────────────────────────────────
  const policies       = useSelector(selectPolicies);
  const loading        = useSelector(policiesLoading);
  const loaded         = useSelector(policiesLoaded);
  const policiesErrMsg = useSelector(policiesError);

  // ── Local state ────────────────────────────────────────────
  const [formData,           setFormData]           = useState(EMPTY_FORM);
  const [searchTerm,         setSearchTerm]         = useState("");
  const [availablePolicies,  setAvailablePolicies]  = useState([]);
  const [selectedPolicies,   setSelectedPolicies]   = useState([]);

  // ── Derived flags ──────────────────────────────────────────
  const isViewMode   = mode === "view";
  const isEditMode   = mode === "edit";
  const isCreateMode = mode === "create";

  // ── Effective tenantId ─────────────────────────────────────
  // Create → use prop directly
  // Edit/View → prefer initialData.tenant_id, fallback to prop
  const effectiveTenantId =
    isCreateMode
      ? tenantId
      : initialData?.tenant_id || tenantId || null;

  // ── Fetch policies when modal opens or tenant changes ──────
  // ✅ Always re-fetch for tenant roles (ignore cache)
  // ✅ Use cache only for system roles (no tenant)
  useEffect(() => {
    if (!isOpen) return;

    if (effectiveTenantId) {
      // Tenant role — always fetch fresh scoped to that tenant
      dispatch(fetchPoliciesThunk({ tenant_id: effectiveTenantId }));
    } else if (!loaded) {
      // System role — fetch all, use Redux cache if already loaded
      dispatch(fetchPoliciesThunk({}));
    }
  }, [isOpen, effectiveTenantId, dispatch]); // ✅ `loaded` removed — tenantId drives refetch

  // ── Build form & policy lists ──────────────────────────────
  useEffect(() => {
    if (!isOpen || !policies?.length) return;

    const allPolicies = transformPolicies(policies);

    // ✅ Tenant role → only that tenant's non-system policies
    // ✅ System role → all policies
    const selectablePolicies = effectiveTenantId
      ? allPolicies.filter(
          (p) => p.tenant_id === effectiveTenantId && !p.is_system_policy
        )
      : allPolicies;

    if (isCreateMode) {
      setFormData({ ...EMPTY_FORM, tenant_id: tenantId || null });
      setSelectedPolicies([]);
      setAvailablePolicies(selectablePolicies);
      return;
    }

    if (initialData && (isEditMode || isViewMode)) {
      const selected = (initialData.policies || []).map((policy) => ({
        policy_id:        policy.policy_id,
        name:             policy.name,
        description:      policy.description || "",
        is_active:        policy.is_active !== false,
        is_system_policy: policy.is_system_policy || false,
        tenant_id:        policy.tenant_id,
        permissions:      policy.permissions || [],
      }));

      const selectedIds = selected.map((p) => p.policy_id);

      setSelectedPolicies(selected);
      setAvailablePolicies(
        selectablePolicies.filter((p) => !selectedIds.includes(p.policy_id))
      );
      setFormData({
        name:        initialData.name        || "",
        description: initialData.description || "",
        tenant_id:   initialData.tenant_id   || tenantId || null,
        is_active:   initialData.is_active   ?? true,
        policy_ids:  selectedIds,
      });
    }
  }, [isOpen, policies, mode, initialData, tenantId, effectiveTenantId]);

  // ── Reset when modal closes ────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setFormData(EMPTY_FORM);
      setSelectedPolicies([]);
      setAvailablePolicies([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  // ── Policy handlers ────────────────────────────────────────
  const handleAddPolicy = useCallback((policy) => {
    if (isViewMode) return;
    setSelectedPolicies((prev) => [...prev, policy]);
    setAvailablePolicies((prev) => prev.filter((p) => p.policy_id !== policy.policy_id));
    setFormData((prev) => ({ ...prev, policy_ids: [...prev.policy_ids, policy.policy_id] }));
  }, [isViewMode]);

  const handleRemovePolicy = useCallback((policyId) => {
    if (isViewMode) return;
    logDebug("Removing policy with ID:", policyId);
    setSelectedPolicies((prev) => {
      const removed = prev.find((p) => p.policy_id === policyId);
      if (removed) setAvailablePolicies((avail) => [...avail, removed]);
      return prev.filter((p) => p.policy_id !== policyId);
    });
    setFormData((prev) => ({
      ...prev,
      policy_ids: prev.policy_ids.filter((id) => id !== policyId),
    }));
  }, [isViewMode]);

  // ── Field handler ──────────────────────────────────────────
  const handleInputChange = useCallback((field, value) => {
    if (isViewMode) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, [isViewMode]);

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewMode || isSubmitting) return onClose();

    const submitData = {
      name:        formData.name.trim(),
      description: formData.description?.trim() || "",
      is_active:   formData.is_active,
      policy_ids:  formData.policy_ids,
      ...(initialData?.role_id && { role_id: initialData.role_id }),
    };

    if (formData.tenant_id) {
      submitData.tenant_id = formData.tenant_id;
    }

    logDebug("Submitting role data:", submitData);
    onSubmit(submitData);
  };

  // ── Policy removal permission ──────────────────────────────
  const canRemovePolicy = (policy) => {
    if (isSuperAdmin) return true;
    return !(policy.is_system_policy && isEditMode);
  };

  // ── Filtered available policies ────────────────────────────
  const filteredPolicies = availablePolicies.filter((policy) => {
    const term = searchTerm.toLowerCase();
    return (
      policy.name.toLowerCase().includes(term) ||
      policy.description?.toLowerCase().includes(term)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[95vh] flex flex-col">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-sidebar-primary to-sidebar-secondary px-6 py-4 flex justify-between items-center rounded-t-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isViewMode ? "bg-gray-100" : "bg-gradient-to-r from-blue-100 to-indigo-100"
            }`}>
              {isViewMode  ? <Eye    className="w-5 h-5 text-gray-600"   /> :
               isEditMode  ? <Edit2  className="w-5 h-5 text-blue-600"   /> :
                             <Shield className="w-5 h-5 text-indigo-600" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-white">
                  {isViewMode  ? "View Role Details" :
                   isEditMode  ? "Edit Role"         :
                                 "Create New Role"}
                </h2>
                {isSuperAdmin && isSystemRole && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-200 text-purple-800">
                    System Role
                  </span>
                )}
              </div>
              <p className="text-sm text-white/80 mt-0.5">
                {isViewMode  ? "View role information and assigned policies"  :
                 isEditMode  ? "Modify role details and assigned policies"    :
                               "Define a new role and assign policies"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-5">

              {/* Errors */}
              {formError        && <ErrorBanner message={formError} />}
              {roleDetailsError && <ErrorBanner message={roleDetailsError} />}
              {policiesErrMsg && !loading && (
                <ErrorBanner message={`Failed to load policies: ${policiesErrMsg}`} />
              )}

              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <p className="text-sm text-gray-500">Loading policies...</p>
                </div>
              )}

              {/* ── Basic Information ── */}
              {!loading && (
                <div className={`rounded-xl p-6 border ${
                  isViewMode
                    ? "bg-gray-50 border-gray-200"
                    : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                }`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h3>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        disabled={isViewMode}
                        className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          isViewMode
                            ? "bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
                            : "bg-white border-gray-300"
                        }`}
                        placeholder="Enter role name"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        disabled={isViewMode}
                        rows={3}
                        className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                          isViewMode
                            ? "bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
                            : "bg-white border-gray-300"
                        }`}
                        placeholder="Enter role description"
                      />
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => handleInputChange("is_active", e.target.checked)}
                        disabled={isViewMode}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <label
                        htmlFor="is_active"
                        className={`text-sm text-gray-700 ${isViewMode ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        Active Role
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Policies Section ── */}
              {!loading && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {isCreateMode ? "Assign Policies" : "Assigned Policies"}
                    </h3>

                    {/* Search — create/edit only */}
                    {!isViewMode && (
                      <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search policies by name or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    )}

                    {/* ✅ Tenant boundary notice */}
                    {!isViewMode && effectiveTenantId && (
                      <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-700">
                          Only policies belonging to this tenant are shown. System policies are excluded.
                        </p>
                      </div>
                    )}

                    {/* Selected policies */}
                    {selectedPolicies.length > 0 && (
                      <div className="mb-5">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          {isViewMode ? "Assigned" : "Selected"} Policies ({selectedPolicies.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedPolicies.map((policy) => (
                            <div
                              key={policy.policy_id}
                              className="flex items-start justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className="text-sm font-semibold text-blue-900 truncate">
                                    {policy.name}
                                  </span>
                                  <PolicyBadge
                                    isActive={policy.is_active}
                                    isSystemPolicy={policy.is_system_policy}
                                  />
                                </div>
                                {policy.description && (
                                  <p className="text-xs text-blue-700 line-clamp-2">
                                    {policy.description}
                                  </p>
                                )}
                              </div>

                              {!isViewMode && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!canRemovePolicy(policy)) return;
                                    handleRemovePolicy(policy.policy_id);
                                  }}
                                  disabled={!canRemovePolicy(policy)}
                                  title={
                                    !canRemovePolicy(policy)
                                      ? "System policies cannot be removed"
                                      : "Remove policy"
                                  }
                                  className={`p-1 rounded transition-colors ml-2 shrink-0 ${
                                    canRemovePolicy(policy)
                                      ? "text-red-500 hover:bg-red-100"
                                      : "text-gray-300 cursor-not-allowed"
                                  }`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available policies — create/edit only */}
                    {!isViewMode && filteredPolicies.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Available Policies ({filteredPolicies.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                          {filteredPolicies.map((policy) => (
                            <div
                              key={policy.policy_id}
                              onClick={() => handleAddPolicy(policy)}
                              className="flex items-start justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className="text-sm font-semibold text-gray-900 truncate">
                                    {policy.name}
                                  </span>
                                  <PolicyBadge
                                    isActive={policy.is_active}
                                    isSystemPolicy={policy.is_system_policy}
                                  />
                                </div>
                                {policy.description && (
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {policy.description}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {policy.permissions?.length || 0} permissions
                                </p>
                              </div>
                              <Plus size={16} className="text-gray-400 ml-2 shrink-0 mt-0.5" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Empty states ── */}
                    {isViewMode && selectedPolicies.length === 0 && (
                      <div className="text-center py-10 text-gray-400">
                        <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No policies assigned to this role</p>
                      </div>
                    )}

                    {!isViewMode && availablePolicies.length === 0 && !searchTerm && (
                      <div className="text-center py-10 text-gray-400">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No policies available for this tenant</p>
                      </div>
                    )}

                    {!isViewMode && filteredPolicies.length === 0 && searchTerm && (
                      <div className="text-center py-10 text-gray-400">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No policies match "{searchTerm}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>

            {!isViewMode && (
              <button
                type="submit"
                disabled={!formData.name.trim() || isSubmitting}
                className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                )}
                {isSubmitting
                  ? "Saving..."
                  : isCreateMode
                  ? "Create Role"
                  : "Update Role"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;