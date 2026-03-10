// src/pages/CompanyManagement.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, RefreshCw } from "lucide-react";
import EntityModal from "@components/EntityModal";
import CompanyList from "../companies/CompanyList";
import {
  fetchCompaniesThunk,
  createCompanyThunk,
  updateTenantThunk,
  fetchCompanyByIdThunk,
} from "../redux/features/company/companyThunks";
import {
  selectCompanies,
  selectCompaniesFetched,
  selectCompaniesLoading,
  selectCompaniesError,
} from "../redux/features/company/companySlice";

const STATUS = {
  ALL: "all",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

const CompanyManagement = () => {
  const dispatch = useDispatch();

  // ✅ Split selectors — no object literal, no || {} fallback
  // Each returns a primitive or the stable Redux array reference.
  // Uses named selectors from the slice for consistency and reusability.
  const companies = useSelector(selectCompanies);
  const fetched   = useSelector(selectCompaniesFetched);
  const loading   = useSelector(selectCompaniesLoading);
  const error     = useSelector(selectCompaniesError);

  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [modalMode,       setModalMode]       = useState("create");
  const [selectedEntity,  setSelectedEntity]  = useState(null);
  const [loadingTenant,   setLoadingTenant]   = useState(false);
  const [tenantCache,     setTenantCache]     = useState({});
  const [searchTerm,      setSearchTerm]      = useState("");
  const [statusFilter,    setStatusFilter]    = useState(STATUS.ALL);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [editError,       setEditError]       = useState(null);
  const [submitError,     setSubmitError]     = useState(null);

  // ✅ useRef removed — fetched now lives in Redux and survives unmount/remount.
  //
  // WHY useRef FAILED:
  //   useRef is scoped to a single component instance. When you navigate away,
  //   the component unmounts and the ref is destroyed. On the next visit it
  //   remounts with hasFetched.current = false, triggering a fresh fetch every
  //   single time — exactly the duplicate API hits you were seeing.
  //
  // WHY Redux fetched WORKS:
  //   Redux state persists for the lifetime of the app (until page reload or
  //   explicit reset). Once fetched = true it stays true no matter how many
  //   times this component mounts and unmounts. Navigation is free.
  useEffect(() => {
    if (!fetched) {
      dispatch(fetchCompaniesThunk());
    }
  }, [fetched, dispatch]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === STATUS.ACTIVE)
        matchesStatus = company.is_active === true;
      else if (statusFilter === STATUS.INACTIVE)
        matchesStatus = company.is_active === false;

      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  const handleCreate = () => {
    setModalMode("create");
    setSelectedEntity(null);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (company) => {
    setModalMode("edit");
    setEditError(null);
    setSubmitError(null);

    // tenant_id is the external tenant identifier; company.id is the internal DB record ID
    if (tenantCache[company.tenant_id]) {
      setSelectedEntity(tenantCache[company.tenant_id]);
      setIsModalOpen(true);
      return;
    }

    setLoadingTenant(true);

    try {
      const response = await dispatch(
        fetchCompanyByIdThunk(company.tenant_id)
      ).unwrap();

      const entity = {
        id: company.id,
        company: {
          tenant_id: response.tenant.tenant_id,
          name:      response.tenant.name,
          address:   response.tenant.address,
          latitude:  response.tenant.latitude,
          longitude: response.tenant.longitude,
          is_active: response.tenant.is_active,
        },
        employee_email: response.tenant.employee?.email || "",
        employee_phone: response.tenant.employee?.phone || "",
        permissions:    response.admin_policy?.permissions || [],
      };

      setTenantCache((prev) => ({ ...prev, [company.tenant_id]: entity }));
      setSelectedEntity(entity);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch tenant details:", err);
      setEditError("Failed to load company details. Please try again.");
    } finally {
      setLoadingTenant(false);
    }
  };

  const handleSubmit = async (formData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (modalMode === "create") {
        await dispatch(createCompanyThunk(formData)).unwrap();
      } else if (modalMode === "edit" && selectedEntity) {
        await dispatch(
          updateTenantThunk({
            tenantId: selectedEntity?.company?.tenant_id,
            data: formData,
          })
        ).unwrap();

        // Invalidate stale tenant cache entry so next edit re-fetches fresh data
        setTenantCache((prev) => {
          const updated = { ...prev };
          delete updated[selectedEntity.company.tenant_id];
          return updated;
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save company:", err);
      setSubmitError("Failed to save company. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmitError(null);
    setEditError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 lg:px-10 py-6 space-y-6">

        {/* Edit error banner */}
        {editError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            <span>{editError}</span>
            <button
              onClick={() => setEditError(null)}
              className="ml-4 text-red-500 hover:text-red-700 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TOP TOOLBAR */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status + Sync + Add */}
            <div className="flex flex-col sm:flex-row items-center gap-3">

              <div className="w-full sm:w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={STATUS.ALL}>All Status</option>
                  <option value={STATUS.ACTIVE}>Active</option>
                  <option value={STATUS.INACTIVE}>Inactive</option>
                </select>
              </div>

              {/* Sync = intentional manual refresh, bypasses fetched guard */}
              <button
                onClick={() => dispatch(fetchCompaniesThunk())}
                aria-label="Sync companies"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition"
              >
                <RefreshCw className="w-4 h-4" />
                Sync
              </button>

              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Company
              </button>

            </div>
          </div>
        </div>

        {/* COMPANY LIST */}
        <div>
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading companies...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Error: {error}
            </div>
          ) : (
            <CompanyList
              companies={filteredCompanies}
              onEditCompany={handleEdit}
            />
          )}
        </div>

        <EntityModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          entityType="company"
          entityData={selectedEntity}
          onSubmit={handleSubmit}
          mode={modalMode}
          loading={loadingTenant}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      </div>
    </div>
  );
};

export default CompanyManagement;