import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { Eye,Plus, Trash, Users, UserCheck, Clock, UserPlus } from "lucide-react";
import ToolBar from "../components/ui/ToolBar";
import ReusableButton from "../components/ui/ReusableButton";
import ReusableToggleButton from "../components/ui/ReusableToggleButton";
import { logDebug, logError } from "../utils/logger";
import { toggleTeamStatus } from "../redux/features/teams/teamsTrunk";
import { fetchTeamsThunk } from "../redux/features/teams/teamsTrunk";
import {
  selectAllTeams,
  selectTeamsByTenantId,
  selectTeamsLoading,
  selectTeamsError,
  selectTogglingTeamId,
  selectUniqueTenantsFromTeams,
} from "../redux/features/teams/teamsSelectors";
import { selectCurrentUser } from "../redux/features/auth/authSlice";
import TeamModal from "../components/modals/TeamModal";
import TeamEmployeeModal from "../components/TeamEmployees/TeamEmployeeModal";
import AuditLogsModal from "../components/modals/AuditLogsModal";

import BulkUploadEmployeesSection from "../components/modals/BulkUploadEmployeesSection";

const TeamManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const userType = user?.type || "";

  // Redux selectors
  const isLoading = useSelector(selectTeamsLoading);
  const teamsError = useSelector(selectTeamsError);
  const allTeams = useSelector(selectAllTeams);
  const togglingTeamId = useSelector(selectTogglingTeamId);
  const uniqueTenants = useSelector(selectUniqueTenantsFromTeams);

   const [showBulkUpload, setShowBulkUpload] = useState(false);

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeamFromSearch, setSelectedTeamFromSearch] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Get tenant from localStorage for non-admin users
  const getTenantFromLocalStorage = () => {
    try {
      const tenantData = localStorage.getItem("tenant");
      if (tenantData) {
        const parsedTenant = JSON.parse(tenantData);
        return parsedTenant.tenant_id || "";
      }
    } catch (error) {
      logError("Error getting tenant from localStorage:", error);
    }
    return "";
  };

  // Get current tenant ID
  const currentTenantId = useMemo(() => {
    if (userType === "admin") {
      return selectedTenantId;
    }
    return getTenantFromLocalStorage();
  }, [userType, selectedTenantId]);

  // Get teams by tenant ID
  const teamsByTenant = useSelector((state) =>
    currentTenantId ? selectTeamsByTenantId(state, currentTenantId) : []
  );

  // Get teams based on current tenant
  const teams = useMemo(() => {
    if (!currentTenantId) {
      return allTeams;
    }
    return teamsByTenant;
  }, [currentTenantId, allTeams, teamsByTenant]);

  // Fetch teams on mount and when tenant changes
  useEffect(() => {
    const fetchTeams = async () => {
      const queryParams = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      if (userType === "admin" && selectedTenantId) {
        queryParams.tenant_id = selectedTenantId;
      } else if (userType !== "admin") {
        const tenantId = getTenantFromLocalStorage();
        if (tenantId) {
          queryParams.tenant_id = tenantId;
        }
      }

      try {
        await dispatch(fetchTeamsThunk(queryParams)).unwrap();
      } catch (error) {
        logError("Failed to fetch teams:", error);
        toast.error(error || "Failed to fetch teams");
      }
    };

    if (userType === "admin" || getTenantFromLocalStorage()) {
      fetchTeams();
    }
  }, [dispatch, currentPage, userType, selectedTenantId]);

  // Filter teams based on search and status
  const filteredTeams = useMemo(() => {
    let filtered = teams;

    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (team) =>
          team.name?.toLowerCase().includes(searchLower) ||
          team.description?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter && statusFilter.value) {
      if (statusFilter.value === "active") {
        filtered = filtered.filter((team) => team.is_active === true);
      } else if (statusFilter.value === "inactive") {
        filtered = filtered.filter((team) => team.is_active === false);
      }
    }

    return filtered;
  }, [teams, searchTerm, statusFilter]);

  // Generate search options for react-select
  const searchOptions = useMemo(() => {
    return teams.map((team) => ({
      value: team.team_id || team.id,
      label: team.name,
      data: team,
    }));
  }, [teams]);

  // Handle team selection from search
  const handleTeamSelect = (selectedOption) => {
    if (selectedOption && selectedOption.data) {
      const selectedTeam = selectedOption.data;
      setSelectedTeamFromSearch(selectedTeam);
      setSearchTerm(selectedTeam.name);

      // Open the team modal in view mode
      setEditingTeam({ ...selectedTeam, mode: "view" });
      setIsModalOpen(true);
    } else {
      // Clear selection
      setSelectedTeamFromSearch(null);
      setSearchTerm("");
    }
  };

  // Handle input change for search (for typing)
  const handleSearchInputChange = (inputValue) => {
    setSearchTerm(inputValue || "");
    // Clear selected team if user starts typing
    if (inputValue && !inputValue.includes(selectedTeamFromSearch?.name)) {
      setSelectedTeamFromSearch(null);
    }
  };

  // Paginated teams
  const paginatedTeams = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTeams.slice(startIndex, endIndex);
  }, [filteredTeams, currentPage, itemsPerPage]);

  const totalItems = filteredTeams.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Generate tenant options
  const tenantOptions = React.useMemo(() => {
    if (userType !== "admin" || !uniqueTenants || uniqueTenants.length === 0) {
      return [];
    }
    return [
      { value: "", label: "All Tenants" },
      ...uniqueTenants.map((tenant) => ({
        value: tenant.tenant_id,
        label: tenant.tenant_name || `Tenant ${tenant.tenant_id}`,
      })),
    ];
  }, [uniqueTenants, userType]);

  // Handle tenant selection change
  const handleTenantChange = (selectedOption) => {
    const tenantId = selectedOption?.value || null;
    setSelectedTenantId(tenantId);
    setCurrentPage(1);
    // Clear search when tenant changes
    setSearchTerm("");
    setSelectedTeamFromSearch(null);
  };

  // Handle status toggle
  const handleStatusToggle = async (teamId) => {
    try {
      const result = await dispatch(toggleTeamStatus({ teamId })).unwrap();

      if (result.data?.success) {
        toast.success(
          result.data.message || "Team status updated successfully"
        );
      } else {
        toast.success("Team status updated successfully");
      }
    } catch (error) {
      logError("Failed to toggle team status:", error);
      toast.error(error || "Failed to update team status");
    }
  };

  // Handle delete
  const handleDelete = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) {
      return;
    }

    try {
      // You'll need to implement deleteTeamThunk
      // await dispatch(deleteTeamThunk({ teamId })).unwrap();

      toast.success("Team deleted successfully");

      // Refresh teams list
      const queryParams = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };
      if (currentTenantId) {
        queryParams.tenant_id = currentTenantId;
      }
      dispatch(fetchTeamsThunk(queryParams));
    } catch (error) {
      logError("Failed to delete team:", error);
      toast.error("Failed to delete team");
    }
  };

  // Handle view
  const handleView = (team) => {
    setEditingTeam({ ...team, mode: "view" });
    setIsModalOpen(true);
  };

  // Handle view employees
  const handleViewEmployees = (team) => {
    const teamId = team.team_id;
    const tenantId = team.tenant_id || currentTenantId || "";

    navigate(`/companies/teams/${teamId}/employees?tenantId=${tenantId}`, {
      state: {
        team,
        teamName: team.name,
        tenantId,
      },
    });
  };

  // Handle create
  const handleCreate = () => {
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  // Handle modal success
  const handleModalSuccess = (teamData) => {
    setIsModalOpen(false);
    setEditingTeam(null);
    // Clear search selection
    setSelectedTeamFromSearch(null);
    setSearchTerm("");

    // Refresh teams list
    const queryParams = {
      skip: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    };
    if (currentTenantId) {
      queryParams.tenant_id = currentTenantId;
    }
    dispatch(fetchTeamsThunk(queryParams));
  };

  // Status filter options
  const statusOptions = [
    { value: "all", label: "All Teams" },
    { value: "active", label: "Active Teams" },
    { value: "inactive", label: "Inactive Teams" },
  ];

     const handleBulkUploadSuccess = () => {
      setShowBulkUpload(false);
      toast.success("Employees uploaded successfully");

      // Optional: refresh teams to update employee counts
      dispatch(
        fetchTeamsThunk({
          skip: (currentPage - 1) * itemsPerPage,
          limit: itemsPerPage,
          tenant_id: currentTenantId,
        })
      );
    };


  // Custom styles for react-select
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#d1d5db",
      borderRadius: "0.5rem",
      minHeight: "2.5rem",
      "&:hover": {
        borderColor: "#9ca3af",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
    }),
  };

  // Custom filter function for search
  const customFilterOption = (option, rawInput) => {
    const input = rawInput.toLowerCase().trim();
    if (!input) return true;

    const team = option.data;
    // Check if team data exists
    if (!team) return false;

    return (
      team.name?.toLowerCase().includes(input) ||
      team.description?.toLowerCase().includes(input)
    );
  };

  // Custom format for search options - FIXED VERSION
  const formatOptionLabel = (option) => {
    // Check if option has data property
    const teamData = option.data;

    return (
      <div className="py-2">
        <div className="font-medium text-gray-900">
          {option.label || "Unnamed Team"}
        </div>
        {teamData && teamData.description && (
          <div className="text-sm text-gray-500 truncate">
            {teamData.description}
          </div>
        )}
        <div className="text-xs text-gray-400 mt-1">
          ID: {teamData ? teamData.team_id || teamData.id || "N/A" : "N/A"}
        </div>
      </div>
    );
  };

  // Alternative: Simple format for when user is typing (not selecting from options)
  const formatOptionLabelSimple = (option) => {
    // If it's just a typed value (not from our search options)
    if (!option.data) {
      return <div className="py-2">{option.label}</div>;
    }

    // Otherwise, use the detailed format
    return formatOptionLabel(option);
  };

  // Update the ReusableToggleButton to show loading state
  const renderStatusToggle = (team) => {
    const teamId = team.team_id || team.id;
    const isToggling = togglingTeamId === teamId;

    return (
      <ReusableToggleButton
        module="team"
        action="update"
        isChecked={team.is_active ?? true}
        onToggle={() => handleStatusToggle(teamId)}
        labels={{ on: "Active", off: "Inactive" }}
        size="small"
        className="scale-90"
        disabled={isToggling}
        loading={isToggling}
      />

    );
  };

  // Pagination calculations
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="p-1">
      <ToolBar
        module="team"
       
        onAddClick={handleCreate}
        addButtonLabel="Create Team"
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* Search with react-select and suggestions */}
            <div className="flex-1">
              <Select
                isSearchable={true}
                isClearable={true}
                placeholder="Search by team name or description..."
                onInputChange={handleSearchInputChange}
                value={
                  selectedTeamFromSearch
                    ? {
                        value:
                          selectedTeamFromSearch.team_id ||
                          selectedTeamFromSearch.id,
                        label: selectedTeamFromSearch.name,
                        data: selectedTeamFromSearch,
                      }
                    : searchTerm
                    ? { value: searchTerm, label: searchTerm }
                    : null
                }
                onChange={handleTeamSelect}
                styles={selectStyles}
                options={searchOptions}
                filterOption={customFilterOption}
                formatOptionLabel={formatOptionLabelSimple}
                noOptionsMessage={({ inputValue }) =>
                  inputValue ? "No teams found" : "Type to search teams"
                }
              />
            </div>

            {/* Tenant Filter for Admin */}
            {userType === "admin" && tenantOptions.length > 0 && (
              <div className="w-full sm:w-48">
                <Select
                  options={tenantOptions}
                  value={
                    tenantOptions.find(
                      (opt) => opt.value === (selectedTenantId || "")
                    ) || tenantOptions[0]
                  }
                  onChange={handleTenantChange}
                  styles={selectStyles}
                  isSearchable={true}
                  placeholder="Select tenant"
                />
              </div>
            )}

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Select
                options={statusOptions}
                value={
                  statusFilter ||
                  statusOptions.find((opt) => opt.value === "all")
                }
                onChange={(selected) => {
                  if (selected.value === "all") {
                    setStatusFilter(null);
                  } else {
                    setStatusFilter(selected);
                  }
                  setCurrentPage(1);
                }}
                styles={selectStyles}
                isSearchable={false}
                placeholder="Filter by status"
              />
            </div>
          </div>
        }

 rightElements={
  <div className="flex items-center gap-2">
    <ReusableButton
       module="employee"
      action="create" // Changed from "read" to "create" since you're creating an employee
      icon={UserPlus} // You might want to use a UserPlus icon or similar
      title="Create Employee"
      className="bg-app-primary p-2"
      onClick={() => {
        setIsEmployeeModalOpen(true);
      }}
    />

    <ReusableButton
      module="team"
      action="read"
      icon={Clock}
      title="History"
      className="bg-app-primary p-2"
      onClick={() => {
        setIsAuditModalOpen(true);
      }}
    />

      <ReusableButton
     module="employee"
     action="create"
     buttonName="Bulk Upload"
     icon={Plus}
     title="Bulk Upload Employees"
       onClick={() => {
    setShowBulkUpload(true);
  }}
     className="text-white bg-green-600 p-2 rounded-md"
    />

  </div>
}
      />

