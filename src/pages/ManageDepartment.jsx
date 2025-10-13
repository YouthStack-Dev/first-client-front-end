import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, UsersRound, History, Trash } from "lucide-react";
import DepartmentForm from "@components/departments/DepartmentForm";
import DepartmentList from "@components/departments/DepartmentList";
import { useDispatch, useSelector } from "react-redux";
import { API_CLIENT } from "../Api/API_Client";
import { setTeams, removeTeam } from "../redux/features/user/userSlice";
import { logDebug, logError } from "../utils/logger";
import ToolBar from "@components/ui/ToolBar";
import SearchInput from "@components/ui/SearchInput";
import AuditLogModal from "@components/departments/AuditLogModal";
import Modal from "@components/modals/Modal";
import { toast } from "react-toastify";
import ReusableButton from "../components/ui/ReusableButton";
import endpoint from "../Api/Endpoints";

const ManageDepartment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Modal states
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);

  // Audit log state
  const [auditLogs, setAuditLogs] = useState([]);
  const [isAuditLogLoading, setIsAuditLogLoading] = useState(false);

  // Pull teams from Redux slice
  const teamsById = useSelector((state) => state.user.teams.byId);
  const teamIds = useSelector((state) => state.user.teams.allIds);

  // Fixed teams mapping
  const teams = teamIds?.map((id) => teamsById[id]) || [];

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Filter teams locally first
  const filteredTeams = teams.filter((team) =>
    team?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle add button click
  const handleAddClick = () => {
    setEditingTeam(null);
    setIsDepartmentModalOpen(true);
  };

  // Fetch departments with proper pagination
  const fetchDepartments = async (page = 1, limit = 10, search = "") => {
    try {
      const params = {
        skip: (page - 1) * limit,
        limit,
      };

      // Add search parameter if provided
      if (search && search.length > 0) {
        params.name = search;
      }

      logDebug("Fetching departments with params:", params);
      const { data } = await API_CLIENT.get(endpoint.getDepartments, {
        params,
      });
      logDebug("Fetched departments response:", data);

      // Handle different response structures
      const departmentsData = data?.data || data;

      if (departmentsData?.items) {
        // If response has items array and pagination info
        return {
          items: departmentsData.items,
          totalCount:
            departmentsData.totalCount ||
            departmentsData.total ||
            departmentsData.items.length,
          currentPage: page,
          totalPages: Math.ceil(
            (departmentsData.totalCount ||
              departmentsData.total ||
              departmentsData.items.length) / limit
          ),
        };
      } else if (Array.isArray(departmentsData)) {
        // If response is directly an array
        return {
          items: departmentsData,
          totalCount: departmentsData.length,
          currentPage: page,
          totalPages: Math.ceil(departmentsData.length / limit),
        };
      } else {
        // Fallback
        return {
          items: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
        };
      }
    } catch (error) {
      logError("Error fetching departments:", error);
      throw error;
    }
  };

  // Fetch teams with pagination - only when debounced search term changes or page changes
  useEffect(() => {
    const loadTeams = async () => {
      setIsLoading(true);
      try {
        // Only make backend request if:
        // 1. We have a search term AND local filtering returns no results, OR
        // 2. We're on a specific page with search term (for paginated search results)
        const shouldFetchFromBackend =
          debouncedSearchTerm &&
          debouncedSearchTerm.length > 3 &&
          (filteredTeams.length === 0 || currentPage > 1);

        if (shouldFetchFromBackend || !debouncedSearchTerm) {
          const data = await fetchDepartments(
            currentPage,
            itemsPerPage,
            debouncedSearchTerm
          );
          logDebug("Processed departments data:", data);

          dispatch(setTeams(data.items));
          setTotalItems(data.totalCount);

          // Show toast if no results from backend
          if (debouncedSearchTerm && data.items.length === 0) {
            toast.info("Nothing found on search");
          }
        } else {
          // When using local filtering, update total items count
          setTotalItems(filteredTeams.length);

          // Show toast if no results from local filtering
          if (debouncedSearchTerm && filteredTeams.length === 0) {
            toast.info("Nothing found on search");
          }
        }
      } catch (error) {
        logError("Error fetching teams:", error);
        toast.error("Failed to fetch departments");
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, [dispatch, currentPage, itemsPerPage, debouncedSearchTerm]);

  // Reset to first page when search term changes significantly
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Fetch audit logs when modal opens
  const fetchAuditLogs = async () => {
    setIsAuditLogLoading(true);
    try {
      const response = await API_CLIENT.get("/api/audit/departmentsLogs");
      setAuditLogs(response.data.data || response.data || []);
    } catch (error) {
      logError("Error fetching audit logs:", error);
      if (error.response?.status === 404) {
        setAuditLogs([]);
        toast.info("No audit logs found");
      } else {
        toast.error("Failed to fetch audit logs");
      }
    } finally {
      setIsAuditLogLoading(false);
    }
  };

  // Handle history button click
  const handleHistoryClick = async () => {
    setIsAuditLogModalOpen(true);
    await fetchAuditLogs();
  };

  // Handle department selection
  const handleSelectDepartment = (departmentId, isSelected) => {
    setSelectedDepartments((prev) =>
      isSelected
        ? [...prev, departmentId]
        : prev.filter((id) => id !== departmentId)
    );
  };

  const handleSelectAllDepartments = (e) => {
    if (e.target.checked) {
      setSelectedDepartments(teamIds);
    } else {
      setSelectedDepartments([]);
    }
  };

  const handleEdit = (team) => {
    // Transform team data back to the form's expected structure
    const teamToEdit = {
      ...team,
      department_id: team.id,
      name: team.name,
    };
    setEditingTeam(teamToEdit);
    setIsDepartmentModalOpen(true);
  };

  const handleDelete = async (teamId) => {
    if (window.confirm(`Are you sure you want to delete this department?`)) {
      try {
        await API_CLIENT.delete(`/departments/${teamId}`);
        dispatch(removeTeam({ teamId }));
        setSelectedDepartments((prev) => prev.filter((id) => id !== teamId));

        // Refresh the current page if we're left with no items after deletion
        if (teams.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        toast.success("Department deleted successfully");
      } catch (error) {
        console.error("Error deleting department:", error);
        toast.error("Failed to delete department");
      }
    }
  };

  const handleViewEmployees = (
    departmentId,
    isActive,
    depname,
    memberCount
  ) => {
    navigate(`/department/${departmentId}/employees?active=${isActive}`, {
      state: { isActive, depname, departmentId, memberCount },
    });
  };

  const handleFormSuccess = () => {
    setEditingTeam(null);
    setIsDepartmentModalOpen(false);
    // Refresh the list after successful form submission
    const loadTeams = async () => {
      const data = await fetchDepartments(
        currentPage,
        itemsPerPage,
        debouncedSearchTerm
      );
      dispatch(setTeams(data.items));
      setTotalItems(data.totalCount);
    };
    loadTeams();
  };

  const handleDepartmentSpecificLog = (departmentId) => {
    logDebug("Department specific log function invoked for:", departmentId);
    // Implement department-specific log functionality here
  };

  // Determine which departments to display
  const displayDepartments =
    debouncedSearchTerm && filteredTeams.length > 0 ? filteredTeams : teams;

  return (
    <div>
      <ToolBar
        onAddClick={handleAddClick}
        addButtonLabel="Department"
        addButtonIcon={<UsersRound size={16} />}
        className="p-4 bg-white border rounded shadow-sm mb-4"
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <SearchInput
              placeholder="Search departments..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-grow"
            />
          </div>
        }
        rightElements={
          <div className="flex items-center gap-3">
            <ReusableButton
              module="team"
              action="delete"
              buttonName={"History"}
              icon={History}
              title="View Audit History"
              onClick={handleHistoryClick}
              className="text-white bg-blue-600 p-2 rounded-md"
            />

            <ReusableButton
              module="employee"
              action="create"
              buttonName="Employee"
              icon={UserPlus}
              title="Create Employee"
              onClick={() => navigate("/employees/create")}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            />
          </div>
        }
      />

      {/* Department List Component */}
      <DepartmentList
        departments={displayDepartments}
        selectedDepartments={selectedDepartments}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSelectDepartment={handleSelectDepartment}
        onSelectAllDepartments={handleSelectAllDepartments}
        onEditDepartment={handleEdit}
        onDeleteDepartment={handleDelete}
        onViewEmployees={handleViewEmployees}
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onViewHistory={handleDepartmentSpecificLog}
      />

      {/* Department Form Modal */}
      <Modal
        isOpen={isDepartmentModalOpen}
        onClose={() => {
          setIsDepartmentModalOpen(false);
          setEditingTeam(null);
        }}
        title={editingTeam ? "Edit Department" : "Create Department"}
        size="md"
      >
        <DepartmentForm
          onClose={() => {
            setIsDepartmentModalOpen(false);
            setEditingTeam(null);
          }}
          onSuccess={handleFormSuccess}
          initialData={editingTeam}
        />
      </Modal>

      {/* Audit Log Modal */}
      <Modal
        isOpen={isAuditLogModalOpen}
        onClose={() => setIsAuditLogModalOpen(false)}
        title="Department Audit History"
        size="lg"
      >
        <AuditLogModal logs={auditLogs} isLoading={isAuditLogLoading} />
      </Modal>
    </div>
  );
};

export default ManageDepartment;
