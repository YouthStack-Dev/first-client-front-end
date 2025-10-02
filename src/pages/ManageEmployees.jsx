import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { API_CLIENT } from '../Api/API_Client';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { Plus } from 'lucide-react';
import SearchInput from '../components/ui/SearchInput';
import { logDebug } from '../utils/logger';
import ToolBar from '../components/ui/ToolBar';
import { setDepartmentEmployees, updateEmployeeStatus } from '../redux/features/user/userSlice';
import EmployeeList from '../components/departments/EmployeeList';
import endpoint from '../Api/Endpoints';
import Modal from '../components/modals/Modal';
import AuditLogModal from '../components/departments/AuditLogModal';

const ManageEmployees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();

  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isAuditLogLoading, setIsAuditLogLoading] = useState(false);

  const navigate = useNavigate();
  const { depId } = useParams();
  const dispatch = useDispatch();

  const isActive = searchParams.get("active");
  const targetIsActive = isActive === 'true';

  // Get department cache and employees from Redux store
  const departmentCache = useSelector((state) => state.user.departmentEmployees[depId]);
  
  // Get employees based on active status
  const allEmployees = useSelector((state) => {
    if (!departmentCache) return [];
    
    const employeeIds = targetIsActive ? 
      (departmentCache.active || []) : 
      (departmentCache.inactive || []);
    
    return employeeIds.map((id) => state.user.employees.byId[id]).filter(Boolean);
  });

  // Check if we need to refetch - only if we don't have cached data for this department + active status
  const shouldRefetch = useMemo(() => {
    if (!departmentCache) return true;
    
    const cachedIds = targetIsActive ? 
      (departmentCache.active || []) : 
      (departmentCache.inactive || []);
    
    return cachedIds.length === 0;
  }, [departmentCache, targetIsActive]);

  useEffect(() => {
    if (shouldRefetch) {
      fetchEmployeesByDepartment();
    } else {
      setLoading(false);
      logDebug(`Using cached ${targetIsActive ? 'active' : 'inactive'} employees for department ${depId}`);
    }
  }, [depId, targetIsActive, shouldRefetch]);

  const fetchEmployeesByDepartment = async () => {
    try {
      const query = new URLSearchParams({
        skip: 0,
        limit: 100,
        team_id: depId,
        is_active: targetIsActive
      }).toString();
      
      setLoading(true);
      const response = await API_CLIENT.get(`${endpoint.getEmployesByDepartment}?${query}`);
      
      const employees = response.data.data.items;
      
      logDebug(`Fetched ${employees.length} ${targetIsActive ? 'active' : 'inactive'} employees for department:`, depId);

      dispatch(setDepartmentEmployees({ 
        departmentId: depId, 
        employees,
        isActive: targetIsActive 
      }));
      
      toast.success(`${targetIsActive ? 'Active' : 'Inactive'} employees loaded successfully`);
    } catch (err) {
      logDebug("Error fetching employees by department", err);
      setError(err.response?.data?.detail || 'Something went wrong');
      toast.error(err.response?.data?.detail || 'Failed to load employees');
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
    if (e.target.type === 'checkbox') return;
    navigate(`/employees/${employee.employee_code}/view`);
  };

  const handleAddClick = () => {
    navigate(`/employee/create-employee`);
  };

  const handleView = (employee) => {
    navigate(`/department/${employee.departmentId}/employees/${employee.userId}/view`, {
      state: { employee, fromChild: true },
    });
  };

  const handleEdit = (employee) => {
    navigate(`/department/${employee.departmentId}/employees/${employee.userId}/edit`, {
      state: { employee },
    });
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  

  // Filter employees based on search term (active status is already handled by cache)
  const filteredEmployees = useMemo(() => {
    if (!allEmployees || allEmployees.length === 0) return [];

    let result = allEmployees;
    
    // Filter by search term only (active status is already handled by cache)
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(employee => {
        const nameMatch = employee.name?.toLowerCase().includes(query);
        const mobileMatch = employee.phone?.toString().includes(query);
        const emailMatch = employee.email?.toLowerCase().includes(query);
        const employeeCodeMatch = employee.employee_code?.toLowerCase().includes(query);
        return nameMatch || mobileMatch || emailMatch || employeeCodeMatch;
      });
    }
    
    return result;
  }, [allEmployees, searchTerm]);

  const handleStatusChange = async (employeeId, newIsActive) => {
    try {
      await API_CLIENT.patch(`api/users/status-update/${employeeId}`, null, { 
        params: { isActive: newIsActive } 
      });
      dispatch(updateEmployeeStatus({ employeeId, isActive: newIsActive }));
      toast.success(`Employee ${newIsActive ? "activated" : "deactivated"} successfully`);
      
      // No need to refetch - Redux cache is automatically updated
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
      throw error;
    }
  };

  const handleEmployeeLog = async (employee) => {
    setIsAuditLogLoading(true);
    setIsAuditLogModalOpen(true);

    try {
      // TODO: Replace with actual API call
      // await API_CLIENT.get(`/api/users/${employee.userId}/logs`);
      const dummyLogs = [
        {
          id: 1,
          action: "UPDATE",
          action_description: "Changed phone number",
          changes: ["phone: 9876543210 → 9123456780"],
          changed_by: "Admin",
          changed_at: new Date().toISOString(),
        },
        {
          id: 2,
          action: "CREATE",
          action_description: "Employee account created",
          changes: ["name: John Doe", "email: john@example.com"],
          changed_by: "System",
          changed_at: new Date().toISOString(),
        },
      ];
      setAuditLogs(dummyLogs);
    } catch (err) {
      toast.error("Failed to load employee logs");
    } finally {
      setIsAuditLogLoading(false);
    }
  };

  return (
    <div>
      <ToolBar
        title={`${targetIsActive ? 'Active' : 'Inactive'} Employees in Department ${depId}`}
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
        onHistory={handleEmployeeLog} 
      />

      <Modal
        isOpen={isAuditLogModalOpen}
        onClose={() => setIsAuditLogModalOpen(false)}
        title="Employee Audit History"
        size="lg"
      >
        <AuditLogModal logs={auditLogs} isLoading={isAuditLogLoading} />
      </Modal>
    </div>
  );
};

export default ManageEmployees;