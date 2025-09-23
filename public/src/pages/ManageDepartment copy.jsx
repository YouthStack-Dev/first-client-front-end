import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UsersRound, History } from 'lucide-react';
import Modal from '../components/modals/Modal';
import DepartmentList from '../components/departments/DepartmentList';
import { useDispatch, useSelector } from 'react-redux';
import { API_CLIENT } from '../Api/API_Client';
import { setDepartments, removeDepartment } from '../redux/features/user/userSlice';
import { logDebug, logError } from '../utils/logger';
import { fetchDepartments } from '../redux/features/user/userTrunk';
import ToolBar from '../components/ui/ToolBar';
import SearchInput from '../components/ui/SearchInput';
import DepartmentForm from '../components/departments/DepartmentForm';
import AuditLogModal from '../components/departments/AuditLogModal.jsx'; // New component for audit logs

const ManageDepartment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pull departments from Redux slice
  const departmentsById = useSelector((state) => state.user.departments.byId);
  const departmentIds = useSelector((state) => state.user.departments.allIds);
  const departments = departmentIds.map((id) => departmentsById[id]);

  const [isOpen, setIsOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false); // New state for audit log modal
  const [auditLogs, setAuditLogs] = useState([]); // State for audit logs
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false); // Loading state for audit logs
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleAddClick = () => {
    setEditingDepartment(null);
    setIsOpen(true);
  };

  // Fetch departments with pagination
  useEffect(() => {
    if (departmentIds.length > 0) {
      logDebug('Departments already fetched, skipping API call');
      return;
    }

    const fetchDeps = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDepartments(currentPage, itemsPerPage, searchTerm);
        logDebug('Fetched departments:', data);
        dispatch(setDepartments(data.departments));
        setTotalItems(data.length);
      } catch (error) {
        logError('Error fetching departments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeps();
  }, [dispatch, currentPage, itemsPerPage, searchTerm, departmentIds]);

  // Function to fetch audit logs
  const fetchAuditLogs = async () => {
    setIsLoadingAuditLogs(true);
    try {
      const response = await API_CLIENT.get('/api/audit/departmentsLogs');
      setAuditLogs(response.data.data || response.data); // Handle both structured and raw responses
    } catch (error) {
      logError('Error fetching audit logs:', error);
      alert('Failed to fetch audit logs');
    } finally {
      setIsLoadingAuditLogs(false);
    }
  };

  // Function to handle history icon click
  const handleHistoryClick = () => {
    setIsAuditLogOpen(true);
    fetchAuditLogs();
  };

  const handleSelectDepartment = (departmentId, isSelected) => {
    setSelectedDepartments((prev) =>
      isSelected ? [...prev, departmentId] : prev.filter((id) => id !== departmentId)
    );
  };

  const handleSelectAllDepartments = (e) => {
    setSelectedDepartments(e.target.checked ? departmentIds : []);
  };

  const handleEdit = (department) => {
    const deptToEdit = {
      ...department,
      department_id: department.id,
      department_name: department.name
    };
    setEditingDepartment(deptToEdit);
    setIsOpen(true);
  };

  const handleDelete = async (departmentId) => {
    if (window.confirm(`Are you sure you want to delete this department?`)) {
      try {
        await API_CLIENT.delete(`/departments/${departmentId}`);
        dispatch(removeDepartment({ departmentId }));
        setSelectedDepartments((prev) => prev.filter((id) => id !== departmentId));

        if (departments.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const handleViewEmployees = (departmentId, isActive) => {
    navigate(`/department/${departmentId}/employees?active=${isActive}`);
  };

  const handleFormSuccess = () => {
    setEditingDepartment(null);
    setIsOpen(false);
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
          <div className="flex gap-2">
            {/* History Button */}
            <button 
              onClick={handleHistoryClick}
              className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition"
              title="View Audit History"
            >
              <History size={17} />
              History
            </button>
            
            <button className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
              <UserPlus size={17} />
              Employee
            </button>
          </div>
        }
      />

      <DepartmentList
        departments={departments}
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

      {/* Department Form Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditingDepartment(null);
        }}
        title={editingDepartment ? 'Edit Department' : 'Create Department'}
        size="md"
      >
        <DepartmentForm
          onClose={() => {
            setIsOpen(false);
            setEditingDepartment(null);
          }}
          onSuccess={handleFormSuccess}
          initialData={editingDepartment}
        />
      </Modal>

      {/* Audit Log Modal */}
      <Modal
  isOpen={isAuditLogOpen}
  onClose={() => setIsAuditLogOpen(false)}
  title="Department Audit History"
  size="lg"
>
  <AuditLogModal
    logs={auditLogs}
    isLoading={isLoadingAuditLogs}
  />
</Modal>

    </div>
  );
};

export default ManageDepartment;