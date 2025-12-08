import React, { useState, useEffect, useMemo } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { API_CLIENT } from "../Api/API_Client";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { History, Plus } from "lucide-react";
import SearchInput from "@components/ui/SearchInput";
import { logDebug } from "../utils/logger";
import ToolBar from "@components/ui/ToolBar";
import {
  moveEmployeeToActive,
  moveEmployeeToInactive,
  setDepartmentEmployees,
  updateEmployeeStatus,
} from "../redux/features/user/userSlice";
import EmployeeList from "@components/departments/EmployeeList";
import endpoint from "../Api/Endpoints";
import AuditLogsModal from "../components/modals/AuditLogsModal";
import ReusableButton from "../components/ui/ReusableButton";

const ManageEmployees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams] = useSearchParams();
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const location = useLocation();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // Get department info from location state with safe fallback
  const { depname, memberCount } = location.state || {};

  const navigate = useNavigate();
  const { depId } = useParams();
  const dispatch = useDispatch();

  const isActive = searchParams.get("active");
  const tenantId = searchParams.get("tenantId");
  const targetIsActive = isActive === "true";

  // Get department cache and employees from Redux store
  const departmentCache = useSelector(
    (state) => state.user.departmentEmployees[depId]
  );

  // Get employees based on active status
  const allEmployees = useSelector((state) => {
    if (!departmentCache) return [];

    const employeeIds = targetIsActive
      ? departmentCache.active || []
      : departmentCache.inactive || [];

    return employeeIds
      .map((id) => state.user.employees.byId[id])
      .filter(Boolean);
  });

  // Check if we need to refetch based on cache existence and count mismatch
  const shouldRefetch = useMemo(() => {
    // If no cache at all, definitely refetch
    if (!departmentCache) return true;

    // If we have memberCount from props, validate against cached data
    if (memberCount !== undefined && memberCount !== null) {
      const cachedEmployeeCount = targetIsActive
        ? departmentCache.active?.length || 0
        : departmentCache.inactive?.length || 0;

      const needsRefetch = cachedEmployeeCount !== memberCount;

      if (needsRefetch) {
        logDebug(
          `Count mismatch: cached ${cachedEmployeeCount} vs expected ${memberCount}, refetching`
        );
      }

      return needsRefetch;
    }

    // If no memberCount provided, rely on cache existence only
    return false;
  }, [departmentCache, memberCount, targetIsActive]);

  useEffect(() => {
    if (shouldRefetch) {
      fetchEmployeesByDepartment();
    } else {
      setLoading(false);
      logDebug(
        `Using cached ${
          targetIsActive ? "active" : "inactive"
        } employees for department ${depId}`
      );
    }
  }, [depId, targetIsActive, shouldRefetch]);

  const fetchEmployeesByDepartment = async () => {
    try {
      const query = new URLSearchParams({
        skip: 0,
        limit: 100,
        team_id: depId,
        is_active: targetIsActive,
      }).toString();

      setLoading(true);
      const response = await API_CLIENT.get(
        `${endpoint.getEmployesByDepartment}?${query}`
      );

      const employees = response.data.data.items;

      logDebug(
        `Fetched ${employees.length} ${
          targetIsActive ? "active" : "inactive"
        } employees for department:`,
        depId
      );

      dispatch(
        setDepartmentEmployees({
          departmentId: depId,
          employees,
          isActive: targetIsActive,
        })
      );

      toast.success(
        `${
          targetIsActive ? "Active" : "Inactive"
        } employees loaded successfully`
      );
    } catch (err) {
      logDebug("Error fetching employees by department", err);
      setError(err.response?.data?.detail || "Something went wrong");
      toast.error(err.response?.data?.detail || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((eId) => eId !== id) : [...prev, id]
    );
  };

  const handleRowClick = (employee, e) => {
    if (e.target.type === "checkbox") return;
    navigate(
      `/companies/department/${employee.team_id}/employees/${employee.employee_id}/view`,
      {
        state: { employee, fromChild: true },
      }
    );
  };

  const handleAddClick = () => {
    navigate(`/companies/employee/create-employee`);
  };

  const handleView = (employee) => {
    navigate(
      `/companies/department/${employee.team_id}/employees/${employee.employee_id}/view`,
      {
        state: { employee, fromChild: true },
      }
    );
  };

  const handleEdit = (employee) => {
    navigate(
      `/companies/department/${employee.team_id}/employees/${employee.employee_id}/edit`,
      {
        state: { employee },
      }
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!allEmployees || allEmployees.length === 0) return [];

    let result = allEmployees;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter((employee) => {
        const nameMatch = employee.name?.toLowerCase().includes(query);
        const mobileMatch = employee.phone?.toString().includes(query);
        const emailMatch = employee.email?.toLowerCase().includes(query);
        return nameMatch || mobileMatch || emailMatch;
      });
    }

    return result;
  }, [allEmployees, searchTerm]);

  const handleStatusChange = async (employeeId, newIsActive) => {
    try {
      // Get the current employee from the store to preserve all data
      const currentEmployee = allEmployees.find(
        (emp) => emp.employee_id === employeeId
      );

      if (!currentEmployee) {
        toast.error("Employee not found");
        return;
      }

      // First make the API call
      await API_CLIENT.patch(
        `${endpoint.toggleEmployeStatus}${employeeId}/toggle-status`,
        null,
        {
          params: { isActive: newIsActive },
        }
      );

      // Only update Redux store on successful API response
      const updatedEmployee = {
        ...currentEmployee,
        is_active: newIsActive,
      };

      // Dispatch the appropriate movement action
      if (newIsActive) {
        // Moving from inactive to active
        dispatch(moveEmployeeToActive({ departmentId: depId }));
      } else {
        // Moving from active to inactive
        dispatch(moveEmployeeToInactive({ departmentId: depId }));
      }

      // Update employee status in store
      dispatch(
        updateEmployeeStatus({
          employeeId,
          isActive: newIsActive,
          departmentId: depId,
          employeeData: updatedEmployee,
        })
      );

      // Remove from current selection since employee will move to different list
      setSelectedEmployeeIds((prev) => prev.filter((id) => id !== employeeId));
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleHistoryClick = async () => {
    // setIsAuditLogModalOpen(true);
    setShowAuditModal(true);
  };

  const handleEmployeeSpecificHistory = async (employeeId) => {
    setShowAuditModal(true);
    logDebug("Fetching audit logs for employee ID:", employeeId);
    setSelectedEmployee(employeeId?.name || "NAN");
  };

  return (
    <div>
      <ToolBar
        onAddClick={handleAddClick}
        addButtonLabel="Add employee"
        addButtonIcon={<Plus size={16} />}
        className="p-4 bg-white border rounded shadow-sm"
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <SearchInput
              placeholder="Search by name, mobile, email, or code..."
              value={searchTerm}
              onChange={handleSearch}
              className="flex-grow"
            />
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

      <EmployeeList
        onStatusChange={handleStatusChange}
        employees={filteredEmployees}
        loading={loading}
        error={error}
        selectedEmployeeIds={selectedEmployeeIds}
        onCheckboxChange={handleCheckboxChange}
        onRowClick={handleRowClick}
        onView={handleView}
        onEdit={handleEdit}
        onHistory={handleEmployeeSpecificHistory}
      />

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
    </div>
  );
};

export default ManageEmployees;
