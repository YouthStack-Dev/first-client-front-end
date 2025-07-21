import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, UserX } from 'lucide-react';
import {
  toggleModal,
  setEditingTeamId,
  toggleSelect,
} from '../redux/features/manageTeam/manageTeamSlice';
import Loading from '../components/ui/Loading';
import TeamForm from '../components/TeamForm';
import { fetchTeams, deleteTeams } from '../redux/features/manageTeam/manageTeamThunks';
import { log } from '../utils/logger';

const ManageTeams = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { teams, showModal, apiStatus } = useSelector((state) => state.manageTeam);
  const status = apiStatus.fetchTeams.status;

  // Fetch teams on mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTeams({ skip: 0, limit: 10 }));
    }
  }, [status, dispatch]);

  const handleEdit = (teamId) => {
    dispatch(setEditingTeamId(teamId));
    dispatch(toggleModal());
  };

  const handleDelete = (teamId) => {
    log("The deleted team id ", teamId);
    dispatch(deleteTeams([teamId]));
  };

  if (status === 'loading') return <Loading />;
  if (status === 'failed') return <p>Error loading teams</p>;

  return (
    <div className="p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Create Department */}
          <button
            onClick={() => {
              dispatch(setEditingTeamId(null));
              dispatch(toggleModal());
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"
          >
            <UserX size={16} /> Create Department
          </button>

          {/* Create Employee */}
          <button
            onClick={() => navigate('/employee/create-employee')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"
          >
            <UserX size={16} /> Create Employee
          </button>
        </div>
      </div>

      {/* Teams Table */}
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
            {teams?.map((team) => (
              <tr key={team.department_id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={false} // Disable checkbox since bulk delete is removed
                    disabled
                  />
                </td>
                <td className="px-3 py-2">{team.department_name}</td>
                <td className="px-3 py-2">{team.description || '-'}</td>
                <td className="px-3 py-2">
                  <button
                    className="bg-green-100 text-green-800 px-2 py-0.5 rounded"
                    onClick={() => navigate(`/teams/${team.department_id}/employees`)}
                  >
                    {team.employee_count || 0}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-3">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => handleEdit(team.department_id)}
                    >
                      Edit
                    </button>
                    {/* <button
                      className="text-gray-700 hover:underline"
                      onClick={() => alert(`History for ${team.department_name}`)}
                    >
                      History
                    </button> */}
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
      />
    </div>
  );
};

export default ManageTeams;