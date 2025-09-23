import React, { useState, useEffect } from "react";
import { Search, X, User, Check } from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";
import { logDebug } from "../../utils/logger";

const UserAssignmentModal = ({ role, isOpen, onClose, onAssign }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    if (searchTerm.length < 3) {
      setUsers([]); // clear list if <3 chars
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchUsers(searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, isOpen]);

  const fetchUsers = async (query) => {
    setLoading(true);
    try {
      const response = await API_CLIENT.get(
        `api/users/employees/search`,
        {
          params: { q: query, isActive: true },
        }
      );

      if (response.data.success) {
        setUsers(response.data.employees || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleAssign = async () => {
    setAssigning(true);
    try {
      // Extract userIds from selected users
      const userIds = selectedUsers.map(user => user.id);
      logDebug("User data to assign:", userIds);
      
      // Call the onAssign callback with the user IDs
      // Let the parent component handle the API call
      if (onAssign) {
        await onAssign(role.id, userIds);
      }
      
      onClose();
    } catch (error) {
      console.error("Error in assignment:", error);
      alert("Error assigning users. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold">
              Assign Users to {role.name}
            </h3>
            <p className="text-sm text-gray-500">
              Select users to assign this role
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users (min 3 chars)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm.length < 3 ? "Type at least 3 characters to search" : "No users found"}
            </div>
          ) : (
            <ul className="divide-y">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleUserSelection(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">ID: {user.id}</p>
                      </div>
                    </div>
                    {selectedUsers.some((u) => u.id === user.id) && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={assigning}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={selectedUsers.length === 0 || assigning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {assigning ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Assigning...
              </>
            ) : (
              `Assign Selected Users (${selectedUsers.length})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAssignmentModal;