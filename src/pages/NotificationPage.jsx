import React, { useEffect, useState, useRef } from "react";
import {
  RefreshCw, Search, Bell, BellRing, X,
  ChevronLeft, ChevronRight, Clock, CheckCircle,
  AlertTriangle, Activity, AlertCircle, ChevronDown,
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
  } catch { return null; }
};

const STATUS_COLORS = {
  TRIGGERED:    "bg-red-100 text-red-800",
  ACKNOWLEDGED: "bg-blue-100 text-blue-800",
  IN_PROGRESS:  "bg-purple-100 text-purple-800",
  RESOLVED:     "bg-teal-100 text-teal-800",
  CLOSED:       "bg-green-100 text-green-800",
  FALSE_ALARM:  "bg-gray-100 text-gray-700",
};

const SEVERITY_COLORS = {
  CRITICAL: "bg-red-500 text-white",
  HIGH:     "bg-orange-500 text-white",
  MEDIUM:   "bg-yellow-500 text-white",
  LOW:      "bg-blue-500 text-white",
};

// 3 lifecycle stat boxes — all-time counts, clickable for history
const STAT_TO_FILTER = {
  triggered:    { status: "TRIGGERED" },
  acknowledged: { status: "ACKNOWLEDGED" },
  closed:       { status: "CLOSED" },
};

const STAT_CONFIG = {
  triggered:    { label: "Triggered",    icon: AlertTriangle, iconBg: "bg-red-500",   activeClass: "from-red-500 to-red-600",    border: "border-red-200 hover:border-red-400" },
  acknowledged: { label: "Acknowledged", icon: CheckCircle,   iconBg: "bg-blue-500",  activeClass: "from-blue-500 to-blue-600",   border: "border-blue-200 hover:border-blue-400" },
  closed:       { label: "Closed",       icon: CheckCircle,   iconBg: "bg-green-500", activeClass: "from-green-600 to-green-700",  border: "border-green-200 hover:border-green-400" },
};

const LIFECYCLE_TABS = [
  { key: "all",          label: "All",          statusKey: null },
  { key: "triggered",    label: "Triggered",    statusKey: "triggered" },
  { key: "acknowledged", label: "Acknowledged", statusKey: "acknowledged" },
  { key: "escalated",    label: "Escalated",    statusKey: "in_progress" },
  { key: "closed",       label: "Closed",       statusKey: "closed" },
];

const TIMELINE_EVENT_STYLES = {
  TRIGGERED:    { icon: AlertTriangle, dot: "bg-red-500",    badge: "bg-red-100 text-red-800" },
  ACKNOWLEDGED: { icon: CheckCircle,   dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-800" },
  ESCALATED:    { icon: AlertCircle,   dot: "bg-orange-500", badge: "bg-orange-100 text-orange-800" },
  IN_PROGRESS:  { icon: Activity,      dot: "bg-purple-500", badge: "bg-purple-100 text-purple-800" },
  RESOLVED:     { icon: CheckCircle,   dot: "bg-teal-500",   badge: "bg-teal-100 text-teal-800" },
  CLOSED:       { icon: CheckCircle,   dot: "bg-green-500",  badge: "bg-green-100 text-green-800" },
  FALSE_ALARM:  { icon: AlertCircle,   dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-700" },
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

  // All-time counts from team-alerts API (3 calls only)
  const [historicalCounts, setHistoricalCounts] = useState({ triggered: 0, acknowledged: 0, closed: 0 });
  const [countsLoading, setCountsLoading] = useState(false);

  // Action modal states
  const [showAckModal, setShowAckModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [ackForm, setAckForm] = useState({ acknowledged_by: null, notes: "" });
  const [escalateForm, setEscalateForm] = useState({ escalated_by: null, escalation_level: 1, escalated_to: "", reason: "" });
  const [closeForm, setCloseForm] = useState({ closed_by: null, resolution_notes: "", is_false_alarm: false });

  // Inline history states
  const [activeStatKey, setActiveStatKey] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyAlerts, setHistoryAlerts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyDateFilters, setHistoryDateFilters] = useState({ start_date: "", end_date: "" });
  const historyAbortRef = useRef(null);
  const dateDebounceRef = useRef(null);

  // Timeline modal states
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
      setError(err.response?.data?.message || "Unable to fetch alerts. Please try again.");
      toast.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  // 3 parallel calls — limit=1 each, we only need the `total` field
  const fetchHistoricalCounts = async () => {
    try {
      setCountsLoading(true);
      const countFilters = [
        { key: "triggered",    params: { status: "TRIGGERED" } },
        { key: "acknowledged", params: { status: "ACKNOWLEDGED" } },
        { key: "closed",       params: { status: "CLOSED" } },
      ];
      const results = await Promise.all(
        countFilters.map(({ key, params }) =>
          API_CLIENT.get("/alerts/team-alerts", { params })
            .then((r) => ({ key, count: r.data.data?.total ?? 0 }))
            .catch(() => ({ key, count: 0 }))
        )
      );
      setHistoricalCounts(Object.fromEntries(results.map(({ key, count }) => [key, count])));
    } catch (err) {
      console.error("Failed to fetch historical counts", err);
    } finally {
      setCountsLoading(false);
    }
  };

  const fetchHistory = async (page = 1, statKey = activeStatKey, dateFilters = historyDateFilters) => {
    if (!statKey) return;
    if (historyAbortRef.current) historyAbortRef.current.abort();
    const controller = new AbortController();
    historyAbortRef.current = controller;

    try {
      setHistoryLoading(true);
      const statFilter = STAT_TO_FILTER[statKey] || {};
      const params = {
        limit: HISTORY_PAGE_SIZE,
        offset: (page - 1) * HISTORY_PAGE_SIZE,
        ...statFilter,
        ...(dateFilters.start_date && { start_date: dateFilters.start_date }),
        ...(dateFilters.end_date && { end_date: dateFilters.end_date }),
      };
      const response = await API_CLIENT.get("/alerts/team-alerts", { params, signal: controller.signal });
      setHistoryAlerts(response.data.data?.alerts || []);
      setHistoryTotal(response.data.data?.total || 0);
      setHistoryPage(page);
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      toast.error("Failed to fetch alert history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleStatBoxClick = (key) => {
    setActiveStatKey(key);
    setHistoryDateFilters({ start_date: "", end_date: "" });
    setHistoryAlerts([]);
    setHistoryTotal(0);
    setShowHistoryModal(true);
    fetchHistory(1, key, { start_date: "", end_date: "" });
  };

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setActiveStatKey(null);
    setHistoryAlerts([]);
    setHistoryTotal(0);
    setHistoryDateFilters({ start_date: "", end_date: "" });
  };

  const handleDateChange = (field, value) => {
    const updated = { ...historyDateFilters, [field]: value };
    setHistoryDateFilters(updated);
    if (dateDebounceRef.current) clearTimeout(dateDebounceRef.current);
    dateDebounceRef.current = setTimeout(() => fetchHistory(1, activeStatKey, updated), 500);
  };

  const fetchTimeline = async (alert) => {
    try {
      setTimelineLoading(true);
      setTimelineEvents([]);
      const response = await API_CLIENT.get(`/alerts/${alert.alert_id}/timeline`);
      setTimelineEvents(response.data.data?.events || response.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch alert timeline");
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchHistoricalCounts();
  }, []);

  const activeStatusCounts = {
    triggered:    alerts.filter((a) => a.status === "TRIGGERED").length,
    acknowledged: alerts.filter((a) => a.status === "ACKNOWLEDGED").length,
    in_progress:  alerts.filter((a) => a.status === "IN_PROGRESS").length,
    closed:       alerts.filter((a) => a.status === "CLOSED").length,
  };

  const filteredAlerts = alerts
    .filter((alert) => {
      if (filter === "all")          return true;
      if (filter === "triggered")    return alert.status === "TRIGGERED";
      if (filter === "acknowledged") return alert.status === "ACKNOWLEDGED";
      if (filter === "escalated")    return alert.status === "IN_PROGRESS";
      if (filter === "closed")       return alert.status === "CLOSED";
      return true;
    })
    .filter((alert) =>
      alert.alert_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alert_id?.toString().includes(searchTerm) ||
      alert.employee_id?.toString().includes(searchTerm) ||
      alert.trigger_notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAlertAction = (action, alert) => {
    setCurrentAlert(alert);
    if (action === "acknowledge") {
      setAckForm({ acknowledged_by: String(currentUserId), notes: "" });
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
      const result = await dispatch(acknowledgeAlertConfigThunk({ alertId: currentAlert.alert_id, payload: ackForm }));
      if (acknowledgeAlertConfigThunk.fulfilled.match(result)) {
        toast.success("Alert acknowledged!");
        setAlerts((prev) => prev.map((a) => a.alert_id === currentAlert.alert_id ? { ...a, status: "ACKNOWLEDGED" } : a));
        setShowAckModal(false);
      } else throw new Error(result.payload?.message || "Failed");
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const handleEscalateSubmit = async () => {
    if (!currentAlert) return;
    try {
      setActionLoading(true);
      const result = await dispatch(escalateAlertConfigThunk({ alertId: currentAlert.alert_id, payload: escalateForm }));
      if (escalateAlertConfigThunk.fulfilled.match(result)) {
        toast.success("Alert escalated!");
        setShowEscalateModal(false);
      } else throw new Error(result.payload?.message || "Failed");
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const handleCloseAlert = async () => {
    if (!currentAlert) return;
    try {
      setActionLoading(true);
      const result = await dispatch(closeAlertThunk({
        alertId: currentAlert.alert_id,
        closed_by: closeForm.closed_by,
        resolution_notes: closeForm.resolution_notes,
        is_false_alarm: closeForm.is_false_alarm,
      }));
      if (closeAlertThunk.fulfilled.match(result)) {
        toast.success("Alert closed!");
        setAlerts((prev) => prev.filter((a) => a.alert_id !== currentAlert.alert_id));
        setShowCloseModal(false);
      } else throw new Error(result.payload?.message || "Failed");
    } catch (err) { toast.error(err.message); }
    finally { setActionLoading(false); }
  };

  const totalHistoryPages = Math.ceil(historyTotal / HISTORY_PAGE_SIZE);

  if (error) return <ErrorDisplay error={error} title="Alert Fetch Error" onClear={clearError} />;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">

          {/* Top row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow">
                <BellRing className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Alert Notifications</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real-time security monitoring &nbsp;·&nbsp;
                  {timestamp && `Updated ${new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-56 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => { fetchAlerts(); fetchHistoricalCounts(); }}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* ── 3 Stat Boxes — all-time counts ── */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {Object.entries(STAT_CONFIG).map(([key, config]) => {
              const isActive = activeStatKey === key;
              const count = historicalCounts[key] ?? 0;
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => handleStatBoxClick(key)}
                  title={`View ${config.label} history`}
                  className={`relative rounded-xl p-4 border-2 text-left transition-all duration-200 overflow-hidden
                    ${isActive
                      ? `bg-gradient-to-br ${config.activeClass} border-transparent shadow-lg scale-[1.02]`
                      : `bg-white ${config.border} hover:shadow-md`
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-xs font-medium mb-1 ${isActive ? "text-white/70" : "text-gray-500"}`}>
                        {config.label}
                      </p>
                      <p className={`text-3xl font-bold ${isActive ? "text-white" : "text-gray-900"}`}>
                        {countsLoading
                          ? <span className="inline-block w-8 h-7 bg-gray-200 rounded animate-pulse" />
                          : count
                        }
                      </p>
                      <p className={`text-xs mt-1 ${isActive ? "text-white/50" : "text-gray-400"}`}>
                        {isActive ? (
                          <span className="flex items-center gap-0.5"><ChevronDown className="h-3 w-3" /> viewing history</span>
                        ) : "all-time · click to view"}
                      </p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${isActive ? "bg-white/20" : config.iconBg}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Lifecycle tabs — active alert counts ── */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            {LIFECYCLE_TABS.map(({ key, label, statusKey }) => {
              const count = key === "all" ? alerts.length : activeStatusCounts[statusKey] ?? 0;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 flex items-center gap-1.5
                    ${filter === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                    ${filter === key ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── History Modal ── */}
      {showHistoryModal && activeStatKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  activeStatKey === "triggered" ? "bg-red-100" :
                  activeStatKey === "acknowledged" ? "bg-blue-100" : "bg-green-100"
                }`}>
                  <Clock className={`h-5 w-5 ${
                    activeStatKey === "triggered" ? "text-red-600" :
                    activeStatKey === "acknowledged" ? "text-blue-600" : "text-green-600"
                  }`} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 capitalize">
                    {STAT_CONFIG[activeStatKey]?.label} — Alert History
                  </h2>
                  {!historyLoading && (
                    <p className="text-xs text-gray-400 mt-0.5">{historyTotal} records found</p>
                  )}
                </div>
              </div>

              {/* Date filters */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">From</label>
                <input type="date" value={historyDateFilters.start_date}
                  onChange={(e) => handleDateChange("start_date", e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <label className="text-xs text-gray-400">To</label>
                <input type="date" value={historyDateFilters.end_date}
                  onChange={(e) => handleDateChange("end_date", e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                {(historyDateFilters.start_date || historyDateFilters.end_date) && (
                  <button
                    onClick={() => { const r = { start_date: "", end_date: "" }; setHistoryDateFilters(r); fetchHistory(1, activeStatKey, r); }}
                    className="text-xs text-gray-400 hover:text-gray-700 underline"
                  >Clear</button>
                )}
                <button onClick={handleCloseHistoryModal} className="p-2 hover:bg-gray-100 rounded-lg ml-2">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              {historyLoading ? (
                <div className="text-center py-16 text-gray-400">
                  <RefreshCw className="h-7 w-7 animate-spin mx-auto mb-3" />
                  <p className="text-sm">Loading...</p>
                </div>
              ) : historyAlerts.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Alert ID</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Severity</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee ID</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee Name</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Booking ID</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Triggered At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyAlerts.map((alert, idx) => (
                      <tr key={alert.alert_id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-5 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                          #{alert.alert_id}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${SEVERITY_COLORS[alert.severity] || "bg-gray-200 text-gray-700"}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[alert.status] || "bg-gray-100 text-gray-700"}`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                          #{alert.employee_id}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                          {alert.employee_name || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                          {alert.booking_id ? <span>#{alert.booking_id}</span> : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                          {new Date(alert.triggered_at).toLocaleString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-16">
                  <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No records found{(historyDateFilters.start_date || historyDateFilters.end_date) ? " for this date range" : ""}</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalHistoryPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50 shrink-0 rounded-b-xl">
                <span className="text-xs text-gray-500">
                  Page {historyPage} of {totalHistoryPages} &nbsp;·&nbsp; {historyTotal} total records
                </span>
                <div className="flex gap-1">
                  <button onClick={() => fetchHistory(historyPage - 1)} disabled={historyPage === 1 || historyLoading}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => fetchHistory(historyPage + 1)} disabled={historyPage === totalHistoryPages || historyLoading}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

            {/* ── Active Alerts ── */}
      <div className="px-6 py-5">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3" />
            Loading alerts...
          </div>
        ) : filteredAlerts.length > 0 ? (
          <>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
              Active Alerts &nbsp;·&nbsp; {filteredAlerts.length} showing
            </p>
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <NotificationAlertCard key={alert.alert_id} alert={alert} onAction={handleAlertAction} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">No alerts found</h3>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm ? "Try a different search term" : "All clear — no active alerts"}
            </p>
          </div>
        )}
      </div>

      {/* ── Timeline Modal ── */}
      {showTimelineModal && timelineAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Alert #{timelineAlert.alert_id} — Timeline</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {timelineAlert.alert_type} · {timelineAlert.severity} · Employee #{timelineAlert.employee_id}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowTimelineModal(false); setTimelineAlert(null); setTimelineEvents([]); }}
                className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {timelineLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-7 w-7 animate-spin mx-auto mb-3 text-indigo-400" />
                  <p className="text-sm text-gray-400">Loading timeline...</p>
                </div>
              ) : timelineEvents.length > 0 ? (
                <ol>
                  {timelineEvents.map((event, index) => {
                    const style = TIMELINE_EVENT_STYLES[event.event_type] || TIMELINE_EVENT_STYLES["TRIGGERED"];
                    const EventIcon = style.icon;
                    const isLast = index === timelineEvents.length - 1;
                    return (
                      <li key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.dot}`}>
                            <EventIcon className="h-4 w-4 text-white" />
                          </div>
                          {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                        </div>
                        <div className="flex-1 pb-5">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${style.badge}`}>{event.event_type}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(event.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            {event.description && <p className="text-sm text-gray-700 mb-2">{event.description}</p>}
                            {event.details && Object.keys(event.details).length > 0 && (
                              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                                {event.details.location && <span>📍 {event.details.location}</span>}
                                {event.details.responder && <span>👤 {event.details.responder}</span>}
                                {event.details.resolution_notes && <span>📝 {event.details.resolution_notes}</span>}
                                {event.details.escalated_to && <span>📧 {event.details.escalated_to}</span>}
                                {event.details.escalation_level && <span>⬆ Level {event.details.escalation_level}</span>}
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
                  <Clock className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No timeline events recorded yet</p>
                </div>
              )}
            </div>
            {!timelineLoading && timelineEvents.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 rounded-b-xl">
                {timelineEvents.length} event{timelineEvents.length !== 1 ? "s" : ""} recorded
              </div>
            )}
          </div>
        </div>
      )}

      {/* Acknowledgment Modal */}
      <Modal isOpen={showAckModal} onClose={() => !actionLoading && setShowAckModal(false)}
        onSubmit={handleAckSubmit} title="Acknowledge Alert"
        submitText={actionLoading ? "Submitting..." : "Submit Acknowledgment"}
        submitColor="bg-green-600 hover:bg-green-700" size="md" mode="create"
        isLoading={actionLoading} disabled={actionLoading}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Alert ID: <span className="font-medium text-gray-900">{currentAlert?.alert_id}</span></p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            Acknowledging as: <strong>{currentUserName}</strong> (ID: {currentUserId})
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={ackForm.notes} onChange={(e) => setAckForm({ ...ackForm, notes: e.target.value })}
              rows={4} disabled={actionLoading} placeholder="Add any notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>
      </Modal>

      {/* Escalation Modal */}
      <Modal isOpen={showEscalateModal} onClose={() => !actionLoading && setShowEscalateModal(false)}
        onSubmit={handleEscalateSubmit} title="Escalate Alert"
        submitText={actionLoading ? "Submitting..." : "Submit Escalation"}
        submitColor="bg-orange-600 hover:bg-orange-700" size="md" mode="create"
        isLoading={actionLoading} disabled={actionLoading}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Alert ID: <span className="font-medium text-gray-900">{currentAlert?.alert_id}</span></p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
            Escalating as: <strong>{currentUserName}</strong> (ID: {currentUserId})
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escalation Level</label>
            <select value={escalateForm.escalation_level}
              onChange={(e) => setEscalateForm({ ...escalateForm, escalation_level: parseInt(e.target.value) })}
              disabled={actionLoading} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
              <option value={1}>Level 1 (Low)</option>
              <option value={2}>Level 2 (Medium)</option>
              <option value={3}>Level 3 (High)</option>
              <option value={4}>Level 4 (Critical)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escalated To (email)</label>
            <input type="email" value={escalateForm.escalated_to}
              onChange={(e) => setEscalateForm({ ...escalateForm, escalated_to: e.target.value })}
              placeholder="director@company.com" required disabled={actionLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea value={escalateForm.reason}
              onChange={(e) => setEscalateForm({ ...escalateForm, reason: e.target.value })}
              rows={3} required disabled={actionLoading} placeholder="Explain why this needs escalation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>
      </Modal>

      {/* Close Modal */}
      <Modal isOpen={showCloseModal} onClose={() => !actionLoading && setShowCloseModal(false)}
        onSubmit={handleCloseAlert} title="Close Alert"
        submitText={actionLoading ? "Closing..." : "Confirm Close"}
        submitColor="bg-red-600 hover:bg-red-700" size="md" mode="create"
        isLoading={actionLoading} disabled={actionLoading}>
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <strong>Alert #{currentAlert?.alert_id}</strong> · {currentAlert?.alert_type} · {currentAlert?.severity}
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            Closing as: <strong>{currentUserName}</strong> (ID: {currentUserId})
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resolution Notes <span className="text-red-500">*</span>
            </label>
            <textarea value={closeForm.resolution_notes}
              onChange={(e) => setCloseForm({ ...closeForm, resolution_notes: e.target.value })}
              rows={4} required disabled={actionLoading} placeholder="Describe how the alert was resolved..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_false_alarm" checked={closeForm.is_false_alarm}
              onChange={(e) => setCloseForm({ ...closeForm, is_false_alarm: e.target.checked })}
              disabled={actionLoading} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label htmlFor="is_false_alarm" className="text-sm font-medium text-gray-700">Mark as False Alarm</label>
          </div>
          {closeForm.is_false_alarm && (
            <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded p-2">
              This will be marked as <strong>FALSE_ALARM</strong> and cannot be modified after closing.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPage;