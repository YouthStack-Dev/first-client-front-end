import React, { useState, useEffect, useMemo } from 'react';
import EmployeeList from "../components/teams/EmployeeList";
import { useNavigate, useParams } from 'react-router-dom';
import { API_CLIENT } from '../Api/API_Client';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { Plus} from 'lucide-react';
import SearchInput from '../components/ui/SearchInput';
import { logDebug } from '../utils/logger';
import ToolBar from '../components/ui/ToolBar';
import Pagination from '../components/Pagination';
import ActiveFilterToggle from '../components/ui/ActiveFilterToggle';
import { setDepartmentEmployees } from '../redux/features/user/userSlice';

const ManageEmployees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [viewActive, setViewActive] = useState(true); // Default to active view
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const navigate = useNavigate();
    const { depId} = useParams();

     const dispatch = useDispatch();


  const allEmployees = useSelector((state) => {const ids = state.user.departmentEmployees[depId] ||
                                     [];return ids.map((id) => state.user.employees.byId[id]);});
  
  useEffect(() => {


    fetchEmployeesByDepartment();
  }, [currentPage, itemsPerPage, depId]);

 

 
const fetchEmployeesByDepartment = async () => {
  // 🔹 Check if employees for this department already exist
  if (allEmployees && allEmployees.length > 0) {
    console.log(`Employees for ${depId} already fetched, skipping API call`);
    setLoading(false);
    return;
  }

  try {

    logDebug("Fetching employees for department", depId); 
    setLoading(true);
    const response = await API_CLIENT.get(`/employees/department/${depId}`);
    const { employees, department_id } = response.data;

    dispatch(setDepartmentEmployees({ department_id, employees }));
    toast.success('Employees loaded successfully');
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

  // Count active and inactive employees
  const activeEmployeesCount = useMemo(() => 
    allEmployees.filter(employee => employee.is_active).length, 
    [allEmployees]
  );
  
  const inactiveEmployeesCount = useMemo(() => 
    allEmployees.filter(employee => !employee.is_active).length, 
    [allEmployees]
  );


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