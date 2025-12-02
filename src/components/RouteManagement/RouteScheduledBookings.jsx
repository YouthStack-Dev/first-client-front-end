import React, { useState, useEffect, useRef } from "react";
import ToolBar from "../ui/ToolBar";
import { useSelector, useDispatch } from "react-redux";

import ShiftBookingsTable from "./ShiftBookingsTable.jsx";
import { API_CLIENT } from "../../Api/API_Client.js";
import {
  selectRouteLoading,
  selectShiftsData,
  setLoading,
  setError,
  addShiftsFromAPI,
  clearAllRouteData,
} from "@features/routes/roureSlice.js";
import { Settings, RefreshCw } from "lucide-react";
import SelectField from "../ui/SelectField.jsx";
import { selectCurrentUser } from "../../redux/features/auth/authSlice.js";
import { logDebug } from "../../utils/logger.js";
// Configuration Modal Component (keep this same as before)
const ConfigModal = ({ isOpen, onClose, config, onConfigChange, onSave }) => {
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleChange = (field, value) => {
    setLocalConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Route Configuration
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Cluster Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cluster Radius
              <span className="text-gray-400 ml-1">(default = 1km)</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={localConfig.radius}
              onChange={(e) =>
                handleChange("radius", parseFloat(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Distance in kilometers for clustering
            </p>
          </div>

          {/* Cluster Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cluster Size per Group
              <span className="text-gray-400 ml-1">(default = 2)</span>
            </label>
            <input
              type="number"
              min="1"
              value={localConfig.group_size}
              onChange={(e) =>
                handleChange("group_size", parseInt(e.target.value))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of bookings per cluster group
            </p>
          </div>

          {/* Strict Grouping */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strict Grouping
                <span className="text-gray-400 ml-1">(default = false)</span>
              </label>
              <p className="text-xs text-gray-500">
                If enabled → enforce fixed group size strictly
              </p>
            </div>
            <button
              type="button"
              className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                localConfig.strict_grouping ? "bg-blue-600" : "bg-gray-200"
              }`}
              onClick={() =>
                handleChange("strict_grouping", !localConfig.strict_grouping)
              }
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                  localConfig.strict_grouping
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

// Main RouteScheduledBookings Component
const RouteScheduledBookings = () => {
  const [selectedShiftType, setSelectedShiftType] = useState("All");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [config, setConfig] = useState({
    radius: 1.0,
    group_size: 2,
    strict_grouping: false,
  });
  const [generatingRoute, setGeneratingRoute] = useState(null); // Track which route is being generated
  const [selectedCompany, setSelectedCompany] = useState("");

  const hasFetchedRef = useRef(false);
  const { type } = useSelector(selectCurrentUser);
  logDebug(" this is the user type ", type);
  const loading = useSelector(selectRouteLoading);
  const shiftsData = useSelector(selectShiftsData);
  const dispatch = useDispatch();

  // Real API call function
  const fetchShiftsData = async (date) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await API_CLIENT.get(
        `/v1/bookings/tenant/SAM001/shifts/bookings?booking_date=${date}`
      );

      if (response.data.success) {
        const transformedData = {
          date: response.data.data.date,
          shifts: response.data.data.shifts.map((shift) => ({
            shift_id: shift.shift_id,
            shift_code: shift.shift_code,
            shift_time: shift.shift_time,
            log_type: shift.log_type,
            stats: shift.stats || {
              route_count: shift.route_count || 0,
              total_bookings: shift.total_bookings || 0,
              routed_bookings: shift.routed_bookings || 0,
              unrouted_bookings: shift.unrouted_bookings || 0,
              vendor_assigned: shift.vendor_assigned || 0,
              driver_assigned: shift.driver_assigned || 0,
            },
            bookings: shift.bookings || [],
          })),
        };

        console.log(" this is the transformed data ", transformedData);
        dispatch(addShiftsFromAPI(transformedData));
      } else {
        throw new Error(response.data.message || "Failed to fetch shifts data");
      }
    } catch (error) {
      console.error("Error fetching shifts data:", error);
      dispatch(
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch shifts data"
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Generate/Regenerate Route function
  const handleGenerateRoute = async (shiftId) => {
    try {
      setGeneratingRoute(shiftId);

      const response = await API_CLIENT.post(
        `/v1/routes/?booking_date=${selectedDate}&shift_id=${shiftId}&radius=${config.radius}&group_size=${config.group_size}&strict_grouping=${config.strict_grouping}`
      );

      if (response.data.success) {
        console.log("Route generated successfully:", response.data);

        // Refresh the shifts data to get updated stats
        await fetchShiftsData(selectedDate);

        // Show success message
        alert("Route generated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to generate route");
      }
    } catch (error) {
      console.error("Error generating route:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate route"
      );
    } finally {
      setGeneratingRoute(null);
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchShiftsData(selectedDate);
      hasFetchedRef.current = true;
    }
  }, [selectedDate]);

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    hasFetchedRef.current = false;
  };

  // Handle sync data
  const handleSync = () => {
    fetchShiftsData(selectedDate);
  };

  // Handle clear data
  const handleClearAllRouteData = () => {
    dispatch(clearAllRouteData());
  };

  // Handle config save
  const handleConfigSave = (newConfig) => {
    setConfig(newConfig);
    console.log("Saving configuration:", newConfig);
  };

  const handleRefreshData = () => {
    fetchShiftsData(selectedDate);
  };
  const shiftOptions = [
    { value: "All", label: "All" },
    { value: "In", label: "LogIn" },
    { value: "Out", label: "LogOut" },
  ];

  const companyOptions = [
    { value: "", label: "All company" },
    { value: "company1", label: "company 1" },
    { value: "company2", label: "company 2" },
    { value: "company3", label: "company 3" },
  ];

  const topToolbar = (
    <ToolBar
      className="mb-6"
      leftElements={
        <div className="flex items-center gap-4">
          {/* Date Input */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            />
          </div>

          {/* Shift Type (Reusable SelectField) */}
          <SelectField
            label="Shift Type"
            value={selectedShiftType}
            onChange={setSelectedShiftType}
            options={shiftOptions}
          />

          {type === "admin" ? (
            <SelectField
              label="Company"
              value={selectedCompany}
              onChange={setSelectedCompany}
              options={companyOptions}
            />
          ) : null}

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={loading}
            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm 
                   hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Sync
              </>
            )}
          </button>

          {/* Config Button */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm 
                   hover:bg-green-600 flex items-center gap-2"
            title="Route Configuration"
          >
            <Settings size={16} />
            Config
          </button>

          {/* Clear Data Button */}
          <button
            onClick={handleClearAllRouteData}
            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
            title="Clear all route data"
          >
            Clear Data
          </button>
        </div>
      }
    />
  );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {topToolbar}

      <div className="mx-auto">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-sm">Loading shift data...</p>
            </div>
          </div>
        ) : (
          <ShiftBookingsTable
            data={shiftsData.shifts}
            date={shiftsData.date}
            selectedShiftType={selectedShiftType}
            loading={loading}
            onGenerateRoute={handleGenerateRoute}
            onRefresh={handleRefreshData}
            generatingRoute={generatingRoute}
          />
        )}
      </div>

      {/* Configuration Modal */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onConfigChange={setConfig}
        onSave={handleConfigSave}
      />
    </div>
  );
};

export default RouteScheduledBookings;
