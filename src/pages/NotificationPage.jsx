import React, { useEffect, useState } from "react";
import { RefreshCw, Search, Bell, BellRing } from "lucide-react";
import { NotificationAlertCard } from "../components/NotificationAlertCard";
import ErrorDisplay from "../components/ui/ErrorDisplay";
import { API_CLIENT } from "../Api/API_Client";
import { Modal } from "../components/SmallComponents";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

import {
  escalateAlertConfigThunk,
  acknowledgeAlertConfigThunk,
  closeAlertThunk,
} from "../redux/features/alertconfig/alertconfigTrunk";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [timestamp, setTimestamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [showAckModal, setShowAckModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [ackForm, setAckForm] = useState({
    acknowledged_by: "",
    notes: "",
  });

  const [escalateForm, setEscalateForm] = useState({
    escalated_by: "",
    escalation_level: 1,
    escalated_to: "",
    reason: "",
  });

  const clearError = () => setError(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      clearError();

      const response = await API_CLIENT.get("/alerts/active");

      setAlerts(response.data.data || []);
      setTimestamp(response.data.timestamp || new Date().toISOString());
    } catch (err) {
      console.error("Failed to fetch alerts", err);
      setError(
        err.response?.data?.message ||
          "Unable to fetch alerts. Please try again."
      );
      toast.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts
    .filter((alert) => {
      if (filter === "all") return true;
      if (filter === "critical") return alert.severity === "CRITICAL";
      if (filter === "triggered") return alert.status === "TRIGGERED";
      if (filter === "acknowledged") return alert.status === "ACKNOWLEDGED";
      if (filter === "closed") return alert.status === "CLOSED";
      return true;
    })
    .filter(
      (alert) =>
        alert.alert_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.alert_id?.toString().includes(searchTerm) ||
        alert.employee_id?.toString().includes(searchTerm) ||
        alert.trigger_notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAlertAction = (action, alert) => {
    setCurrentAlert(alert);

    if (action === "acknowledge") {
      // Pre-fill with current user (you can get from localStorage or context)
      const currentUser = localStorage.getItem("username") || "admin";
      setAckForm({
        acknowledged_by: currentUser,
        notes: "",
      });
      setShowAckModal(true);
    } else if (action === "escalate") {
      const currentUser = localStorage.getItem("username") || "admin";
      setEscalateForm({
        escalated_by: currentUser,
        escalation_level: 1,
        escalated_to: "",
        reason: "",
      });
      setShowEscalateModal(true);
    } else if (action === "closealert") {
      setShowCloseModal(true);
    }
  };

  const handleAckSubmit = async () => {
    if (!currentAlert) return;

    try {
      setActionLoading(true);

      // Using thunk for acknowledgment
      const resultAction = await dispatch(
        acknowledgeAlertConfigThunk({
          alertId: currentAlert.alert_id,
          payload: ackForm,
        })
      );

      if (acknowledgeAlertConfigThunk.fulfilled.match(resultAction)) {
        toast.success("Alert acknowledged successfully!");

        // Update local state
        const updatedAlerts = alerts.map((alert) =>
          alert.alert_id === currentAlert.alert_id
            ? { ...alert, status: "ACKNOWLEDGED" }
            : alert
        );
        setAlerts(updatedAlerts);

        // Close modal and reset
        setShowAckModal(false);
        setAckForm({
          acknowledged_by: "",
          notes: "",
        });
      } else {
        throw new Error(
          resultAction.payload?.message || "Failed to acknowledge"
        );
      }
    } catch (err) {
      console.error("Failed to acknowledge alert", err);
      toast.error(err.message || "Failed to acknowledge alert");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalateSubmit = async () => {
    if (!currentAlert) return;

    try {
      setActionLoading(true);

      // Using thunk for escalation
      const resultAction = await dispatch(
        escalateAlertConfigThunk({
          alertId: currentAlert.alert_id,
          payload: escalateForm,
        })
      );

      if (escalateAlertConfigThunk.fulfilled.match(resultAction)) {
        toast.success("Alert escalated successfully!");

        // Update local state
        const updatedAlerts = alerts.map((alert) =>
          alert.alert_id === currentAlert.alert_id
            ? {
                ...alert,
                status: "ESCALATED",
                escalation_level: escalateForm.escalation_level,
              }
            : alert
        );
        setAlerts(updatedAlerts);

        // Close modal and reset
        setShowEscalateModal(false);
        setEscalateForm({
          escalated_by: "",
          escalation_level: 1,
          escalated_to: "",
          reason: "",
        });
      } else {
        throw new Error(resultAction.payload?.message || "Failed to escalate");
      }
    } catch (err) {
      console.error("Failed to escalate alert", err);
      toast.error(err.message || "Failed to escalate alert");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseAlert = async () => {
    if (!currentAlert) return;

    try {
      setActionLoading(true);

      // Using thunk for closing alert
      const resultAction = await dispatch(
        closeAlertThunk({
          alertId: currentAlert.alert_id,
        })
      );

      if (closeAlertThunk.fulfilled.match(resultAction)) {
        toast.success("Alert closed successfully!");

        // Update local state - remove closed alert
        const updatedAlerts = alerts.filter(
          (alert) => alert.alert_id !== currentAlert.alert_id
        );
        setAlerts(updatedAlerts);

        // Close modal
        setShowCloseModal(false);
      } else {
        throw new Error(
          resultAction.payload?.message || "Failed to close alert"
        );
      }
    } catch (err) {
      console.error("Failed to close alert", err);
      toast.error(err.message || "Failed to close alert");
    } finally {
      setActionLoading(false);
    }
  };

  // Confirmation Modal for Close Action
  const CloseConfirmationModal = () => (
    <Modal
      isOpen={showCloseModal}
      onClose={() => setShowCloseModal(false)}
      onSubmit={handleCloseAlert}
      title="Close Alert"
      submitText="Confirm Close"
      submitColor="bg-red-600 hover:bg-red-700"
      size="sm"
      mode="create"
      isLoading={actionLoading}
    >
      <div className="text-center py-4">
        <Bell className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Close Alert #{currentAlert?.alert_id}?
        </h3>
        <p className="text-gray-600">
          Are you sure you want to close this alert? This action cannot be
          undone.
        </p>
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          <strong>Alert Type:</strong> {currentAlert?.alert_type}
          <br />
          <strong>Severity:</strong> {currentAlert?.severity}
        </div>
      </div>
    </Modal>
  );

  const stats = {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === "CRITICAL").length,
    high: alerts.filter((a) => a.severity === "HIGH").length,
    medium: alerts.filter((a) => a.severity === "MEDIUM").length,
    low: alerts.filter((a) => a.severity === "LOW").length,
    triggered: alerts.filter((a) => a.status === "TRIGGERED").length,
    acknowledged: alerts.filter((a) => a.status === "ACKNOWLEDGED").length,
    closed: alerts.filter((a) => a.status === "CLOSED").length,
  };

  /* ---------------- ERROR STATE ---------------- */
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        title="Alert Fetch Error"
        onClear={clearError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BellRing className="h-8 w-8 text-blue-600" />
                Alert Notifications
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage security alerts in real-time
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={fetchAlerts}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            {["all", "critical", "triggered", "acknowledged", "closed"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                    filter === f
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f} {stats[f] ? `(${stats[f]})` : ""}
                </button>
              )
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {Object.entries(stats).map(([key, value]) => (
              <div
                key={key}
                className="bg-white border border-gray-200 rounded-lg p-3"
              >
                <div className="text-xs text-gray-500 mb-1 capitalize">
                  {key}
                </div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="px-6 py-8">
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            Loading alerts...
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <NotificationAlertCard
                key={alert.alert_id}
                alert={alert}
                onAction={handleAlertAction}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell className="h-16 w-16 text-gray-300 mx-auto" />
            <h3 className="mt-4 text-xl font-medium text-gray-900">
              No alerts found
            </h3>
            <p className="text-gray-600 mt-2">
              {searchTerm
                ? "Try a different search term"
                : "All clear for now!"}
            </p>
          </div>
        )}

        {!loading && filteredAlerts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600 flex justify-between">
            <div>
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </div>
            <div>
              Last updated:{" "}
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
          </div>
        )}
      </div>

      {/* Acknowledgment Modal */}
      <Modal
        isOpen={showAckModal}
        onClose={() => !actionLoading && setShowAckModal(false)}
        onSubmit={handleAckSubmit}
        title="Acknowledge Alert"
        submitText={actionLoading ? "Submitting..." : "Submit Acknowledgment"}
        submitColor="bg-green-600 hover:bg-green-700"
        size="md"
        mode="create"
        isLoading={actionLoading}
        disabled={actionLoading}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Alert ID:{" "}
            <span className="font-medium">{currentAlert?.alert_id}</span>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acknowledged By
            </label>
            <input
              type="text"
              value={ackForm.acknowledged_by}
              onChange={(e) =>
                setAckForm({
                  ...ackForm,
                  acknowledged_by: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={actionLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={ackForm.notes}
              onChange={(e) =>
                setAckForm({
                  ...ackForm,
                  notes: e.target.value,
                })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes about this acknowledgment..."
              disabled={actionLoading}
            />
          </div>
        </div>
      </Modal>

      {/* Escalation Modal */}
      <Modal
        isOpen={showEscalateModal}
        onClose={() => !actionLoading && setShowEscalateModal(false)}
        onSubmit={handleEscalateSubmit}
        title="Escalate Alert"
        submitText={actionLoading ? "Submitting..." : "Submit Escalation"}
        submitColor="bg-red-600 hover:bg-red-700"
        size="md"
        mode="create"
        isLoading={actionLoading}
        disabled={actionLoading}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Alert ID:{" "}
            <span className="font-medium">{currentAlert?.alert_id}</span>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Escalated By
            </label>
            <input
              type="text"
              value={escalateForm.escalated_by}
              onChange={(e) =>
                setEscalateForm({
                  ...escalateForm,
                  escalated_by: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={actionLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Escalation Level
            </label>
            <select
              value={escalateForm.escalation_level}
              onChange={(e) =>
                setEscalateForm({
                  ...escalateForm,
                  escalation_level: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={actionLoading}
            >
              <option value={1}>Level 1 (Low)</option>
              <option value={2}>Level 2 (Medium)</option>
              <option value={3}>Level 3 (High)</option>
              <option value={4}>Level 4 (Critical)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Escalated To
            </label>
            <input
              type="text"
              value={escalateForm.escalated_to}
              onChange={(e) =>
                setEscalateForm({
                  ...escalateForm,
                  escalated_to: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Team or person responsible"
              required
              disabled={actionLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Escalation
            </label>
            <textarea
              value={escalateForm.reason}
              onChange={(e) =>
                setEscalateForm({
                  ...escalateForm,
                  reason: e.target.value,
                })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explain why this alert needs escalation..."
              required
              disabled={actionLoading}
            />
          </div>
        </div>
      </Modal>

      {/* Close Confirmation Modal */}
      <CloseConfirmationModal />
    </div>
  );
};

export default NotificationsPage;
