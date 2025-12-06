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
} from "lucide-react";

import { selectCurrentUser } from "../redux/features/auth/authSlice";
import { useVendorOptions } from "../hooks/useVendorOptions";
import { VendorUsersTable } from "../components/vendor/VendorUsersTable";
import { fetchVendorsThunk } from "../redux/features/vendors/vendorThunk";
import { API_CLIENT } from "../Api/API_Client";
import endpoint from "../Api/Endpoints";

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

// Dummy companies for dropdown
export const DUMMY_COMPANIES = [
  { id: 1, name: "Tech Corp" },
  { id: 2, name: "Retail Inc" },
  { id: 3, name: "Manufacturing Ltd" },
];

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
  const vendors = useVendorOptions();
  const { type: userType, tenant_id } = useSelector(selectCurrentUser);

  const companyOptions = DUMMY_COMPANIES.map((company) => ({
    value: company.id,
    label: company.name,
  }));

  // Single fetch function
  const fetchVendorUsers = useCallback(
    async (page, size, search = "", companyId = "") => {
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
    debounce((page, size, search, companyId) => {
      fetchVendorUsers(page, size, search, companyId);
    }, 500),
    [fetchVendorUsers]
  );

  // Trigger search when inputs change
  useEffect(() => {
    debouncedFetchVendorUsers(
      currentPage,
      itemsPerPage,
      searchTerm,
      selectedCompanyId
    );

    return () => {
      debouncedFetchVendorUsers.cancel();
    };
  }, [
    searchTerm,
    selectedCompanyId,
    currentPage,
    itemsPerPage,
    debouncedFetchVendorUsers,
  ]);

  // Initial load
  useEffect(() => {
    dispatch(fetchVendorsThunk({ skip: 0, limit: 50 }));
  }, [
    dispatch,
    fetchVendorUsers,
    currentPage,
    itemsPerPage,
    selectedCompanyId,
  ]);

  const handleCompanyChange = (e) => {
    const value = e.target.value;
    setSelectedCompanyId(value);
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
          selectedCompanyId
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
    fetchVendorUsers(currentPage, itemsPerPage, searchTerm, selectedCompanyId);
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
    <div className="p-4">
      <ToolBar
        onAddClick={handleCreateVendorUser}
        addButtonLabel="Vendor User"
        addButtonIcon={<UserPlus size={16} />}
        className="p-4 bg-white border rounded-lg shadow-sm mb-6"
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <SearchInput
              placeholder={" Search by name , email"}
              value={searchTerm}
              onChange={handleSearch}
              onClear={handleClearSearch}
              className="flex-grow pr-10"
            />
          </div>
        }
        rightElements={
          <div className="flex items-center gap-3">
            {userType === "admin" && (
              <SelectField
                label="Select Company"
                value={selectedCompanyId}
                onChange={handleCompanyChange}
                options={companyOptions}
                placeholder="All Companies"
                className="min-w-[200px]"
              />
            )}

            <ReusableButton
              module="vendor-user"
              action="delete"
              icon={History}
              title="View Audit History"
              onClick={() => setShowAuditModal(true)}
              className="text-white bg-blue-600 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
            />

            <ReusableButton
              module="vendor-user"
              action="create"
              icon={UserPlus}
              title="Create Vendor User"
              onClick={handleCreateVendorUser}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={16} />
              Create Vendor User
            </ReusableButton>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <UsersRound className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Vendor Users</p>
              <p className="text-2xl font-bold text-gray-800">
                {vendorUsers.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-800">
                {activeUsersCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg mr-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-800">
                {inactiveUsersCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Info Banner */}
      {searchTerm && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 flex items-center">
            <span className="font-medium">Search Results:</span>
            <span className="ml-2">
              {getSearchPlaceholder(searchTerm).replace("Searching by ", "")}
            </span>
            <span className="ml-auto">
              Found {filteredVendorUsers.length} result(s)
            </span>
          </p>
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
        vendors={vendors}
        onSuccess={handleVendorUserSuccess}
        refreshVendors={() => {
          dispatch(fetchVendorsThunk({ skip: 0, limit: 50 }));
        }}
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
