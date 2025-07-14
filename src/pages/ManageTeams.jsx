import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Download, History, Trash2, UserX } from 'lucide-react';
import TeamForm from '../components/TeamForm';
import {  toggleModal, setEditingTeamId, setFormData, toggleSelect, clearSelectedTeams, removeTeams } from '../redux/features/manageTeam/manageTeamSlice';
import Loading from "../components/ui/Loading";
import { log } from '../utils/logger';
import { fetchTeams } from '../redux/features/manageTeam/manageTeamThunks';

const ManageTeams = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    teams,
    status,
    selectedTeams,
    showModal,
    editingTeamId,
    formData
  } = useSelector((state) => state.manageTeam);

  // Fetch teams on mount if needed
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTeams({ skip: 0, limit: 10 }));
    }
  }, [status, dispatch]);

  const handleActiveClick = (teamId) => {
    log("Team ID:", teamId);
    navigate(`/teams/${teamId}/employees`);
  };

  const handleEdit = (team) => {
    dispatch(setEditingTeamId(team.department_id));
    dispatch(setFormData({
      teamName: team.department_name,
      teamManager1: team.manager || '',
      teamManager2: '',
      teamManager3: '',
      shiftCategory: 'Default',
      description: team.description || '',
      notification: '',
    }));
    dispatch(toggleModal());
  };

  const handleDelete = (teamId) => {
    dispatch(removeTeams([teamId]));
  };

  const handleHistory = (team) => {
    console.log(`Showing history for ${team.department_name}`);
    alert(`History for ${team.department_name} (placeholder)`);
  };

  const handleModalSubmit = (submittedData) => {
    // TODO: send data to backend (add/edit team)
    dispatch(toggleModal());
    dispatch(setEditingTeamId(null));
    dispatch(setFormData({
      teamName: '',
      teamManager1: '',
      teamManager2: '',
      teamManager3: '',
      shiftCategory: 'Default',
      description: '',
      notification: '',
    }));
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <p>Error loading teams</p>;

  return (
    <div className="p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              dispatch(setEditingTeamId(null));
              dispatch(setFormData({
                teamName: '',
                teamManager1: '',
                teamManager2: '',
                teamManager3: '',
                shiftCategory: 'Default',
                description: '',
                notification: '',
              }));
              dispatch(toggleModal());
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"
          >
            <UserX size={16} /> Create Team
          </button>

          <button
            onClick={() => navigate('/employee/create-employee')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"
          >
            <UserX size={16} /> Create Employee
          </button>

          {/* <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm">
            <Download size={16} /> Download Report
          </button> */}
{/* 
          <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm">
            <History size={16} /> View History
          </button> */}

          {selectedTeams.length > 0 && (
            <button
              onClick={() => {
                dispatch(removeTeams(selectedTeams));
                dispatch(clearSelectedTeams());
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"
            >
              <Trash2 size={16} /> Delete Selected
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow max-h-[500px] overflow-y-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">Select</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Employees</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams && teams.map((team) => (
              <tr key={team.department_id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team.department_id)}
                    onChange={() => dispatch(toggleSelect(team.department_id))}
                  />
                </td>
                <td className="px-3 py-2">{team.department_name}</td>
                <td className="px-3 py-2">{team.description || '-'}</td>
                <td className="px-3 py-2">
                  <button
                    className="bg-green-100 text-green-800 px-2 py-0.5 rounded"
                    onClick={() => handleActiveClick(team.department_id)}
                  >
                    {team.employee_count || 0}
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
                      className="text-gray-700 hover:underline"
                      onClick={() => handleHistory(team)}
                    >
                      History
                    </button>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleDelete(team.department_id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <TeamForm
        isOpen={showModal}
        onClose={() => {
          dispatch(toggleModal());
          dispatch(setEditingTeamId(null));
        }}
        onSubmit={handleModalSubmit}
        formData={formData}
        setFormData={(data) => dispatch(setFormData(data))}
      />
    </div>
  );
};

export default ManageTeams;
