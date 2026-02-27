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
  FileText,
} from "lucide-react";

import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { useVendorOptions } from "../hooks/useVendorOptions";
import { VendorUsersTable } from "../components/vendor/VendorUsersTable";
import { API_CLIENT } from "../Api/API_Client";
import endpoint from "../Api/Endpoints";
import { fetchCompaniesThunk } from "../redux/features/company/companyThunks";

// Reusable helpers
import {
  buildSearchParams,
  getSearchPlaceholder,
  extractDataFromResponse,
  handleApiError,
} from "../utils/searchHelpers";

import VendorUsersModal from "../components/modals/VendorUsersModal";

/**
 * Constants for vendor-related data
 */

// Vendor user statuses
const VENDOR_USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
};

const MODAL_MODES = {
  CREATE: "create",
  VIEW: "view",
  EDIT: "edit",
};

// Default pagination values
const DEFAULT_PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
};

const VendorUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showVendorUserModal, setShowVendorUserModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [modalMode, setModalMode] = useState(MODAL_MODES.CREATE);
  const [selectedVendorUser, setSelectedVendorUser] = useState(null);

  const [vendorUsers, setVendorUsers] = useState([]);
  const [filteredVendorUsers, setFilteredVendorUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGINATION.PAGE);
  const [itemsPerPage, setItemsPerPage] = useState(
    DEFAULT_PAGINATION.PAGE_SIZE
  );
  const [totalItems, setTotalItems] = useState(0);

  const dispatch = useDispatch();
  const { vendorOptions, loading: vendorLoading } = useVendorOptions(
    null,
    true
  );
  const { type: userType, tenant_id } = useSelector(selectCurrentUser);

  // Get companies from Redux
  const {
    data: companies = [],
    loading: companyLoading = false,
    error: companyError = null,
  } = useSelector((state) => state.company || {});

  // Map real companies to options
  const companyOptions = [
    { value: "", label: "All Companies" },
    ...(companies?.map((company) => ({
      value: company?.tenant_id || company?._id || company?.id,
      label: company?.name || company?.companyName || "Unnamed Company",
    })) || []),
  ];

  // Fetch companies on mount
  useEffect(() => {
    if (!companies || companies.length === 0) {
      dispatch(fetchCompaniesThunk());
    }
  }, [dispatch, companies]);

  // Single fetch function
  const fetchVendorUsers = useCallback(
    async (page, size, search = "", companyId = "", vendorId = "") => {
      setIsLoading(true);
      try {
        const baseParams = {
          skip: (page - 1) * size,
          limit: size,
          tenant_id: tenant_id || "SAM001",
        };

        const searchParams = buildSearchParams(search);

        const params = {
          ...baseParams,
          ...searchParams,
          company_id: companyId || undefined,
          vendor_id: vendorId || undefined,
        };

        const response = await API_CLIENT.get(endpoint.VendorUser, { params });

        const { data: users, total } = extractDataFromResponse(response);

        setVendorUsers(users);
        setFilteredVendorUsers(users);
        setTotalItems(total);
      } catch (error) {
        const { data: users, total } = handleApiError(error, toast);
        setVendorUsers(users);
        setFilteredVendorUsers(users);
        setTotalItems(total);
      } finally {
        setIsLoading(false);
      }
    },
    [tenant_id]
  );

  // Debounced wrapper
  const debouncedFetchVendorUsers = useCallback(
    debounce((page, size, search, companyId, vendorId) => {
      fetchVendorUsers(page, size, search, companyId, vendorId);
    }, 500),
    [fetchVendorUsers]
  );

  // Trigger search when inputs change
  useEffect(() => {
    debouncedFetchVendorUsers(
      currentPage,
      itemsPerPage,
      searchTerm,
      selectedCompanyId,
      selectedVendorId
    );

    return () => {
      debouncedFetchVendorUsers.cancel();
    };
  }, [
    searchTerm,
    selectedCompanyId,
    selectedVendorId,
    currentPage,
    itemsPerPage,
    debouncedFetchVendorUsers,
  ]);

  const handleCompanyChange = (e) => {
    const value = e.target.value;
    setSelectedCompanyId(value);
    setCurrentPage(DEFAULT_PAGINATION.PAGE);
  };

  const handleVendorChange = (e) => {
    const value = e.target.value;
    setSelectedVendorId(value);
    setCurrentPage(DEFAULT_PAGINATION.PAGE);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
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
    setSelectedVendorUser(vendorUser);
    setModalMode(MODAL_MODES.EDIT);
    setShowVendorUserModal(true);
  };

  const handleCreateVendorUser = () => {
    setSelectedVendorUser(null);
    setModalMode(MODAL_MODES.CREATE);
    setShowVendorUserModal(true);
  };

  const handleDeleteVendorUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor user?")) {
      setIsLoading(true);
      try {
        await API_CLIENT.delete(`${endpoint.VendorUser}/${id}`);

        await fetchVendorUsers(
          currentPage,
          itemsPerPage,
          searchTerm,
          selectedCompanyId,
          selectedVendorId
        );

        toast.success("Vendor user deleted successfully!");
      } catch (error) {
        console.error("Error deleting vendor user:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete vendor user"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePageChange = (newPage, newPageSize) => {
    setCurrentPage(newPage);
    if (newPageSize !== itemsPerPage) {
      setItemsPerPage(newPageSize);
    }
  };

  const handleVendorUserSuccess = () => {
    fetchVendorUsers(
      currentPage,
      itemsPerPage,
      searchTerm,
      selectedCompanyId,
      selectedVendorId
    );
    if (modalMode === MODAL_MODES.CREATE) {
      toast.success("Vendor user created successfully!");
    } else if (modalMode === MODAL_MODES.EDIT) {
      toast.success("Vendor user updated successfully!");
    }
  };

  const activeUsersCount = vendorUsers.filter((user) => user.is_active).length;
  const inactiveUsersCount = vendorUsers.filter(
    (user) => !user.is_active
  ).length;

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
            {/* Vendor Filter Dropdown with Icon */}
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
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
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

            {/* Audit Log Button with Better Design */}
           
            <ReusableButton
              module="vendor-user"
              action="read"
              buttonName={"History"}
              icon={History}
              title="Audit History"
              onClick={() => setShowAuditModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm"
              size={16}
            />

            {/* Create Vendor User Button */}
            <ReusableButton
              module="vendor-user"
              action="create"
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
              <p className="text-sm text-gray-500 font-medium">
                Total Vendor Users
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {totalItems || vendorUsers.length}
              </p>
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
              <p className="text-2xl font-bold text-gray-800">
                {activeUsersCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg mr-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Inactive Users
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {inactiveUsersCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || selectedVendorId) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-semibold text-blue-800">
                Active Filters:
              </span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  <span>Search: {searchTerm}</span>
                </span>
              )}
              {selectedVendorId && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                  <Truck className="w-3 h-3" />
                  <span>
                    {
                      vendorOptions.find((v) => v.value === selectedVendorId)
                        ?.label
                    }
                  </span>
                </span>
              )}
            </div>
            <span className="text-sm text-blue-700 font-medium">
              Found {filteredVendorUsers.length} result(s)
            </span>
          </div>
        </div>
      )}

      {/* Vendor Users Table */}
      <div className="mt-6">
        <VendorUsersTable
          vendorUsers={filteredVendorUsers}
          onView={handleViewVendorUser}
          onEdit={handleEditVendorUser}
          onDelete={handleDeleteVendorUser}
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
        selectedCompany={"SAM001"}
      />
    </div>
  );
};

export default VendorUserManagement;