import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserX, Building2, Plus } from 'lucide-react';
import Modal from '../components/modals/Modal';
import DepartmentForm from '../components/teams/DepartmentForm';
import DepartmentList from '../components/teams/DepartmentList';
import { useDispatch, useSelector } from 'react-redux';
import { API_CLIENT } from '../Api/API_Client';
import {
  setTeams,
  upsertTeam,
  removeTeam
} from '../redux/features/user/userSlice';
import Pagination from '../components/Pagination';
import { logDebug, logError } from '../utils/logger';
import { fetchDepartments } from '../redux/features/user/userTrunk';
import ToolBar from '../components/ui/ToolBar';
import SearchInput from '../components/ui/SearchInput';
import ActiveFilterToggle from '../components/ui/ActiveFilterToggle';
import Select from '../components/ui/Select';

const ManageDepartment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pull teams from Redux slice
  const teamsById = useSelector((state) => state.user.teams.byId);
  const teamIds = useSelector((state) => state.user.teams.allIds);
  const teams = teamIds.map((id) => teamsById[id]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [viewActive, setViewActive] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState(null);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle add button click
  const handleAddClick = () => {
    setEditingTeam(null);
    setIsOpen(true);
  };

  // Handle department filter change
  const handleDepartmentFilterChange = (option) => {
    setDepartmentFilter(option);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter(null);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || departmentFilter;

  // Fetch teams with pagination
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDepartments(currentPage, itemsPerPage, searchTerm);
        dispatch(setTeams(data));
        setTotalItems(data.length);
      } catch (error) {
        logError('Error fetching teams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [dispatch, currentPage, itemsPerPage, searchTerm]);

  // Handle department selection
  const handleSelectDepartment = (departmentId, isSelected) => {
    setSelectedDepartments((prev) =>
      isSelected ? [...prev, departmentId] : prev.filter((id) => id !== departmentId)
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
        setSelectedDepartments((prev) => prev.filter((id) => id !== teamId));
        
        // Refresh the current page if we're left with no items after deletion
        if (teams.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const handleViewEmployees = (departmentId) => {
    navigate(`/department/${departmentId}/employees`);
  };

  const handleFormSuccess = (teamData) => {
    logDebug(" debug data based from submission " ,teamData)
    // Transform the form data to match your Redux structure
    const transformedData = {
      id: teamData.department_id,
      name: teamData.department_name,
      description: teamData.description,
    };

    if (editingTeam) {
      // Update existing team
      dispatch(upsertTeam(transformedData));
    } else {
      // Add new team
      dispatch(upsertTeam(transformedData));
      
      // If we're not on the first page, go to first page to see the new item
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    }
    setEditingTeam(null);
    setIsOpen(false);
  };

  // Prepare department options for filter
  const departmentOptions = [
    { id: 'all', name: 'All Departments' },
    ...teams.map(team => ({ id: team.id, name: team.name }))
  ];

  return (
    <div className="p-4">
      <ToolBar
        onAddClick={handleAddClick}
        addButtonLabel="Add Department"
        addButtonIcon={<Plus size={16} />}
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
          <ActiveFilterToggle
            viewActive={viewActive}
            setViewActive={setViewActive}
            activeCount={teams.filter(t => t.status === 'active').length}
            inactiveCount={teams.filter(t => t.status === 'inactive').length}
          />
        }
      />

      {/* Department List Component */}
      <DepartmentList
        departments={teams}
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
      />

      {/* Modal */}
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

export default ManageDepartment;