<BulkUploadEmployeesSection
  isOpen={showBulkUpload}
  onClose={() => setShowBulkUpload(false)}
  onSuccess={handleBulkUploadSuccess}
/>



      {/* Teams Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading teams...</p>
          </div>
        ) : paginatedTeams.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No teams found
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter
                ? "No teams match your search criteria"
                : "Get started by creating your first team"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Team Name
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Inactive
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTeams.map((team) => (
                    <tr
                      key={team.team_id || team.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Users size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {team.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {team.team_id || team.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <div className="line-clamp-2">
                          {team.description || (
                            <span className="text-gray-400 italic">
                              No description
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusToggle(team)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {team.active_employee_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {team.inactive_employee_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <ReusableButton
                            module="team"
                            action="read"
                            icon={UserCheck}
                            title="View Employees"
                            onClick={() => handleViewEmployees(team)}
                            className="text-gray-600 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-all"
                          />
                          <ReusableButton
                            module="team"
                            action="read"
                            icon={Eye}
                            title="View Team"
                            onClick={() => handleView(team)}
                            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          />
                          <ReusableButton
                            module="team"
                            action="delete"
                            icon={Trash}
                            title="Delete Team"
                            onClick={() =>
                              handleDelete(team.team_id || team.id)
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-semibold">
                    {startItem}-{endItem}
                  </span>{" "}
                  of <span className="font-semibold">{totalItems}</span> teams
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed bg-gray-100"
                        : "text-gray-700 hover:bg-white hover:shadow-sm border border-gray-200"
                    }`}
                  >
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
                          onClick={() => setCurrentPage(pageNum)}
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed bg-gray-100"
                        : "text-gray-700 hover:bg-white hover:shadow-sm border border-gray-200"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Team Modal */}
      <TeamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTeam(null);
          setSelectedTeamFromSearch(null);
          setSearchTerm("");
        }}
        onSuccess={handleModalSuccess}
        initialData={editingTeam}
        mode={editingTeam?.mode || (editingTeam ? "edit" : "create")}
        userType={userType}
        tenantOptions={tenantOptions}
        selectedTenant={
          userType === "admin" ? null : getTenantFromLocalStorage()
        }
      />

      {/* Team Employee Modal */}
      <TeamEmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        mode="create"
        onSuccess={() => {
          setIsEmployeeModalOpen(false);
          // Refresh teams list to update counts
          const queryParams = {
            skip: (currentPage - 1) * itemsPerPage,
            limit: itemsPerPage,
          };
          if (currentTenantId) {
            queryParams.tenant_id = currentTenantId;
          }
          dispatch(fetchTeamsThunk(queryParams));
        }}
      />

      <AuditLogsModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        moduleName="Team"
        apimodule="teams"
        selectedCompany={currentTenantId}
      />
    </div>
  );
};

export default TeamManagement;
