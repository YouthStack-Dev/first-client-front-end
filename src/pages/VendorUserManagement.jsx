import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

// Components
import ToolBar from "@components/ui/ToolBar";
import SearchInput from "@components/ui/SearchInput";
import SelectField from "../components/ui/SelectField";
import ReusableButton from "../components/ui/ReusableButton";
import AuditLogsModal from "../components/modals/AuditLogsModal";
// import VendorUsersModal from "../components/modals/VendorUsersModal"; // Fixed import

// Icons
import {
  UsersRound,
  History,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";

// Utils
import { logDebug } from "../utils/logger";
import { useCompanyOptions } from "../hooks/useCompanyOptions";
import { selectCurrentUser } from "../redux/features/auth/authSlice";
import endpoint from "../Api/Endpoints";

// Dummy data for vendor users

// Dummy data for vendors
const DUMMY_VENDORS = [
  {
    id: 101,
    name: "ABC Suppliers",
    vendor_name: "ABC Suppliers",
    company_id: 1,
  },
  {
    id: 102,
    name: "XYZ Distributors",
    vendor_name: "XYZ Distributors",
    company_id: 1,
  },
  {
    id: 103,
    name: "Global Logistics",
    vendor_name: "Global Logistics",
    company_id: 2,
  },
  {
    id: 104,
    name: "Premium Supplies",
    vendor_name: "Premium Supplies",
    company_id: 2,
  },
  {
    id: 105,
    name: "Quality Goods Co",
    vendor_name: "Quality Goods Co",
    company_id: 3,
  },
  {
    id: 106,
    name: "Fast Delivery Inc",
    vendor_name: "Fast Delivery Inc",
    company_id: 3,
  },
  { id: 107, name: "Eco Supplies", vendor_name: "Eco Supplies", company_id: 1 },
  {
    id: 108,
    name: "Office Essentials",
    vendor_name: "Office Essentials",
    company_id: 2,
  },
];

// Dummy companies for dropdown
const DUMMY_COMPANIES = [
  { id: 1, name: "Tech Corp" },
  { id: 2, name: "Retail Inc" },
  { id: 3, name: "Manufacturing Ltd" },
];

// Table component for displaying vendor users
const VendorUsersTable = ({
  vendorUsers,
  onView,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vendorUsers || vendorUsers.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg shadow">
        <UsersRound className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg mb-2">No vendor users found</p>
        <p className="text-gray-400 text-sm">
          Try creating a new vendor user or adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vendorUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <UsersRound className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">ID: {user.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.vendor_name || `Vendor ${user.vendor_id}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.company_name || `Company ${user.company_id}`}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.is_active ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-3">
                  <button
                    onClick={() => onView(user)}
                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(user)}
                    className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Import Building, CheckCircle, XCircle icons
import { Building, CheckCircle, XCircle } from "lucide-react";
import VendorUsersModal from "../components/modals/VendorUsersModa";
import { DUMMY_VENDOR_USERS } from "../staticData/StaticReport";

const VendorUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showVendorUserModal, setShowVendorUserModal] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [modalMode, setModalMode] = useState("create"); // 'create', 'view', 'edit'
  const [selectedVendorUser, setSelectedVendorUser] = useState(null);

  // State for vendor users data
  const [vendorUsers, setVendorUsers] = useState(DUMMY_VENDOR_USERS);
  const [isLoading, setIsLoading] = useState(false);
  const [vendors, setVendors] = useState(DUMMY_VENDORS);

  // Get companies & userType from Redux
  const {
    data: companies = DUMMY_COMPANIES,
    loading: companiesLoading = false,
    fetched = true,
  } = useSelector((state) => state.company || {});

  const { type: userType } = useSelector(selectCurrentUser);
  logDebug("User type:", userType);

  // Company dropdown options
  const companyOptions = DUMMY_COMPANIES.map((company) => ({
    value: company.id,
    label: company.name,
  }));

  // Handle dropdown change
  const handleCompanyChange = (e) => {
    const value = e.target.value;
    setSelectedCompanyId(value);
    logDebug("Selected company:", value);

    // Filter vendor users by company
    if (value) {
      const filteredUsers = DUMMY_VENDOR_USERS.filter(
        (user) => user.company_id === parseInt(value)
      );
      setVendorUsers(filteredUsers);
    } else {
      setVendorUsers(DUMMY_VENDOR_USERS);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Filter based on search term and company
    let filtered = DUMMY_VENDOR_USERS;

    if (selectedCompanyId) {
      filtered = filtered.filter(
        (user) => user.company_id === parseInt(selectedCompanyId)
      );
    }

    if (value) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(value.toLowerCase()) ||
          user.email?.toLowerCase().includes(value.toLowerCase()) ||
          user.phone?.includes(value) ||
          user.vendor_name?.toLowerCase().includes(value.toLowerCase())
      );
    }

    setVendorUsers(filtered);
  };

  // Handle view vendor user
  const handleViewVendorUser = (vendorUser) => {
    setSelectedVendorUser(vendorUser);
    setModalMode("view");
    setShowVendorUserModal(true);
  };

  // Handle edit vendor user
  const handleEditVendorUser = (vendorUser) => {
    setSelectedVendorUser(vendorUser);
    setModalMode("edit");
    setShowVendorUserModal(true);
  };

  // Handle create vendor user
  const handleCreateVendorUser = () => {
    setSelectedVendorUser(null);
    setModalMode("create");
    setShowVendorUserModal(true);
  };

  // Handle delete vendor user
  const handleDeleteVendorUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor user?")) {
      // Show loading
      setIsLoading(true);

      // Simulate API call delay
      setTimeout(() => {
        // Remove from dummy data
        const updatedUsers = vendorUsers.filter((user) => user.id !== id);
        setVendorUsers(updatedUsers);

        // Show success message
        alert(`Vendor user #${id} deleted successfully!`);

        setIsLoading(false);
      }, 500);
    }
  };

  // Handle vendor user modal success
  const handleVendorUserSuccess = (newUser) => {
    if (modalMode === "create") {
      // Add new user to the list
      const newId = Math.max(...vendorUsers.map((u) => u.id)) + 1;
      const userToAdd = {
        ...newUser,
        id: newId,
        created_at: new Date().toISOString(),
        company_id: selectedCompanyId ? parseInt(selectedCompanyId) : 1,
        company_name:
          DUMMY_COMPANIES.find(
            (c) =>
              c.id === (selectedCompanyId ? parseInt(selectedCompanyId) : 1)
          )?.name || "Company",
      };

      setVendorUsers([...vendorUsers, userToAdd]);
      alert("Vendor user created successfully!");
    } else if (modalMode === "edit") {
      // Update existing user
      const updatedUsers = vendorUsers.map((user) =>
        user.id === selectedVendorUser.id ? { ...user, ...newUser } : user
      );
      setVendorUsers(updatedUsers);
      alert("Vendor user updated successfully!");
    }
  };

  // Filter vendor users based on search term
  const filteredVendorUsers = vendorUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  const isLoadingCompanies = false; // Using dummy data

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
              placeholder="Search vendor users by name, email or phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="flex-grow"
            />
          </div>
        }
        rightElements={
          <div className="flex items-center gap-3">
            {/* Company Select — show only for Admin */}
            {userType === "admin" && (
              <SelectField
                label="Select Company"
                value={selectedCompanyId}
                onChange={handleCompanyChange}
                options={isLoadingCompanies ? [] : companyOptions}
                isLoading={isLoadingCompanies}
                placeholder={
                  isLoadingCompanies
                    ? "Loading companies..."
                    : "Select a company..."
                }
                disabled={isLoadingCompanies}
                className="min-w-[200px]"
              />
            )}

            {/* Audit Logs */}
            <ReusableButton
              module="vendor-user"
              action="delete"
              icon={History}
              title="View Audit History"
              onClick={() => setShowAuditModal(true)}
              className="text-white bg-blue-600 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
            />

            {/* Create Vendor User */}
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
                {vendorUsers.filter((u) => u.is_active).length}
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
                {vendorUsers.filter((u) => !u.is_active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Users Table */}
      <div className="mt-6">
        <VendorUsersTable
          vendorUsers={filteredVendorUsers}
          onView={handleViewVendorUser}
          onEdit={handleEditVendorUser}
          onDelete={handleDeleteVendorUser}
          isLoading={isLoading}
        />
      </div>

      {/* Vendor Users Modal */}
      <VendorUsersModal
        isOpen={showVendorUserModal}
        onClose={() => setShowVendorUserModal(false)}
        mode={modalMode}
        initialData={selectedVendorUser}
        vendors={vendors}
        onSuccess={handleVendorUserSuccess}
        refreshVendors={() => {
          // In real app, this would fetch vendors again
          console.log("Refreshing vendors...");
        }}
      />

      {/* Audit Logs Modal */}
      <AuditLogsModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        moduleName="Vendor User"
        showUserColumn={true}
        apimodule="vendor-user"
      />
    </div>
  );
};

export default VendorUserManagement;
