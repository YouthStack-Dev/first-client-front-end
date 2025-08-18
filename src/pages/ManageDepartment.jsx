import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserX } from 'lucide-react';
import Modal from '../components/modals/Modal';
import DepartmentForm from '../components/teams/DepartmentForm';
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

const ManageDepartment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Pull teams from Redux slice
  const teamsById = useSelector((state) => state.user.teams.byId);
  const teamIds = useSelector((state) => state.user.teams.allIds);
  const teams = teamIds.map((id) => teamsById[id]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
// logDebug("Teams fetched from Redux:", teams);
  // Fetch teams with pagination
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        const  data  = await   fetchDepartments(currentPage,itemsPerPage)

        
        dispatch(setTeams(data));
        setTotalItems(data.length);
      } catch (error) {
       logError('Error fetching teams:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    // ✅ Check if we already have data for this page
    const skip = (currentPage - 1) * itemsPerPage;
    const pageTeams = teamIds
      .slice(skip, skip + itemsPerPage)
      .map((id) => teamsById[id]);
  
    if (pageTeams.length === itemsPerPage || (pageTeams.length > 0 && currentPage === 1)) {
      // Data already exists for this page, skip fetch
      return;
    }
  
    fetchTeams();
  }, [dispatch, currentPage, itemsPerPage, teamIds, teamsById]);
  

  // Handle team selection
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
    if (window.confirm(`Are you sure you want to delete this team?  ${teamId}`)) {
      try {
        await API_CLIENT.delete(`/departments/${teamId}`);
        dispatch(removeTeam({ teamId }));
        setSelectedTeams((prev) => prev.filter((id) => id !== teamId));
        
        // Refresh the current page if we're left with no items after deletion
        if (teams.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    }
  };



  const handleFormSuccess = (teamData) => {
    logDebug(" debug data based from subbmision " ,teamData)
    // Transform the form data to match your Redux structure
    const transformedData = {
      id: teamData.department_id ,
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

  return (
    <div className="p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              setEditingTeam(null);
              setIsOpen(true);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"
          >
            <UserX size={16} /> Create Department
          </button>

          <button
            onClick={() => navigate('/employee/create-employee')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"
          >
            <UserX size={16} /> Create Employee
          </button>

          {/* {selectedTeams.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"
            >
              Delete Selected ({selectedTeams.length})
            </button>
          )} */}
        </div>
      </div>

      {/* Teams Table */}
      <div className="overflow-x-auto bg-white rounded shadow max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">Loading departments...</div>
        ) : (
          <>
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedTeams.length === teamIds.length &&
                        teamIds.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-left">Employees</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team.id)}
                        onChange={(e) =>
                          handleSelectTeam(team.id, e.target.checked)
                        }
                      />
                    </td>
                    <td className="px-3 py-2">{team.name}</td>
                    <td className="px-3 py-2">{team.description || '-'}</td>
                    <td className="px-3 py-2">
                      <button
                        className="bg-green-100 text-green-800 px-2 py-0.5 rounded"
                        onClick={() =>
                          navigate(`/department/${team.id}/employees`)
                        }
                      >
                        {team.users || 0}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-3">
                        <button
                          className="text-blue-500 hover:underline"
                          onClick={() => handleEdit(team)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() => handleDelete(team.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {teams.length === 0 && !isLoading && (
              <div className="p-4 text-center">No departments found</div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditingTeam(null);
        }}
        title={editingTeam ? 'Edit Team' : 'Create Team'}
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