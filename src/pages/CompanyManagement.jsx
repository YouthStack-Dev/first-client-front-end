// src/pages/CompanyManagement.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search,RefreshCw } from "lucide-react";
import EntityModal from "@components/EntityModal";
import CompanyList from "../companies/CompanyList";
import {
  fetchCompaniesThunk,
  createCompanyThunk,
  updateTenantThunk,
  fetchCompanyByIdThunk,
} from "../redux/features/company/companyThunks";

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
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (companies.length === 0) {
      dispatch(fetchCompaniesThunk());
    }
  }, [dispatch, companies.length]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === "Active")
        matchesStatus = company.is_active === true;
      else if (statusFilter === "Inactive")
        matchesStatus = company.is_active === false;

      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  const handleCreate = () => {
    setModalMode("create");
    setSelectedEntity(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (company) => {
    setModalMode("edit");

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
    } finally {
      setLoadingTenant(false);
    }
  };

  const handleSubmit = async (formData) => {
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
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save company:", err);
    }
  };

return (
  <div className="min-h-screen bg-gray-50">
    <div className="px-6 lg:px-10 py-6 space-y-6">

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
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Sync Button */}
            <button
              onClick={() => dispatch(fetchCompaniesThunk())}
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
      <EntityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityType="company"
        entityData={selectedEntity}
        onSubmit={handleSubmit}
        mode={modalMode}
        loading={loadingTenant}
      />
    </div>
  </div>
);
};

export default CompanyManagement;
