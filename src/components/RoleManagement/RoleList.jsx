import React from 'react';
/** @typedef {import('./types').RoleListProps} RoleListProps */
import RoleCard from './RoleCard';

/**
 * Renders a list of roles using RoleCard components or a message if no roles exist.
 * @param {RoleListProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
function RoleList({ roles, onEdit, onDelete, onDuplicate }) {
  if (roles.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No roles found. Create a new role to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {roles.map(role => (
        <RoleCard
          key={role.id}
          role={role}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}

export default RoleList;