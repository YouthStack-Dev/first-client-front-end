import React, { useState } from "react";
import {
  UsersRound,
  Eye,
  Edit2,
  Trash2,
  Building,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { logDebug } from "../../utils/logger";

export const VendorUsersTable = ({
  vendorUsers,
  onView,
  onEdit,
  onDelete,
  isLoading,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  currentPage = 1,
}) => {
  const [pageSize, setPageSize] = useState(itemsPerPage);
  const [localPage, setLocalPage] = useState(currentPage);
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);

  // If onPageChange is provided, use controlled pagination
  // Otherwise, use local state for pagination
  const page = onPageChange ? currentPage : localPage;

  // Get paginated data if no external pagination
  const getPaginatedData = () => {
    if (onPageChange || !vendorUsers) return vendorUsers;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return vendorUsers.slice(startIndex, endIndex);
  };

  const paginatedUsers = getPaginatedData();
  logDebug(" this is the user ", paginatedUsers);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    if (onPageChange) {
      onPageChange(newPage, pageSize);
    } else {
      setLocalPage(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    if (onPageChange) {
      onPageChange(1, newSize);
    } else {
      setLocalPage(1);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg">
        {/* Page size selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">entries</span>
        </div>

        {/* Page info */}
        <div className="hidden sm:block text-sm text-gray-700">
          Showing{" "}
          <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
          <span className="font-medium">
            {Math.min(page * pageSize, totalItems)}
          </span>{" "}
          of <span className="font-medium">{totalItems}</span> results
        </div>

        {/* Pagination controls */}
        <div className="flex items-center space-x-2">
          {/* First page */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            className={`p-1.5 rounded-md ${
              page === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="First page"
          >
            <ChevronsLeft size={18} />
          </button>

          {/* Previous page */}
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`p-1.5 rounded-md ${
              page === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Page numbers */}
          <div className="flex space-x-1">
            {pages.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-medium ${
                  page === pageNum
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          {/* Next page */}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`p-1.5 rounded-md ${
              page === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Next page"
          >
            <ChevronRight size={18} />
          </button>

          {/* Last page */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            className={`p-1.5 rounded-md ${
              page === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Last page"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>
    );
  };

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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
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
            {paginatedUsers.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
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

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};
