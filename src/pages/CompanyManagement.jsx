// src/pages/CompanyManagement.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
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

// ✅ Fix #6 (minor): Extract status constants to avoid scattered string literals
const STATUS = {
  ALL: "all",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

const CompanyManagement = () => {
  const dispatch = useDispatch();

  const {
    data: companies = [],
    loading,
    error,
  } = useSelector((state) => state.company || {});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [loadingTenant, setLoadingTenant] = useState(false);
  const [tenantCache, setTenantCache] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(STATUS.ALL);

  // ✅ Fix #4 (Issue 4): Submit guard to prevent double-submits
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Fix #2 (Issue 2): Error state for handleEdit silent failure
  const [editError, setEditError] = useState(null);

  // ✅ Fix #5 (Issue 5): Error state for handleSubmit silent failure
  const [submitError, setSubmitError] = useState(null);

  // ✅ Fix #3 (Issue 3): Replace fragile companies.length dependency with a hasFetched ref
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchCompaniesThunk());
    }
  }, [dispatch]);

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

    // ✅ Fix #7 (minor): Comment clarifying the two ID types
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
          name: response.tenant.name,
          address: response.tenant.address,
          latitude: response.tenant.latitude,
          longitude: response.tenant.longitude,
          is_active: response.tenant.is_active,
        },
        employee_email: response.tenant.employee?.email || "",
        employee_phone: response.tenant.employee?.phone || "",
        permissions: response.admin_policy?.permissions || [],
      };

      setTenantCache((prev) => ({
        ...prev,
        [company.tenant_id]: entity,
      }));

      setSelectedEntity(entity);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch tenant details:", err);
      // ✅ Fix #2 (Issue 2): Surface error to user instead of silent failure
      setEditError("Failed to load company details. Please try again.");
    } finally {
      setLoadingTenant(false);
    }
  };

  const handleSubmit = async (formData) => {
    // ✅ Fix #4 (Issue 4): Guard against double-submits
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

        // ✅ Fix #1 (Issue 1): Invalidate stale cache entry after a successful update
        setTenantCache((prev) => {
          const updated = { ...prev };
          delete updated[selectedEntity.company.tenant_id];
          return updated;
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save company:", err);
      // ✅ Fix #5 (Issue 5): Surface submit error inside the modal
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

        {/* ✅ Fix #2 (Issue 2): Edit error banner shown above toolbar */}
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

        {/* 🔎 TOP TOOLBAR */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            {/* LEFT — Search Only */}
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

            {/* RIGHT — Status + Sync + Add */}
            <div className="flex flex-col sm:flex-row items-center gap-3">

              {/* Status Dropdown */}
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

              {/* ✅ Fix #8 (minor): aria-label added for accessibility */}
              <button
                onClick={() => dispatch(fetchCompaniesThunk())}
                aria-label="Sync companies"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition"
              >
                <RefreshCw className="w-4 h-4" />
                Sync
              </button>

              {/* Add Company Button */}
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

        {/* 📋 COMPANY LIST */}
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

        {/* 🧾 MODAL */}
        {/*
          ✅ Fix #4: isSubmitting passed to disable submit button inside modal
          ✅ Fix #5: submitError passed to show inline error inside modal
        */}
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