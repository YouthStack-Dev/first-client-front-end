// components/AlertConfigTable.js
import React from "react";
import { STATIC_TEAMS } from "../modals/alertConfig";

const AlertConfigTable = ({ configs }) => {
  const getTeamName = (teamId) => {
    if (teamId === null) return "All Teams (Tenant)";
    const team = STATIC_TEAMS.find((t) => t.id === teamId);
    return team ? team.name : `Team ${teamId}`;
  };

  const getStatusBadge = (isActive) => (
    <span
      className={`px-2 py-1 rounded-full text-xs ${
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );

  const getScopeBadge = (teamId) => (
    <span
      className={`px-2 py-1 rounded-full text-xs ${
        teamId === null
          ? "bg-blue-100 text-blue-800"
          : "bg-purple-100 text-purple-800"
      }`}
    >
      {teamId === null ? "Tenant" : "Team"}
    </span>
  );

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Scope
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Team
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Alert Types
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {configs.map((config) => (
            <tr key={config.config_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {config.config_name}
                </div>
                <div className="text-sm text-gray-500">
                  {config.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getScopeBadge(config.team_id)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getTeamName(config.team_id)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {config.applicable_alert_types.map((type, index) => (
                    <span
                      key={index}
                      className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(config.is_active || true)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {config.priority}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {config.created_at
                  ? new Date(config.created_at).toLocaleDateString()
                  : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-3">
                  Edit
                </button>
                <button className="text-gray-600 hover:text-gray-900">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlertConfigTable;
