import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Select from "react-select";
import {
  History,
  Eye,
  Calendar,
  BookOpen,
  ChevronDown,
  ChevronUp,
  User,
}from "lucide-react";
import ToolBar from "@components/ui/ToolBar";
import AuditLogsModal from "@components/modals/AuditLogsModal";
import ReusableButton from "@components/ui/ReusableButton";
import ReusableToggleButton from "@components/ui/ReusableToggleButton";
import TeamEmployeeModal from "./TeamEmployeeModal";
import WeekOffModal from "../modals/WeekOffModal";
import {
  selectEmployeesByTeamId,
  selectEmployeesLoading,
} from "../../redux/features/employees/employeesSelectors";
import { toggleEmployeeStatus } from "../../redux/features/employees/employeesThunk";
import { toast } from "react-toastify";
import { fetchEmployeesThunk } from "../../redux/features/employees/employeesThunk";



const TeamEmployeesManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [searchParams] = useSearchParams();

  // Redux state
  const loading = useSelector(selectEmployeesLoading);
  const employees = useSelector((state) =>
    selectEmployeesByTeamId(state, teamId)
  );

  // Local state
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [updatingEmployeeId, setUpdatingEmployeeId] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [modalEmployeeData, setModalEmployeeData] = useState(null);
  const [isWeekOffModalOpen, setIsWeekOffModalOpen] = useState(false);
  const [selectedEmployeeForWeekOff, setSelectedEmployeeForWeekOff] = useState(null);


  const isActive = searchParams.get("active");
  const tenantId = searchParams.get("tenantId");
  const targetIsActive = isActive === "true";

  useEffect(() => {
    if (teamId) {
      const queryParams = {
        team_id: teamId,
        tenant_id: tenantId,
        page: 1,
        limit: 50,
      };

      dispatch(fetchEmployeesThunk(queryParams))
        .unwrap()
        .catch((error) => {
          toast.error(error || "Failed to fetch employees");
        });
    }
  }, [dispatch, teamId, tenantId]);

  // Filter employees based on active status from URL params (if present)
  const baseEmployees = useMemo(() => {
    if (!employees || employees.length === 0) return [];

    // If URL has active param, filter by it; otherwise show all
    if (isActive !== null) {
      return employees.filter((emp) => emp.is_active === targetIsActive);
    }
    return employees;
  }, [employees, isActive, targetIsActive]);

  // Sort function
  const sortEmployees = (employees, config) => {
    if (!config.key || !employees) return employees || [];

    return [...employees].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];

      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // String comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        if (config.direction === "ascending") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }

      // Number comparison
      if (config.direction === "ascending") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

  // Handle sort request
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  // Sort employees
  const allEmployees = useMemo(() => {
    return sortEmployees(baseEmployees, sortConfig);
  }, [baseEmployees, sortConfig]);

  const handleCheckboxChange = (id) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((eId) => eId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployeeIds.length === allEmployees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(allEmployees.map((emp) => emp.employee_id));
    }
  };

  const handleAddClick = () => {
    setModalMode("create");
    setModalEmployeeData(null);
    setIsModalOpen(true);
  };

  const handleView = (employee) => {
    setModalMode("view");
    setModalEmployeeData(employee);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (formData) => {
    setIsModalOpen(false);
  };

  const handleWeekOffOpen = (employee) => {
    setSelectedEmployeeForWeekOff(employee);
    setIsWeekOffModalOpen(true);
  };

  const handleWeekOffUpdate = async (updateData) => {
    setIsWeekOffModalOpen(false);
    toast.success("Week off updated successfully");
    // Optionally refresh employees if needed
    if (teamId) {
      const queryParams = {
        team_id: teamId,
        tenant_id: tenantId,
        page: 1,
        limit: 50,
      };
      dispatch(fetchEmployeesThunk(queryParams));
    }
  };

  const handleBook = (employee) => {
    console.log("Book employee:", employee);
    navigate(`/companies/booking?employeeId=${employee.employee_id}&teamId=${teamId}`);
  };

  // Handle search input change from Select component
  const handleSearchInputChange = (inputValue) => {
    setSearchTerm(inputValue || "");
  };

  // Filter employees based on search term and status filter
  const filteredEmployees = useMemo(() => {
    if (!allEmployees || allEmployees.length === 0) return [];

    let result = allEmployees;

    // Apply search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter((employee) => {
        const nameMatch = employee.name?.toLowerCase().includes(query);
        const mobileMatch = employee.phone?.toString().includes(query);
        const emailMatch = employee.email?.toLowerCase().includes(query);
        const codeMatch = employee.employee_code?.toLowerCase().includes(query);
        return nameMatch || mobileMatch || emailMatch || codeMatch;
      });
    }

    // Apply status filter
    if (statusFilter && statusFilter.value) {
      if (statusFilter.value === "active") {
        result = result.filter((employee) => employee.is_active === true);
      } else if (statusFilter.value === "inactive") {
        result = result.filter((employee) => employee.is_active === false);
      }
    }

    return result;
  }, [allEmployees, searchTerm, statusFilter]);

  // TeamEmployeesManagement.js - handleStatusToggle function
  const handleStatusToggle = async (employeeId, currentStatus) => {
    try {
      setUpdatingEmployeeId(employeeId);

      // Call the async thunk
      await dispatch(
        toggleEmployeeStatus({
          employeeId,
          isActive: !currentStatus,
        })
      ).unwrap();

      // No need for separate toast - the state is updated automatically
      // through the extraReducer when the thunk is fulfilled
    } catch (error) {
      // Error handling
      toast.error(error || "Failed to update employee status");

      // The state won't be updated because the thunk was rejected
      // So the toggle button will revert to its original state
    } finally {
      setUpdatingEmployeeId(null);
    }
  };

  const handleHistoryClick = () => {
    setShowAuditModal(true);
    setAuditLogs([
      {
        id: 1,
        action: "CREATE",
        module: "employee",
        description: "Employees were fetched",
        timestamp: new Date().toISOString(),
        user_name: "System",
        old_values: null,
        new_values: null,
      },
    ]);
  };


  const handleEmployeeSpecificHistory = async (employeeId) => {
    setShowAuditModal(true);
    const employee = employees.find((emp) => emp.employee_id === employeeId);
    setSelectedEmployee(employee?.name || "Unknown Employee");

    setAuditLogs([
      {
        id: 1,
        action: "VIEW",
        module: "employee",
        description: `Employee ${employee?.name || "Unknown"} details viewed`,
        timestamp: new Date().toISOString(),
        user_name: "System",
        old_values: null,
        new_values: null,
      },
    ]);
  };

  // Status filter options for react-select
  const statusFilterOptions = [
    { value: "all", label: "All Employees" },
    { value: "active", label: "Active Employees" },
    { value: "inactive", label: "Inactive Employees" },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <ToolBar
        module="employee"
        onAddClick={handleAddClick}
        addButtonLabel="Add employee"
        className="p-4 bg-white border-b rounded-t-lg shadow-sm"
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* Search Select */}
            <div className="flex-1">
              <Select
                isSearchable={true}
                isClearable={true}
                placeholder="Search by name, mobile, email, or code..."
                onInputChange={handleSearchInputChange}
                styles={selectStyles}
                value={
                  searchTerm ? { value: searchTerm, label: searchTerm } : null
                }
                onChange={() => {
                  // Clear search when selection is cleared
                  setSearchTerm("");
                }}
                options={[]}
                menuIsOpen={false}
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Select
                options={statusFilterOptions}
                value={
                  statusFilter ||
                  statusFilterOptions.find((opt) => opt.value === "all")
                }
                onChange={(selected) => {
                  if (selected.value === "all") {
                    setStatusFilter(null);
                  } else {
                    setStatusFilter(selected);
                  }
                }}
                styles={selectStyles}
                isSearchable={false}
                placeholder="Filter by status"
              />
            </div>
          </div>
        }
        rightElements={
          <div className="flex items-center gap-3">
            <ReusableButton
              module="team"
              action="read"
              buttonName={"History"}
              icon={History}
              title="View Audit History"
              onClick={handleHistoryClick}
              className="text-white bg-blue-600 p-2 rounded-md"
            />
          </div>
        }
      />

    

      {/* Employee Table */}
      <div className="bg-white rounded-b-lg shadow-sm border border-t-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No employees found</p>
            {searchTerm && (
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={
                        selectedEmployeeIds.length ===
                          filteredEmployees.length &&
                        filteredEmployees.length > 0
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {getSortIcon("name")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("employee_code")}
                  >
                    <div className="flex items-center gap-1">
                      Employee Code
                      {getSortIcon("employee_code")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("email")}
                  >
                    <div className="flex items-center gap-1">
                      Email
                      {getSortIcon("email")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("phone")}
                  >
                    <div className="flex items-center gap-1">
                      Mobile Number
                      {getSortIcon("phone")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("gender")}
                  >
                    <div className="flex items-center gap-1">
                      Gender
                      {getSortIcon("gender")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("is_active")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {getSortIcon("is_active")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.employee_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(
                          employee.employee_id
                        )}
                        onChange={() =>
                          handleCheckboxChange(employee.employee_id)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {employee.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={employee.avatar}
                              alt=""
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold">
                              {employee.name?.charAt(0) || "E"}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.position || employee.role_name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {employee.employee_code || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.phone || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {employee.gender || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ReusableToggleButton
                          module="employee"
                          action="update"
                          isChecked={employee.is_active ?? true}
                          onToggle={() =>
                            handleStatusToggle(
                              employee.employee_id,
                              employee.is_active
                            )
                          }
                          labels={{ on: "Active", off: "Inactive" }}
                          size="small"
                          className="scale-90"
                          disabled={updatingEmployeeId === employee.employee_id}
                        />
                        {updatingEmployeeId === employee.employee_id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <ReusableButton
                          module="employee"
                          action="read"
                          icon={Eye}
                          title="View Employee"
                          onClick={() => handleView(employee)}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                          iconSize={16}
                        />
                        <ReusableButton
                          module="employee"
                          action="update"
                          icon={Calendar}
                          title="Week Off"
                          onClick={() => handleWeekOffOpen(employee)}
                          className="text-gray-600 hover:text-green-600 transition-colors"
                          iconSize={16}
                        />
                        <ReusableButton
                          module="employee"
                          action="create"
                          icon={BookOpen}
                          title="Book"
                          onClick={() => handleBook(employee)}
                          className="text-gray-600 hover:text-purple-600 transition-colors"
                          iconSize={16}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AuditLogsModal
        isOpen={showAuditModal}
        onClose={() => {
          setShowAuditModal(false);
          setSelectedEmployee(null);
        }}
        apimodule="employee"
        moduleName={`${selectedEmployee ? selectedEmployee : "Employee"} `}
        auditData={auditLogs}
        showUserColumn={true}
        selectedCompany={tenantId}
      />

      <TeamEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        employeeData={modalEmployeeData}
      />

      <WeekOffModal
        show={isWeekOffModalOpen}
        employee={selectedEmployeeForWeekOff}
        onUpdate={handleWeekOffUpdate}
        onClose={() => setIsWeekOffModalOpen(false)}
      />
    </div>
  );
};

export default TeamEmployeesManagement;
