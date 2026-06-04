import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import {
  Play,
  Square,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Terminal,
  List,
  WifiOff,
} from "lucide-react";

import { fetchRecentLogsThunk } from "../redux/features/logs/logsThunks";
import {
  clearRecentLogs,
  selectRecentLogEntries,
  selectRecentLogsTotal,
  selectRecentLogsLoading,
  selectRecentLogsError,
} from "../redux/features/logs/logsSlice";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE =
  (import.meta.env.VITE_API_URL || "https://api.mltcorporate.com/api/v1").replace(
    /\/$/,
    ""
  );
const MAX_STREAM_ENTRIES = 500;
const LEVELS = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"];

const DEFAULT_FILTERS = {
  level: "DEBUG",
  path: "",
  status_code: "",
  tail: "100",
};

// ─── Style helpers ────────────────────────────────────────────────────────────

const LEVEL_BADGE = {
  DEBUG:    "bg-gray-100 text-gray-600",
  INFO:     "bg-blue-100 text-blue-700",
  WARNING:  "bg-yellow-100 text-yellow-700",
  ERROR:    "bg-red-100 text-red-700",
  CRITICAL: "bg-purple-100 text-purple-700",
};

const LEVEL_TERM = {
  DEBUG:    "text-gray-400",
  INFO:     "text-blue-300",
  WARNING:  "text-yellow-300",
  ERROR:    "text-red-400",
  CRITICAL: "text-purple-400",
};

const httpStatusColor = (code) => {
  if (!code) return "text-gray-400";
  if (code >= 500) return "text-red-400";
  if (code >= 400) return "text-yellow-300";
  if (code >= 300) return "text-blue-300";
  return "text-green-400";
};

const fmtTs = (ts) => {
  if (!ts) return "--:--:--.---";
  try {
    return new Date(ts).toISOString().slice(11, 23); // HH:MM:SS.mmm
  } catch {
    return String(ts).slice(0, 23);
  }
};

// ─── Atoms ────────────────────────────────────────────────────────────────────

