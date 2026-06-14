import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";

// Components
import ToolBar from "@components/ui/ToolBar";
import SearchInput from "@components/ui/SearchInput";
import SelectField from "../components/ui/SelectField";
import ReusableButton from "../components/ui/ReusableButton";
import AuditLogsModal from "../components/modals/AuditLogsModal";

// Icons
import {
  UsersRound,
  History,
  UserPlus,
  CheckCircle,
  XCircle,
  Truck,
  Trash2,
} from "lucide-react";

import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { useVendorOptions } from "../hooks/useVendorOptions";
import { VendorUsersTable } from "../components/vendor/VendorUsersTable";
import { fetchCompaniesThunk } from "../redux/features/company/companyThunks";

import {
  fetchVendorUsersThunk,
  deleteVendorUserThunk,
  toggleVendorUserStatusThunk,
} from "../redux/features/Vendoruser/Vendoruserthunks";

import {
  selectVendorUsers,
  selectVendorUsersTotal,
  selectVendorUsersLoading,
  selectVendorUsersLastFetched,
  selectVendorUsersLastParams,
} from "../redux/features/Vendoruser/Vendoruserslice";

import VendorUsersModal from "../components/modals/VendorUsersModal";

const MODAL_MODES = {
  CREATE: "create",
  VIEW: "view",
  EDIT: "edit",
};

const DEFAULT_PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 10,
};

// How long before cached data is considered stale
const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

const VendorUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showVendorUserModal, setShowVendorUserModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [modalMode, setModalMode] = useState(MODAL_MODES.CREATE);
  const [selectedVendorUser, setSelectedVendorUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGINATION.PAGE);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGINATION.PAGE_SIZE);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, userId: null });

  const dispatch = useDispatch();

  // ── Redux selectors ────────────────────────────────────────────────────────
  const vendorUsers = useSelector(selectVendorUsers);
  const totalItems  = useSelector(selectVendorUsersTotal);
  const isLoading   = useSelector(selectVendorUsersLoading);
  const lastFetched = useSelector(selectVendorUsersLastFetched);
  const lastParams  = useSelector(selectVendorUsersLastParams);

  const { type: userType, tenant_id } = useSelector(selectCurrentUser);
  const { vendorOptions, loading: vendorLoading } = useVendorOptions(null, true);

  const {
    data: companies = [],
    loading: companyLoading = false,
  } = useSelector((state) => state.company || {});

  const companyOptions = [
    { value: "", label: "All Companies" },
    ...(companies?.map((company) => ({
      value: company?.tenant_id || company?._id || company?.id,
      label: company?.name || company?.companyName || "Unnamed Company",
    })) || []),
  ];

  useEffect(() => {
    if (!companies || companies.length === 0) {
      dispatch(fetchCompaniesThunk());
    }
  }, [dispatch, companies]);

  // ── Core fetch with staleness + params-changed check ──────────────────────
  // tenantId: for admin users the API needs tenant_id as a query param;
  //           for employee users it is enforced from the token automatically.
  // selectedCompanyId changes which tenant_id we pass (admin switching context).
  const fetchIfNeeded = useCallback(
    (page, size, search, vendorId, companyId, force = false) => {
      // Admin can filter by company, which changes the effective tenant_id
      const effectiveTenantId = companyId || tenant_id || undefined;

      const params = {
        page,
        size,
        search,
        vendorId,
        tenantId: effectiveTenantId,
      };

      const paramsChanged =
        !lastParams ||
        lastParams.page     !== page     ||
        lastParams.size     !== size     ||
        lastParams.search   !== search   ||
        lastParams.vendorId !== vendorId ||
        lastParams.tenantId !== effectiveTenantId;

      const isStale = !lastFetched || Date.now() - lastFetched > STALE_TIME_MS;

      if (force || isStale || paramsChanged) {
        dispatch(fetchVendorUsersThunk(params));
      }
    },
    [dispatch, tenant_id, lastFetched, lastParams]
  );

  // ── Debounced version for search/filter typing ─────────────────────────────
  const debouncedFetch = useCallback(
    debounce((page, size, search, vendorId, companyId) => {
      fetchIfNeeded(page, size, search, vendorId, companyId);
    }, 500),
    [fetchIfNeeded]
  );

  useEffect(() => {
    debouncedFetch(currentPage, itemsPerPage, searchTerm, selectedVendorId, selectedCompanyId);
    return () => debouncedFetch.cancel();
  }, [searchTerm, selectedVendorId, selectedCompanyId, currentPage, itemsPerPage, debouncedFetch]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCompanyChange = (e) => {
    setSelectedCompanyId(e.target.value);
    setCurrentPage(DEFAULT_PAGINATION.PAGE);
  };

  const handleVendorChange = (e) => {
    setSelectedVendorId(e.target.value);
    setCurrentPage(DEFAULT_PAGINATION.PAGE);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(DEFAULT_PAGINATION.PAGE);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(DEFAULT_PAGINATION.PAGE);
  };

  const handleViewVendorUser = (vendorUser) => {
    setSelectedVendorUser(vendorUser);
    setModalMode(MODAL_MODES.VIEW);
    setShowVendorUserModal(true);
  };

  const handleEditVendorUser = (vendorUser) => {
    setSelectedVendorUser({
      ...vendorUser,
      id: vendorUser.id || vendorUser.vendor_user_id,
    });
    setModalMode(MODAL_MODES.EDIT);
    setShowVendorUserModal(true);
  };

  const handleCreateVendorUser = () => {
    setSelectedVendorUser(null);
    setModalMode(MODAL_MODES.CREATE);
    setShowVendorUserModal(true);
  };

  const handleDeleteVendorUser = (id) => {
    setDeleteConfirm({ open: true, userId: id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.userId;
    setDeleteConfirm({ open: false, userId: null });

    // DELETE /api/v1/vendor-users/{id}?tenant_id=...
    // tenant_id required as query param for admin; automatic for employee
    const result = await dispatch(
      deleteVendorUserThunk({
        id,
        tenantId: selectedCompanyId || tenant_id || undefined,
      })
    );

    if (deleteVendorUserThunk.fulfilled.match(result)) {
      toast.success("Vendor user deleted successfully!");
    } else {
      toast.error(result.payload || "Failed to delete vendor user");
    }
  };

  const handleToggleVendorUser = async (user) => {
    // PATCH /api/v1/vendor-users/{id}/toggle-status?tenant_id=...
    // Optimistic update applied in slice pending; rolled back on rejected
    const result = await dispatch(
      toggleVendorUserStatusThunk({
        user,
        tenantId: selectedCompanyId || tenant_id || undefined,
      })
    );

    if (toggleVendorUserStatusThunk.fulfilled.match(result)) {
      toast.success(result.payload?.message || "Vendor user status updated successfully!");
    } else {
      toast.error(result.payload?.message || "Failed to toggle vendor user status");
    }
  };

  const handlePageChange = (newPage, newPageSize) => {
    setCurrentPage(newPage);
    if (newPageSize !== itemsPerPage) {
      setItemsPerPage(newPageSize);
    }
  };

  const handleVendorUserSuccess = () => {
    // Force refetch after create/edit — list content changed
    fetchIfNeeded(
      currentPage, itemsPerPage, searchTerm, selectedVendorId, selectedCompanyId,
      true // force
    );
    if (modalMode === MODAL_MODES.CREATE) {
      toast.success("Vendor user created successfully!");
    } else if (modalMode === MODAL_MODES.EDIT) {
      toast.success("Vendor user updated successfully!");
    }
  };

  const activeUsersCount   = vendorUsers.filter((u) => u.is_active).length;
  const inactiveUsersCount = vendorUsers.filter((u) => !u.is_active).length;

  return (
    <div className="p-1">
      <ToolBar
        onAddClick={handleCreateVendorUser}
        addButtonLabel="Vendor User"
        className="p-4 bg-white border rounded-lg shadow-sm mb-6"
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <SearchInput
              placeholder="Search by name, email"
              value={searchTerm}
              onChange={handleSearch}
              onClear={handleClearSearch}
              className="flex-grow"
            />
          </div>
        }
        rightElements={
          <div className="flex items-center gap-3 flex-wrap">
            {/* Vendor Filter */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <Truck className="w-4 h-4 text-gray-500" />
              </div>
              <select
                value={selectedVendorId}
                onChange={handleVendorChange}
                disabled={vendorLoading}
                className="appearance-none pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
              >
                <option value="">Select Vendor</option>
                {vendorOptions.map((vendor) => (
                  <option key={vendor.value} value={vendor.value}>
                    {vendor.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {userType === "admin" && (
              <SelectField
                label="Select Company"
                value={selectedCompanyId}
                onChange={handleCompanyChange}
                options={companyOptions}
                placeholder="All Companies"
                className="min-w-[200px]"
                disabled={companyLoading}
              />
            )}

            <ReusableButton
              module="vendor_user"
              action="read"
              buttonName={"History"}
              icon={History}
              title="Audit History"
              onClick={() => setShowAuditModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm"
              size={16}
            />

            <ReusableButton
              module="vendor_user"
              action="create"
              buttonName={"vendor User"}
              icon={UserPlus}
              title="Create Vendor User"
              onClick={handleCreateVendorUser}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium text-sm"
            >
              <UserPlus size={16} />
              Create User
            </ReusableButton>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <UsersRound className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Vendor Users</p>
              <p className="text-2xl font-bold text-gray-800">{totalItems || vendorUsers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-gray-800">{activeUsersCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg mr-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-800">{inactiveUsersCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(searchTerm || selectedVendorId) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-semibold text-blue-800">Active Filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  Search: {searchTerm}
                </span>
              )}
              {selectedVendorId && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                  <Truck className="w-3 h-3" />
                  {vendorOptions.find((v) => v.value === selectedVendorId)?.label}
                </span>
              )}
            </div>
            <span className="text-sm text-blue-700 font-medium">
              Found {vendorUsers.length} result(s)
            </span>
          </div>
        </div>
      )}

      {/* Vendor Users Table */}
      <div className="mt-6">
        <VendorUsersTable
          vendorUsers={vendorUsers}
          onView={handleViewVendorUser}
          onEdit={handleEditVendorUser}
          onDelete={handleDeleteVendorUser}
          onToggle={handleToggleVendorUser}
          isLoading={isLoading}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          currentPage={currentPage}
          vendorOptions={vendorOptions}
        />
      </div>

      {/* Vendor Users Modal */}
      <VendorUsersModal
        isOpen={showVendorUserModal}
        onClose={() => {
          setShowVendorUserModal(false);
          setSelectedVendorUser(null);
        }}
        mode={modalMode}
        initialData={selectedVendorUser}
        vendors={vendorOptions}
        onSuccess={handleVendorUserSuccess}
      />

      {/* Audit Logs Modal */}
      <AuditLogsModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        moduleName="Vendor User"
        showUserColumn={true}
        apimodule="vendor_user"
        selectedCompany={selectedCompanyId || tenant_id}
      />

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 w-80 text-center">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-red-100 mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <p className="font-semibold text-gray-800 text-base mb-1">Delete vendor user?</p>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm({ open: false, userId: null })}
                className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorUserManagement;