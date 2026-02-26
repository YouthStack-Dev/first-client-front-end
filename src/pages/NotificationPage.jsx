import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  Bell,
  BellRing,
  History,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  AlertCircle,
} from "lucide-react";
import { NotificationAlertCard } from "../components/NotificationAlertCard";
import ErrorDisplay from "../components/ui/ErrorDisplay";
import { API_CLIENT } from "../Api/API_Client";
import { Modal } from "../components/SmallComponents";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/features/auth/authSlice";

import {
  escalateAlertConfigThunk,
  acknowledgeAlertConfigThunk,
  closeAlertThunk,
} from "../redux/features/alertconfig/alertconfigTrunk";

const getEmployeeFromSession = () => {
  try {
    const data = JSON.parse(sessionStorage.getItem("userPermissions"));
    return data?.user?.employee || null;
  } catch {
    return null;
  }
};

const STATUS_COLORS = {
  TRIGGERED: "bg-red-100 text-red-800",
  ACKNOWLEDGED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  RESOLVED: "bg-teal-100 text-teal-800",
  CLOSED: "bg-green-100 text-green-800",
  FALSE_ALARM: "bg-gray-100 text-gray-700",
};

const SEVERITY_COLORS = {
  CRITICAL: "bg-red-500 text-white",
  HIGH: "bg-orange-500 text-white",
  MEDIUM: "bg-yellow-500 text-white",
  LOW: "bg-blue-500 text-white",
};

// Timeline event styling
const TIMELINE_EVENT_STYLES = {
  TRIGGERED: {
    icon: AlertTriangle,
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-800",
    line: "border-red-200",
  },
  ACKNOWLEDGED: {
    icon: CheckCircle,
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800",
    line: "border-blue-200",
  },
  ESCALATED: {
    icon: AlertCircle,
    dot: "bg-orange-500",
    badge: "bg-orange-100 text-orange-800",
    line: "border-orange-200",
  },
  IN_PROGRESS: {
    icon: Activity,
    dot: "bg-purple-500",
    badge: "bg-purple-100 text-purple-800",
    line: "border-purple-200",
  },
  RESOLVED: {
    icon: CheckCircle,
    dot: "bg-teal-500",
    badge: "bg-teal-100 text-teal-800",
    line: "border-teal-200",
  },
  CLOSED: {
    icon: CheckCircle,
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-800",
    line: "border-green-200",
  },
  FALSE_ALARM: {
    icon: AlertCircle,
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-700",
    line: "border-gray-200",
  },
};

