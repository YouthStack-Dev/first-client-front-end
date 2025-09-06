import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, UsersRound } from 'lucide-react';
import Modal from '../components/modals/Modal';
import DepartmentForm from '../components/teams/DepartmentForm';
import DepartmentList from '../components/teams/DepartmentList';
import { useDispatch, useSelector } from 'react-redux';
import { API_CLIENT } from '../Api/API_Client';
import { setTeams,upsertTeam, removeTeam} from '../redux/features/user/userSlice';
import { logDebug, logError } from '../utils/logger';
import { fetchDepartments } from '../redux/features/user/userTrunk';
import ToolBar from '../components/ui/ToolBar';
import SearchInput from '../components/ui/SearchInput';

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

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle add button click
  const handleAddClick = () => {
    setEditingTeam(null);
    setIsOpen(true);
  };

  // Fetch teams with pagination
  useEffect(() => {

    if (teamIds.length > 0) {
      logDebug('Teams already fetched, skipping API call');
      return;

    }
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDepartments(currentPage, itemsPerPage, searchTerm);
        logDebug('Fetched teams:', data);
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

  const handleViewEmployees = (departmentId, isActive,depname) => {
    navigate(`/department/${departmentId}/employees?active=${isActive}`);
  };

  const handleFormSuccess = () => {
    setEditingTeam(null);
    setIsOpen(false);
  };

  return (
    <div >
      <ToolBar
        onAddClick={handleAddClick}
        addButtonLabel=" Department"
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
          <button className="flex items-center gap-2 px-2  p-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            <UserPlus size={17} />
            Employee
          </button>
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