// pages/AlertConfigPage.js - Fixed
import React, { useState, useEffect, useMemo } from "react";
import AlertConfigCard from "../components/Schedulemanagement/AlertConfigCard";
import AlertConfigForm from "../components/Schedulemanagement/AlertConfigForm";
import ToolBar from "../components/ui/ToolBar";
import { useDispatch, useSelector } from "react-redux";
import {
  createAlertConfigThunk,
  getAlertConfigThunk,
  updateAlertConfigThunk,
} from "../redux/features/alertconfig/alertconfigTrunk";
import { logDebug } from "../utils/logger";

const DEFAULT_CONFIG = {
  team_id: null,
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
};

const AlertManagement = () => {
  // STATE VARIABLES
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("view");
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [formError, setFormError] = useState(null); // Add state for form errors

  const dispatch = useDispatch();

  // Get data from Redux store
  const allIds = useSelector((state) => state.alertconfig.allIds);
  const byId = useSelector((state) => state.alertconfig.byId);
  const configs = useMemo(() => allIds.map((id) => byId[id]), [allIds, byId]);

  const loading = useSelector((state) => state.alertconfig.loading.fetch);

  // Initial fetch when component mounts
  useEffect(() => {
    dispatch(getAlertConfigThunk());
  }, []);

  // Clear form errors when form opens/closes or mode changes
  useEffect(() => {
    setFormError(null);
  }, [showForm, formMode]);

  // Handle Create Configuration
  const handleCreateConfig = async (newConfig) => {
    try {
      logDebug("Submitted data", newConfig);

      const result = await dispatch(
        createAlertConfigThunk({ payload: newConfig })
      ).unwrap(); // unwrap gives actual response or throws error

      alert("Configuration created successfully!");

      logDebug("Created alert config", result);

      // Refresh list
      dispatch(getAlertConfigThunk());

      setShowForm(false);
      setFormMode("view");
      setSelectedConfig(null);
      setFormError(null); // Clear any previous errors
    } catch (error) {
      console.error("Create alert config failed", error);

      // Set the error to pass to the form
      setFormError(error);

      // Don't close the form, let the form handle the error display
      // The form will stay open so user can fix the errors
    }
  };

  // Handle Update Configuration
  const handleUpdateConfig = async (updatedConfig) => {
    try {
      const result = await dispatch(
        updateAlertConfigThunk({
          configId: updatedConfig.config_id,
          payload: updatedConfig,
        })
      ).unwrap();

      alert("Configuration updated successfully!");

      logDebug("Updated alert config", result);

      setSelectedConfig(result); // keep UI in sync
      setFormMode("view");
      setFormError(null);
      setShowForm(false);
    } catch (error) {
      console.error("Update alert config failed", error);
      setFormError(error);
    }
  };

  // Handle View Configuration
  const handleViewConfig = (config) => {
    setSelectedConfig(config);
    setFormMode("view");
    setShowForm(true);
    setFormError(null); // Clear errors when viewing
  };

  // Handle Edit mode switch
  const handleSwitchToEdit = () => {
    setFormMode("edit");
    setFormError(null); // Clear errors when switching to edit mode
  };

  // Handle Form Close/Cancel
  const handleFormClose = () => {
    setShowForm(false);
    setSelectedConfig(null);
    setFormMode("view");
    setFormError(null); // Clear errors when closing form
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <ToolBar
        onAddClick={() => {
          setFormMode("create");
          setSelectedConfig(null);
          setShowForm(true);
          setFormError(null);
        }}
        module="alert"
        addButtonLabel="Alert"
        className="p-4 bg-white border rounded shadow-sm mb-4"
      />

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
          error={formError}
          clearError={() => setFormError(null)}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading configurations...</p>
        </div>
      ) : /* Configurations Display */
      configs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {configs.map((config) => (
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
            Create your first alert configuration to get started
          </p>
          <button
            onClick={() => {
              setFormMode("create");
              setShowForm(true);
              setFormError(null); // Clear errors when creating new
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
