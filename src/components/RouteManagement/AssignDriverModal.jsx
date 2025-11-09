// AssignDriverModal.jsx
import React, { useState, useMemo, useEffect } from "react";
import { X, Car, Check, Search, RefreshCw } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectAllVehicles } from "../../redux/features/manageVehicles/vehicleSelectors";
import { fetchVehiclesThunk } from "../../redux/features/manageVehicles/vehicleThunk";

const AssignDriverModal = ({
  isOpen,
  onClose,
  onAssign,
  selectedRoutesCount,
  routeIds,
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [search, setSearch] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const dispatch = useDispatch();

  const allVehicles = useSelector(selectAllVehicles);

  console.log("All vehicles in AssignDriverModal:", allVehicles);

  // Fetch vehicles if not already fetched
  useEffect(() => {
    if (isOpen && allVehicles.length === 0) {
      console.log("Fetching vehicles data...");
      setLocalLoading(true);
      dispatch(fetchVehiclesThunk())
        .unwrap()
        .finally(() => setLocalLoading(false));
    }
  }, [isOpen, dispatch, allVehicles.length]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setLocalLoading(true);
    try {
      await dispatch(fetchVehiclesThunk()).unwrap();
    } catch (error) {
      console.error("Failed to refresh vehicles:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Filter active vehicles and transform for display - FIXED DATA ACCESS
  const availableAssignments = useMemo(() => {
    return allVehicles
      .filter((vehicle) => vehicle.is_active) // Only show active vehicles
      .map((vehicle) => ({
        id: vehicle.vehicle_id || vehicle.vehicle_id, // Handle both possible property names
        vehicle_id: vehicle.vehicle_id || vehicle.vehicle_id, // Ensure vehicle_id is available
        vehicle_rc: vehicle.rc_number || vehicle.vehicle_rc || "N/A",
        driver_name: vehicle.driver_name || "Unassigned",
        status: vehicle.driver_id ? "Available" : "No Driver",
        vehicle_type:
          vehicle.vehicle_type_name || vehicle.vehicle_type || "Unknown Type",
        // Include original vehicle for reference
        originalVehicle: vehicle,
      }));
  }, [allVehicles]);

  // Filter by RC number
  const filteredAssignments = useMemo(() => {
    if (!search.trim()) return availableAssignments;

    const searchTerm = search.toLowerCase();
    return availableAssignments.filter(
      (assignment) =>
        assignment.vehicle_rc.toLowerCase().includes(searchTerm) ||
        (assignment.driver_name &&
          assignment.driver_name.toLowerCase().includes(searchTerm))
    );
  }, [search, availableAssignments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssignment) {
      alert("Please select a vehicle assignment");
      return;
    }

    const assignment = availableAssignments.find(
      (a) => a.vehicle_id === selectedAssignment // Use id for finding
    );

    if (!assignment) {
      alert("Selected assignment not found");
      return;
    }

    // Pass vehicle_id, driver_name, and rc_number to onAssign
    onAssign(assignment.vehicle_id);
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
      case "No Driver":
        return "text-yellow-600 bg-yellow-100";
      case "On Duty":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const isDataLoading = localLoading;
  const hasNoVehicles = availableAssignments.length === 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold">Assign Vehicle</h2>
              <p className="text-sm text-gray-600">
                {selectedRoutesCount} route
                {selectedRoutesCount !== 1 ? "s" : ""} selected
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-hidden flex-1 flex flex-col">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex-1 flex flex-col"
          >
            {/* Search Bar */}
            <div className="shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Vehicle RC Number
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by RC number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isDataLoading || hasNoVehicles}
                />
              </div>
            </div>

            {/* Refresh Button */}
            <div className="shrink-0 flex justify-end">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isDataLoading}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isDataLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {/* Loading State */}
            {isDataLoading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading vehicles...</p>
                </div>
              </div>
            )}

            {/* Empty States */}
            {!isDataLoading && hasNoVehicles && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Car className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-medium mb-2">
                    No Vehicles Available
                  </p>
                  <p className="text-sm">
                    {allVehicles.length === 0
                      ? "No vehicles found in the system."
                      : "No active vehicles with drivers available."}
                  </p>
                </div>
              </div>
            )}

            {/* Assignments List */}
            {!isDataLoading && !hasNoVehicles && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <label className="block text-sm font-medium text-gray-700">
                    Available Vehicles
                  </label>
                  <span className="text-xs text-gray-500">
                    {filteredAssignments.length} of{" "}
                    {availableAssignments.length} available
                  </span>
                </div>
                <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
                  <div className="overflow-y-auto flex-1 p-2">
                    {filteredAssignments.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No matching vehicles found</p>
                        <p className="text-sm mt-1">
                          Try adjusting your search terms
                        </p>
                      </div>
                    ) : (
                      filteredAssignments.map((assignment) => (
                        <div
                          key={assignment.vehicle_id} // Use id as key
                          className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-between mb-2 last:mb-0 ${
                            selectedAssignment === assignment.vehicle_id // Use id for selection
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          } ${
                            assignment.status !== "Available"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={
                            () =>
                              assignment.status === "Available" &&
                              setSelectedAssignment(assignment.vehicle_id) // Use id for selection
                          }
                        >
                          <div className="flex items-center gap-3">
                            <Car className="w-4 h-4 text-blue-500 shrink-0" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {assignment.vehicle_rc}
                              </div>
                              <div className="text-xs text-gray-500">
                                Driver: {assignment.driver_name} •{" "}
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
                            {selectedAssignment === assignment.vehicle_id && ( // Use id for selection
                              <Check className="w-4 h-4 text-blue-500 shrink-0" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Selection Summary */}
            {selectedAssignment && (
              <div className="p-3 bg-gray-50 rounded-lg border shrink-0">
                <h4 className="font-medium text-sm mb-2">Selected Vehicle:</h4>
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>
                      {availableAssignments.find(
                        (a) => a.vehicle_id === selectedAssignment // Use id for finding
                      )?.vehicle_rc || "N/A"}
                      {" - "}
                      {availableAssignments.find(
                        (a) => a.vehicle_id === selectedAssignment // Use id for finding
                      )?.driver_name || "No Driver"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isDataLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedAssignment || isDataLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isDataLoading ? (
                  "Loading..."
                ) : (
                  <>
                    Assign to {selectedRoutesCount} Route
                    {selectedRoutesCount !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignDriverModal;
