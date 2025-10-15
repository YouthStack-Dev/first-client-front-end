// components/EmployeeList.jsx
import { useEffect, useState } from "react";
import { Edit, Eye, HistoryIcon, Calendar, BookOpen } from "lucide-react";
import { logDebug } from "../../utils/logger";
import ConfirmationModal from "../modals/ConfirmationModal";
import WeekOffModal from "./WeekOffModal";
import ReusableButton from "../ui/ReusableButton"; // Import the reusable button component
import ReusableToggleButton from "../ui/ReusableToggleButton";
import { useNavigate } from "react-router-dom";

const EmployeeList = ({
  employees = [],
  loading = false,
  error = "",
  selectedEmployeeIds = [],
  onCheckboxChange,
  onRowClick,
  onEdit,
  onView,
  onStatusChange,
  onHistory,
  onWeekOffUpdate,
  hasActiveSearch = false,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Week off modal states
  const [showWeekOffModal, setShowWeekOffModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();

  const handleStatusToggle = (employeeId, currentis_active) => {
    logDebug("handleStatusToggle employeeId is ", employeeId);
    const newis_active = !currentis_active;
    const employee = employees.find((emp) => emp.employee_id === employeeId);
    logDebug("handleStatusToggle ", employee);
    setPendingStatusChange({
      employeeId,
      currentis_active,
      newis_active,
      name: employee?.name || "this employee",
    });
    setShowConfirmation(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    setIsProcessing(true);
    try {
      await onStatusChange?.(
        pendingStatusChange.employeeId,
        pendingStatusChange.newis_active
      );
      setShowConfirmation(false);
      setPendingStatusChange(null);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelStatusChange = () => {
    setShowConfirmation(false);
    setPendingStatusChange(null);
  };

  // Week off handlers
  const handleWeekOffClick = (employee) => {
    logDebug("Opening week off modal for employee:", employee);
    setSelectedEmployee(employee);
    setShowWeekOffModal(true);
  };

  const handleWeekOffUpdate = async (updateData) => {
    setIsProcessing(true);
    try {
      // Call the parent component's handler if provided
      if (onWeekOffUpdate) {
        await onWeekOffUpdate(updateData);
      } else {
        // Fallback simulation
        logDebug("Week off update data:", updateData);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(
          `Week off updated for ${updateData.employeeName} at ${updateData.updateLevel} level:`,
          updateData.weekOffData
        );
      }

      setShowWeekOffModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Failed to update week off:", error);
      throw error; // Re-throw to let the modal handle the error state
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseWeekOffModal = () => {
    setShowWeekOffModal(false);
    setSelectedEmployee(null);
  };

  // Booking handler
  const handleBookingClick = (employee) => {
    navigate(`/employee/${employee.employee_id}/bookings`, {
      state: { employee },
    });
  };

  logDebug("pendingStatusChange is ", pendingStatusChange);

  return (
    <div className="space-y-4">
      {/* Status Change Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmation}
        title="Confirm Status Change"
        message={
          pendingStatusChange
            ? `Are you sure you want to ${
                pendingStatusChange.newis_active ? "activate" : "deactivate"
              } ${pendingStatusChange.name}?`
            : ""
        }
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
      />

      {/* Reusable Week Off Modal */}
      <WeekOffModal
        show={showWeekOffModal}
        employee={selectedEmployee}
        onUpdate={handleWeekOffUpdate}
        onClose={handleCloseWeekOffModal}
        isLoading={isProcessing}
      />

      {/* Employee Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
        <table className="w-full text-left border-collapse min-w-[900px] text-sm">
          <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
            <tr>
              <th className="p-3 border-b border-r border-gray-200">
                <input type="checkbox" disabled className="w-3.5 h-3.5" />
              </th>
              <th className="p-3 border-b border-r border-gray-200">Name</th>
              <th className="p-3 border-b border-r border-gray-200">
                Employee Code
              </th>
              <th className="p-3 border-b border-r border-gray-200">Email</th>
              <th className="p-3 border-b border-r border-gray-200">
                Mobile Number
              </th>
              <th className="p-3 border-b border-r border-gray-200">Gender</th>
              <th className="p-3 border-b border-r border-gray-200">Status</th>
              <th className="p-3 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                    <span className="text-xs">Loading employees...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-red-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-8 h-8 text-red-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs">
                      Failed to load employees: {error}
                    </span>
                  </div>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="text-xs">
                      {hasActiveSearch
                        ? "No employees match your search."
                        : "No employees found."}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr
                  key={employee.employee_id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={(e) => onRowClick?.(employee, e)}
                >
                  <td
                    className="p-3 border-r border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.includes(
                        employee.employee_id
                      )}
                      onChange={(e) => {
                        logDebug(
                          " this is the employee code and id ",
                          employee.employee_code,
                          employee.employee_id
                        );
                        e.stopPropagation();
                        onCheckboxChange?.(employee.employee_id);
                      }}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3 border-r border-gray-100 font-medium text-gray-900">
                    {employee.name}
                  </td>
                  <td className="p-3 border-r border-gray-100 text-gray-600">
                    {employee.employee_code}
                  </td>
                  <td className="p-3 border-r border-gray-100 text-gray-600">
                    {employee.email}
                  </td>
                  <td className="p-3 border-r border-gray-100 text-gray-600">
                    {employee.phone}
                  </td>
                  <td className="p-3 border-r border-gray-100">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.gender?.toLowerCase() === "female"
                          ? "bg-pink-100 text-pink-700 border border-pink-200"
                          : employee.gender?.toLowerCase() === "male"
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {employee.gender || "Not specified"}
                    </span>
                  </td>
                  <td
                    className="p-3 border-r border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ReusableToggleButton
                      module="employee"
                      action="update"
                      isChecked={employee.is_active === true}
                      onToggle={(newStatus) => {
                        handleStatusToggle(employee.employee_id, !newStatus);
                      }}
                      labels={{ on: "Active", off: "Inactive" }}
                      loading={
                        isProcessing &&
                        pendingStatusChange?.employeeId === employee.employee_id
                      }
                      disabled={isProcessing}
                      size="default"
                    />
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center space-x-1">
                      {/* View Button */}
                      {/* <ReusableButton
                        module="employee"
                        action="read"
                        icon={Eye}
                        title="View Details"
                        onClick={() => {
                          onView?.(employee);
                        }}
                        className="text-sidebar-primary-600 hover:text-sidebar-primary-700 transition-colors"
                        iconSize={14}
                      /> */}

                      {/* Edit Button */}
                      <ReusableButton
                        module="employee"
                        action="update"
                        icon={Edit}
                        title="Edit Employee"
                        onClick={() => {
                          onEdit?.(employee);
                        }}
                        className="text-sidebar-primary-600 hover:text-sidebar-primary-700 transition-colors"
                        iconSize={14}
                      />

                      {/* History Button */}
                      <ReusableButton
                        module="employee"
                        action="read"
                        icon={HistoryIcon}
                        title="View History"
                        onClick={() => {
                          onHistory?.(employee);
                        }}
                        className="text-sidebar-primary-600 hover:text-sidebar-primary-700 transition-colors"
                        iconSize={14}
                      />

                      {/* Week Off Button */}
                      <ReusableButton
                        module="weekoff-config"
                        action="read"
                        icon={Calendar}
                        title="Set Week Off"
                        onClick={() => {
                          handleWeekOffClick(employee);
                        }}
                        className="text-sidebar-primary-600 hover:text-sidebar-primary-700 transition-colors"
                        iconSize={14}
                      />

                      {/* Booking Button - New */}
                      <ReusableButton
                        module="booking"
                        action="create"
                        icon={BookOpen}
                        title="Create Booking"
                        onClick={() => {
                          handleBookingClick(employee);
                        }}
                        className="text-sidebar-primary-600 hover:text-sidebar-primary-700 transition-colors"
                        iconSize={14}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;
