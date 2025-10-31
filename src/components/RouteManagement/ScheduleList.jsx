import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Bookmark,
  Calendar,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ScheduleList = ({
  selectedDate,
  shiftBookings = [],
  totalLogin = 0,
  totalLogout = 0,
  selectedOption,
  setSelectedOption,
  shiftOptions = [],
  handleShiftOption,
  handleButtonClick,
  handleRoutingView,
  getVendorCount = () => 0,
  getVehicleCount = () => 0,
  selectedShift,
  onViewSuggestions,
  onSaveRoute,
  onPendingRouteBookings,
  isLoading = false,
  emptyMessage = "No shifts available for selected date",
}) => {
  const navigate = useNavigate();

  // Safe data handling
  const safeShiftBookings = Array.isArray(shiftBookings) ? shiftBookings : [];
  const safeShiftOptions = Array.isArray(shiftOptions) ? shiftOptions : [];

  // Helper function to get shift display name
  const getShiftDisplayName = (shift) => {
    return `${shift.shift_code || "N/A"} (${shift.log_type || "N/A"})`;
  };

  // Helper function to get shift time display
  const getShiftTimeDisplay = (shift) => {
    return shift.shift_time || shift.shift_code || "Shift time not available";
  };

  // Helper function to check if shift has routes (for button text)
  const hasRoutes = (shift) => {
    return (
      shift.routes && Array.isArray(shift.routes) && shift.routes.length > 0
    );
  };

  // Function to handle routing view button click (opens in new tab)
  const handleRoutingButtonClick = (shift, event) => {
    event.stopPropagation();
    if (handleRoutingView) {
      handleRoutingView(shift);
    }
  };

  // Function to handle schedule button click (opens in new tab)
  const handleScheduleButtonClick = (shift, event) => {
    event.stopPropagation();
    if (handleButtonClick) {
      handleButtonClick(shift);
    }
  };

  // Function to handle suggestions button click
  const handleSuggestionsClick = (shift, event) => {
    event.stopPropagation();
    if (onViewSuggestions) {
      onViewSuggestions(shift);
    } else {
      // Fallback navigation
      const shiftName = encodeURIComponent(shift.shift_id || "unknown");
      const routePath = `/shift/${shiftName}/${selectedDate}/suggestions-route`;
      window.open(`${window.location.origin}${routePath}`, "_blank")?.focus();
    }
  };

  // Function to handle save route button click
  const handleSaveRouteClick = (shift, event) => {
    event.stopPropagation();
    if (onSaveRoute) {
      onSaveRoute(shift);
    } else {
      // Fallback navigation
      const shiftName = encodeURIComponent(shift.shift_id || "unknown");
      const routePath = `/shift/${shiftName}/${selectedDate}/saved-routes`;
      window.open(`${window.location.origin}${routePath}`, "_blank")?.focus();
    }
  };

  // Function to handle pending route bookings button click
  const handlePendingRouteBookingsClick = (shift, event) => {
    event.stopPropagation();
    if (onPendingRouteBookings) {
      onPendingRouteBookings(shift);
    } else {
      // Fallback navigation
      const shiftName = encodeURIComponent(shift.shift_code || "unknown");
      const routePath = `/shift/${shiftName}/pending-routes`;
      window.open(`${window.location.origin}${routePath}`, "_blank")?.focus();
    }
  };

  // Calculate totals safely
  const totalEmployees = safeShiftBookings.reduce(
    (sum, shift) =>
      sum + (Array.isArray(shift.bookings) ? shift.bookings.length : 0),
    0
  );

  const totalVendors = safeShiftBookings.reduce(
    (sum, shift) => sum + getVendorCount(shift.routes || []),
    0
  );

  const totalVehicles = safeShiftBookings.reduce(
    (sum, shift) => sum + getVehicleCount(shift.routes || []),
    0
  );

  const totalRoutes = safeShiftBookings.reduce(
    (sum, shift) =>
      sum + (Array.isArray(shift.routes) ? shift.routes.length : 0),
    0
  );

  // Keyboard shortcuts handler
  React.useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "r":
            event.preventDefault();
            // Refresh data
            break;
          case "s":
            event.preventDefault();
            // Quick save
            break;
          case "f":
            event.preventDefault();
            // Focus search/filter
            document.querySelector('input[type="search"]')?.focus();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-gray-600">Loading shifts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Enhanced Actions Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search shifts..."
              className="pl-10 pr-4 py-2 border rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedOption}
              onChange={(e) =>
                setSelectedOption && setSelectedOption(e.target.value)
              }
              className="pl-10 pr-8 py-2 border rounded-lg text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              disabled={safeShiftOptions.length === 0}
            >
              {safeShiftOptions.length > 0 ? (
                safeShiftOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                ))
              ) : (
                <option value="">No options</option>
              )}
            </select>
          </div>

          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
            onClick={() =>
              handleShiftOption &&
              handleShiftOption(selectedOption, selectedShift)
            }
            disabled={
              !selectedShift ||
              selectedOption === "Select option" ||
              safeShiftOptions.length === 0
            }
          >
            <RefreshCw className="w-4 h-4" />
            GO
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={safeShiftBookings.length === 0}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:bg-green-300 disabled:cursor-not-allowed"
            title="Ctrl+S to save"
            disabled={safeShiftBookings.length === 0}
          >
            <Bookmark className="w-4 h-4" />
            Save View
          </button>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 text-[13px] text-black sticky top-0">
            <tr>
              {[
                "Shift Time (Type)",
                "Employees (Routes)",
                "Vehicles/Vendors/Routes",
                "Suggestions",
                "Saved Routes",
                "Pending Route Bookings",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-medium uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Total Row - Only show if there are shifts */}
            {safeShiftBookings.length > 0 && (
              <tr className="bg-gray-50 font-semibold border-t-2 border-gray-300">
                <td className="px-4 py-3">
                  Total - Login: {totalLogin}, Logout: {totalLogout}
                </td>
                <td className="px-4 py-3">{totalEmployees} Employees</td>
                <td className="px-4 py-3">
                  {`${totalVendors} Vendors / ${totalVehicles} Vehicles / ${totalRoutes} Routes`}
                </td>
                <td className="px-4 py-3 text-center">-</td>
                <td className="px-4 py-3 text-center">-</td>
                <td className="px-4 py-3 text-center">-</td>
              </tr>
            )}

            {safeShiftBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-12 h-12 text-gray-300" />
                    <span className="text-lg font-medium">{emptyMessage}</span>
                    <span className="text-sm text-gray-400 max-w-md">
                      No shift data available for the selected criteria. Try
                      selecting a different date or check your filters.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              safeShiftBookings.map((shift, idx) => (
                <tr
                  key={shift.shift_id || idx}
                  className={`
                    ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} 
                    hover:bg-blue-50 transition-colors group
                  `}
                >
                  {/* Shift Time (Type) */}
                  <td className="px-4 py-3 flex items-center">
                    {shift.log_type === "IN" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {getShiftTimeDisplay(shift)}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {shift.log_type === "IN"
                          ? "Login Shift"
                          : "Logout Shift"}
                      </div>
                    </div>
                  </td>

                  {/* Employees (Routes) */}
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => handleScheduleButtonClick(shift, e)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium hover:opacity-90 transition ${
                        hasRoutes(shift)
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                      title="View employee schedule"
                      disabled={!handleButtonClick}
                    >
                      <Eye className="w-3 h-3" />
                      {Array.isArray(shift.bookings)
                        ? shift.bookings.length
                        : 0}
                    </button>
                  </td>

                  {/* Vehicles/Vendors/Routes */}
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => handleRoutingButtonClick(shift, e)}
                      className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium transition ${
                        hasRoutes(shift)
                          ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                          : "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                      }`}
                      disabled={!hasRoutes(shift) || !handleRoutingView}
                      title={
                        hasRoutes(shift)
                          ? "View routing details"
                          : "No routes available"
                      }
                    >
                      <MapPin className="w-3 h-3" />
                      {`${getVendorCount(shift.routes || [])}/${getVehicleCount(
                        shift.routes || []
                      )}/${
                        Array.isArray(shift.routes) ? shift.routes.length : 0
                      }`}
                    </button>
                  </td>

                  {/* Suggestions Column */}
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => handleSuggestionsClick(shift, e)}
                      className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded text-xs font-medium hover:bg-orange-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="View suggested routes"
                      disabled={!shift.shift_id}
                    >
                      <MapPin className="w-3 h-3" />
                      Suggestions
                    </button>
                  </td>

                  {/* Saved Routes Column */}
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => handleSaveRouteClick(shift, e)}
                      className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-medium hover:bg-indigo-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Save current route configuration"
                      disabled={!shift.shift_id}
                    >
                      <Bookmark className="w-3 h-3" />
                      Save Route
                    </button>
                  </td>

                  {/* Pending Route Bookings Column */}
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => handlePendingRouteBookingsClick(shift, e)}
                      className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded text-xs font-medium hover:bg-yellow-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="View and manage pending route bookings"
                      disabled={!shift.shift_code}
                    >
                      <Plus className="w-3 h-3" />
                      Pending Bookings
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Summary Footer - Only show if there are shifts */}
      {safeShiftBookings.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>
                Showing {safeShiftBookings.length} shift
                {safeShiftBookings.length !== 1 ? "s" : ""}
              </span>
              <span>Total Employees: {totalEmployees}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">F</kbd>
                <span>Search</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">S</kbd>
                <span>Save</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleList;
