import React, { useState } from "react";
import {
  Building2,
  Edit,
  Trash,
  History,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggleButton from "../ui/ReusableToggleButton";
import { logDebug, logError } from "../../utils/logger";
import { API_CLIENT } from "../../Api/API_Client";
import endpoint from "../../Api/Endpoints";
import { toggleTeamStatus } from "../../redux/features/user/userSlice";
import { useDispatch } from "react-redux";

const DepartmentList = ({
  departments,
  selectedDepartments,
  isLoading,
  searchTerm,
  onSelectDepartment,
  onSelectAllDepartments,
  onEditDepartment,
  onDeleteDepartment,
  onViewEmployees,
  onViewHistory,

  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending", // 'ascending' or 'descending'
  });
  const [columnFilters, setColumnFilters] = useState({
    name: "",
    status: "all", // 'all', 'active', 'inactive'
    activeEmployees: "",
    inactiveEmployees: "",
  });
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);

  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const dispatch = useDispatch();
  // Apply column filters and sorting
  const filteredAndSortedDepartments = React.useMemo(() => {
    let filtered = departments?.filter((dept) => {
      // Name filter
      if (
        columnFilters.name &&
        !dept.name?.toLowerCase().includes(columnFilters.name.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (columnFilters.status !== "all") {
        if (columnFilters.status === "active" && !dept.is_active) return false;
        if (columnFilters.status === "inactive" && dept.is_active) return false;
      }

      // Active employees filter (greater than or equal to)
      if (
        columnFilters.activeEmployees &&
        (dept.active_employee_count || 0) <
          parseInt(columnFilters.activeEmployees)
      ) {
        return false;
      }

      // Inactive employees filter (greater than or equal to)
      if (
        columnFilters.inactiveEmployees &&
        (dept.inactive_employee_count || 0) <
          parseInt(columnFilters.inactiveEmployees)
      ) {
        return false;
      }

      return true;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered = filtered?.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle different data types
        if (sortConfig.key === "name") {
          aValue = aValue?.toLowerCase() || "";
          bValue = bValue?.toLowerCase() || "";
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [departments, columnFilters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const handleFilterChange = (column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const clearColumnFilter = (column) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: column === "status" ? "all" : "",
    }));
  };

  const clearAllFilters = () => {
    setColumnFilters({
      name: "",
      status: "all",
      activeEmployees: "",
      inactiveEmployees: "",
    });
    setSortConfig({ key: null, direction: "ascending" });
  };

  const hasActiveFilters = Object.values(columnFilters).some(
    (filter) => filter !== "" && filter !== "all"
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleStatusToggle = async (teamId) => {
    try {
      const response = await API_CLIENT.patch(
        `${endpoint.toggleTeamStatus}${teamId}/toggle-status`
      );

      if (response.status === 200) {
        // ✅ Update local Redux store after backend success
        dispatch(toggleTeamStatus(teamId));
      }
    } catch (error) {
      logError("Failed to toggle team status:", error);
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="w-3 h-3 opacity-30" />;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="w-3 h-3 text-blue-600" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-600" />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading departments...</p>
          <p className="text-sm text-gray-500 mt-1">
            Please wait while we fetch your data
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="pl-6 pr-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        filteredAndSortedDepartments.length > 0 &&
                        selectedDepartments.length ===
                          filteredAndSortedDepartments.length
                      }
                      onChange={onSelectAllDepartments}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2"
                    />
                  </th>

                  {/* Department Name Column with Filter and Sort */}
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                      >
                        Department
                        <div className="flex flex-col">
                          {getSortIcon("name")}
                        </div>
                      </button>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={columnFilters.name}
                          onChange={(e) =>
                            handleFilterChange("name", e.target.value)
                          }
                          className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {columnFilters.name && (
                          <button
                            onClick={() => clearColumnFilter("name")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>

                  {/* Description Column */}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>

                  {/* Status Column with Filter and Sort */}
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSort("is_active")}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                      >
                        Status
                        <div className="flex flex-col">
                          {getSortIcon("is_active")}
                        </div>
                      </button>
                      <select
                        value={columnFilters.status}
                        onChange={(e) =>
                          handleFilterChange("status", e.target.value)
                        }
                        className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </th>

                  {/* Team Members Column with Filters */}
                  <th className="px-4 py-3 text-left">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Team Members
                      </div>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          placeholder="Active ≥"
                          value={columnFilters.activeEmployees}
                          onChange={(e) =>
                            handleFilterChange(
                              "activeEmployees",
                              e.target.value
                            )
                          }
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Inactive ≥"
                          value={columnFilters.inactiveEmployees}
                          onChange={(e) =>
                            handleFilterChange(
                              "inactiveEmployees",
                              e.target.value
                            )
                          }
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </th>

                  <th className="pl-4 pr-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedDepartments?.map((department) => (
                  <tr
                    key={department?.team_id || department?.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="pl-6 pr-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(
                          department?.team_id || department?.id
                        )}
                        onChange={(e) =>
                          onSelectDepartment(
                            department?.team_id || department?.id,
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Building2 size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {department?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {department?.team_id || department?.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">
                        {department?.description ? (
                          <span className="line-clamp-2">
                            {department.description}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            No description
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <ReusableToggleButton
                        module="team"
                        action="update"
                        isChecked={department?.is_active ?? true}
                        onToggle={() => handleStatusToggle(department?.team_id)}
                        labels={{ on: "Active", off: "Inactive" }}
                        size="small"
                        className="scale-90"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <ReusableButton
                          module="team"
                          action="read"
                          icon={UserCheck}
                          buttonName={department?.active_employee_count || 0}
                          title="View Active Employees"
                          onClick={() =>
                            onViewEmployees(
                              department?.team_id || department?.id,
                              true,
                              department?.name,
                              department.active_employee_count
                            )
                          }
                          className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-100 transition-all border border-green-200 hover:border-green-300 hover:shadow-sm"
                        />
                        <ReusableButton
                          module="team"
                          action="read"
                          icon={UserX}
                          buttonName={department?.inactive_employee_count || 0}
                          title="View Inactive Employees"
                          onClick={() =>
                            onViewEmployees(
                              department?.team_id || department?.id,
                              false,
                              department?.name,
                              department.inactive_employee_count
                            )
                          }
                          className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        />
                      </div>
                    </td>
                    <td className="pl-4 pr-6 py-4">
                      <div className="flex items-center gap-2">
                        <ReusableButton
                          module="team"
                          action="update"
                          icon={Edit}
                          title="Edit Department"
                          onClick={() => onEditDepartment(department)}
                          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                        />

                        <ReusableButton
                          module="team"
                          action="view_history"
                          icon={History}
                          title="View History"
                          onClick={() =>
                            onViewHistory(department?.team_id || department?.id)
                          }
                          className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 p-2 rounded-lg transition-all"
                        />

                        <ReusableButton
                          module="team"
                          action="delete"
                          icon={Trash}
                          title="Delete Team"
                          onClick={() =>
                            onDeleteDepartment(
                              department?.team_id || department?.id
                            )
                          }
                          className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!filteredAndSortedDepartments ||
            filteredAndSortedDepartments.length === 0) &&
            !isLoading && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {hasActiveFilters || searchTerm
                    ? "No departments found"
                    : "No departments yet"}
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  {hasActiveFilters
                    ? "No departments match your filter criteria. Try adjusting your filters."
                    : searchTerm
                    ? "No departments match your search criteria."
                    : "Get started by creating your first department to organize your team."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

          {/* Enhanced Pagination */}
          {filteredAndSortedDepartments &&
            filteredAndSortedDepartments.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-semibold">
                    {startItem}-{endItem}
                  </span>{" "}
                  of <span className="font-semibold">{totalItems}</span>{" "}
                  departments
                  {hasActiveFilters && (
                    <span className="ml-2 text-blue-600">
                      • Filtered ({filteredAndSortedDepartments.length} results)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed bg-gray-100"
                        : "text-gray-700 hover:bg-white hover:shadow-sm border border-gray-200"
                    }`}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => onPageChange(pageNum)}
                          className={`w-8 h-8 rounded text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-700 hover:bg-white hover:shadow-sm border border-gray-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed bg-gray-100"
                        : "text-gray-700 hover:bg-white hover:shadow-sm border border-gray-200"
                    }`}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default DepartmentList;
