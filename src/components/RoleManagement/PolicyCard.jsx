import React from "react";
import { Edit, Trash2, FileText } from "lucide-react";

export const PolicyTable = ({
  policies,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading policies...</p>
        </div>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <div className="text-center py-12 text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No policies
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new policy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Policy ID
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {policies.map((policy) => (
              <PolicyTableRow
                key={policy.policy_id}
                policy={policy}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const PolicyTableRow = ({ policy, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="py-4 px-6 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <FileText className="text-blue-600" size={16} />
          </div>
          <span className="ml-3 inline-flex items-center text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
            {policy.id || policy.policy_id}
          </span>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200">
          {policy.name}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="text-sm text-gray-600 max-w-md truncate">
          {policy.description}
        </div>
      </td>
      <td className="py-4 px-6 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(policy)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            title="Edit Policy"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(policy)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            title="Delete Policy"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};
