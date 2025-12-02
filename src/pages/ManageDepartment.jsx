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
import Modal from "@components/modals/Modal";
import { toast } from "react-toastify";
import ReusableButton from "../components/ui/ReusableButton";
import endpoint from "../Api/Endpoints";
import AuditLogsModal from "../components/modals/AuditLogsModal";
import { DummyauditLogs } from "../staticData/StaticReport";
import SelectField from "../components/ui/SelectField";
import {
  selectCompaniesFetched,
  selectCompaniesFromRedux,
} from "../redux/features/company/companyslice";
import { fetchCompaniesThunk } from "../redux/features/company/companyThunks";

const ManageDepartment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showAuditModal, setShowAuditModal] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");

  // Modal states
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);

  // Audit log state
  const [auditLogs, setAuditLogs] = useState(DummyauditLogs);
  const [isAuditLogLoading, setIsAuditLogLoading] = useState(false);

  // Pull teams from Redux slice
  const teamsById = useSelector((state) => state.user.teams.byId);
  const teamIds = useSelector((state) => state.user.teams.allIds);

  // Fixed teams mapping
  const teams = teamIds?.map((id) => teamsById[id]) || [];

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);

  // Get companies data from Redux
  const companies = useSelector(selectCompaniesFromRedux);
  const companiesFetched = useSelector(selectCompaniesFetched);

  // Generate company options from fetched data
  const companyOptions = React.useMemo(() => {
    const options = [{ value: "", label: "All Companies" }];

    if (companies && companies.length > 0) {
      companies.forEach((company) => {
        options.push({
          value: company.tenant_id || company.id || company.company_id,
          label:
            company.name ||
            company.company_name ||
            `Company ${company.tenant_id}`,
        });
      });
    }

    logDebug("Generated company options:", options);
    return options;
  }, [companies]);

  // Debounce search term
  useEffect(() => {
    if (!companiesFetched) {
      dispatch(fetchCompaniesThunk());
    }
  }, [dispatch, companiesFetched]);

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

  // Handle company selection change - ONLY fetch when company is selected
  const handleCompanyChange = async (companyId) => {
    setSelectedCompany(companyId);
    setCurrentPage(1);
    setSearchTerm("");
    setDebouncedSearchTerm("");

    // Only make API call if a company is selected (not empty/"All Companies")
    if (companyId && companyId !== "") {
      await fetchDepartmentsByCompany(companyId);
    } else {
      // If "All Companies" is selected, clear the departments
      dispatch(setTeams([]));
      setTotalItems(0);
    }
  };

  // Handle add button click
  const handleAddClick = () => {
    setEditingTeam(null);
    setIsDepartmentModalOpen(true);
  };

  // Fetch departments for specific company
  const fetchDepartmentsByCompany = async (companyId, page = 1, limit = 10) => {
    if (!companyId) return;

    setIsLoading(true);
    try {
      const params = {
        skip: (page - 1) * limit,
        limit,
        tenant_id: companyId, // Always include tenant_id when company is selected
      };

      logDebug("Fetching departments by company with params:", params);
      const { data } = await API_CLIENT.get(endpoint.getDepartments, {
        params,
      });
      logDebug("Fetched departments by company response:", data);

      // Handle different response structures
      const departmentsData = data?.data || data;

      let processedData;
      if (departmentsData?.items) {
        processedData = {
          items: departmentsData.items,
          totalCount:
            departmentsData.totalCount ||
            departmentsData.total ||
            departmentsData.items.length,
        };
      } else if (Array.isArray(departmentsData)) {
        processedData = {
          items: departmentsData,
          totalCount: departmentsData.length,
        };
      } else {
        processedData = {
          items: [],
          totalCount: 0,
        };
      }

      dispatch(setTeams(processedData.items));
      setTotalItems(processedData.totalCount);

      // Show toast if no results
      if (processedData.items.length === 0) {
        const selectedCompanyName =
          companyOptions.find((opt) => opt.value === companyId)?.label ||
          "Selected company";
        toast.info(`No departments found for ${selectedCompanyName}`);
      }
    } catch (error) {
      logError("Error fetching departments by company:", error);
      toast.error("Failed to fetch departments");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch departments with search (only when search term is used)
  const fetchDepartmentsWithSearch = async (
    page = 1,
    limit = 10,
    search = ""
  ) => {
    setIsLoading(true);
    try {
      const params = {
        skip: (page - 1) * limit,
        limit,
      };

      // Add search parameter if provided
      if (search && search.length > 0) {
        params.name = search;
      }

      // Add company filter if a company is selected
      if (selectedCompany && selectedCompany !== "") {
        params.tenant_id = selectedCompany;
      }

      logDebug("Fetching departments with search params:", params);
      const { data } = await API_CLIENT.get(endpoint.getDepartments, {
        params,
      });

      // Handle response (same as before)
      const departmentsData = data?.data || data;
      let processedData;

      if (departmentsData?.items) {
        processedData = {
          items: departmentsData.items,
          totalCount:
            departmentsData.totalCount ||
            departmentsData.total ||
            departmentsData.items.length,
        };
      } else if (Array.isArray(departmentsData)) {
        processedData = {
          items: departmentsData,
          totalCount: departmentsData.length,
        };
      } else {
        processedData = {
          items: [],
          totalCount: 0,
        };
      }

      dispatch(setTeams(processedData.items));
      setTotalItems(processedData.totalCount);

      if (search && processedData.items.length === 0) {
        toast.info("Nothing found on search");
      }
    } catch (error) {
      logError("Error fetching departments with search:", error);
      toast.error("Failed to fetch departments");
    } finally {
      setIsLoading(false);
    }
  };

  // Load teams only when search term changes (not on initial load)
  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length > 0) {
      fetchDepartmentsWithSearch(
        currentPage,
        itemsPerPage,
        debouncedSearchTerm
      );
    }
  }, [debouncedSearchTerm, currentPage]);

  // Reset to first page when search term changes
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
    setShowAuditModal(true);
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
    const teamToEdit = {
      ...team,
      department_id: team.id,
      name: team.name,
    };
    setEditingTeam(teamToEdit);
    setIsDepartmentModalOpen(true);
  };

  const handleDelete = async (teamId) => {
    alert("Delete functionality is currently disabled.");
  };

  const handleViewEmployees = (
    departmentId,
    isActive,
    depname,
    memberCount
  ) => {
    navigate(
      `/department/${departmentId}/employees?active=${isActive}&tenantId=${selectedCompany}`,
      {
        state: { isActive, depname, departmentId, memberCount },
      }
    );
  };

  const handleFormSuccess = () => {
    setEditingTeam(null);
    setIsDepartmentModalOpen(false);
    // Refresh the list after successful form submission
    if (selectedCompany && selectedCompany !== "") {
      fetchDepartmentsByCompany(selectedCompany, currentPage, itemsPerPage);
    }
  };

  const handleDepartmentSpecificLog = (departmentId) => {
    logDebug("Department specific log function invoked for:", departmentId);
  };

  // Determine which departments to display
  const displayDepartments =
    debouncedSearchTerm && filteredTeams.length > 0 ? filteredTeams : teams;

  return (
    <div>
      <ToolBar
        onAddClick={handleAddClick}
        module="team"
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
            <SelectField
              className="p-2"
              label="Company"
              value={selectedCompany}
              onChange={handleCompanyChange}
              options={companyOptions}
              disabled={!companiesFetched || companyOptions.length === 1}
            />
            <ReusableButton
              module="team"
              action="delete"
              buttonName={"History"}
              icon={History}
              title="View Audit History"
              onClick={handleHistoryClick}
              className="text-white bg-blue-600 p-1 rounded-md"
            />

            <ReusableButton
              module="employee"
              action="create"
              buttonName="Employee"
              icon={UserPlus}
              title="Create Employee"
              onClick={() => navigate("/employees/create")}
              className="flex items-center gap-2 p-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            />
          </div>
        }
      />

      {/* Show message when no company is selected */}
      {!selectedCompany && (
        <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 text-center">
            Please select a company to view departments
          </p>
        </div>
      )}

      {/* Department List Component - Only show when company is selected */}
      {selectedCompany && (
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
          selectedCompany={selectedCompany}
        />
      )}

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
          companyOptions={companyOptions}
          selectedCompany={selectedCompany}
        />
      </Modal>

      <AuditLogsModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        moduleName="Team"
        showUserColumn={true}
        apimodule="team"
        selectedCompany={selectedCompany}
      />
    </div>
  );
};

export default ManageDepartment;
