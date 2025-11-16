import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  MapPin,
  Clock,
  User,
  Truck,
  Building,
  Navigation,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Info,
  Edit,
} from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import ConfirmationModal from "../modals/ConfirmationModal";
import { API_CLIENT } from "../../Api/API_Client";
import BookingCard from "../ui/BookingCard";
import { logDebug, logError } from "../../utils/logger";

const SavedRouteCard = ({
  route,
  isSelected,
  onRouteSelect,
  selectedBookings,
  onBookingSelect,
  OnOperation,
  onRouteUpdate, // New prop for handling route updates
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteRouteModal, setShowDeleteRouteModal] = useState(false);
  const [showDeleteBookingModal, setShowDeleteBookingModal] = useState(false);
  const [showUpdateRouteModal, setShowUpdateRouteModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  // Safe value renderer to prevent object rendering errors
  const renderSafeValue = (value, fallback = "N/A") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "object") {
      if (value.name) return value.name;
      return JSON.stringify(value);
    }
    return value;
  };

  // Check if route can be deleted
  const canDeleteRoute = () => {
    if (route.status?.toLowerCase() === "completed") {
      setAlertMessage("This route cannot be deleted as it has been completed.");
      return false;
    }

    if (route.driver?.name && route.driver.name !== "Not assigned") {
      setAlertMessage(
        "This route cannot be deleted as a driver has already been assigned. To override this restriction, please contact the vendor."
      );
      return false;
    }

    return true;
  };

  // Check if booking can be deleted from route
  const canDeleteBooking = (stop) => {
    if (route.status?.toLowerCase() === "completed") {
      setAlertMessage("Bookings cannot be removed from a completed route.");
      return false;
    }

    if (route.driver?.name && route.driver.name !== "Not assigned") {
      setAlertMessage(
        "Bookings cannot be removed as a driver has already been assigned to this route. To make changes, please contact the vendor."
      );
      return false;
    }

    return true;
  };

  const handleDeleteRouteClick = (e) => {
    if (!canDeleteRoute()) {
      setShowAlertModal(true);
      return;
    }

    setShowDeleteRouteModal(true);
  };

  const handleUpdateRouteClick = (e) => {
    // Check if there are selected bookings
    logDebug(" selectedBookings:", selectedBookings);
    if (!selectedBookings || selectedBookings.size === 0) {
      setAlertMessage(
        "Please select at least one booking to add to this route."
      );
      setShowAlertModal(true);
      return;
    }

    setShowUpdateRouteModal(true);
  };

  const handleBookingDetach = async (booking_id, stop, routeId) => {
    logDebug("Detaching booking:", booking_id, "from route:", routeId);

    try {
      await API_CLIENT.put(`/v1/routes/${routeId}`, {
        operation: "remove",
        booking_ids: [booking_id],
      });

      OnOperation();
    } catch (error) {
      logError("Failed to detach booking:", error);
      alert("Failed to detach booking. Please try again.");
    }
  };

  const confirmDeleteRoute = async () => {
    try {
      await API_CLIENT.delete(`/v1/routes/${route.route_id}`);
      OnOperation();
      setShowDeleteRouteModal(false);
    } catch (error) {
      console.error("Failed to delete route:", error);
      alert("Failed to delete route. Please try again.");
    }
  };

  const cancelDeleteRoute = () => {
    setShowDeleteRouteModal(false);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
    setAlertMessage("");
  };

  const handleRouteClick = (e) => {
    if (
      e.target.closest("button") ||
      e.target.closest('input[type="checkbox"]')
    ) {
      return;
    }
    onRouteSelect(route.route_id);
  };

  const handleBookingClick = (e, bookingId) => {
    if (e.target.closest("button")) {
      return;
    }
    onBookingSelect && onBookingSelect(bookingId);
  };

  const handleExpandClick = (e) => {
    setIsExpanded(!isExpanded);
  };

  // Helper function to display resource information
  const renderResourceInfo = (
    icon,
    value,
    label,
    fallback = "Not assigned"
  ) => {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        {icon}
        <span className="text-gray-600">{label}:</span>
        <span
          className={`font-medium ${value ? "text-gray-900" : "text-gray-400"}`}
        >
          {renderSafeValue(value, fallback)}
        </span>
      </div>
    );
  };

  // Helper function to display summary stats
  const renderSummaryStat = (icon, value, label, unit = "") => {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        {icon}
        <span className="text-gray-600">{label}:</span>
        <span className="font-medium text-gray-900">
          {renderSafeValue(value)}
          {unit}
        </span>
      </div>
    );
  };

  // Get status badge color and icon
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "ongoing":
        return {
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: <PlayCircle className="w-3 h-3" />,
        };
      case "completed":
        return {
          color: "bg-green-100 text-green-700 border-green-200",
          icon: <CheckCircle2 className="w-3 h-3" />,
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-700 border-red-200",
          icon: <AlertCircle className="w-3 h-3" />,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700 border-gray-200",
          icon: <AlertCircle className="w-3 h-3" />,
        };
    }
  };
  const confirmUpdateRoute = async () => {
    try {
      const bookingIdsArray = Array.from(selectedBookings);

      const updateData = {
        operation: "add",
        booking_ids: bookingIdsArray,
      };

      // Log the data in the requested format
      console.log("Update Route Data:", updateData);

      // Make the API call
      await API_CLIENT.put(`/v1/routes/${route.route_id}`, updateData);

      OnOperation();
      setShowUpdateRouteModal(false);

      // Call onRouteUpdate if provided
      if (onRouteUpdate) {
        onRouteUpdate(route);
      }
    } catch (error) {
      logError("Failed to update route:", error);
      alert("Failed to update route. Please try again.");
    }
  };

  const cancelUpdateRoute = () => {
    setShowUpdateRouteModal(false);
  };
  // Check if delete actions should be disabled
  const isDeleteDisabled =
    route.status?.toLowerCase() === "completed" ||
    (route.driver?.name && route.driver.name !== "Not assigned");

  const routeStatusInfo = getStatusInfo(route.status);

  return (
    <>
      <div
        className={`bg-white border rounded-lg transition-all cursor-pointer ${
          isSelected
            ? "border-purple-500 shadow-md bg-purple-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        } ${isDeleteDisabled ? "opacity-80" : ""}`}
        onClick={handleRouteClick}
      >
        {/* Route Header */}
        <div className="p-3">
          <div className="flex items-start gap-3">
            {/* Selection Indicator */}
            <div className="mt-1 w-4 h-4 flex items-center justify-center">
              {isSelected && (
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              )}
            </div>

            {/* Route Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {renderSafeValue(route.route_code)}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${routeStatusInfo.color}`}
                  >
                    {routeStatusInfo.icon}
                    {renderSafeValue(route.status)}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                    ID: {renderSafeValue(route.route_id)}
                  </span>

                  {/* Warning badges for restricted routes */}
                  {route.status?.toLowerCase() === "completed" && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded border bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Info className="w-3 h-3" />
                      Read Only
                    </span>
                  )}
                  {route.driver?.name &&
                    route.driver.name !== "Not assigned" &&
                    route.status?.toLowerCase() !== "completed" && (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded border bg-orange-100 text-orange-700 border-orange-200">
                        <User className="w-3 h-3" />
                        Driver Assigned
                      </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* Update Route Button */}
                  {onRouteUpdate && (
                    <ReusableButton
                      module="route"
                      action="update"
                      icon={Edit}
                      title="Update route details"
                      onClick={handleUpdateRouteClick}
                      size={16}
                      className="p-1.5 rounded transition-colors text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    />
                  )}

                  {/* Delete Route Button */}
                  <ReusableButton
                    module="route"
                    action="delete"
                    icon={Trash2}
                    title={
                      isDeleteDisabled
                        ? "Delete restricted - check route status or driver assignment"
                        : "Delete entire route"
                    }
                    onClick={handleDeleteRouteClick}
                    size={16}
                    className={`p-1.5 rounded transition-colors group ${
                      isDeleteDisabled
                        ? "text-gray-400 cursor-not-allowed hover:bg-gray-50"
                        : "text-red-500 hover:text-red-700 hover:bg-red-50"
                    }`}
                    disabled={isDeleteDisabled}
                  />

                  {/* Expand/Collapse Button */}
                  <ReusableButton
                    icon={isExpanded ? ChevronUp : ChevronDown}
                    title={isExpanded ? "Collapse" : "Expand"}
                    onClick={handleExpandClick}
                    size={16}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600"
                  />
                </div>
              </div>

              {/* Resource Information */}
              <div className="flex flex-wrap gap-3 mb-2">
                {renderResourceInfo(
                  <User className="w-3 h-3 text-purple-500" />,
                  route.driver?.name,
                  "Driver"
                )}
                {renderResourceInfo(
                  <Truck className="w-3 h-3 text-green-500" />,
                  route.vehicle?.rc_number,
                  "Vehicle"
                )}
                {renderResourceInfo(
                  <Building className="w-3 h-3 text-orange-500" />,
                  route.vendor?.name,
                  "Vendor"
                )}
              </div>

              {/* Route Summary */}
              {route.summary && (
                <div className="flex flex-wrap gap-3 mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                  {renderSummaryStat(
                    <Navigation className="w-3 h-3 text-green-500" />,
                    route.summary.total_distance_km,
                    "Distance",
                    " km"
                  )}
                  {renderSummaryStat(
                    <Clock className="w-3 h-3 text-blue-500" />,
                    route.summary.total_time_minutes,
                    "Time",
                    " min"
                  )}
                  <div className="flex items-center gap-1.5 text-xs">
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span className="text-gray-600">Stops:</span>
                    <span className="font-medium text-gray-900">
                      {route.stops?.length || 0}
                    </span>
                  </div>
                </div>
              )}

              {/* Preview when collapsed */}
              {!isExpanded && route.stops && (
                <div className="text-xs text-gray-600">
                  {route.stops.slice(0, 2).map((stop, i) => (
                    <span key={stop.booking_id}>
                      {renderSafeValue(stop.employee_code)}
                      {i < Math.min(1, route.stops.length - 1) && ", "}
                    </span>
                  ))}
                  {route.stops.length > 2 && ` +${route.stops.length - 2} more`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Stop List */}
        {isExpanded && route.stops && (
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <div className="space-y-2">
              {route.stops.map((stop, index) => (
                <BookingCard
                  key={stop.booking_id}
                  stop={stop}
                  index={index}
                  isSelected={selectedBookings?.has(stop.booking_id)}
                  isDeleteDisabled={isDeleteDisabled}
                  onBookingClick={handleBookingClick}
                  onRemoveFromRoute={(e, bookingId, stop) =>
                    handleBookingDetach(bookingId, stop, route.route_id)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Route Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteRouteModal}
        title="Delete Route"
        message="Are you sure you want to delete this entire route? This action cannot be undone."
        onConfirm={confirmDeleteRoute}
        onCancel={cancelDeleteRoute}
      />

      {/* Update Route Confirmation Modal */}
      <ConfirmationModal
        show={showUpdateRouteModal}
        title="Update Route"
        message={`Are you sure you want to add ${
          selectedBookings?.size || 0
        } booking${selectedBookings?.size !== 1 ? "s" : ""} to route ${
          route.route_code
        }?`}
        onConfirm={confirmUpdateRoute}
        onCancel={cancelUpdateRoute}
        confirmText="Add Bookings"
      />

      {/* Alert Modal for Restricted Actions */}
      <ConfirmationModal
        show={showAlertModal}
        title="Action Restricted"
        message={alertMessage}
        onConfirm={closeAlertModal}
        onCancel={closeAlertModal}
        confirmText="OK"
        showCancel={false}
      />
    </>
  );
};

export default SavedRouteCard;
