import React, { useEffect, useState } from "react";
import { RefreshCw, Search, Bell, BellRing } from "lucide-react";
import { NotificationAlertCard } from "../components/NotificationAlertCard";
import ErrorDisplay from "../components/ui/ErrorDisplay";
import { API_CLIENT } from "../Api/API_Client";
import { Modal } from "../components/SmallComponents";
// import Modal from "../components/Modal"; // Your existing Modal component

const NotificationsPage = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [timestamp, setTimestamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [showAckModal, setShowAckModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);

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
    console.log(`${action} action for alert ${alert.alert_id}`, alert);

    setCurrentAlert(alert);

    if (action === "acknowledge") {
      // Pre-fill with current user
      setAckForm({
        acknowledged_by: "admin", // Replace with actual user from context
        notes: "",
      });
      setShowAckModal(true);
    } else if (action === "escalate") {
      // Pre-fill with current user
      setEscalateForm({
        escalated_by: "admin", // Replace with actual user from context
        escalation_level: 1,
        escalated_to: "",
        reason: "",
      });
      setShowEscalateModal(true);
    } else if (action === "close") {
      // Handle close action
      console.log("Close action submitted:", { alert_id: alert.alert_id });
    } else if (action === "reopen") {
      // Handle reopen action
      console.log("Reopen action submitted:", { alert_id: alert.alert_id });
    }
  };

  const handleAckSubmit = async () => {
    try {
      console.log("Acknowledgment submitted:", {
        alert_id: currentAlert.alert_id,
        ...ackForm,
      });

      // API call to acknowledge the alert
      // await API_CLIENT.post(`/alerts/${currentAlert.alert_id}/acknowledge`, ackForm);

      // Refresh alerts after acknowledgment
      fetchAlerts();

      // Close modal and reset form
      setShowAckModal(false);
      setAckForm({
        acknowledged_by: "",
        notes: "",
      });
    } catch (err) {
      console.error("Failed to acknowledge alert", err);
      setError(
        err.response?.data?.message ||
          "Unable to acknowledge alert. Please try again."
      );
    }
  };

  const handleEscalateSubmit = async () => {
    try {
      console.log("Escalation submitted:", {
        alert_id: currentAlert.alert_id,
        ...escalateForm,
      });

      // API call to escalate the alert
      // await API_CLIENT.post(`/alerts/${currentAlert.alert_id}/escalate`, escalateForm);

      // Refresh alerts after escalation
      fetchAlerts();

      // Close modal and reset form
      setShowEscalateModal(false);
      setEscalateForm({
        escalated_by: "",
        escalation_level: 1,
        escalated_to: "",
        reason: "",
      });
    } catch (err) {
      console.error("Failed to escalate alert", err);
      setError(
        err.response?.data?.message ||
          "Unable to escalate alert. Please try again."
      );
    }
  };

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
              })}
            </div>
          </div>
        )}
      </div>

      {/* Acknowledgment Modal using your Modal component */}
      <Modal
        isOpen={showAckModal}
        onClose={() => setShowAckModal(false)}
        onSubmit={handleAckSubmit}
        title="Acknowledge Alert"
        submitText="Submit Acknowledgment"
        submitColor="bg-green-600 hover:bg-green-700"
        size="md"
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
            />
          </div>
        </div>
      </Modal>

      {/* Escalation Modal using your Modal component */}
      <Modal
        isOpen={showEscalateModal}
        onClose={() => setShowEscalateModal(false)}
        onSubmit={handleEscalateSubmit}
        title="Escalate Alert"
        submitText="Submit Escalation"
        submitColor="bg-red-600 hover:bg-red-700"
        size="md"
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
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
