import React, { useState } from 'react';
/** @typedef {import('./types').RoleCardProps} RoleCardProps */
import { Edit, Trash2, Copy, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { getPermissionPercentage, getModulePermissionStatus } from './utils';
import ConfirmDialog from './ConfirmDialog';

/**
 * Renders a card displaying role details with expandable permissions and action buttons.
 * @param {RoleCardProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function RoleCard({ role, onEdit, onDelete, onDuplicate }) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const permissionPercentage = getPermissionPercentage(role.permissions);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(role.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{role.name}</h3>
              <p className="text-sm text-gray-500">{role.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(role)}
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="Edit role"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDuplicate(role)}
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              aria-label="Duplicate role"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              aria-label="Delete role"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <div className="flex-1">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  permissionPercentage > 66 
                    ? 'bg-indigo-600' 
                    : permissionPercentage > 33 
                    ? 'bg-amber-500' 
                    : 'bg-rose-500'
                }`}
                style={{ width: `${permissionPercentage}%` }}
              />
            </div>
          </div>
          <span className="ml-2 text-xs font-medium text-gray-500">
            {permissionPercentage}% Access
          </span>
        </div>

        <button
          onClick={toggleExpand}
          className="mt-3 w-full flex items-center justify-center p-1.5 text-sm text-gray-500 hover:text-indigo-600 rounded transition-colors"
        >
          {expanded ? (
            <>
              <span className="mr-1">Hide details</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span className="mr-1">Show details</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          {Object.entries(role.permissions).map(([module, permissions]) => {
            const status = getModulePermissionStatus(role.permissions, module);
            return (
              <div key={module} className="py-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{module}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    status === 'all' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : status === 'some' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {status === 'all' 
                      ? 'Full access' 
                      : status === 'some' 
                      ? 'Partial access' 
                      : 'No access'}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {Object.entries(permissions).map(([action, enabled]) => (
                    <span
                      key={action}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        enabled 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default RoleCard;