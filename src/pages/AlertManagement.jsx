// pages/AlertConfigPage.js - Updated
import React, { useState, useEffect, useMemo, useCallback } from "react";
import AlertConfigCard from "../components/Schedulemanagement/AlertConfigCard";
import AlertConfigForm from "../components/Schedulemanagement/AlertConfigForm";
import ToolBar from "../components/ui/ToolBar";
import Select from "react-select";
import { selectStyles } from "../utils/helperutilities";
import { useDispatch, useSelector } from "react-redux";
import { getAlertConfigThunk } from "../redux/features/alertconfig/alertconfigTrunk";
import { logDebug } from "../utils/logger";

const DEFAULT_CONFIG = {
  team_id: 1,
  config_name: "",
  description: "",
  applicable_alert_types: [],
  primary_recipients: [],
  enable_escalation: false,
  escalation_threshold_seconds: 120,
  escalation_recipients: [],
  notification_channels: [],
  notify_on_status_change: true,
  notify_on_escalation: true,
  auto_close_false_alarm_seconds: 90,
  require_closure_notes: true,
  enable_geofencing_alerts: false,
  geofence_radius_meters: 500,
  emergency_contacts: [],
  priority: 500,
  scope: "tenant",
  scope_target_type: "team",
  scope_target_id: null,
};

// Static alert types array
const ALERT_TYPES = ["MEDICAL", "SOS"];

// Create filter options from static array
const getFilterOptions = () => {
  return [
    { value: "all", label: "All Alert Types" },
    ...ALERT_TYPES.map((type) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
    })),
  ];
};

const AlertManagement = () => {
  // STATE VARIABLES
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("view");
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState({
    value: "all",
    label: "All Alert Types",
  });

  const dispatch = useDispatch();

  // Get data from Redux store
  const configs = useSelector((state) =>
    state.alertconfig.allIds.map((id) => state.alertconfig.byId[id])
  );

  const loading = useSelector((state) => state.alertconfig.loading.fetch);
  const error = useSelector((state) => state.alertconfig.error);

  // Filter options
  const filterOptions = useMemo(() => getFilterOptions(), []);

  // Memoized filtered configs
  const filteredConfigs = useMemo(() => {
    if (!selectedFilter || selectedFilter.value === "all") {
      return configs;
    }
    return configs.filter((config) =>
      config.applicable_alert_types?.includes(selectedFilter.value)
    );
  }, [configs, selectedFilter]);

  // Log slice data for debugging

  // Fetch data based on filter
  const fetchConfigs = useCallback(() => {
    const params = {};

    if (selectedFilter?.value && selectedFilter.value !== "all") {
      params.alert_type = selectedFilter.value;
      dispatch(getAlertConfigThunk({ params }));
    }
  }, [selectedFilter?.value, dispatch]);

  // Initial fetch when component mounts
  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  // Handle Create Configuration
  const handleCreateConfig = (newConfig) => {
    // Note: In a real app, you would dispatch an action to create the config
    // For now, we'll show an alert and refresh the data
    alert(`Configuration created successfully!`);
    logDebug(" This is teh subbmited data ", newConfig);
    // Refresh the configs list
    fetchConfigs();

    setShowForm(false);
    setFormMode("view");
    setSelectedConfig(null);
  };

  // Handle Update Configuration
  const handleUpdateConfig = (updatedConfig) => {
    // Note: In a real app, you would dispatch an action to update the config
    alert(`Configuration updated successfully!`);

    // Refresh the configs list
    fetchConfigs();

    setFormMode("view");
  };

  // Handle View Configuration
  const handleViewConfig = (config) => {
    setSelectedConfig(config);
    setFormMode("view");
    setShowForm(true);
  };

  // Handle Edit mode switch
  const handleSwitchToEdit = () => {
    setFormMode("edit");
  };

  // Handle Form Close/Cancel
  const handleFormClose = () => {
    setShowForm(false);
    setSelectedConfig(null);
    setFormMode("view");
  };

  // Get form title based on mode
  const getFormTitle = () => {
    switch (formMode) {
      case "create":
        return "Create Alert Configuration";
      case "edit":
        return "Edit Alert Configuration";
      case "view":
        return `View Configuration: ${selectedConfig?.config_name || ""}`;
      default:
        return "Alert Configuration";
    }
  };

  // Handle filter change with null safety
  const handleFilterChange = (option) => {
    // If option is null (cleared), reset to "All"
    const newFilter = !option
      ? { value: "all", label: "All Alert Types" }
      : option;

    setSelectedFilter(newFilter);

    // Trigger fetch with new filter
    const params = {};
    if (newFilter.value !== "all") {
      params.alert_type = newFilter.value;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <ToolBar
        rightElements={
          <Select
            options={filterOptions}
            value={selectedFilter}
            onChange={handleFilterChange}
            placeholder="Filter by alert type..."
            isClearable
            styles={selectStyles}
            className="text-sm"
          />
        }
        onAddClick={() => {
          setFormMode("create");
          setSelectedConfig(null);
          setShowForm(true);
        }}
        module="alert"
        addButtonLabel="Alert"
        className="p-4 bg-white border rounded shadow-sm mb-4"
      />

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {/* Create/Edit/View Form Modal */}
      {showForm && (
        <AlertConfigForm
          initialData={formMode === "create" ? DEFAULT_CONFIG : selectedConfig}
          mode={formMode}
          onSave={
            formMode === "create" ? handleCreateConfig : handleUpdateConfig
          }
          onCancel={handleFormClose}
          isOpen={showForm}
          title={getFormTitle()}
          onSwitchToEdit={handleSwitchToEdit}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading configurations...</p>
        </div>
      ) : /* Configurations Display */
      filteredConfigs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredConfigs.map((config) => (
            <AlertConfigCard
              key={config.config_id}
              config={config}
              onViewClick={() => handleViewConfig(config)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No configurations found
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedFilter && selectedFilter.value !== "all"
              ? `No configurations found for "${selectedFilter.label}" alert type.`
              : "Create your first alert configuration to get started"}
          </p>
          {selectedFilter && selectedFilter.value !== "all" && (
            <button
              onClick={() => handleFilterChange(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 mr-3"
            >
              Clear Filter
            </button>
          )}
          <button
            onClick={() => {
              setFormMode("create");
              setShowForm(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Configuration
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertManagement;
