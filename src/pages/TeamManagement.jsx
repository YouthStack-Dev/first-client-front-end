import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { Eye, Plus, Trash, Users, UserCheck, Clock, UserPlus } from "lucide-react";
import ToolBar from "../components/ui/ToolBar";
import ReusableButton from "../components/ui/ReusableButton";
import ReusableToggleButton from "../components/ui/ReusableToggleButton";
import { logDebug, logError } from "../utils/logger";
import { toggleTeamStatus, fetchTeamsThunk } from "../redux/features/teams/teamsTrunk";
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
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation(); // ← reads state passed from CompanyCard
  const user      = useSelector(selectCurrentUser);
  const userType  = user?.type || "";

  const isLoading      = useSelector(selectTeamsLoading);
  const teamsError     = useSelector(selectTeamsError);
  const allTeams       = useSelector(selectAllTeams);
  const togglingTeamId = useSelector(selectTogglingTeamId);
  const uniqueTenants  = useSelector(selectUniqueTenantsFromTeams);

  const [showBulkUpload,         setShowBulkUpload]         = useState(false);
  const [searchTerm,             setSearchTerm]             = useState("");
  const [selectedTeamFromSearch, setSelectedTeamFromSearch] = useState(null);
  const [statusFilter,           setStatusFilter]           = useState(null);
  const [isModalOpen,            setIsModalOpen]            = useState(false);
  const [isEmployeeModalOpen,    setIsEmployeeModalOpen]    = useState(false);
  const [editingTeam,            setEditingTeam]            = useState(null);
  const [currentPage,            setCurrentPage]            = useState(1);
  const [isAuditModalOpen,       setIsAuditModalOpen]       = useState(false);
  const itemsPerPage = 10;

  // ── selectedTenantId ───────────────────────────────────────────────────
  // Superadmin  → use tenant_id from CompanyCard navigation state (if any)
  // Company admin/employee → always null here; they use localStorage tenant
  const [selectedTenantId, setSelectedTenantId] = useState(
    userType === "admin" ? (location.state?.tenant_id || null) : null
  );

  // ── Helper: get tenant from localStorage (company admin / employee) ────
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

  // ── currentTenantId ────────────────────────────────────────────────────
  // Superadmin  → uses selected tenant from dropdown (or pre-filled from CompanyCard)
  // Non-admin   → always uses their own tenant from localStorage
  const currentTenantId = useMemo(() => {
    if (userType === "admin") return selectedTenantId;
    return getTenantFromLocalStorage();
  }, [userType, selectedTenantId]);

  const teamsByTenant = useSelector((state) =>
    currentTenantId ? selectTeamsByTenantId(state, currentTenantId) : []
  );

  const teams = useMemo(() => {
    if (!currentTenantId) return allTeams;
    return teamsByTenant;
  }, [currentTenantId, allTeams, teamsByTenant]);

  // ── Fetch teams ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTeams = async () => {
      const queryParams = {
        skip:  (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      if (userType === "admin" && selectedTenantId) {
        // Superadmin: pass selected tenant_id
        queryParams.tenant_id = selectedTenantId;
      } else if (userType !== "admin") {
        // Company admin/employee: pass their own tenant_id
        const tenantId = getTenantFromLocalStorage();
        if (tenantId) queryParams.tenant_id = tenantId;
      }

      try {
        await dispatch(fetchTeamsThunk(queryParams)).unwrap();
      } catch (error) {
        logError("Failed to fetch teams:", error);
        toast.error(error || "Failed to fetch teams");
      }
    };

    // Superadmin: only fetch when a tenant is selected (avoids 400 TENANT_ID_REQUIRED)
    // Non-admin:  always fetch using their own localStorage tenant
    const shouldFetch = userType === "admin"
      ? !!selectedTenantId
      : !!getTenantFromLocalStorage();

    if (shouldFetch) fetchTeams();
  }, [dispatch, currentPage, userType, selectedTenantId]);

  // ── Filtered teams ──────────────────────────────────────────────────────
  const filteredTeams = useMemo(() => {
    let filtered = teams;
    if (searchTerm?.trim()) {
      const q = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (t) => t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      );
    }
    if (statusFilter?.value) {
      filtered = filtered.filter((t) =>
        statusFilter.value === "active" ? t.is_active === true : t.is_active === false
      );
    }
    return filtered;
  }, [teams, searchTerm, statusFilter]);

  const searchOptions = useMemo(() =>
    teams.map((team) => ({ value: team.team_id || team.id, label: team.name, data: team })),
    [teams]
  );

  const paginatedTeams = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTeams.slice(start, start + itemsPerPage);
  }, [filteredTeams, currentPage]);

  const totalItems = filteredTeams.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem  = (currentPage - 1) * itemsPerPage + 1;
  const endItem    = Math.min(currentPage * itemsPerPage, totalItems);

  // ── Tenant options (superadmin only) ────────────────────────────────────
  const tenantOptions = useMemo(() => {
    if (userType !== "admin" || !uniqueTenants?.length) return [];
    return [
      { value: "", label: "All Tenants" },
      ...uniqueTenants.map((t) => ({
        value: t.tenant_id,
        label: t.tenant_name || `Tenant ${t.tenant_id}`,
      })),
    ];
  }, [uniqueTenants, userType]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleTeamSelect = (selectedOption) => {
    if (selectedOption?.data) {
      const t = selectedOption.data;
      setSelectedTeamFromSearch(t);
      setSearchTerm(t.name);
      setEditingTeam({ ...t, mode: "view" });
      setIsModalOpen(true);
    } else {
      setSelectedTeamFromSearch(null);
      setSearchTerm("");
    }
  };

  const handleSearchInputChange = (inputValue) => {
    setSearchTerm(inputValue || "");
    if (inputValue && !inputValue.includes(selectedTeamFromSearch?.name)) {
      setSelectedTeamFromSearch(null);
    }
  };

  const handleTenantChange = (selectedOption) => {
    setSelectedTenantId(selectedOption?.value || null);
    setCurrentPage(1);
    setSearchTerm("");
    setSelectedTeamFromSearch(null);
  };

  const handleStatusToggle = async (teamId) => {
    try {
      const result = await dispatch(toggleTeamStatus({ teamId })).unwrap();
      toast.success(result.data?.message || "Team status updated successfully");
    } catch (error) {
      logError("Failed to toggle team status:", error);
      toast.error(error || "Failed to update team status");
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      toast.success("Team deleted successfully");
      dispatch(fetchTeamsThunk({
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        ...(currentTenantId ? { tenant_id: currentTenantId } : {}),
      }));
    } catch (error) {
      logError("Failed to delete team:", error);
      toast.error("Failed to delete team");
    }
  };

  const handleView = (team) => {
    setEditingTeam({ ...team, mode: "view" });
    setIsModalOpen(true);
  };

  const handleViewEmployees = (team) => {
    const teamId   = team.team_id;
    const tenantId = team.tenant_id || currentTenantId || "";
    navigate(`/superadmin/teams/${teamId}/employees?tenantId=${tenantId}`, {
      state: { team, teamName: team.name, tenantId },
    });
  };

  const handleCreate = () => {
    setEditingTeam(null);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setSelectedTeamFromSearch(null);
    setSearchTerm("");
    dispatch(fetchTeamsThunk({
      skip: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
      ...(currentTenantId ? { tenant_id: currentTenantId } : {}),
    }));
  };

  const handleBulkUploadSuccess = () => {
    setShowBulkUpload(false);
    toast.success("Employees uploaded successfully");
    dispatch(fetchTeamsThunk({
      skip: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
      tenant_id: currentTenantId,
    }));
  };

  const renderStatusToggle = (team) => {
    const teamId     = team.team_id || team.id;
    const isToggling = togglingTeamId === teamId;
    return (
      <ReusableToggleButton
        module="team" action="update"
        isChecked={team.is_active ?? true}
        onToggle={() => handleStatusToggle(teamId)}
        labels={{ on: "Active", off: "Inactive" }}
        size="small" className="scale-90"
        disabled={isToggling} loading={isToggling}
      />
    );
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#d1d5db",
      borderRadius: "0.5rem",
      minHeight: "2.5rem",
      "&:hover": { borderColor: "#9ca3af" },
    }),
    menu: (base) => ({ ...base, zIndex: 50 }),
  };

  const customFilterOption = (option, rawInput) => {
    const input = rawInput.toLowerCase().trim();
    if (!input) return true;
    const team = option.data;
    if (!team) return false;
    return team.name?.toLowerCase().includes(input) || team.description?.toLowerCase().includes(input);
  };

  const formatOptionLabel = (option) => {
    const teamData = option.data;
    return (
      <div className="py-2">
        <div className="font-medium text-gray-900">{option.label || "Unnamed Team"}</div>
        {teamData?.description && (
          <div className="text-sm text-gray-500 truncate">{teamData.description}</div>
        )}
        <div className="text-xs text-gray-400 mt-1">
          ID: {teamData ? teamData.team_id || teamData.id || "N/A" : "N/A"}
        </div>
      </div>
    );
  };

  const formatOptionLabelSimple = (option) => {
    if (!option.data) return <div className="py-2">{option.label}</div>;
    return formatOptionLabel(option);
  };

  const statusOptions = [
    { value: "all",      label: "All Teams"      },
    { value: "active",   label: "Active Teams"   },
    { value: "inactive", label: "Inactive Teams" },
  ];

  return (
    <div className="p-1">

      {/* ── Banner: shown only for superadmin when coming from CompanyCard ── */}
      {userType === "admin" && location.state?.companyName && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-blue-50
          border border-blue-200 rounded-xl text-[13px]">
          <span className="font-semibold text-blue-700">
            Showing teams for: {location.state.companyName}
          </span>
          <button
            onClick={() => {
              setSelectedTenantId(null);
              navigate("/superadmin/teams", { replace: true });
            }}
            className="ml-auto text-[11px] font-bold text-blue-500 hover:text-blue-700 underline"
          >
            Clear filter
          </button>
        </div>
      )}

      <ToolBar
        module="team"
        onAddClick={handleCreate}
        addButtonLabel="Create Team"
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="flex-1">
              <Select
                isSearchable isClearable
                placeholder="Search by team name or description..."
                onInputChange={handleSearchInputChange}
                value={
                  selectedTeamFromSearch
                    ? { value: selectedTeamFromSearch.team_id || selectedTeamFromSearch.id, label: selectedTeamFromSearch.name, data: selectedTeamFromSearch }
                    : searchTerm ? { value: searchTerm, label: searchTerm } : null
                }
                onChange={handleTeamSelect}
                styles={selectStyles}
                options={searchOptions}
                filterOption={customFilterOption}
                formatOptionLabel={formatOptionLabelSimple}
                noOptionsMessage={({ inputValue }) => inputValue ? "No teams found" : "Type to search teams"}
              />
            </div>

            {/* Tenant filter — superadmin only */}
            {userType === "admin" && tenantOptions.length > 0 && (
              <div className="w-full sm:w-48">
                <Select
                  options={tenantOptions}
                  value={tenantOptions.find((opt) => opt.value === (selectedTenantId || "")) || tenantOptions[0]}
                  onChange={handleTenantChange}
                  styles={selectStyles}
                  isSearchable
                  placeholder="Select tenant"
                />
              </div>
            )}

            <div className="w-full sm:w-48">
              <Select
                options={statusOptions}
                value={statusFilter || statusOptions[0]}
                onChange={(selected) => {
                  setStatusFilter(selected.value === "all" ? null : selected);
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
              module="employee" action="create"
              icon={UserPlus} title="Create Employee"
              className="bg-app-primary p-2"
              onClick={() => setIsEmployeeModalOpen(true)}
            />
            <ReusableButton
              module="team" action="read"
              icon={Clock} title="History"
              className="bg-app-primary p-2"
              onClick={() => setIsAuditModalOpen(true)}
            />
            <ReusableButton
              module="employee" action="create"
              buttonName="Bulk Upload" icon={Plus}
              title="Bulk Upload Employees"
              onClick={() => setShowBulkUpload(true)}
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
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading teams...</p>
          </div>
        ) : userType === "admin" && !selectedTenantId ? (
          // Superadmin with no tenant selected — prompt them to pick one
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Select a tenant</h3>
            <p className="text-gray-400 text-sm">
              Choose a tenant from the dropdown above to view their teams
            </p>
          </div>
        ) : paginatedTeams.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
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
                    {["Team Name", "Description", "Status", "Active", "Inactive", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTeams.map((team) => (
                    <tr key={team.team_id || team.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Users size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{team.name}</div>
                            <div className="text-xs text-gray-500">ID: {team.team_id || team.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <div className="line-clamp-2">
                          {team.description || <span className="text-gray-400 italic">No description</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{renderStatusToggle(team)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {team.active_employee_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {team.inactive_employee_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <ReusableButton module="team" action="read" icon={UserCheck} title="View Employees"
                            onClick={() => handleViewEmployees(team)}
                            className="text-gray-600 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-all" />
                          <ReusableButton module="team" action="read" icon={Eye} title="View Team"
                            onClick={() => handleView(team)}
                            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all" />
                          <ReusableButton module="team" action="delete" icon={Trash} title="Delete Team"
                            onClick={() => handleDelete(team.team_id || team.id)}
                            className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{startItem}–{endItem}</span>{" "}
                  of <span className="font-semibold">{totalItems}</span> teams
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === 1 ? "text-gray-400 cursor-not-allowed bg-gray-100" : "text-gray-700 hover:bg-white hover:shadow-sm border border-gray-200"
                    }`}>
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let p = totalPages <= 5 ? i + 1
                        : currentPage <= 3 ? i + 1
                        : currentPage >= totalPages - 2 ? totalPages - 4 + i
                        : currentPage - 2 + i;
                      return (
                        <button key={p} onClick={() => setCurrentPage(p)}
                          className={`w-8 h-8 rounded text-sm font-medium transition-all ${
                            currentPage === p ? "bg-blue-600 text-white shadow-sm" : "text-gray-700 hover:bg-white hover:shadow-sm border border-gray-200"
                          }`}>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === totalPages ? "text-gray-400 cursor-not-allowed bg-gray-100" : "text-gray-700 hover:bg-white hover:shadow-sm border border-gray-200"
                    }`}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
        selectedTenant={userType === "admin" ? selectedTenantId : getTenantFromLocalStorage()}
      />

      <TeamEmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        mode="create"
        tenantId={currentTenantId}  
        onSuccess={() => {
          setIsEmployeeModalOpen(false);
          dispatch(fetchTeamsThunk({
            skip: (currentPage - 1) * itemsPerPage,
            limit: itemsPerPage,
            ...(currentTenantId ? { tenant_id: currentTenantId } : {}),
          }));
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