const HISTORY_PAGE_SIZE = 10;

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const authUser = useSelector(selectCurrentUser);
  const employee = getEmployeeFromSession() || authUser?.employee || null;
  const currentUserId = employee?.employee_id || null;
  const currentUserName = employee?.name || "Unknown";

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [timestamp, setTimestamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Action modal states
  const [showAckModal, setShowAckModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [ackForm, setAckForm] = useState({ acknowledged_by: null, notes: "" });
  const [escalateForm, setEscalateForm] = useState({
    escalated_by: null,
    escalation_level: 1,
    escalated_to: "",
    reason: "",
  });
  const [closeForm, setCloseForm] = useState({
    closed_by: null,
    resolution_notes: "",
    is_false_alarm: false,
  });

  // ── History modal states ──
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyAlerts, setHistoryAlerts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyFilters, setHistoryFilters] = useState({
    status: "",
    start_date: "",
    end_date: "",
  });

  // ── Abort controller ref to cancel stale requests ──
  const historyAbortRef = React.useRef(null);
  const dateDebounceRef = React.useRef(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineAlert, setTimelineAlert] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

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
      setError(err.response?.data?.message || "Unable to fetch alerts. Please try again.");
      toast.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch team alert history ──
  const fetchHistory = async (page = 1, filters = historyFilters) => {
    // Cancel any previous in-flight request
    if (historyAbortRef.current) historyAbortRef.current.abort();
    const controller = new AbortController();
    historyAbortRef.current = controller;

    try {
      setHistoryLoading(true);
      const params = {
        limit: HISTORY_PAGE_SIZE,
        offset: (page - 1) * HISTORY_PAGE_SIZE,
        ...(filters.status && { status: filters.status }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
      };
      const response = await API_CLIENT.get("/alerts/team-alerts", {
        params,
        signal: controller.signal,
      });
      setHistoryAlerts(response.data.data?.alerts || []);
      setHistoryTotal(response.data.data?.total || 0);
      setHistoryPage(page);
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return; // ignore aborted
      console.error("Failed to fetch history", err);
      toast.error("Failed to fetch alert history");
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── Fetch timeline for a specific alert ──
  const fetchTimeline = async (alert) => {
    try {
      setTimelineLoading(true);
      setTimelineEvents([]);
      const response = await API_CLIENT.get(`/alerts/${alert.alert_id}/timeline`);
      setTimelineEvents(response.data.data?.events || response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch timeline", err);
      toast.error("Failed to fetch alert timeline");
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleOpenHistory = () => {
    const reset = { status: "", start_date: "", end_date: "" };
    setHistoryFilters(reset);
    setShowHistoryModal(true);
    fetchHistory(1, reset);
  };

  const handleHistoryFilterReset = () => {
    const reset = { status: "", start_date: "", end_date: "" };
    setHistoryFilters(reset);
    fetchHistory(1, reset);
  };

  // Status → fire immediately (discrete choice)
  const handleStatusChange = (value) => {
    const updated = { ...historyFilters, status: value };
    setHistoryFilters(updated);
    fetchHistory(1, updated);
  };

  // Dates → debounce 500ms so we don't fire mid-selection
  const handleDateChange = (field, value) => {
    const updated = { ...historyFilters, [field]: value };
    setHistoryFilters(updated);
    if (dateDebounceRef.current) clearTimeout(dateDebounceRef.current);
    dateDebounceRef.current = setTimeout(() => fetchHistory(1, updated), 500);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const filteredAlerts = alerts
    .filter((alert) => {
      if (filter === "all") return true;
      if (filter === "critical") return alert.severity === "CRITICAL";
      if (filter === "triggered") return alert.status === "TRIGGERED";
      if (filter === "acknowledged") return alert.status === "ACKNOWLEDGED";
      if (filter === "in_progress") return alert.status === "IN_PROGRESS";
      if (filter === "resolved") return alert.status === "RESOLVED";
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
      setAckForm({ acknowledged_by: currentUserId, notes: "" });
      setShowAckModal(true);
    } else if (action === "escalate") {
      setEscalateForm({ escalated_by: currentUserId, escalation_level: 1, escalated_to: "", reason: "" });
      setShowEscalateModal(true);
    } else if (action === "closealert") {
      setCloseForm({ closed_by: currentUserId, resolution_notes: "", is_false_alarm: false });
      setShowCloseModal(true);
    } else if (action === "timeline") {
      setTimelineAlert(alert);
      setShowTimelineModal(true);
      fetchTimeline(alert);
    }
  };

  const handleAckSubmit = async () => {
    if (!currentAlert) return;
    try {
      setActionLoading(true);
      const resultAction = await dispatch(acknowledgeAlertConfigThunk({ alertId: currentAlert.alert_id, payload: ackForm }));
      if (acknowledgeAlertConfigThunk.fulfilled.match(resultAction)) {
        toast.success("Alert acknowledged successfully!");
        setAlerts((prev) => prev.map((a) => a.alert_id === currentAlert.alert_id ? { ...a, status: "ACKNOWLEDGED" } : a));
        setShowAckModal(false);
        setAckForm({ acknowledged_by: null, notes: "" });
      } else {
        throw new Error(resultAction.payload?.message || "Failed to acknowledge");
      }
    } catch (err) {
      toast.error(err.message || "Failed to acknowledge alert");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalateSubmit = async () => {
    if (!currentAlert) return;
    try {
      setActionLoading(true);
      const resultAction = await dispatch(escalateAlertConfigThunk({ alertId: currentAlert.alert_id, payload: escalateForm }));
      if (escalateAlertConfigThunk.fulfilled.match(resultAction)) {
        toast.success("Alert escalated successfully!");
        setShowEscalateModal(false);
        setEscalateForm({ escalated_by: null, escalation_level: 1, escalated_to: "", reason: "" });
      } else {
        throw new Error(resultAction.payload?.message || "Failed to escalate");
      }
    } catch (err) {
      toast.error(err.message || "Failed to escalate alert");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseAlert = async () => {
    if (!currentAlert) return;
    try {
      setActionLoading(true);
      const resultAction = await dispatch(closeAlertThunk({
        alertId: currentAlert.alert_id,
        closed_by: closeForm.closed_by,
        resolution_notes: closeForm.resolution_notes,
        is_false_alarm: closeForm.is_false_alarm,
      }));
      if (closeAlertThunk.fulfilled.match(resultAction)) {
        toast.success("Alert closed successfully!");
        setAlerts((prev) => prev.filter((a) => a.alert_id !== currentAlert.alert_id));
        setShowCloseModal(false);
      } else {
        throw new Error(resultAction.payload?.message || "Failed to close alert");
      }
    } catch (err) {
      toast.error(err.message || "Failed to close alert");
    } finally {
      setActionLoading(false);
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
    in_progress: alerts.filter((a) => a.status === "IN_PROGRESS").length,
    resolved: alerts.filter((a) => a.status === "RESOLVED").length,
  };

  const totalHistoryPages = Math.ceil(historyTotal / HISTORY_PAGE_SIZE);

  if (error) {
    return <ErrorDisplay error={error} title="Alert Fetch Error" onClear={clearError} />;
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
              <p className="text-gray-600 mt-1">Monitor and manage security alerts in real-time</p>
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

              {/* History Button */}
              <button
                onClick={handleOpenHistory}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 transition-colors"
              >
                <History className="h-4 w-4" />
                History
              </button>

              <button
                onClick={fetchAlerts}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "critical", "triggered", "acknowledged", "in_progress", "resolved"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.replace("_", " ")} {stats[f] !== undefined ? `(${stats[f]})` : ""}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1 capitalize">{key.replace("_", " ")}</div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="px-6 py-8">
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading alerts...</div>
        ) : filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <NotificationAlertCard key={alert.alert_id} alert={alert} onAction={handleAlertAction} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell className="h-16 w-16 text-gray-300 mx-auto" />
            <h3 className="mt-4 text-xl font-medium text-gray-900">No alerts found</h3>
            <p className="text-gray-600 mt-2">{searchTerm ? "Try a different search term" : "All clear for now!"}</p>
          </div>
        )}

        {!loading && filteredAlerts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600 flex justify-between">
            <div>Showing {filteredAlerts.length} of {alerts.length} alerts</div>
            <div>
              Last updated:{" "}
              {timestamp && new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>
        )}
      </div>

      {/* ── History Modal ── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">Alert History</h2>
                {historyTotal > 0 && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {historyTotal} records
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Filters */}
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex flex-wrap items-end gap-3 shrink-0">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={historyFilters.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="TRIGGERED">Triggered</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="FALSE_ALARM">False Alarm</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                <input
                  type="date"
                  value={historyFilters.start_date}
                  onChange={(e) => handleDateChange("start_date", e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                <input
                  type="date"
                  value={historyFilters.end_date}
                  onChange={(e) => handleDateChange("end_date", e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleHistoryFilterReset}
                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Reset
              </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {historyLoading ? (
                <div className="text-center py-12 text-gray-500">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-gray-400" />
                  Loading history...
                </div>
              ) : historyAlerts.length > 0 ? (
                <div className="space-y-3">
                  {historyAlerts.map((alert) => (
                    <div
                      key={alert.alert_id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">Alert #{alert.alert_id}</span>
                          <span className="text-gray-500 text-sm">{alert.alert_type}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SEVERITY_COLORS[alert.severity] || "bg-gray-200 text-gray-700"}`}>
                            {alert.severity}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[alert.status] || "bg-gray-100 text-gray-700"}`}>
                            {alert.status}
                          </span>
                        </div>
                      </div>

                      {alert.trigger_notes && (
                        <p className="text-sm text-gray-600 mb-2">{alert.trigger_notes}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Employee #{alert.employee_id}</span>
                        {alert.booking_id && <span>Booking #{alert.booking_id}</span>}
                        <span>Triggered: {new Date(alert.triggered_at).toLocaleString()}</span>
                        {alert.acknowledged_at && (
                          <span>Acknowledged: {new Date(alert.acknowledged_at).toLocaleString()}</span>
                        )}
                        {alert.closed_at && (
                          <span>Closed: {new Date(alert.closed_at).toLocaleString()}</span>
                        )}
                        {alert.resolution_time_seconds && (
                          <span>Resolved in: {Math.round(alert.resolution_time_seconds / 60)}m</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No alerts found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalHistoryPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between shrink-0">
                <span className="text-sm text-gray-600">
                  Page {historyPage} of {totalHistoryPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchHistory(historyPage - 1)}
                    disabled={historyPage === 1 || historyLoading}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => fetchHistory(historyPage + 1)}
                    disabled={historyPage === totalHistoryPages || historyLoading}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Timeline Modal ── */}
      {showTimelineModal && timelineAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-indigo-600" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Alert #{timelineAlert.alert_id} — Timeline
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {timelineAlert.alert_type} &nbsp;·&nbsp;
                    <span className={`font-semibold ${SEVERITY_COLORS[timelineAlert.severity] ? "" : ""}`}>
                      {timelineAlert.severity}
                    </span>
                    &nbsp;·&nbsp; Employee #{timelineAlert.employee_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowTimelineModal(false);
                  setTimelineAlert(null);
                  setTimelineEvents([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Timeline Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {timelineLoading ? (
                <div className="text-center py-12 text-gray-500">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-indigo-400" />
                  Loading timeline...
                </div>
              ) : timelineEvents.length > 0 ? (
                <ol className="relative">
                  {timelineEvents.map((event, index) => {
                    const style = TIMELINE_EVENT_STYLES[event.event_type] || TIMELINE_EVENT_STYLES["TRIGGERED"];
                    const EventIcon = style.icon;
                    const isLast = index === timelineEvents.length - 1;

                    return (
                      <li key={index} className="flex gap-4 mb-0">
                        {/* Dot + vertical line */}
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style.dot} shadow-sm`}>
                            <EventIcon className="h-4 w-4 text-white" />
                          </div>
                          {!isLast && (
                            <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                          )}
                        </div>

                        {/* Event card */}
                        <div className={`flex-1 pb-6 ${isLast ? "" : ""}`}>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${style.badge}`}>
                                {event.event_type}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(event.timestamp).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </span>
                            </div>

                            {event.description && (
                              <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                            )}

                            {/* Extra details if present */}
                            {event.details && Object.keys(event.details).length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                                {event.details.location && (
                                  <span>📍 {event.details.location}</span>
                                )}
                                {event.details.responder && (
                                  <span>👤 {event.details.responder}</span>
                                )}
                                {event.details.resolution_notes && (
                                  <span>📝 {event.details.resolution_notes}</span>
                                )}
                                {event.details.escalated_to && (
                                  <span>📧 Escalated to: {event.details.escalated_to}</span>
                                )}
                                {event.details.escalation_level && (
                                  <span>⬆ Level {event.details.escalation_level}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No timeline events found</p>
                  <p className="text-sm text-gray-400 mt-1">This alert has no recorded history yet</p>
                </div>
              )}
            </div>

            {/* Footer — event count */}
            {!timelineLoading && timelineEvents.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 shrink-0 rounded-b-xl">
                {timelineEvents.length} event{timelineEvents.length !== 1 ? "s" : ""} recorded
              </div>
            )}
          </div>
        </div>
      )}

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
            Alert ID: <span className="font-medium">{currentAlert?.alert_id}</span>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            Acknowledging as: <strong>{currentUserName}</strong> (ID: {currentUserId})
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={ackForm.notes}
              onChange={(e) => setAckForm({ ...ackForm, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
        submitColor="bg-orange-600 hover:bg-orange-700"
        size="md"
        mode="create"
        isLoading={actionLoading}
        disabled={actionLoading}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Alert ID: <span className="font-medium">{currentAlert?.alert_id}</span>
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
            Escalating as: <strong>{currentUserName}</strong> (ID: {currentUserId})
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escalation Level</label>
            <select
              value={escalateForm.escalation_level}
              onChange={(e) => setEscalateForm({ ...escalateForm, escalation_level: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={actionLoading}
            >
              <option value={1}>Level 1 (Low)</option>
              <option value={2}>Level 2 (Medium)</option>
              <option value={3}>Level 3 (High)</option>
              <option value={4}>Level 4 (Critical)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escalated To (email)</label>
            <input
              type="email"
              value={escalateForm.escalated_to}
              onChange={(e) => setEscalateForm({ ...escalateForm, escalated_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="director@company.com"
              required
              disabled={actionLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Escalation</label>
            <textarea
              value={escalateForm.reason}
              onChange={(e) => setEscalateForm({ ...escalateForm, reason: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Explain why this alert needs escalation..."
              required
              disabled={actionLoading}
            />
          </div>
        </div>
      </Modal>

      {/* Close Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => !actionLoading && setShowCloseModal(false)}
        onSubmit={handleCloseAlert}
        title="Close Alert"
        submitText={actionLoading ? "Closing..." : "Confirm Close"}
        submitColor="bg-red-600 hover:bg-red-700"
        size="md"
        mode="create"
        isLoading={actionLoading}
        disabled={actionLoading}
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <strong>Alert #{currentAlert?.alert_id}</strong> &nbsp;|&nbsp;
            <strong>Type:</strong> {currentAlert?.alert_type} &nbsp;|&nbsp;
            <strong>Severity:</strong> {currentAlert?.severity}
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            Closing as: <strong>{currentUserName}</strong> (ID: {currentUserId})
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resolution Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={closeForm.resolution_notes}
              onChange={(e) => setCloseForm({ ...closeForm, resolution_notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe how the alert was resolved..."
              required
              disabled={actionLoading}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_false_alarm"
              checked={closeForm.is_false_alarm}
              onChange={(e) => setCloseForm({ ...closeForm, is_false_alarm: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              disabled={actionLoading}
            />
            <label htmlFor="is_false_alarm" className="text-sm font-medium text-gray-700">
              Mark as False Alarm
            </label>
          </div>
          {closeForm.is_false_alarm && (
            <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded p-2">
              This alert will be marked as <strong>FALSE_ALARM</strong> and cannot be modified after closing.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPage;