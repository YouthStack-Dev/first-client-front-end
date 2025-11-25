import React from "react";
/** @typedef {import('./types').RoleCardProps} RoleCardProps */
import { Eye, Edit, Trash2, Users, UserPlus } from "lucide-react";

/**
 * Renders a simple role card with header, description, and color-coded footer actions.
 * @param {RoleCardProps} props
 * @returns {JSX.Element}
 */
function RoleCard({
  role,
  onEdit,
  onDelete,
  onView,
  onAssignUsers,
  onViewAssignedUsers,
}) {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors bg-white shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {role.name}
          </h3>
          <p className="text-sm text-gray-500">
            {role.description || "No description"}
          </p>

          {/* Role Metadata */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-xs text-gray-500">
              <span className="font-medium">Created:</span>
              <span className="ml-1">{formatDate(role.createdAt)}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <span className="font-medium">Updated:</span>
              <span className="ml-1">{formatDate(role.updatedAt)}</span>
            </div>
            {role.isSystemLevel && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                System Role
              </span>
            )}
            {!role.isAssignable && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                Not Assignable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto">
        <div className="flex items-center space-x-2">
          {/* View Assigned Users Button */}
          <button
            onClick={() => onViewAssignedUsers(role)}
            className="flex items-center justify-center p-2 rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
            title="View assigned users"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Assign Users Button - Only show if role is assignable */}
          {role.isAssignable && (
            <button
              onClick={() => onAssignUsers(role)}
              className="flex items-center justify-center p-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
              title="Assign users to this role"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons - Hide for system-level roles */}
        {!role.isSystemLevel && (
          <div className="flex items-center space-x-2">
            {/* View Button */}
            <button
              onClick={() => onView(role)}
              className="flex items-center justify-center p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="View details"
            >
              <Eye className="w-3 h-3" />
            </button>

            {/* Edit Button */}
            <button
              onClick={() => onEdit(role)}
              className="flex items-center justify-center p-2 rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
              title="Edit role"
            >
              <Edit className="w-3 h-3" />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => onDelete(role)}
              className="flex items-center justify-center p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              title="Delete role"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoleCard;
