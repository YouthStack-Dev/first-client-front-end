import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UsersRound, History } from 'lucide-react';
import DepartmentForm from '@components/departments/DepartmentForm';
import DepartmentList from '@components/departments/DepartmentList';
import { useDispatch, useSelector } from 'react-redux';
import { API_CLIENT } from '../Api/API_Client';
import { setTeams, removeTeam } from '../redux/features/user/userSlice';
import { logDebug, logError } from '../utils/logger';
import { fetchDepartments } from '../redux/features/user/userTrunk';
import ToolBar from '@components/ui/ToolBar';
import SearchInput from '@components/ui/SearchInput';
import AuditLogModal from '@components/departments/AuditLogModal';
import Modal from '@components/modals/Modal';
import { toast } from 'react-toastify';

const ManageDepartment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  
  // Audit log state
  const [auditLogs, setAuditLogs] = useState([]);
  const [isAuditLogLoading, setIsAuditLogLoading] = useState(false);

  // Pull teams from Redux slice
  const teamsById = useSelector((state) => state.user.teams.byId);
  const teamIds = useSelector((state) => state.user.teams.allIds);
  
  // Fixed teams mapping - added return statement
  const teams = teamIds?.map((id) => teamsById[id]) || [];
  
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle add button click
  const handleAddClick = () => {
    setEditingTeam(null);
    setIsDepartmentModalOpen(true);
  };

  // Fetch teams with pagination
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        // Check if we need to fetch or use cached data
        if (teamIds.length === 0 || searchTerm) {
          const data = await fetchDepartments(currentPage, itemsPerPage, searchTerm);
          logDebug('Fetched teams:', data);
          dispatch(setTeams(data));
          setTotalItems(data.length || data.totalCount || 0);
        }
      } catch (error) {
        logError('Error fetching teams:', error);
        toast.error('Failed to fetch departments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [dispatch, currentPage, itemsPerPage, searchTerm, teamIds.length]);

  // Fetch audit logs when modal opens
  const fetchAuditLogs = async () => {
    setIsAuditLogLoading(true);
    try {
      const response = await API_CLIENT.get('/api/audit/departmentsLogs');
      setAuditLogs(response.data.data || response.data || []);
    } catch (error) {
      logError('Error fetching audit logs:', error);
      if (error.response?.status === 404) {
        setAuditLogs([]);
        toast.info("No audit logs found");
      } else {
        toast.error('Failed to fetch audit logs');
      }
    } finally {
      setIsAuditLogLoading(false);
    }
  };

  // Handle history button click
  const handleHistoryClick = async () => {
    setIsAuditLogModalOpen(true);
    await fetchAuditLogs();
  };

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
      name: team.name
    };
    setEditingTeam(teamToEdit);
    setIsDepartmentModalOpen(true);
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
        toast.success('Department deleted successfully');
      } catch (error) {
        console.error('Error deleting department:', error);
        toast.error('Failed to delete department');
      }
    }
  };

  const handleViewEmployees = (departmentId, isActive, depname) => {
    navigate(`/department/${departmentId}/employees?active=${isActive}`);
  };

  const handleFormSuccess = () => {
    setEditingTeam(null);
    setIsDepartmentModalOpen(false);
  };

  const handleDepartmentSpecificLog = (departmentId) => {
    logDebug("Department specific log function invoked for:", departmentId);
    // Implement department-specific log functionality here
  };

  return (
    <div>
      <ToolBar
        onAddClick={handleAddClick}
        addButtonLabel="Department"
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
          <div className="flex items-center gap-3">
            <button
              onClick={handleHistoryClick}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition"
              title="View Audit History"
            >
              <History size={17} />
              History
            </button>

            <button
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              onClick={() => navigate('/employees/create')}
            >
              <UserPlus size={17} />
              Employee
            </button>
          </div>
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
        onViewHistory={handleDepartmentSpecificLog}
      />

      {/* Department Form Modal */}
      <Modal
        isOpen={isDepartmentModalOpen}
        onClose={() => {
          setIsDepartmentModalOpen(false);
          setEditingTeam(null);
        }}
        title={editingTeam ? 'Edit Department' : 'Create Department'}
        size="md"
      >
        <DepartmentForm
          onClose={() => {
            setIsDepartmentModalOpen(false);
            setEditingTeam(null);
          }}
          onSuccess={handleFormSuccess}
          initialData={editingTeam}
        />
      </Modal>

      {/* Audit Log Modal */}
      <Modal
        isOpen={isAuditLogModalOpen}
        onClose={() => setIsAuditLogModalOpen(false)}
        title="Department Audit History"
        size="lg"
      >
        <AuditLogModal 
          logs={auditLogs} 
          isLoading={isAuditLogLoading} 
        />
      </Modal>
    </div>
  );
};

export default ManageDepartment;