import React, { useState, useEffect } from 'react';
import EmployeeList from "../components/teams/EmployeeList";
import { useNavigate, useParams } from 'react-router-dom';
import { API_CLIENT } from '../Api/API_Client';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { setDepartmentEmployees, setLastFetchedDepId } from '../redux/features/user/userSlice';

const ManageEmployees = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const navigate = useNavigate();
  const { depId } = useParams();

  const dispatch = useDispatch();
  const lastFetchedDepId = useSelector(state => state.user.lastFetchedDepId);
  const employeeIds = useSelector(state => state.user.departmentEmployees[depId] || []);
  const employees = useSelector(state => employeeIds.map(id => state.user.employees.byId[id]));
  useEffect(() => {
    // Skip fetch if already fetched for this depId 
    if (lastFetchedDepId === depId && employeeIds.length > 0) {
      setLoading(false);
      return;
    }

    const fetchDepartmentEmployees = async () => {
      try {
        setLoading(true);
        const response = await API_CLIENT.get(`employees/department/${depId}`);
        const { employees, message } = response.data;

        console.log(" this is the employes fetched for the department " ,employees);
        

        dispatch(setDepartmentEmployees({ depId, employees }));
        dispatch(setLastFetchedDepId(depId));

        toast.success(message || 'Employees loaded successfully');
      } catch (err) {
        setError(err.response?.data?.detail || 'Something went wrong');
        toast.error(err.response?.data?.detail || 'Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentEmployees();
  }, [depId, lastFetchedDepId, employeeIds.length, dispatch]);

  const handleCheckboxChange = (id) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((eId) => eId !== id) : [...prev, id]
    );
  };

  const handleRowClick = (employee, e) => {
    if (e.target.type === 'checkbox') return;
    navigate(`/department/${depId}/employees/${employee.userId}/view`);
  };

  const handleAddClick = () => {
    navigate(`/employee/create-employee`);
  };

  const handleView = (employee) => {
    navigate(`/department/${depId}/employees/${employee.userId}/view`, {
      state: { employee, fromChild: true },
    });
  };

  const handleEdit = (employee) => {
    navigate(`/department/${depId}/employees/${employee.userId}/edit`, {
      state: { employee },
    });
  };

  return (
    <EmployeeList
      employees={employees}
      loading={loading}
      error={error}
      selectedEmployeeIds={selectedEmployeeIds}
      onAddClick={handleAddClick}
      onCheckboxChange={handleCheckboxChange}
      onRowClick={handleRowClick}
      onView={handleView}
      onEdit={handleEdit}
    />
  );
};

export default ManageEmployees;
