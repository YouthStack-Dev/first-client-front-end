import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { UserX, Users, Building2, Plus, Search, Filter } from 'lucide-react';
import Modal from '../modals/Modal';
import DepartmentForm from '../teams/DepartmentForm';
import EmployeeList from '../teams/EmployeeList';
import { useDispatch, useSelector } from 'react-redux';
import { API_CLIENT } from '../../Api/API_Client';
import {
  setTeams,
  upsertTeam,
  removeTeam,
  setDepartmentEmployees,
  setLastFetchedDepId
} from '../../redux/features/user/userSlice';

import { fetchDepartments } from '../../redux/features/user/userTrunk';
import { toast } from 'react-toastify';
import DepartmentList from './DepartmentList';
import { logDebug } from '../../utils/logger';

const TeamManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { depId } = useParams();

  // Tab Management
  const [activeTab, setActiveTab] = useState('departments');
  const [searchTerm, setSearchTerm] = useState('');

  // Department State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);

  // Employee State
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Redux selectors
  const teamsById = useSelector((state) => state.user.teams.byId);
  const teamIds = useSelector((state) => state.user.teams.allIds);
  const teams = teamIds.map((id) => teamsById[id]);
  
  const lastFetchedDepId = useSelector(state => state.user.lastFetchedDepId);
  const employeeIds = useSelector(state => state.user.departmentEmployees[selectedDepartment] || []);
  const employees = useSelector(state => employeeIds.map(id => state.user.employees.byId[id]));



  logDebug(" this are the actions:", actions);
  // Initialize tab based on URL or default
  useEffect(() => {
    if (depId) {
      setActiveTab('employees');
      setSelectedDepartment(depId);
    } else if (location.pathname.includes('employees')) {
      setActiveTab('employees');
    }
  }, [depId, location.pathname]);

  // Fetch departments
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDepartments(currentPage, itemsPerPage);
        dispatch(setTeams(data));
        setTotalItems(data.length);
      } catch (error) {
        logError('Error fetching teams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'departments') {
      const skip = (currentPage - 1) * itemsPerPage;
      const pageTeams = teamIds
        .slice(skip, skip + itemsPerPage)
        .map((id) => teamsById[id]);

      if (pageTeams.length === itemsPerPage || (pageTeams.length > 0 && currentPage === 1)) {
        return;
      }

      fetchTeams();
    }
  }, [dispatch, currentPage, itemsPerPage, teamIds, teamsById, activeTab]);

  // Fetch employees when department is selected
  useEffect(() => {
    if (activeTab === 'employees' && selectedDepartment) {
      if (lastFetchedDepId === selectedDepartment && employeeIds.length > 0) {
        setEmployeeLoading(false);
        return;
      }

      const fetchDepartmentEmployees = async () => {
        try {
          setEmployeeLoading(true);
          const response = await API_CLIENT.get(`employees/department/${selectedDepartment}`);
          const { employees: fetchedEmployees, message } = response.data;

          dispatch(setDepartmentEmployees({ depId: selectedDepartment, employees: fetchedEmployees }));
          dispatch(setLastFetchedDepId(selectedDepartment));

          toast.success(message || 'Employees loaded successfully');
        } catch (err) {
          setEmployeeError(err.response?.data?.detail || 'Something went wrong');
          toast.error(err.response?.data?.detail || 'Failed to load employees');
        } finally {
          setEmployeeLoading(false);
        }
      };

      fetchDepartmentEmployees();
    }
  }, [activeTab, selectedDepartment, lastFetchedDepId, employeeIds.length, dispatch]);

  // Department handlers
  const handleSelectTeam = (teamId, isSelected) => {
    setSelectedTeams((prev) =>
      isSelected ? [...prev, teamId] : prev.filter((id) => id !== teamId)
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTeams(teamIds);
    } else {
      setSelectedTeams([]);
    }
  };

  const handleEdit = (team) => {
    const teamToEdit = {
      ...team,
      department_id: team.id,
      department_name: team.name
    };
    setEditingTeam(teamToEdit);
    setIsOpen(true);
  };

  const handleDelete = async (teamId) => {
    if (window.confirm(`Are you sure you want to delete this department?`)) {
      try {
        await API_CLIENT.delete(`/departments/${teamId}`);
        dispatch(removeTeam({ teamId }));
        setSelectedTeams((prev) => prev.filter((id) => id !== teamId));
        
        if (teams.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        toast.success('Department deleted successfully');
      } catch (error) {
        toast.error('Error deleting department');
        console.error('Error deleting team:', error);
      }
    }
  };

  const handleFormSuccess = (teamData) => {
    const transformedData = {
      id: teamData.department_id,
      name: teamData.department_name,
      description: teamData.description,
    };

    if (editingTeam) {
      dispatch(upsertTeam(transformedData));
    } else {
      dispatch(upsertTeam(transformedData));
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    }
    setEditingTeam(null);
    setIsOpen(false);
  };

  // Employee handlers
  const handleEmployeeCheckboxChange = (id) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((eId) => eId !== id) : [...prev, id]
    );
  };

  const handleEmployeeRowClick = (employee, e) => {
    if (e.target.type === 'checkbox') return;
    navigate(`/department/${selectedDepartment}/employees/${employee.employee_code}/view`);
  };

  const handleEmployeeView = (employee) => {
    navigate(`/department/${selectedDepartment}/employees/${employee.employee_code}/view`, {
      state: { employee, fromChild: true },
    });
  };

  const handleEmployeeEdit = (employee) => {
    navigate(`/department/${selectedDepartment}/employees/${employee.employee_code}/edit`, {
      state: { employee },
    });
  };

  const handleAddEmployee = () => {
    navigate(`/employee/create-employee`);
  };

  // Filter data based on search
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployees = employees.filter(employee =>
    employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee?.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-app-background min-h-screen">
      {/* Header */}
    
      {/* Tab Navigation */}
      <div className="bg-app-surface rounded-lg shadow-sm border border-app-border mb-6">
        <div className="border-b border-app-border">
          {/* ... (tab navigation remains the same) */}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Search and Actions Bar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            {/* ... (search and actions bar remains the same) */}
          </div>

          {/* Departments Tab Content */}
          {activeTab === 'departments' && (
            <DepartmentList
              departments={filteredTeams}
              selectedDepartments={selectedTeams}
              isLoading={isLoading}
              searchTerm={searchTerm}
              onSelectDepartment={handleSelectTeam}
              onSelectAllDepartments={handleSelectAll}
              onEditDepartment={handleEdit}
              onDeleteDepartment={handleDelete}
              onViewEmployees={(depId) => {
                setSelectedDepartment(depId);
                setActiveTab('employees');
              }}
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Employees Tab Content */}
          {activeTab === 'employees' && (
            <>
              {!selectedDepartment ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-app-text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-app-text-primary mb-2">Select a Department</h3>
                  <p className="text-app-text-secondary mb-6">Choose a department to view its employees</p>
                  <button
                    onClick={() => setActiveTab('departments')}
                    className="bg-sidebar-primary-500 hover:bg-sidebar-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    View Departments
                  </button>
                </div>
              ) : (
                <EmployeeList
                  employees={filteredEmployees}
                  loading={employeeLoading}
                  error={employeeError}
                  selectedEmployeeIds={selectedEmployeeIds}
                  onAddClick={handleAddEmployee}
                  onCheckboxChange={handleEmployeeCheckboxChange}
                  onRowClick={handleEmployeeRowClick}
                  onView={handleEmployeeView}
                  onEdit={handleEmployeeEdit}
                  departmentName={teams.find(t => t.id === parseInt(selectedDepartment))?.name}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Department Form Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditingTeam(null);
        }}
        title={editingTeam ? 'Edit Department' : 'Create Department'}
        size="md"
      >
        <DepartmentForm
          onClose={() => {
            setIsOpen(false);
            setEditingTeam(null);
          }}
          onSuccess={handleFormSuccess}
          initialData={editingTeam}
        />
      </Modal>
    </div>
  );
};

export default TeamManagement;