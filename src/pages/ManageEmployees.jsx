import React, { useState, useEffect, useMemo } from 'react';
import EmployeeList from "../components/teams/EmployeeList";
import { useNavigate } from 'react-router-dom';
import { API_CLIENT } from '../Api/API_Client';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { setAllEmployees } from '../redux/features/user/userSlice';
import { Plus, Filter } from 'lucide-react';
import SearchInput from '../components/ui/SearchInput';
import { logDebug } from '../utils/logger';
import ToolBar from '../components/ui/ToolBar';
import Pagination from '../components/Pagination';
import Select from '../components/ui/Select';
import ActiveFilterToggle from '../components/ui/ActiveFilterToggle';

const ManageEmployees = () => {
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [viewActive, setViewActive] = useState(true); // Default to active view
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const allEmployees = useSelector(state => state.user.employees.allIds.map(id => state.user.employees.byId[id]));
  const allDepartments = useSelector(state => state.user.teams.allIds.map(id => state.user.teams.byId[id]));

  useEffect(() => {
    // Fetch departments if not already loaded
    if (allDepartments.length === 0) {
      fetchAllDepartments();
    }

    fetchAllEmployees();
  }, [currentPage, itemsPerPage]);

  const fetchAllDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const response = await API_CLIENT.get('/departments');
      dispatch(setAllDepartments(response.data));
    } catch (err) {
      console.error('Error fetching departments:', err);
      toast.error('Failed to load departments');
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      setLoading(true);
      const response = await API_CLIENT.get(`/employees/tenant?page=${currentPage}&limit=${itemsPerPage}`);
      const { employees, total_employees, message } = response.data;

      dispatch(setAllEmployees({ employees, page: currentPage }));
      setTotalEmployees(total_employees);

      toast.success(message || 'Employees loaded successfully');
    } catch (err) {
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
    navigate(`/employees/${employee.employee_code}/view`, {
      state: { employee, fromChild: true },
    });
  };

  const handleEdit = (employee) => {
    navigate(`/employees/${employee.employee_code}/edit`, {
      state: { employee },
    });
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
  };

  const handleDepartmentFilterChange = (value) => {
    setDepartmentFilter(value);
  };

  // Count active and inactive employees
  const activeEmployeesCount = useMemo(() => 
    allEmployees.filter(employee => employee.is_active).length, 
    [allEmployees]
  );
  
  const inactiveEmployeesCount = useMemo(() => 
    allEmployees.filter(employee => !employee.is_active).length, 
    [allEmployees]
  );

  // Prepare department options for the Select component
  const departmentOptions = [
    { id: 'all', name: 'All Departments' },
    ...allDepartments
  ];

  // Filter employees based on search query, department filter, and active status
  const filteredEmployees = useMemo(() => {
    if (!allEmployees || allEmployees.length === 0) return [];

    let result = allEmployees;

    // Apply active/inactive filter
    result = result.filter(employee => 
      viewActive ? employee.is_active : !employee.is_active
    );

    // Apply search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(employee => {
        const nameMatch = employee.name?.toLowerCase().includes(query);
        const mobileMatch = employee.mobile_number?.toString().includes(query);
        const emailMatch = employee.email?.toLowerCase().includes(query);
        const codeMatch = employee.employee_code?.toLowerCase().includes(query);
        
        return nameMatch || mobileMatch || emailMatch || codeMatch;
      });
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      result = result.filter(employee => 
        employee.department_id?.toString() === departmentFilter
      );
    }

    return result;
  }, [allEmployees, searchTerm, departmentFilter, viewActive]);

  const hasActiveFilters = searchTerm.trim() !== '' || departmentFilter !== 'all';

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
  };

  logDebug("this is the employees in employee list", allEmployees);
  logDebug("filtered employees", filteredEmployees);
  logDebug("current search query", searchTerm);
  logDebug("current department filter", departmentFilter);
  logDebug("current view active status", viewActive);

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
      
      <div className="flex gap-2 items-center flex-wrap">
        {/* Department Filter */}
   
          <Select
            options={departmentOptions}
            value={departmentFilter}
            onChange={handleDepartmentFilterChange}
            placeholder="All Departments"
            disabled={departmentsLoading}
            loading={departmentsLoading}
            searchable
            clearable
            className="min-w-[180px] pl-7"
            emptyMessage="No departments found"
            renderOption={(option) => (
              <div className="flex items-center">
                <span>{option.name}</span>
                {option.id === 'all' && (
                  <span className="ml-2 text-xs text-gray-500">(Show All)</span>
                )}
              </div>
            )}
          />
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm  text-red-500 hover:text-sidebar-primary-700 transition-colors whitespace-nowrap"
          >
            X
          </button>
        )}
      </div>
    </div>
  }
  rightElements={
    <ActiveFilterToggle
    viewActive={viewActive}
    setViewActive={setViewActive}
    activeCount={activeEmployeesCount}
    inactiveCount={inactiveEmployeesCount}
  />
  }
/>
      
      <EmployeeList
        employees={filteredEmployees}
        loading={loading}
        error={error}
        selectedEmployeeIds={selectedEmployeeIds}
        onAddClick={handleAddClick}
        onCheckboxChange={handleCheckboxChange}
        onRowClick={handleRowClick}
        onView={handleView}
        onEdit={handleEdit}
      />

      {/* Pagination */}
      {!loading && allEmployees.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalItems={totalEmployees}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;