const LevelBadge = ({ level }) => (
  <span
    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${
      LEVEL_BADGE[level] || "bg-gray-100 text-gray-600"
    }`}
  >
    {level || "?"}
  </span>
);

const StreamStatusBadge = ({ status }) => {
  const cfg = {
    idle:         { dot: "bg-gray-400",                 label: "Idle" },
    connecting:   { dot: "bg-yellow-400 animate-pulse", label: "Connecting…" },
    connected:    { dot: "bg-green-500 animate-pulse",  label: "Live" },
    disconnected: { dot: "bg-gray-500",                 label: "Disconnected" },
    error:        { dot: "bg-red-500",                  label: "Error" },
  }[status] || { dot: "bg-gray-400", label: status };

  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
      <span className="font-medium text-gray-700">{cfg.label}</span>
    </span>
  );
};

const ErrorBanner = ({ message }) => (
  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
    <WifiOff size={16} className="mt-0.5 shrink-0" />
    <span>{message}</span>
  </div>
);

// ─── Filter row ───────────────────────────────────────────────────────────────

const FilterRow = ({ filters, onChange, disabled }) => (
  <div className="flex flex-wrap gap-3 items-end">
    {/* Level */}
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        Level
      </label>
      <select
        disabled={disabled}
        value={filters.level}
        onChange={(e) => onChange({ level: e.target.value })}
        className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {LEVELS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </div>

    {/* Path */}
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        Path filter
      </label>
      <input
        disabled={disabled}
        type="text"
        value={filters.path}
        onChange={(e) => onChange({ path: e.target.value })}
        placeholder="/bookings"
        className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm w-36 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>

    {/* Status code */}
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        Status code
      </label>
      <input
        disabled={disabled}
        type="number"
        value={filters.status_code}
        onChange={(e) => onChange({ status_code: e.target.value })}
        placeholder="500"
        min="100"
        max="599"
        className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>

    {/* Tail */}
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        Tail
      </label>
      <input
        disabled={disabled}
        type="number"
        value={filters.tail}
        onChange={(e) => onChange({ tail: e.target.value })}
        min="0"
        max="1000"
        className="border border-gray-300 rounded-md px-2.5 py-1.5 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  </div>
);

// ─── Expandable row (recent snapshot table) ───────────────────────────────────

const RecentRow = ({ entry }) => {
  const [open, setOpen] = useState(false);
  const hasDetail = !!(entry.exc_info || entry.request_id || entry.module);

  return (
    <>
      <tr
        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
          hasDetail ? "cursor-pointer" : ""
        }`}
        onClick={hasDetail ? () => setOpen((v) => !v) : undefined}
      >
        {/* Timestamp */}
        <td className="px-3 py-2 text-xs font-mono text-gray-500 whitespace-nowrap">
          {fmtTs(entry.timestamp)}
        </td>

        {/* Level */}
        <td className="px-3 py-2">
          <LevelBadge level={entry.level} />
        </td>

        {/* Logger */}
        <td
          className="px-3 py-2 text-xs text-gray-400 max-w-[160px] truncate"
          title={entry.logger}
        >
          {entry.logger}
        </td>

        {/* Message */}
        <td className="px-3 py-2 text-sm text-gray-800 max-w-xs">
          <span className="line-clamp-2 break-words">{entry.message}</span>
        </td>

        {/* HTTP details */}
        <td className="px-3 py-2 text-xs font-mono whitespace-nowrap">
          {entry.http_method && (
            <span>
              <span className="font-semibold text-gray-700">
                {entry.http_method}
              </span>{" "}
              <span className="text-gray-500">{entry.http_path}</span>{" "}
              <span
                className={`font-bold ${httpStatusColor(entry.http_status)}`}
              >
                {entry.http_status}
              </span>{" "}
              <span className="text-gray-400">
                {entry.duration_ms != null
                  ? `${Number(entry.duration_ms).toFixed(1)}ms`
                  : ""}
              </span>
            </span>
          )}
        </td>

        {/* Expand toggle */}
        <td className="px-3 py-2 text-gray-400 w-6">
          {hasDetail &&
            (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </td>
      </tr>

      {/* Expanded detail row */}
      {open && (
        <tr className="bg-gray-50 border-b border-gray-100">
          <td colSpan={6} className="px-5 py-3">
            <div className="text-xs font-mono space-y-1.5 text-gray-600">
              {entry.request_id && (
                <div>
                  <span className="text-gray-400 select-none mr-2">
                    request_id
                  </span>
                  {entry.request_id}
                </div>
              )}
              {entry.module && (
                <div>
                  <span className="text-gray-400 select-none mr-2">source</span>
                  {entry.module}:{entry.lineno} · {entry.funcName}
                </div>
              )}
              {entry.exc_info && (
                <pre className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-relaxed">
                  {entry.exc_info}
                </pre>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const LogsViewer = () => {
  const dispatch = useDispatch();

  // Redux — recent snapshot
  const recentEntries = useSelector(selectRecentLogEntries);
  const recentTotal   = useSelector(selectRecentLogsTotal);
  const recentLoading = useSelector(selectRecentLogsLoading);
  const recentError   = useSelector(selectRecentLogsError);

  // Active tab (sessionStorage-persisted like other admin pages)
  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem("activeLogsTab") || "stream"
  );
  useEffect(() => {
    sessionStorage.setItem("activeLogsTab", activeTab);
  }, [activeTab]);

  // Filters — each tab has its own copy so switching doesn't reset the other
  const [streamFilters, setStreamFilters] = useState({ ...DEFAULT_FILTERS });
  const [recentFilters, setRecentFilters] = useState({ ...DEFAULT_FILTERS });

  // Stream-specific state (local — SSE connections are UI-scoped)
  const [streamStatus, setStreamStatus] = useState("idle");
  const [streamError, setStreamError]   = useState(null);
  const [streamEntries, setStreamEntries] = useState([]);
  const [autoScroll, setAutoScroll]       = useState(true);

  const abortRef    = useRef(null);
  const terminalRef = useRef(null);

  // Auto-scroll terminal when new entries arrive
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [streamEntries, autoScroll]);

  // Clean up SSE connection on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // ── SSE: connect ─────────────────────────────────────────────────────────────
  const connectStream = useCallback(async () => {
    setStreamStatus("connecting");
    setStreamError(null);

    const token = Cookies.get("auth_token");
    if (!token) {
      setStreamStatus("error");
      setStreamError("No auth token found. Please log in again.");
      return;
    }

    const q = new URLSearchParams();
    if (streamFilters.tail !== "" && streamFilters.tail !== undefined)
      q.set("tail", streamFilters.tail);
    if (streamFilters.level)
      q.set("level", streamFilters.level);
    if (streamFilters.path.trim())
      q.set("path", streamFilters.path.trim());
    if (streamFilters.status_code !== "")
      q.set("status_code", streamFilters.status_code);

    const url = `${API_BASE}/logs/stream${q.toString() ? `?${q.toString()}` : ""}`;
    abortRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        let msg;
        if (response.status === 401 || response.status === 403) {
          msg =
            "Unauthorized — your account needs the logs.read permission.";
        } else {
          const body = await response.text().catch(() => "");
          msg = `Server returned ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`;
        }
        setStreamError(msg);
        setStreamStatus("error");
        return;
      }

      if (!response.body) {
        setStreamError(
          "Your browser does not support ReadableStream (upgrade required)."
        );
        setStreamStatus("error");
        return;
      }

      setStreamStatus("connected");

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep the last (potentially incomplete) line

        for (const line of lines) {
          // skip SSE comments (": keepalive") and blank lines
          if (!line.startsWith("data: ")) continue;
          try {
            const entry = JSON.parse(line.slice(6));
            setStreamEntries((prev) => {
              const next = [
                ...prev,
                { ...entry, _uid: `${Date.now()}-${Math.random()}` },
              ];
              // cap at MAX_STREAM_ENTRIES — drop oldest for slow clients
              return next.length > MAX_STREAM_ENTRIES
                ? next.slice(next.length - MAX_STREAM_ENTRIES)
                : next;
            });
          } catch {
            // silently skip malformed SSE data lines
          }
        }
      }

      // Server closed the stream normally
      setStreamStatus("disconnected");
    } catch (err) {
      if (err.name === "AbortError") {
        // Intentional disconnect — not an error
        setStreamStatus("disconnected");
      } else if (
        !navigator.onLine ||
        err.message === "Failed to fetch" ||
        err.message?.includes("NetworkError")
      ) {
        setStreamError("Network error — cannot reach the server. Check your connection.");
        setStreamStatus("error");
      } else {
        setStreamError(err.message || "Connection failed unexpectedly.");
        setStreamStatus("error");
      }
    }
  }, [streamFilters]);

  // ── SSE: disconnect ───────────────────────────────────────────────────────────
  const disconnectStream = useCallback(() => {
    abortRef.current?.abort();
    setStreamStatus("disconnected");
  }, []);

  const clearStreamEntries = useCallback(() => {
    setStreamEntries([]);
  }, []);

  // ── Recent snapshot: fetch ────────────────────────────────────────────────────
  const fetchRecent = useCallback(() => {
    const params = {};
    if (recentFilters.tail !== "" && recentFilters.tail !== undefined)
      params.tail = recentFilters.tail;
    if (recentFilters.level)
      params.level = recentFilters.level;
    if (recentFilters.path.trim())
      params.path = recentFilters.path.trim();
    if (recentFilters.status_code !== "")
      params.status_code = recentFilters.status_code;

    dispatch(fetchRecentLogsThunk(params));
  }, [dispatch, recentFilters]);

  // Auto-fetch recent once when switching to that tab (if not already loaded)
  const hasFetchedRecent = useRef(false);
  useEffect(() => {
    if (activeTab === "recent" && !hasFetchedRecent.current) {
      hasFetchedRecent.current = true;
      fetchRecent();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const isStreaming =
    streamStatus === "connecting" || streamStatus === "connected";

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* ── Tab switcher ── */}
      <div className="flex gap-2 mb-5">
        {[
          { key: "stream", label: "Live Stream", Icon: Terminal },
          { key: "recent", label: "Recent Snapshot", Icon: List },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          LIVE STREAM TAB
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "stream" && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <FilterRow
                filters={streamFilters}
                onChange={(patch) =>
                  setStreamFilters((prev) => ({ ...prev, ...patch }))
                }
                disabled={isStreaming}
              />

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {!isStreaming ? (
                  <button
                    onClick={connectStream}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    <Play size={14} />
                    Connect
                  </button>
                ) : (
                  <button
                    onClick={disconnectStream}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                  >
                    <Square size={14} />
                    Disconnect
                  </button>
                )}

                <button
                  onClick={clearStreamEntries}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  <Trash2 size={14} />
                  Clear
                </button>

                <button
                  onClick={() => setAutoScroll((v) => !v)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    autoScroll
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  Auto-scroll {autoScroll ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {/* Status + entry count */}
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <StreamStatusBadge status={streamStatus} />
              {streamEntries.length > 0 && (
                <span className="text-xs text-gray-400">
                  {streamEntries.length.toLocaleString()} entr
                  {streamEntries.length === 1 ? "y" : "ies"}
                  {streamEntries.length === MAX_STREAM_ENTRIES &&
                    " — buffer full, oldest entries dropped"}
                </span>
              )}
            </div>

            {/* Error banner */}
            {streamStatus === "error" && streamError && (
              <div className="mt-3">
                <ErrorBanner message={streamError} />
              </div>
            )}
          </div>

          {/* Terminal output */}
          <div
            ref={terminalRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const nearBottom =
                el.scrollHeight - el.scrollTop - el.clientHeight < 40;
              if (!nearBottom && autoScroll) setAutoScroll(false);
            }}
            className="bg-gray-900 rounded-xl border border-gray-700 font-mono text-xs leading-relaxed overflow-y-auto select-text"
            style={{ height: "calc(100vh - 370px)", minHeight: 280 }}
          >
            {streamEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 select-none gap-2">
                <Terminal size={36} className="opacity-30" />
                <p className="text-sm">
                  {streamStatus === "idle"
                    ? "Set filters and click Connect to start the live stream."
                    : streamStatus === "connecting"
                    ? "Connecting to server…"
                    : streamStatus === "disconnected"
                    ? "Stream disconnected. Click Connect to reconnect."
                    : "No entries received yet."}
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-0.5">
                {streamEntries.map((entry) => (
                  <div
                    key={entry._uid}
                    className="flex gap-2 hover:bg-gray-800/60 px-1 rounded"
                  >
                    {/* Timestamp */}
                    <span className="text-gray-500 shrink-0 select-none">
                      {fmtTs(entry.timestamp)}
                    </span>

                    {/* Level */}
                    <span
                      className={`shrink-0 w-[68px] text-right ${
                        LEVEL_TERM[entry.level] || "text-gray-300"
                      }`}
                    >
                      [{entry.level}]
                    </span>

                    {/* Logger (hidden on small screens) */}
                    <span
                      className="text-gray-500 shrink-0 max-w-[180px] truncate hidden lg:inline"
                      title={entry.logger}
                    >
                      {entry.logger}
                    </span>

                    {/* Message + optional HTTP info */}
                    <span
                      className={`flex-1 break-all ${
                        LEVEL_TERM[entry.level] || "text-gray-200"
                      }`}
                    >
                      {entry.message}
                      {entry.http_method && (
                        <span className="ml-2 text-gray-400">
                          [
                          <span className="text-gray-300">
                            {entry.http_method}
                          </span>
                          <span className="text-gray-500">
                            {" "}{entry.http_path}
                          </span>
                          <span
                            className={httpStatusColor(entry.http_status)}
                          >
                            {" "}{entry.http_status}
                          </span>
                          {entry.duration_ms != null && (
                            <span className="text-gray-500">
                              {" "}{Number(entry.duration_ms).toFixed(1)}ms
                            </span>
                          )}
                          ]
                        </span>
                      )}
                      {entry.exc_info && (
                        <span className="ml-2 text-red-400">[EXCEPTION]</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jump-to-bottom hint when auto-scroll is off */}
          {!autoScroll && streamEntries.length > 0 && (
            <div className="flex justify-center -mt-2">
              <button
                onClick={() => {
                  setAutoScroll(true);
                  if (terminalRef.current) {
                    terminalRef.current.scrollTop =
                      terminalRef.current.scrollHeight;
                  }
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                ↓ Jump to bottom and re-enable auto-scroll
              </button>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          RECENT SNAPSHOT TAB
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "recent" && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <FilterRow
                filters={recentFilters}
                onChange={(patch) =>
                  setRecentFilters((prev) => ({ ...prev, ...patch }))
                }
                disabled={recentLoading}
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchRecent}
                  disabled={recentLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    size={14}
                    className={recentLoading ? "animate-spin" : ""}
                  />
                  {recentLoading ? "Fetching…" : "Fetch"}
                </button>

                {recentEntries.length > 0 && (
                  <button
                    onClick={() => dispatch(clearRecentLogs())}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                  >
                    <Trash2 size={14} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Result count */}
            {recentEntries.length > 0 && !recentLoading && (
              <p className="mt-2 text-xs text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-600">
                  {recentEntries.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-600">
                  {recentTotal}
                </span>{" "}
                matching entries · in-memory buffer (lost on server restart)
              </p>
            )}
          </div>

          {/* Error banner */}
          {recentError && <ErrorBanner message={recentError} />}

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div
              className="overflow-x-auto overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 330px)" }}
            >
              {recentLoading ? (
                <div className="p-10 text-center text-gray-400 text-sm">
                  <RefreshCw
                    size={28}
                    className="animate-spin mx-auto mb-3 opacity-40"
                  />
                  Loading log entries…
                </div>
              ) : recentEntries.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm">
                  <List size={36} className="mx-auto mb-3 opacity-25" />
                  {recentError
                    ? "Failed to load — see error above."
                    : "No entries found. Adjust filters and click Fetch."}
                </div>
              ) : (
                <table className="w-full text-sm min-w-[780px]">
                  <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Timestamp
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Logger
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        HTTP
                      </th>
                      <th className="w-6" />
                    </tr>
                  </thead>
                  <tbody>
                    {recentEntries.map((entry, idx) => (
                      <RecentRow
                        key={`${entry.request_id ?? ""}-${entry.timestamp ?? ""}-${idx}`}
                        entry={entry}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsViewer;