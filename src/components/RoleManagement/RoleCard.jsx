import React from "react";
import { Eye, Edit, Trash2, Users } from "lucide-react";
import ReusableButton from "../ui/ReusableButton";

function RoleCard({ role, onEdit, onDelete, onView }) {
  // Format date for display - handle API date format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    // Handle both "2025-12-05T16:20:21.863074" format and others
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Try to parse as ISO string without microseconds
      const isoString = dateString.split(".")[0] + "Z";
      const fallbackDate = new Date(isoString);
      if (!isNaN(fallbackDate.getTime())) {
        return fallbackDate.toLocaleDateString();
      }
      return "N/A";
    }

    return date.toLocaleDateString();
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
              <span className="ml-1">{formatDate(role.created_at)}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <span className="font-medium">Updated:</span>
              <span className="ml-1">{formatDate(role.updated_at)}</span>
            </div>

            {/* Only show system role badge */}
            {role.is_system_role && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                System Role
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto">
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* View Button - Always show view */}
          <ReusableButton
            module="role"
            action="read"
            buttonName=""
            icon={Eye}
            title="View details"
            onClick={() => onView(role)}
            className="flex items-center justify-center p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          />

          {/* Edit Button - Only show if NOT system role */}
          {!role.is_system_role && (
            <ReusableButton
              module="role"
              action="update"
              buttonName=""
              icon={Edit}
              title="Edit role"
              onClick={() => onEdit(role)}
              className="flex items-center justify-center p-2 rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
            />
          )}

          {/* Delete Button - Only show if NOT system role */}
          {!role.is_system_role && (
            <ReusableButton
              module="role"
              action="delete"
              buttonName=""
              icon={Trash2}
              title="Delete role"
              onClick={() => onDelete(role)}
              className="flex items-center justify-center p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default RoleCard;
