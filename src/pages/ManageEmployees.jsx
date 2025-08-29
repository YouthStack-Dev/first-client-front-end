import React, { useState, useEffect, useMemo } from 'react';
import EmployeeList from "../components/teams/EmployeeList";
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { API_CLIENT } from '../Api/API_Client';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { Plus } from 'lucide-react';
import SearchInput from '../components/ui/SearchInput';
import { logDebug } from '../utils/logger';
import ToolBar from '../components/ui/ToolBar';
import { setDepartmentEmployees } from '../redux/features/user/userSlice';

const ManageEmployees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const { depId } = useParams();
  const dispatch = useDispatch();

  const isActive = searchParams.get("active");

  const allEmployees = useSelector((state) => {
    const ids = state.user.departmentEmployees[depId] || [];
    return ids.map((id) => state.user.employees.byId[id]);
  });

  useEffect(() => {
    fetchEmployeesByDepartment();
  }, [depId]);

  const fetchEmployeesByDepartment = async () => {
    if (allEmployees && allEmployees.length > 0) {
      console.log(`Employees for ${depId} already fetched, skipping API call`);
      setLoading(false);
      return;
    }

    try {
      logDebug("Fetching employees for department", depId); 
      setLoading(true);
      const response = await API_CLIENT.get(`/employees/department/${depId}?is_active=${isActive}`);
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

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!allEmployees || allEmployees.length === 0) return [];

    let result = allEmployees;

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

    return result;
  }, [allEmployees, searchTerm]);

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
      />
      
      <EmployeeList
        employees={filteredEmployees}
        loading={loading}
        error={error}
        selectedEmployeeIds={selectedEmployeeIds}
        onCheckboxChange={handleCheckboxChange}
        onRowClick={handleRowClick}
        onView={handleView}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default ManageEmployees;