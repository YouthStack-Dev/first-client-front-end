import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, History, Trash2, UserX } from 'lucide-react';
import TeamForm from '../components/TeamForm';

const ManageTeams = () => {
  const navigate = useNavigate();
  const [searchBy, setSearchBy] = useState('employee');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);

  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Team Alpha',
      manager: 'Alice',
      active: 4,
      inactive: 1,
    },
    {
      id: 2,
      name: 'Team Beta',
      manager: 'Bob',
      active: 3,
      inactive: 2,
    },
  ]);

  const [formData, setFormData] = useState({
    teamName: '',
    teamManager1: '',
    teamManager2: '',
    teamManager3: '',
    shiftCategory: 'Default',
    description: '',
    notification: '',
  });

  const toggleSelect = (id) => {
    setSelectedTeams((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleActiveClick = (teamId) => {
    navigate(`/teams/${teamId}/employees`);
  };

  const handleEdit = (team) => {
    setEditingTeamId(team.id);
    setFormData({
      teamName: team.name,
      teamManager1: team.manager,
      teamManager2: '',
      teamManager3: '',
      shiftCategory: 'Default',
      description: '',
      notification: '',
    });
    setShowModal(true);
  };

  const handleDelete = (teamId) => {
    setTeams((prev) => prev.filter((team) => team.id !== teamId));
    setSelectedTeams((prev) => prev.filter((id) => id !== teamId));
  };

  const handleHistory = (team) => {
    console.log(`Showing history for ${team.name}`);
    alert(`History for ${team.name} (placeholder)`);
  };

  const handleModalSubmit = (submittedData) => {
    if (editingTeamId) {
      // Edit existing team
      setTeams((prev) =>
        prev.map((team) =>
          team.id === editingTeamId
            ? { ...team, name: submittedData.teamName, manager: submittedData.managers[0] || '' }
            : team
        )
      );
    } else {
      // Add new team
      const newTeam = {
        id: Date.now(),
        name: submittedData.teamName,
        manager: submittedData.managers[0] || '',
        active: 0,
        inactive: 0,
      };
      setTeams((prev) => [...prev, newTeam]);
    }

    setShowModal(false);
    setEditingTeamId(null);
    setFormData({
      teamName: '',
      teamManager1: '',
      teamManager2: '',
      teamManager3: '',
      shiftCategory: 'Default',
      description: '',
      notification: '',
    });
  };

  return (
    <div className="p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingTeamId(null);
                setFormData({
                  teamName: '',
                  teamManager1: '',
                  teamManager2: '',
                  teamManager3: '',
                  shiftCategory: 'Default',
                  description: '',
                  notification: '',
                });
                setShowModal(true);
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
          </div>

          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm">
            <Download size={16} /> Download Report
          </button>

          <button className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm">
            <History size={16} /> View History
          </button>

          {selectedTeams.length > 0 && (
            <button
              onClick={() => {
                setTeams((prev) =>
                  prev.filter((team) => !selectedTeams.includes(team.id))
                );
                setSelectedTeams([]);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm"
            >
              <Trash2 size={16} /> Delete Selected
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="border px-2 py-1 text-sm rounded"
          >
            <option value="employee">Employee</option>
            <option value="team">Team</option>
          </select>
          <input
            type="text"
            placeholder={`Search by ${searchBy}`}
            className="border px-2 py-1 text-sm rounded"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow max-h-[500px] overflow-y-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left">Select</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Team Manager</th>
              <th className="px-3 py-2 text-left">Active</th>
              <th className="px-3 py-2 text-left">Inactive</th>
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
                    onChange={() => toggleSelect(team.id)}
                  />
                </td>
                <td className="px-3 py-2">{team.name}</td>
                <td className="px-3 py-2">{team.manager}</td>
                <td className="px-3 py-2">
                  <button
                    className="bg-green-100 text-green-800 px-2 py-0.5 rounded"
                    onClick={() => handleActiveClick(team.id)}
                  >
                    {team.active}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <button className="bg-red-100 text-red-800 px-2 py-0.5 rounded">
                    {team.inactive}
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
      </div>

      {/* Modal */}
      <TeamForm
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTeamId(null);
        }}
        onSubmit={handleModalSubmit}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
};

export default ManageTeams;
