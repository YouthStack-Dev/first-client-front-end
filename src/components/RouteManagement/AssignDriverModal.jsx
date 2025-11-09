// AssignDriverModal.jsx
import React, { useState, useMemo } from "react";
import { X, Car, Check, Search } from "lucide-react";

const AssignDriverModal = ({
  isOpen,
  onClose,
  onAssign,
  selectedRoutesCount,
  routeIds,
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [search, setSearch] = useState("");

  // Combined data with vehicle and driver assigned together
  const availableAssignments = [
    {
      id: "AS001",
      vehicle_rc: "KA01AB1234",
      driver_name: "Rajesh Kumar",
      status: "Available",
      vehicle_type: "SUV",
    },
    {
      id: "AS002",
      vehicle_rc: "KA01CD5678",
      driver_name: "Suresh Nair",
      status: "Available",
      vehicle_type: "Sedan",
    },
    {
      id: "AS003",
      vehicle_rc: "KA01EF9012",
      driver_name: "Anil Joshi",
      status: "On Duty",
      vehicle_type: "MPV",
    },
    {
      id: "AS004",
      vehicle_rc: "KA01GH3456",
      driver_name: "Mohammed Khan",
      status: "Available",
      vehicle_type: "SUV",
    },
    {
      id: "AS005",
      vehicle_rc: "KA01IJ7890",
      driver_name: "Vikram Singh",
      status: "Available",
      vehicle_type: "Sedan",
    },
  ];

  // Filter by vehicle number or driver name
  const filteredAssignments = useMemo(() => {
    return availableAssignments.filter(
      (assignment) =>
        assignment.vehicle_rc.toLowerCase().includes(search.toLowerCase()) ||
        assignment.driver_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssignment) {
      alert("Please select a driver-vehicle assignment");
      return;
    }

    const assignment = availableAssignments.find(
      (a) => a.id === selectedAssignment
    );
    onAssign(assignment.driver_name, assignment.vehicle_rc);
    setSelectedAssignment("");
    setSearch("");
  };

  const handleClose = () => {
    setSelectedAssignment("");
    setSearch("");
    onClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "text-green-600 bg-green-100";
      case "On Duty":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Assign Vehicle & Driver</h2>
            <p className="text-sm text-gray-600">
              {selectedRoutesCount} route{selectedRoutesCount !== 1 ? "s" : ""}{" "}
              selected
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Vehicle or Driver
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by vehicle number or driver name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Assignments List */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Assignments
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                {filteredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                      selectedAssignment === assignment.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${
                      assignment.status !== "Available"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() =>
                      assignment.status === "Available" &&
                      setSelectedAssignment(assignment.id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Car className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {assignment.vehicle_rc} ({assignment.driver_name})
                        </div>
                        <div className="text-xs text-gray-500">
                          {assignment.vehicle_type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusColor(
                          assignment.status
                        )}`}
                      >
                        {assignment.status}
                      </span>
                      {selectedAssignment === assignment.id && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection Summary */}
            {selectedAssignment && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-sm mb-2">
                  Selected Assignment:
                </h4>
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-500" />
                    <span>
                      {
                        availableAssignments.find(
                          (a) => a.id === selectedAssignment
                        )?.vehicle_rc
                      }
                      (
                      {
                        availableAssignments.find(
                          (a) => a.id === selectedAssignment
                        )?.driver_name
                      }
                      )
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedAssignment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Assign to {selectedRoutesCount} Route
                {selectedRoutesCount !== 1 ? "s" : ""}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignDriverModal;
