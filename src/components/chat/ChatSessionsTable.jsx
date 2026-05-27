import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchChatSessions,
  fetchChatMessages,
} from "../../redux/features/chat/chatThunk";

import {
  setCurrentPage,
  setPageSize,
  setSearchQuery,
  setStatusFilter,
  selectFilteredSessions,
  selectSessionsMeta,
  selectSessionsLoading,
  selectSessionsError,
  selectSessionStats,
  selectCurrentPage,
  selectPageSize,
  selectSearchQuery,
  selectStatusFilter,
} from "../../redux/features/chat/chatSlice";

const TRANSCRIPT_PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const LANG_NAMES = {
  en:"English",hi:"Hindi",ar:"Arabic",fr:"French",de:"German",
  es:"Spanish",zh:"Chinese",ja:"Japanese",ko:"Korean",pt:"Portuguese",
  ru:"Russian",it:"Italian",ta:"Tamil",te:"Telugu",kn:"Kannada",
  ml:"Malayalam",mr:"Marathi",bn:"Bengali",gu:"Gujarati",pa:"Punjabi",ur:"Urdu",
};

function displayName(name, role, id) {
  if (name) return name;
  if (id)   return `${role} #${id}`;
  return `${role} (unassigned)`;
}

function avatarLabel(name, role, id) {
  if (name) return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  if (id)   return `${role[0]}${id}`;
  return role[0];
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function Highlight({ text = "", query = "" }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} style={styles.highlight}>{part}</mark>
          : part
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// UI pieces
// ---------------------------------------------------------------------------
function StatusBadge({ active }) {
  return (
    <span style={active ? styles.badgeActive : styles.badgeClosed}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#0F6E56" : "#999", display: "inline-block", marginRight: 5 }} />
      {active ? "Active" : "Closed"}
    </span>
  );
}

function Avatar({ name, role, id, variant = "emp" }) {
  return (
    <span style={variant === "emp" ? styles.avatarEmp : styles.avatarDrv} title={displayName(name, role, id)}>
      {avatarLabel(name, role, id)}
    </span>
  );
}

function PersonCell({ name, role, id, variant, query }) {
  const label = displayName(name, role, id);
  return (
    <div style={styles.personCell}>
      <Avatar name={name} role={role} id={id} variant={variant} />
      <span style={styles.personName}><Highlight text={label} query={query} /></span>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div style={styles.errorBanner}>
      <span>⚠ {message}</span>
      {onRetry && <button style={styles.retryBtn} onClick={onRetry}>Retry</button>}
    </div>
  );
}

function Skeleton({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
          {[80, "25%", "25%", 70, 80, 130, 60].map((w, j) => (
            <td key={j} style={styles.td}>
              <div style={{ ...styles.skeletonLine, width: w }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Stat cards
// ---------------------------------------------------------------------------
function StatsRow({ stats }) {
  const cards = [
    { label: "Total Sessions", value: stats.total,         icon: "💬", color: "#185FA5", bg: "#EBF3FD" },
    { label: "Active",         value: stats.active,        icon: "🟢", color: "#0F6E56", bg: "#E6F7F2" },
    { label: "Total Messages", value: stats.totalMessages, icon: "📨", color: "#7B4FBF", bg: "#F3EDFB" },
    { label: "Languages",      value: stats.uniqueLangs,   icon: "🌐", color: "#B45309", bg: "#FEF3C7" },
  ];
  return (
    <div style={styles.statsRow}>
      {cards.map((c) => (
        <div key={c.label} style={{ ...styles.statCard, borderTop: `3px solid ${c.color}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={styles.statLabel}>{c.label}</div>
              <div style={{ ...styles.statValue, color: c.color }}>{c.value}</div>
            </div>
            <div style={{ ...styles.statIcon, background: c.bg }}>{c.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
function Pagination({ page, totalPages, total, pageSize, loading, onPageChange, onPageSizeChange }) {
  function getPageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const left = page - 1, right = page + 1;
    pages.push(1);
    if (left > 2) pages.push("…");
    for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) pages.push(i);
    if (right < totalPages - 1) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  return (
    <div style={styles.paginationBar}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={styles.pgInfo}>Show</span>
        <select style={styles.pgSizeSelect} value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} disabled={loading}>
          {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span style={styles.pgInfo}>entries</span>
        {total > 0 && <span style={{ ...styles.pgInfo, marginLeft: 10, color: "#444" }}>Showing {from}–{to} of {total}</span>}
      </div>
      <div style={styles.pgBtns}>
        <button style={{ ...styles.pgBtn, ...(page <= 1 || loading ? styles.pgBtnDisabled : {}) }} disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>← Prev</button>
        {getPageNumbers().map((p, i) =>
          p === "…"
            ? <span key={`e${i}`} style={styles.pgEllipsis}>…</span>
            : <button key={p} style={{ ...styles.pgBtn, ...(p === page ? styles.pgBtnActive : {}), ...(loading ? styles.pgBtnDisabled : {}) }} disabled={loading} onClick={() => onPageChange(p)}>{p}</button>
        )}
        <button style={{ ...styles.pgBtn, ...(page >= totalPages || loading ? styles.pgBtnDisabled : {}) }} disabled={page >= totalPages || loading} onClick={() => onPageChange(page + 1)}>Next →</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Transcript Modal
// ---------------------------------------------------------------------------
function TranscriptModal({ session: s, onClose }) {
  const dispatch = useDispatch();
  const transcript = useSelector(
    (state) => state.chat.transcripts[s.booking_id] ?? {
      messages: [], total: 0, page: 1, per_page: 50, loading: false, error: null,
    }
  );
  const { messages, total, page, per_page, loading, error } = transcript;
  const totalPages  = Math.max(1, Math.ceil(total / per_page));
  const empLang     = s.employee_language ?? "en";
  const drvLang     = s.driver_language   ?? "en";
  const empDisplay  = displayName(s.employee_name, "Employee", s.employee_id);
  const drvDisplay  = displayName(s.driver_name, "Driver", s.driver_id);

  const goToPage = (n) => dispatch(fetchChatMessages({ bookingId: s.booking_id, skip: (n - 1) * per_page, limit: per_page }));
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div style={styles.modalBackdrop} onClick={handleBackdrop}>
      <div style={styles.modalBox}>

        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={styles.modalTitle}>Booking #{s.booking_id}</span>
            <StatusBadge active={s.is_active} />
            <span style={styles.readOnlyChip}>🔒 Read only</span>
          </div>
          <button style={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        {/* Participants bar */}
        <div style={styles.participantsBar}>
          <div style={styles.participantChip}>
            <Avatar name={s.employee_name} role="Employee" id={s.employee_id} variant="emp" />
            <div>
              <div style={styles.chipName}>{empDisplay}</div>
              <div style={styles.chipRole}>Employee · {LANG_NAMES[empLang] ?? empLang}</div>
            </div>
          </div>
          <div style={styles.chipArrow}>↔</div>
          <div style={styles.participantChip}>
            <Avatar name={s.driver_name} role="Driver" id={s.driver_id} variant="drv" />
            <div>
              <div style={styles.chipName}>{drvDisplay}</div>
              <div style={styles.chipRole}>Driver · {LANG_NAMES[drvLang] ?? drvLang}</div>
            </div>
          </div>
          <div style={styles.metaChips}>
            <span style={styles.metaChip}>📅 {formatDate(s.activated_at)}</span>
            <span style={styles.metaChip}>💬 {s.message_count ?? 0} messages</span>
          </div>
        </div>

        {/* Error */}
        {error && <div style={{ padding: "0 20px 10px" }}><ErrorBanner message={error} onRetry={() => goToPage(page)} /></div>}

        {/* Messages */}
        <div style={styles.modalMessages}>
          {loading ? (
            <div style={styles.msgCenter}>Loading messages…</div>
          ) : messages.length === 0 ? (
            <div style={styles.msgCenter}>No messages yet</div>
          ) : (
            messages.map((m) => (
              <MessageBubble key={m.id} msg={m} empLang={empLang} drvLang={drvLang} empDisplay={empDisplay} drvDisplay={drvDisplay} />
            ))
          )}
        </div>

        {/* Modal footer pagination */}
        {totalPages > 1 && (
          <div style={styles.modalFooter}>
            <span style={styles.pgInfo}>{(page - 1) * per_page + 1}–{Math.min(page * per_page, total)} of {total} messages</span>
            <div style={styles.pgBtns}>
              <button style={styles.pgBtn} disabled={page <= 1 || loading} onClick={() => goToPage(page - 1)}>← Prev</button>
              <button style={styles.pgBtn} disabled={page >= totalPages || loading} onClick={() => goToPage(page + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------
function MessageBubble({ msg, empLang, drvLang, empDisplay, drvDisplay }) {
  const isSystem   = msg.is_system_message || msg.sender_type === "system";
  const isEmployee = msg.sender_type === "employee";

  if (isSystem) {
    return (
      <div style={styles.systemMsg}>
        <span style={styles.systemBubble}>{msg.original_text}</span>
        <span style={styles.msgTime}>{formatDate(msg.created_at)}</span>
      </div>
    );
  }

  const recipLang      = isEmployee ? drvLang : empLang;
  const senderLabel    = isEmployee ? empDisplay : drvDisplay;
  const hasTranslation = msg.translated_text && msg.translated_text !== msg.original_text;

  return (
    <div style={{ ...styles.msgRow, justifyContent: isEmployee ? "flex-start" : "flex-end" }}>
      <div style={{ maxWidth: "62%" }}>
        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3, textAlign: isEmployee ? "left" : "right" }}>{senderLabel}</div>
        <div style={isEmployee ? styles.bubbleEmp : styles.bubbleDrv}>{msg.original_text}</div>
        {hasTranslation && (
          <div style={styles.translationRow}>
            <span style={styles.trLabel}>→ {recipLang}:</span>
            <span>{msg.translated_text}</span>
          </div>
        )}
        <div style={{ ...styles.msgMeta, justifyContent: isEmployee ? "flex-start" : "flex-end" }}>
          <span style={styles.msgTime}>{formatDate(msg.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main table
// ---------------------------------------------------------------------------
export default function ChatSessionsTable() {
  const dispatch     = useDispatch();
  const sessions     = useSelector(selectFilteredSessions);
  const meta         = useSelector(selectSessionsMeta);
  const loading      = useSelector(selectSessionsLoading);
  const error        = useSelector(selectSessionsError);
  const stats        = useSelector(selectSessionStats);
  const page         = useSelector(selectCurrentPage);
  const pageSize     = useSelector(selectPageSize);
  const search       = useSelector(selectSearchQuery);
  const statusFilter = useSelector(selectStatusFilter);
  const [modalSession, setModalSession] = useState(null);

  useEffect(() => {
    dispatch(fetchChatSessions({ skip: (page - 1) * pageSize, limit: pageSize }));
  }, [dispatch, page, pageSize]);

  const handleRefresh = () => dispatch(fetchChatSessions({ skip: (page - 1) * pageSize, limit: pageSize }));

  const openModal = (session) => {
    setModalSession(session);
    dispatch(fetchChatMessages({ bookingId: session.booking_id, skip: 0, limit: TRANSCRIPT_PAGE_SIZE }));
  };

  return (
    <div style={styles.root}>

      {/* Stat cards */}
      <StatsRow stats={stats} />

      {/* Toolbar — search + filter + refresh all in one row */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search booking ID, employee or driver…"
            value={search}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => dispatch(setSearchQuery(""))}>✕</button>
          )}
        </div>
        <select style={styles.select} value={statusFilter} onChange={(e) => dispatch(setStatusFilter(e.target.value))}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
        <button style={styles.refreshBtn} onClick={handleRefresh} disabled={loading}>
          {loading ? "…" : "↻"} Refresh
        </button>
      </div>

      {/* Error */}
      {error && <ErrorBanner message={error} onRetry={handleRefresh} />}

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <colgroup>
            <col style={{ width: 90 }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 90 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 80 }} />
          </colgroup>
          <thead>
            <tr>
              {[
                { label: "Booking", center: false },
                { label: "Employee", center: false },
                { label: "Driver", center: false },
                { label: "Messages", center: true },
                { label: "Status", center: false },
                { label: "Started", center: false },
                { label: "Action", center: true },
              ].map(({ label, center }) => (
                <th key={label} style={{ ...styles.th, ...(center ? { textAlign: "center" } : {}) }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <Skeleton rows={pageSize > 10 ? 8 : pageSize} />
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: "center", padding: "3rem", color: "#bbb", fontSize: 13 }}>
                  No chat sessions found
                </td>
              </tr>
            ) : (
              sessions.map((s, idx) => (
                <SessionRow key={s.id} session={s} search={search} idx={idx} onView={() => openModal(s)} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — single instance at bottom */}
      <Pagination
        page={page}
        totalPages={meta.total_pages}
        total={meta.total}
        pageSize={pageSize}
        loading={loading}
        onPageChange={(p) => dispatch(setCurrentPage(p))}
        onPageSizeChange={(s) => dispatch(setPageSize(s))}
      />

      {/* Modal */}
      {modalSession && <TranscriptModal session={modalSession} onClose={() => setModalSession(null)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Session row
// ---------------------------------------------------------------------------
function SessionRow({ session: s, search, idx, onView }) {
  return (
    <tr style={{ ...styles.row, background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
      <td style={{ ...styles.td, ...styles.monoText }}>
        <Highlight text={`#${s.booking_id}`} query={search} />
      </td>
      <td style={styles.td}>
        <PersonCell name={s.employee_name} role="Employee" id={s.employee_id} variant="emp" query={search} />
      </td>
      <td style={styles.td}>
        <PersonCell name={s.driver_name} role="Driver" id={s.driver_id} variant="drv" query={search} />
      </td>
      <td style={{ ...styles.td, textAlign: "center" }}>
        <span style={styles.msgCount}>{s.message_count ?? 0}</span>
      </td>
      <td style={styles.td}><StatusBadge active={s.is_active} /></td>
      <td style={{ ...styles.td, fontSize: 12, color: "#777", whiteSpace: "nowrap" }}>{formatDate(s.activated_at)}</td>
      <td style={{ ...styles.td, textAlign: "center" }}>
        <button style={styles.viewBtn} onClick={onView}>View</button>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = {
  root:           { fontFamily: "system-ui, -apple-system, sans-serif", padding: "1.25rem 0", width: "100%", boxSizing: "border-box" },

  // Stats
  statsRow:       { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.25rem" },
  statCard:       { background: "#fff", borderRadius: 8, padding: "14px 16px", border: "0.5px solid #e8e8e8", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  statLabel:      { fontSize: 11, color: "#999", marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px" },
  statValue:      { fontSize: 26, fontWeight: 600, lineHeight: 1 },
  statIcon:       { width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },

  // Toolbar
  toolbar:        { display: "flex", gap: 8, marginBottom: 12, alignItems: "center" },
  searchWrap:     { flex: 1, position: "relative", display: "flex", alignItems: "center" },
  searchIcon:     { position: "absolute", left: 10, fontSize: 13, pointerEvents: "none" },
  searchInput:    { width: "100%", fontSize: 13, padding: "8px 32px 8px 32px", border: "0.5px solid #ddd", borderRadius: 7, outline: "none", boxSizing: "border-box", background: "#fafafa" },
  clearBtn:       { position: "absolute", right: 8, background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 12, padding: 2 },
  select:         { fontSize: 13, padding: "8px 12px", border: "0.5px solid #ddd", borderRadius: 7, background: "#fafafa", cursor: "pointer", color: "#444" },
  refreshBtn:     { fontSize: 12, padding: "8px 14px", borderRadius: 7, border: "0.5px solid #ddd", background: "#fff", cursor: "pointer", whiteSpace: "nowrap", color: "#444", fontWeight: 500 },

  // Table
  tableWrapper:   { border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  table:          { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:             { textAlign: "left", fontSize: 10, fontWeight: 600, color: "#999", padding: "11px 14px", borderBottom: "1px solid #eee", background: "#f8f9fa", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" },
  td:             { padding: "11px 14px", borderBottom: "0.5px solid #f0f0f0", verticalAlign: "middle", color: "#444" },
  row:            { transition: "background 0.1s" },
  monoText:       { fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#185FA5" },
  personCell:     { display: "flex", alignItems: "center", gap: 8 },
  personName:     { fontSize: 13, color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 },
  avatarEmp:      { width: 30, height: 30, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#E6F1FB", color: "#185FA5", fontSize: 9, fontWeight: 700, flexShrink: 0, letterSpacing: "-0.5px" },
  avatarDrv:      { width: 30, height: 30, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#EAF3DE", color: "#3B6D11", fontSize: 9, fontWeight: 700, flexShrink: 0, letterSpacing: "-0.5px" },
  badgeActive:    { fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#E6F7F2", color: "#0F6E56", fontWeight: 500, display: "inline-flex", alignItems: "center" },
  badgeClosed:    { fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#F5F5F5", color: "#888", fontWeight: 500, display: "inline-flex", alignItems: "center" },
  msgCount:       { fontWeight: 600, color: "#333", fontSize: 13 },
  highlight:      { background: "#FFF176", color: "#111", borderRadius: 2, padding: "0 1px" },
  viewBtn:        { fontSize: 12, padding: "5px 16px", borderRadius: 6, border: "1px solid #185FA5", background: "#fff", color: "#185FA5", cursor: "pointer", fontWeight: 500, transition: "all 0.15s" },

  // Pagination
  paginationBar:  { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 2px", flexWrap: "wrap", gap: 8 },
  pgSizeSelect:   { fontSize: 12, padding: "4px 8px", border: "0.5px solid #ddd", borderRadius: 6, background: "#fff", cursor: "pointer" },
  pgInfo:         { fontSize: 12, color: "#888" },
  pgBtns:         { display: "flex", gap: 4, alignItems: "center" },
  pgBtn:          { padding: "5px 10px", borderRadius: 6, border: "0.5px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 12, minWidth: 34, textAlign: "center", color: "#444" },
  pgBtnActive:    { background: "#185FA5", color: "#fff", borderColor: "#185FA5", fontWeight: 600 },
  pgBtnDisabled:  { opacity: 0.35, cursor: "not-allowed" },
  pgEllipsis:     { padding: "5px 4px", fontSize: 13, color: "#bbb", userSelect: "none" },
  errorBanner:    { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", marginBottom: 12, borderRadius: 8, background: "#FCEBEB", color: "#A32D2D", fontSize: 13, border: "0.5px solid #F7C1C1" },
  retryBtn:       { fontSize: 12, padding: "3px 10px", borderRadius: 6, border: "0.5px solid #A32D2D", background: "transparent", color: "#A32D2D", cursor: "pointer" },
  skeletonLine:   { height: 12, borderRadius: 4, background: "#ebebeb" },

  // Modal
  modalBackdrop:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" },
  modalBox:         { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 700, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.22)", overflow: "hidden" },
  modalHeader:      { padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" },
  modalTitle:       { fontSize: 15, fontWeight: 700, color: "#111" },
  readOnlyChip:     { fontSize: 11, color: "#aaa", marginLeft: 6 },
  modalClose:       { fontSize: 16, background: "none", border: "none", cursor: "pointer", color: "#999", padding: 4, lineHeight: 1, borderRadius: 4 },
  participantsBar:  { display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", background: "#f8f9fa", borderBottom: "1px solid #eee", flexWrap: "wrap" },
  participantChip:  { display: "flex", alignItems: "center", gap: 8 },
  chipArrow:        { fontSize: 16, color: "#ccc", fontWeight: 300 },
  chipName:         { fontSize: 13, fontWeight: 500, color: "#222" },
  chipRole:         { fontSize: 11, color: "#999" },
  metaChips:        { marginLeft: "auto", display: "flex", gap: 10 },
  metaChip:         { fontSize: 11, color: "#888", background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 6, padding: "3px 8px" },
  modalMessages:    { flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10, background: "#fdfdfd" },
  modalFooter:      { padding: "10px 20px", borderTop: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#888", background: "#fff" },
  msgCenter:        { textAlign: "center", color: "#bbb", fontSize: 13, padding: "2.5rem 0" },
  msgRow:           { display: "flex" },
  bubbleEmp:        { padding: "9px 13px", borderRadius: "4px 14px 14px 14px", background: "#E6F1FB", fontSize: 13, lineHeight: 1.55, color: "#111" },
  bubbleDrv:        { padding: "9px 13px", borderRadius: "14px 4px 14px 14px", background: "#EAF3DE", fontSize: 13, lineHeight: 1.55, color: "#111" },
  systemMsg:        { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, margin: "4px 0" },
  systemBubble:     { padding: "5px 14px", borderRadius: 20, background: "#f0f0f0", fontSize: 11, color: "#888", fontStyle: "italic", textAlign: "center" },
  translationRow:   { display: "flex", gap: 6, marginTop: 4, padding: "4px 10px", borderRadius: 6, background: "rgba(0,0,0,0.04)", fontSize: 11, color: "#666" },
  trLabel:          { color: "#bbb", whiteSpace: "nowrap" },
  msgMeta:          { display: "flex", gap: 6, alignItems: "center", marginTop: 4 },
  msgTime:          { fontSize: 11, color: "#bbb" },
};