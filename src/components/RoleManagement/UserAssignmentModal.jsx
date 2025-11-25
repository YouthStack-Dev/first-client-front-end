import React, { useState, useEffect } from "react";
import { Search, X, User, Check } from "lucide-react";

const UserAssignmentModal = ({
  role,
  isOpen,
  onClose,
  onAssign,
  employees,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedUsers([]);
      setFilteredEmployees(employees);
    }
  }, [isOpen, employees]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const toggleUserSelection = (user) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleAssign = async () => {
    const userIds = selectedUsers.map((user) => user.id);
    await onAssign(role.id, userIds);
    onClose();
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
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

        {/* Search - Fixed */}
        <div className="p-6 border-b flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users List - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredEmployees.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No users found</div>
          ) : (
            <ul className="divide-y">
              {filteredEmployees.map((user) => (
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
                        <p className="text-xs text-gray-400">
                          Employee ID: {user.employeeId}
                        </p>
                      </div>
                    </div>
                    {selectedUsers.some((u) => u.id === user.id) && (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-between items-center p-6 border-t flex-shrink-0 bg-white">
          <div className="text-sm text-gray-500">
            {selectedUsers.length} user(s) selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={selectedUsers.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Assign Selected Users ({selectedUsers.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAssignmentModal;
