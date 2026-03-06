/**
 * AnnouncementForm.jsx
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector }                                   from "react-redux";
import {
  FileText, Target, Radio,
  ChevronRight, Loader2, AlertCircle, X,
  CheckCircle2, Users, Truck, Building2, Hash,
  Upload, Trash2,
} from "lucide-react";

import {
  createAnnouncement,
  updateAnnouncement,
}                        from "../../redux/features/notifications/announcementThunks";
import {
  selectIsCreating,
  selectIsUpdating,
  selectCreateError,
  selectUpdateError,
  clearError,
}                        from "../../redux/features/notifications/announcementsSlice";

import {
  NewfetchDriversThunk,
  driversSelectors,
}                        from "../../redux/features/manageDriver/newDriverSlice";

import { useVendorOptions }    from "../../hooks/useVendorOptions";
import { fetchEmployeesThunk } from "../../redux/features/employees/employeesThunk";
import { selectAllEmployees }  from "../../redux/features/employees/employeesSlice";
import { fetchTeamsThunk }     from "../../redux/features/teams/teamsTrunk";
import { selectTeams }         from "../../redux/features/teams/teamsSlice";

import Modal from "@components/modals/Modal";

// ─── Constants ──────────────────────────────────────────────────────────────────
const ALWAYS_ON_CHANNEL = "in_app";

const MEDIA_CONTENT_TYPES = new Set(["image", "video", "audio", "pdf"]);

const TARGET_TYPES_REQUIRING_IDS = new Set([
  "specific_employees", "specific_drivers", "teams", "vendor_drivers",
]);

const DRIVER_TARGET_TYPES = new Set(["specific_drivers", "vendor_drivers"]);

const ACCEPT_MAP = {
  image: "image/jpeg,image/png,image/gif,image/webp",
  video: "video/mp4,video/quicktime,video/avi,video/webm",
  audio: "audio/mpeg,audio/wav,audio/ogg,audio/m4a",
  pdf:   "application/pdf",
};

const FILE_EXT_HINT = {
  image: "JPG, PNG, GIF, WEBP",
  video: "MP4, MOV, AVI, WEBM",
  audio: "MP3, WAV, OGG, M4A",
  pdf:   "PDF",
};

const FILE_ICON = { image: "🖼", video: "🎬", audio: "🎵", pdf: "📄" };

const CONTENT_TYPE_OPTIONS = [
  { value: "text",  label: "Text",  icon: "📝" },
  { value: "image", label: "Image", icon: "🖼" },
  { value: "video", label: "Video", icon: "🎬" },
  { value: "audio", label: "Audio", icon: "🎵" },
  { value: "pdf",   label: "PDF",   icon: "📄" },
  { value: "link",  label: "Link",  icon: "🔗" },
];

const TARGET_OPTIONS = [
  { value: "all_employees",      label: "All Employees",      icon: Users, needsIds: false },
  { value: "specific_employees", label: "Specific Employees", icon: Users, needsIds: true  },
  { value: "teams",              label: "Teams",              icon: Hash,  needsIds: true  },
  { value: "all_drivers",        label: "All Drivers",        icon: Truck, needsIds: false },
  { value: "vendor_drivers",     label: "Vendor Drivers",     icon: Truck, needsIds: true  },
  { value: "specific_drivers",   label: "Specific Drivers",   icon: Truck, needsIds: true  },
];

const CHANNEL_CONFIG = {
  push:   { label: "Push",   color: "blue",   desc: "Mobile notification" },
  sms:    { label: "SMS",    color: "green",  desc: "Text message"        },
  email:  { label: "Email",  color: "orange", desc: "Email delivery"      },
  in_app: { label: "In-App", color: "purple", desc: "Always included"     },
};

const CHANNEL_COLORS = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   dot: "bg-blue-500"   },
  green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  dot: "bg-green-500"  },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
};

const INITIAL_FORM = {
  title: "", body: "", content_type: "text",
  target_type: "all_employees", target_ids: [],
  media_url: "", media_file: null,
  channels: ["push", "in_app"],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// API may return channels as "push,in_app" string or ["push","in_app"] array
function normalizeChannels(channels) {
  if (!channels)               return ["push", "in_app"];
  if (Array.isArray(channels)) return channels;
  if (typeof channels === "string")
    return channels.split(",").map((c) => c.trim()).filter(Boolean);
  return ["push", "in_app"];
}

function validateForm(formData) {
  const errors = {};
  if (!formData.title.trim()) errors.title = "Title is required.";
  if (!formData.body.trim())  errors.body  = "Body is required.";
  if (
    TARGET_TYPES_REQUIRING_IDS.has(formData.target_type) &&
    formData.target_ids.length === 0
  ) errors.target_ids = "Please select at least one target.";
  return errors;
}

// ─── UI atoms ──────────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-600",
    teal:   "bg-teal-100   text-teal-600",
    amber:  "bg-amber-100  text-amber-600",
  };
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 leading-none">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function FieldError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle size={11} /> {children}
    </p>
  );
}

function InputLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────
const AnnouncementForm = ({ announcement, onClose, onSuccess }) => {
  const dispatch     = useDispatch();
  const isEdit       = !!announcement;
  const fileInputRef = useRef(null);

  const isCreating  = useSelector(selectIsCreating);
  const isUpdating  = useSelector(selectIsUpdating);
  const createError = useSelector(selectCreateError);
  const updateError = useSelector(selectUpdateError);

  const isSubmitting = isEdit ? isUpdating  : isCreating;
  const apiError     = isEdit ? updateError : createError;
  const errorKey     = isEdit ? "updateError" : "createError";

  // ── Slice data ──────────────────────────────────────────────────────────────
  const drivers    = useSelector(driversSelectors.selectAll);
  const employees  = useSelector(selectAllEmployees);
  const teamsState = useSelector(selectTeams);
  const teams      = useMemo(
    () => teamsState.allIds.map((id) => teamsState.byId[id]).filter(Boolean),
    [teamsState]
  );
  const { vendorList: vendors } = useVendorOptions(null, true);

  // ── Local state ─────────────────────────────────────────────────────────────
  const [formData,         setFormData]         = useState(INITIAL_FORM);
  const [fieldErrors,      setFieldErrors]      = useState({});
  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  // Edit mode: API returns target_ids but not vendor_id. Store them so they
  // show as pre-selected before the user picks a vendor (driver types only).
  const [editModeIds,      setEditModeIds]      = useState([]);

  // ── Populate in edit mode ───────────────────────────────────────────────────
  useEffect(() => {
    if (!announcement) return;

    setFormData({
      title:        announcement.title        ?? "",
      body:         announcement.body         ?? "",
      content_type: announcement.content_type ?? "text",
      target_type:  announcement.target_type  ?? "all_employees",
      target_ids:   announcement.target_ids   ?? [],
      media_url:    announcement.media_url    ?? "",
      media_file:   null,
      channels:     normalizeChannels(announcement.channels),
    });

    // Fetch list data for the target_type immediately — target_type won't
    // change so the normal useEffect below won't fire in edit mode.
    switch (announcement.target_type) {
      case "specific_employees": dispatch(fetchEmployeesThunk()); break;
      case "teams":              dispatch(fetchTeamsThunk());     break;
      // drivers: need vendor_id first — handled via editModeIds pills below
      default: break;
    }

    // For driver types: save the API IDs as pills (shown before vendor chosen)
    if (DRIVER_TARGET_TYPES.has(announcement.target_type) &&
        announcement.target_ids?.length) {
      setEditModeIds(announcement.target_ids);
    }
  }, [announcement, dispatch]);

  // ── Reset media when content_type changes ───────────────────────────────────
  useEffect(() => {
    setFormData((p) => ({ ...p, media_file: null, media_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [formData.content_type]);

  // ── Fetch list data when target_type changes (create mode) ──────────────────
  useEffect(() => {
    switch (formData.target_type) {
      case "specific_employees": dispatch(fetchEmployeesThunk()); break;
      case "teams":              dispatch(fetchTeamsThunk());     break;
      default: break;
    }
    setSearchQuery("");
    setSelectedVendorId("");
    setEditModeIds([]);
    setFormData((p) => ({ ...p, target_ids: [] }));
    setFieldErrors((p) => { const n = { ...p }; delete n.target_ids; return n; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.target_type, dispatch]);

  // ── Fetch drivers after vendor chosen ───────────────────────────────────────
  useEffect(() => {
    if (DRIVER_TARGET_TYPES.has(formData.target_type) && selectedVendorId) {
      dispatch(NewfetchDriversThunk({ vendor_id: selectedVendorId }));
    }
  }, [selectedVendorId, formData.target_type, dispatch]);

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  useEffect(() => () => { dispatch(clearError(errorKey)); }, [dispatch, errorKey]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => { if (!p[name]) return p; const n = { ...p }; delete n[name]; return n; });
  }, []);

  const handleTargetTypeChange = useCallback((value) => {
    setFormData((p) => ({ ...p, target_type: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((p) => ({ ...p, media_file: file, media_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFormData((p) => ({ ...p, media_file: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const toggleSelection = useCallback((id) => {
    setFormData((p) => ({
      ...p,
      target_ids: p.target_ids.includes(id)
        ? p.target_ids.filter((i) => i !== id)
        : [...p.target_ids, id],
    }));
    setFieldErrors((p) => { const n = { ...p }; delete n.target_ids; return n; });
  }, []);

  const handleChannelChange = useCallback((channel) => {
    if (channel === ALWAYS_ON_CHANNEL) return;
    setFormData((p) => ({
      ...p,
      channels: p.channels.includes(channel)
        ? p.channels.filter((c) => c !== channel)
        : [...p.channels, channel],
    }));
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    const payload = {
      title:        formData.title.trim(),
      body:         formData.body.trim(),
      content_type: formData.content_type,
      target_type:  formData.target_type,
      channels:     formData.channels,
      ...(TARGET_TYPES_REQUIRING_IDS.has(formData.target_type) && { target_ids: formData.target_ids }),
      ...(formData.media_url.trim() && { media_url:  formData.media_url.trim() }),
      ...(formData.media_file       && { media_file: formData.media_file       }),
    };

    const thunk = isEdit
      ? updateAnnouncement({ id: announcement.announcement_id, data: payload })
      : createAnnouncement(payload);

    const result = await dispatch(thunk);
    if (!result.error) onSuccess?.();
  }, [dispatch, formData, isEdit, announcement, onSuccess]);

  // ── Derived values ───────────────────────────────────────────────────────────
  const needsVendorFirst = DRIVER_TARGET_TYPES.has(formData.target_type);
  const showTargetList   = TARGET_TYPES_REQUIRING_IDS.has(formData.target_type);
  const isMediaType      = MEDIA_CONTENT_TYPES.has(formData.content_type);
  const hasEditModeIds   = editModeIds.length > 0;
  // Gate open if: not a driver type OR vendor chosen OR we have pre-existing IDs
  const vendorGateOpen   = !needsVendorFirst || selectedVendorId || hasEditModeIds;

  const targetItems = useMemo(() => {
    switch (formData.target_type) {
      case "specific_employees":
        return employees.map((e) => ({ id: e.employee_id ?? e.id, label: e.name ?? e.full_name ?? `Employee ${e.employee_id ?? e.id}` }));
      case "specific_drivers":
      case "vendor_drivers":
        return drivers.map((d) => ({ id: d.driver_id ?? d.id, label: d.name ?? `Driver ${d.driver_id ?? d.id}` }));
      case "teams":
        return teams.map((t) => ({ id: t.team_id ?? t.id, label: t.name ?? `Team ${t.team_id ?? t.id}` }));
      default: return [];
    }
  }, [formData.target_type, employees, drivers, teams]);

  const vendorSelectOptions = useMemo(
    () => vendors.map((v) => ({ value: v.vendor_id ?? v.id, label: v.name ?? `Vendor ${v.vendor_id ?? v.id}` })),
    [vendors]
  );

  const filteredItems = useMemo(
    () => targetItems.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase())),
    [targetItems, searchQuery]
  );

  const selectedTarget = TARGET_OPTIONS.find((t) => t.value === formData.target_type);
  const TargetIcon     = selectedTarget?.icon ?? Users;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? "Edit Announcement" : "New Announcement"}
      size="lg"
    >
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 -mt-1 mb-5 rounded" />

      <div className="space-y-5 px-1">

        {/* API error */}
        {apiError && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{apiError.message}</p>
            <button onClick={() => dispatch(clearError(errorKey))} className="text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ══ SECTION 1 — Content ══ */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <SectionHeader icon={FileText} title="Content" subtitle="What you're sending" color="indigo" />
          <div className="space-y-3">

            {/* Title */}
            <div>
              <InputLabel htmlFor="af-title" required>Title</InputLabel>
              <input
                id="af-title" name="title"
                value={formData.title} onChange={handleChange}
                disabled={isSubmitting} placeholder="e.g. Office closed tomorrow"
                aria-invalid={!!fieldErrors.title}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white placeholder:text-gray-300
                  focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all
                  ${fieldErrors.title ? "border-red-300 bg-red-50" : "border-gray-200"}`}
              />
              <FieldError>{fieldErrors.title}</FieldError>
            </div>

            {/* Body */}
            <div>
              <InputLabel htmlFor="af-body" required>Message</InputLabel>
              <textarea
                id="af-body" name="body" rows={3}
                value={formData.body} onChange={handleChange}
                disabled={isSubmitting} placeholder="Write your announcement here…"
                aria-invalid={!!fieldErrors.body}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white resize-y placeholder:text-gray-300
                  focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all
                  ${fieldErrors.body ? "border-red-300 bg-red-50" : "border-gray-200"}`}
              />
              <FieldError>{fieldErrors.body}</FieldError>
            </div>

            {/* Content type pills */}
            <div>
              <InputLabel>Content Type</InputLabel>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPE_OPTIONS.map((ct) => (
                  <button
                    key={ct.value} type="button"
                    onClick={() => setFormData((p) => ({ ...p, content_type: ct.value }))}
                    disabled={isSubmitting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${formData.content_type === ct.value
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"}`}
                  >
                    <span>{ct.icon}</span>{ct.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File upload zone */}
            {isMediaType && (
              <div>
                <InputLabel>{FILE_ICON[formData.content_type]} Attach {formData.content_type}</InputLabel>
                <input
                  ref={fileInputRef} id="af-file-input" type="file"
                  accept={ACCEPT_MAP[formData.content_type]}
                  onChange={handleFileChange} disabled={isSubmitting} className="hidden"
                />
                {formData.media_file ? (
                  <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-indigo-100 flex items-center justify-center text-base flex-shrink-0">
                      {FILE_ICON[formData.content_type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{formData.media_file.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatBytes(formData.media_file.size)}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <label htmlFor="af-file-input" title="Replace file"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium hover:bg-indigo-200 cursor-pointer transition-colors">
                        <Upload size={12} /> Replace
                      </label>
                      <button type="button" onClick={handleRemoveFile} disabled={isSubmitting} title="Remove file"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 text-red-600 text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50">
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="af-file-input"
                    className={`flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed py-8 transition-all
                      ${isSubmitting ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : "border-indigo-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-400 cursor-pointer"}`}>
                    <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                      <Upload size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">Click to upload {formData.content_type}</p>
                      <p className="text-xs text-gray-400 mt-1">{FILE_EXT_HINT[formData.content_type]}</p>
                    </div>
                  </label>
                )}
              </div>
            )}

            {/* Link URL */}
            {formData.content_type === "link" && (
              <div>
                <InputLabel htmlFor="af-link-url">🔗 URL</InputLabel>
                <input
                  id="af-link-url" name="media_url"
                  value={formData.media_url} onChange={handleChange}
                  disabled={isSubmitting} placeholder="https://…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white
                    placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                />
              </div>
            )}

          </div>
        </div>

        {/* ══ SECTION 2 — Audience ══ */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <SectionHeader icon={Target} title="Audience" subtitle="Who receives this" color="teal" />

          {/* Target type cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {TARGET_OPTIONS.map((opt) => {
              const Icon   = opt.icon;
              const active = formData.target_type === opt.value;
              return (
                <button
                  key={opt.value} type="button"
                  onClick={() => handleTargetTypeChange(opt.value)}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-medium transition-all
                    ${active
                      ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-700"}`}
                >
                  <Icon size={13} className="flex-shrink-0" />
                  <span className="leading-tight">{opt.label}</span>
                  {active && <CheckCircle2 size={12} className="ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Vendor picker — driver types only */}
          {showTargetList && needsVendorFirst && (
            <div className="mt-3">
              {/* Edit mode: show existing IDs banner */}
              {hasEditModeIds && (
                <div className="mb-2 flex items-center justify-between rounded-lg bg-teal-50 border border-teal-200 px-3 py-2">
                  <span className="text-xs text-teal-700 font-medium">
                    ✓ {editModeIds.length} driver{editModeIds.length !== 1 ? "s" : ""} currently selected
                  </span>
                  <span className="text-xs text-teal-500">Pick a vendor below to change</span>
                </div>
              )}
              <InputLabel htmlFor="af-vendor-picker" required={!hasEditModeIds}>
                <span className="flex items-center gap-1">
                  <Building2 size={11} />
                  {hasEditModeIds ? "Change vendor (optional)" : "Select Vendor first"}
                </span>
              </InputLabel>
              <select
                id="af-vendor-picker"
                value={selectedVendorId}
                onChange={(e) => {
                  setSelectedVendorId(e.target.value);
                  setEditModeIds([]);                          // clear pills once vendor chosen
                  setFormData((p) => ({ ...p, target_ids: [] }));
                }}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white
                  focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition-all"
              >
                <option value="">{hasEditModeIds ? "— Keep current selection —" : "— Choose a vendor —"}</option>
                {vendorSelectOptions.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Target list */}
          {showTargetList && vendorGateOpen && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <InputLabel>
                  <span className="flex items-center gap-1">
                    <TargetIcon size={11} /> {selectedTarget?.label}
                  </span>
                </InputLabel>
                {formData.target_ids.length > 0 && (
                  <span className="text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    {formData.target_ids.length} selected
                  </span>
                )}
              </div>

              {/* Search — only show when driver list is loaded */}
              {!(hasEditModeIds && !selectedVendorId) && (
                <input
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white mb-1.5
                    placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition-all"
                />
              )}

              <div className="border border-gray-200 rounded-lg max-h-44 overflow-y-auto bg-white divide-y divide-gray-50">
                {/* Edit mode — driver type, no vendor picked yet: show ID pills */}
                {hasEditModeIds && !selectedVendorId ? (
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-2">Currently selected (pick a vendor above to change):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {editModeIds.map((id) => (
                        <span key={id} className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-700 text-xs font-semibold border border-teal-200">
                          #{id}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <p className="py-6 text-center text-xs text-gray-400">No results found.</p>
                ) : (
                  filteredItems.map((item) => {
                    const checked = formData.target_ids.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm transition-colors
                          ${checked ? "bg-teal-50" : "hover:bg-gray-50"}`}
                      >
                        <input
                          type="checkbox" checked={checked}
                          onChange={() => toggleSelection(item.id)}
                          disabled={isSubmitting}
                          className="rounded accent-teal-600"
                        />
                        <span className={`text-xs ${checked ? "text-teal-700 font-medium" : "text-gray-700"}`}>
                          {item.label}
                        </span>
                        {checked && <CheckCircle2 size={12} className="ml-auto text-teal-500 flex-shrink-0" />}
                      </label>
                    );
                  })
                )}
              </div>
              <FieldError>{fieldErrors.target_ids}</FieldError>
            </div>
          )}
        </div>

        {/* ══ SECTION 3 — Channels ══ */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <SectionHeader icon={Radio} title="Channels" subtitle="How it's delivered" color="amber" />
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CHANNEL_CONFIG).map(([ch, cfg]) => {
              const locked   = ch === ALWAYS_ON_CHANNEL;
              const active   = formData.channels.includes(ch);
              const colorCls = CHANNEL_COLORS[cfg.color];
              return (
                <button
                  key={ch} type="button"
                  onClick={() => handleChannelChange(ch)}
                  disabled={locked || isSubmitting}
                  title={locked ? "in_app is always included" : undefined}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                    ${active
                      ? `${colorCls.bg} ${colorCls.border} ${colorCls.text}`
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}
                    ${locked ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? colorCls.dot : "bg-gray-300"}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-none">{cfg.label}</p>
                    <p className="text-xs opacity-60 mt-0.5 leading-none">{cfg.desc}</p>
                  </div>
                  {active && <CheckCircle2 size={14} className={`ml-auto flex-shrink-0 ${colorCls.text}`} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1 pb-1">
          <button
            onClick={onClose} disabled={isSubmitting}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600
              hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit} disabled={isSubmitting} aria-busy={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold
              hover:bg-indigo-700 disabled:opacity-60 shadow-sm shadow-indigo-200 transition-all"
          >
            {isSubmitting ? (
              <><Loader2 size={15} className="animate-spin" />{isEdit ? "Updating…" : "Creating…"}</>
            ) : (
              <>{isEdit ? "Update" : "Create Announcement"}<ChevronRight size={15} /></>
            )}
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default AnnouncementForm;