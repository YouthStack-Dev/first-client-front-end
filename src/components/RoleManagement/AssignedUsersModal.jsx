import React, { useState, useEffect } from 'react';
import { API_CLIENT } from '../../Api/API_Client';

export const AssignedUsersModal = ({ role, isOpen, onClose }) => {

  console.log(" this is the selected role " ,role);
  
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && role) {
      fetchAssignedUsers();
    }
  }, [isOpen, role]);

  const fetchAssignedUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API_CLIENT.get(`api/roles/${role.id}/users`);
      // Extract users from the response data
      setAssignedUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching assigned users:', err);
      setError('Failed to load assigned users');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    // try {
    //   await API_CLIENT.delete(`/api/roles/${role.id}/remove-user/${userId}`);
    //   // Refresh the list after successful removal
    //   fetchAssignedUsers();
    // } catch (err) {
    //   console.error('Error removing user:', err);
    //   setError('Failed to remove user');
    // }

    alert(" This Logic has to be implimented ")
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Users assigned to {role.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-gray-500">Loading users...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : assignedUsers.length === 0 ? (
            <p className="text-gray-500">No users assigned to this role.</p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">Total: {assignedUsers.length} user(s)</p>
              <ul className="space-y-2">
                {assignedUsers.map(user => (
                  <li key={user.userId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">Phone: {user.phone || 'N/A'}</p>
                    </div>
                    {/* Hide Remove button for system-level roles */}
                    {!role.isSystemLevel && (
                      <button 
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1 bg-red-50 rounded"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};