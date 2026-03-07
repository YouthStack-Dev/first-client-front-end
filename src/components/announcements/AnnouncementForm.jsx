import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector }                                   from "react-redux";
import {
  ChevronRight, Loader2, AlertCircle, X,
  CheckCircle2, Users, Truck, Hash, Upload, Trash2,
} from "lucide-react";

import {
  createAnnouncement,
  updateAnnouncement,
}                        from "../../redux/features/notifications/announcementThunks";
import {
  selectIsCreating, selectIsUpdating,
  selectCreateError, selectUpdateError, clearError,
}                        from "../../redux/features/notifications/announcementsSlice";

import { NewfetchDriversThunk, driversSelectors }
                         from "../../redux/features/manageDriver/newDriverSlice";
import { useVendorOptions }    from "../../hooks/useVendorOptions";
import { fetchEmployeesThunk } from "../../redux/features/employees/employeesThunk";
import { selectAllEmployees }  from "../../redux/features/employees/employeesSlice";
import { fetchTeamsThunk }     from "../../redux/features/teams/teamsTrunk";
import { selectTeams }         from "../../redux/features/teams/teamsSlice";
import Modal from "@components/modals/Modal";

// ─── Constants ──────────────────────────────────────────────────────────────────
const ALWAYS_ON_CHANNEL     = "in_app";
const MEDIA_CONTENT_TYPES   = new Set(["image","video","audio","pdf"]);
const TARGET_TYPES_WITH_IDS = new Set(["specific_employees","specific_drivers","teams","vendor_drivers"]);
const DRIVER_TARGET_TYPES   = new Set(["specific_drivers","vendor_drivers"]);

const ACCEPT_MAP = {
  image: "image/jpeg,image/png,image/gif,image/webp",
  video: "video/mp4,video/quicktime,video/avi,video/webm",
  audio: "audio/mpeg,audio/wav,audio/ogg,audio/m4a",
  pdf:   "application/pdf",
};
const FILE_EXT_HINT = { image:"JPG, PNG, WEBP", video:"MP4, MOV", audio:"MP3, WAV", pdf:"PDF" };
const FILE_ICON     = { image:"🖼", video:"🎬", audio:"🎵", pdf:"📄" };

const CONTENT_OPTS = [
  { value:"text",  label:"Text",  icon:"📝" },
  { value:"image", label:"Image", icon:"🖼" },
  { value:"video", label:"Video", icon:"🎬" },
  { value:"audio", label:"Audio", icon:"🎵" },
  { value:"pdf",   label:"PDF",   icon:"📄" },
  { value:"link",  label:"Link",  icon:"🔗" },
];

const TARGET_OPTS = [
  { value:"all_employees",      label:"All Employees",      icon:Users  },
  { value:"specific_employees", label:"Specific Employees", icon:Users  },
  { value:"teams",              label:"Teams",              icon:Hash   },
  { value:"all_drivers",        label:"All Drivers",        icon:Truck  },
  { value:"vendor_drivers",     label:"Vendor Drivers",     icon:Truck  },
  { value:"specific_drivers",   label:"Specific Drivers",   icon:Truck  },
];

const CHANNEL_CFG = {
  push:   { label:"Push",   color:"blue"   },
  sms:    { label:"SMS",    color:"green"  },
  email:  { label:"Email",  color:"orange" },
  in_app: { label:"In-App", color:"purple" },
};
const CH_COLORS = {
  blue:   "bg-blue-100 text-blue-700 border-blue-200",
  green:  "bg-green-100 text-green-700 border-green-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
};

const INITIAL = {
  title:"", body:"", content_type:"text",
  target_type:"all_employees", target_ids:[],
  media_url:"", media_file:null, channels:["push","in_app"],
};

// ─── Helpers (outside component — no closure over state) ───────────────────────

// Fix 4: was `!b` which is truthy for 0; use explicit null check instead
const fmtBytes = (b) =>
  b == null ? "" : b < 1048576
    ? `${(b / 1024).toFixed(1)} KB`
    : `${(b / 1048576).toFixed(1)} MB`;

function normalizeChannels(ch) {
  if (!ch)                return ["push","in_app"];
  if (Array.isArray(ch))  return ch;
  if (typeof ch==="string") return ch.split(",").map(c=>c.trim()).filter(Boolean);
  return ["push","in_app"];
}

function validate(f) {
  const e = {};
  if (!f.title.trim()) e.title = "Required";
  if (!f.body.trim())  e.body  = "Required";
  if (TARGET_TYPES_WITH_IDS.has(f.target_type) && f.target_ids.length === 0)
    e.target_ids = "Select at least one";
  return e;
}

// Fix 3: was defined inside component and recreated on every render
const inputCls = (err) =>
  `w-full rounded-lg border px-3 py-2 text-sm bg-white placeholder:text-gray-300
   focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all
   ${err ? "border-red-300 bg-red-50" : "border-gray-200"}`;

// ─── Tiny field error ──────────────────────────────────────────────────────────
const FErr = ({ msg }) => msg ? (
  <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
    <AlertCircle size={10} />{msg}
  </p>
) : null;

// ─── Component ─────────────────────────────────────────────────────────────────
const AnnouncementForm = ({ announcement, onClose, onSuccess }) => {
  const dispatch     = useDispatch();
  const isEdit       = !!announcement;
  const fileInputRef = useRef(null);

  // Fix 1: ref flag — when populate effect sets target_type, the target_type
  // change effect must NOT run its reset or it wipes the target_ids we just set.
  const skipTargetReset = useRef(false);

  const isCreating  = useSelector(selectIsCreating);
  const isUpdating  = useSelector(selectIsUpdating);
  const createError = useSelector(selectCreateError);
  const updateError = useSelector(selectUpdateError);
  const isSubmitting = isEdit ? isUpdating  : isCreating;
  const apiError     = isEdit ? updateError : createError;
  const errorKey     = isEdit ? "updateError" : "createError";

  const drivers    = useSelector(driversSelectors.selectAll);
  const employees  = useSelector(selectAllEmployees);
  const teamsState = useSelector(selectTeams);
  const teams      = useMemo(
    () => teamsState.allIds.map(id => teamsState.byId[id]).filter(Boolean),
    [teamsState]
  );
  const { vendorList: vendors } = useVendorOptions(null, true);

  const [formData,         setFormData]         = useState(INITIAL);
  const [fieldErrors,      setFieldErrors]      = useState({});
  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [editModeIds,      setEditModeIds]      = useState([]);

  // ── Populate edit ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!announcement) return;

    // Raise the flag before setFormData so the change effect skips its reset
    // on the render cycle triggered by this populate.
    skipTargetReset.current = true;

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

    // Fetch list data immediately — target_type won't change so the
    // normal fetch effect below won't fire in edit mode.
    switch (announcement.target_type) {
      case "specific_employees": dispatch(fetchEmployeesThunk()); break;
      case "teams":              dispatch(fetchTeamsThunk());     break;
      default: break;
    }

    // Driver types: store existing IDs as pills (shown before vendor chosen)
    if (DRIVER_TARGET_TYPES.has(announcement.target_type) && announcement.target_ids?.length)
      setEditModeIds(announcement.target_ids);
  }, [announcement, dispatch]);

  // ── Reset media on content_type switch ──────────────────────────────────────
  useEffect(() => {
    setFormData(p => ({ ...p, media_file:null, media_url:"" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [formData.content_type]);

  // ── Fetch list on target_type change ────────────────────────────────────────
  useEffect(() => {
    // Fix 1: skip reset when this run was triggered by the populate effect
    if (skipTargetReset.current) {
      skipTargetReset.current = false;
      return;
    }
    switch (formData.target_type) {
      case "specific_employees": dispatch(fetchEmployeesThunk()); break;
      case "teams":              dispatch(fetchTeamsThunk());     break;
      default: break;
    }
    setSearchQuery(""); setSelectedVendorId(""); setEditModeIds([]);
    setFormData(p => ({ ...p, target_ids:[] }));
    setFieldErrors(p => { const n={...p}; delete n.target_ids; return n; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.target_type, dispatch]);

  // ── Fetch drivers after vendor chosen ────────────────────────────────────────
  useEffect(() => {
    if (DRIVER_TARGET_TYPES.has(formData.target_type) && selectedVendorId)
      dispatch(NewfetchDriversThunk({ vendor_id: selectedVendorId }));
  }, [selectedVendorId, formData.target_type, dispatch]);

  useEffect(() => () => { dispatch(clearError(errorKey)); }, [dispatch, errorKey]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]:value }));
    setFieldErrors(p => { if (!p[name]) return p; const n={...p}; delete n[name]; return n; });
  }, []);

  const handleFileChange = useCallback(e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData(p => ({ ...p, media_file:file, media_url:"" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // Fix 2: extracted to named handler that also clears the input ref,
  // so re-selecting the same file after removal correctly fires onChange.
  const handleRemoveFile = useCallback(() => {
    setFormData(p => ({ ...p, media_file:null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const toggleSelection = useCallback(id => {
    setFormData(p => ({
      ...p,
      target_ids: p.target_ids.includes(id)
        ? p.target_ids.filter(i => i !== id)
        : [...p.target_ids, id],
    }));
    setFieldErrors(p => { const n={...p}; delete n.target_ids; return n; });
  }, []);

  const handleChannelChange = useCallback(ch => {
    if (ch === ALWAYS_ON_CHANNEL) return;
    setFormData(p => ({
      ...p,
      channels: p.channels.includes(ch)
        ? p.channels.filter(c => c !== ch)
        : [...p.channels, ch],
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const errs = validate(formData);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    // Fix 5: guarantee in_app is always present regardless of state drift
    const channels = formData.channels.includes(ALWAYS_ON_CHANNEL)
      ? formData.channels
      : [...formData.channels, ALWAYS_ON_CHANNEL];

    const payload = {
      title:        formData.title.trim(),
      body:         formData.body.trim(),
      content_type: formData.content_type,
      target_type:  formData.target_type,
      channels,
      ...(TARGET_TYPES_WITH_IDS.has(formData.target_type) && { target_ids: formData.target_ids }),
      ...(formData.media_url.trim() && { media_url:  formData.media_url.trim() }),
      ...(formData.media_file       && { media_file: formData.media_file }),
    };

    const thunk  = isEdit
      ? updateAnnouncement({ id: announcement.announcement_id, data: payload })
      : createAnnouncement(payload);
    const result = await dispatch(thunk);
    if (!result.error) onSuccess?.();
  }, [dispatch, formData, isEdit, announcement, onSuccess]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const needsVendor    = DRIVER_TARGET_TYPES.has(formData.target_type);
  const showTargetList = TARGET_TYPES_WITH_IDS.has(formData.target_type);
  const isMediaType    = MEDIA_CONTENT_TYPES.has(formData.content_type);
  const hasEditIds     = editModeIds.length > 0;
  const gateOpen       = !needsVendor || selectedVendorId || hasEditIds;

  const targetItems = useMemo(() => {
    switch (formData.target_type) {
      case "specific_employees":
        return employees.map(e => ({ id: e.employee_id??e.id, label: e.name??e.full_name??`Employee ${e.employee_id??e.id}` }));
      case "specific_drivers":
      case "vendor_drivers":
        return drivers.map(d => ({ id: d.driver_id??d.id, label: d.name??`Driver ${d.driver_id??d.id}` }));
      case "teams":
        return teams.map(t => ({ id: t.team_id??t.id, label: t.name??`Team ${t.team_id??t.id}` }));
      default: return [];
    }
  }, [formData.target_type, employees, drivers, teams]);

  const vendorOpts = useMemo(
    () => vendors.map(v => ({ value: v.vendor_id??v.id, label: v.name??`Vendor ${v.vendor_id??v.id}` })),
    [vendors]
  );
  const filteredItems = useMemo(
    () => targetItems.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase())),
    [targetItems, searchQuery]
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Modal isOpen onClose={onClose}
      title={isEdit ? "Edit Announcement" : "New Announcement"}
      size="lg">

      {apiError && (
        <div role="alert" className="mx-1 mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700 flex-1">{apiError.message}</p>
          <button onClick={() => dispatch(clearError(errorKey))} className="text-red-400 hover:text-red-600">
            <X size={14}/>
          </button>
        </div>
      )}

      <div className="space-y-4 px-1">

        {/* Title + Body */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Title <span className="text-red-400">*</span>
            </label>
            <input name="title" value={formData.title} onChange={handleChange}
              disabled={isSubmitting} placeholder="e.g. Office closed tomorrow"
              aria-invalid={!!fieldErrors.title} className={inputCls(fieldErrors.title)} />
            <FErr msg={fieldErrors.title} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea name="body" rows={3} value={formData.body} onChange={handleChange}
              disabled={isSubmitting} placeholder="Write your announcement here…"
              aria-invalid={!!fieldErrors.body}
              className={`${inputCls(fieldErrors.body)} resize-none`} />
            <FErr msg={fieldErrors.body} />
          </div>
        </div>

        {/* Content type + media */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Content Type
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CONTENT_OPTS.map(ct => (
              <button key={ct.value} type="button" disabled={isSubmitting}
                onClick={() => setFormData(p => ({ ...p, content_type:ct.value }))}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                  ${formData.content_type===ct.value
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}>
                <span>{ct.icon}</span>{ct.label}
              </button>
            ))}
          </div>

          {/* File upload */}
          {isMediaType && (
            <div className="mt-2">
              <input ref={fileInputRef} id="af-file" type="file"
                accept={ACCEPT_MAP[formData.content_type]}
                onChange={handleFileChange} disabled={isSubmitting} className="hidden" />
              {formData.media_file ? (
                <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
                  <span className="text-sm">{FILE_ICON[formData.content_type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{formData.media_file.name}</p>
                    <p className="text-[11px] text-gray-400">{fmtBytes(formData.media_file.size)}</p>
                  </div>
                  <label htmlFor="af-file"
                    className="text-[11px] text-indigo-600 hover:underline cursor-pointer flex items-center gap-0.5">
                    <Upload size={11}/> Replace
                  </label>
                  {/* Fix 2: use handleRemoveFile so input ref is also cleared */}
                  <button type="button" onClick={handleRemoveFile}
                    className="text-[11px] text-red-500 hover:underline flex items-center gap-0.5">
                    <Trash2 size={11}/> Remove
                  </button>
                </div>
              ) : (
                <label htmlFor="af-file"
                  className="flex items-center gap-3 rounded-lg border border-dashed border-indigo-200 px-4 py-3 cursor-pointer hover:bg-indigo-50/50 transition-all">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 flex-shrink-0">
                    <Upload size={15}/>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Upload {formData.content_type}</p>
                    <p className="text-[11px] text-gray-400">{FILE_EXT_HINT[formData.content_type]}</p>
                  </div>
                </label>
              )}
            </div>
          )}

          {formData.content_type === "link" && (
            <input name="media_url" value={formData.media_url} onChange={handleChange}
              disabled={isSubmitting} placeholder="https://…"
              className={`mt-2 ${inputCls(false)}`} />
          )}
        </div>

        {/* Audience */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Audience
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {TARGET_OPTS.map(opt => {
              const Icon   = opt.icon;
              const active = formData.target_type === opt.value;
              return (
                <button key={opt.value} type="button" disabled={isSubmitting}
                  onClick={() => setFormData(p => ({ ...p, target_type:opt.value }))}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all text-left
                    ${active
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"}`}>
                  <Icon size={12} className="flex-shrink-0"/>
                  <span className="leading-tight">{opt.label}</span>
                  {active && <CheckCircle2 size={11} className="ml-auto flex-shrink-0"/>}
                </button>
              );
            })}
          </div>

          {/* Vendor picker — driver types only */}
          {showTargetList && needsVendor && (
            <div className="mt-2">
              {hasEditIds && (
                <div className="mb-1.5 flex items-center justify-between rounded-lg bg-teal-50 border border-teal-200 px-3 py-1.5">
                  <span className="text-[11px] text-teal-700 font-medium">
                    ✓ {editModeIds.length} driver{editModeIds.length !== 1 ? "s" : ""} selected
                  </span>
                  <span className="text-[11px] text-teal-500">Pick vendor to change</span>
                </div>
              )}
              <select value={selectedVendorId} disabled={isSubmitting}
                onChange={e => {
                  setSelectedVendorId(e.target.value);
                  setEditModeIds([]);
                  setFormData(p => ({ ...p, target_ids:[] }));
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white
                  focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all">
                <option value="">{hasEditIds ? "— Keep current —" : "— Choose a vendor —"}</option>
                {vendorOpts.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </div>
          )}

          {/* Target list */}
          {showTargetList && gateOpen && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-gray-500">
                  {hasEditIds && !selectedVendorId ? "Currently selected" : "Select targets"}
                </p>
                {formData.target_ids.length > 0 && (
                  <span className="text-[11px] font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    {formData.target_ids.length} selected
                  </span>
                )}
              </div>

              {hasEditIds && !selectedVendorId ? (
                <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-lg bg-white">
                  {editModeIds.map(id => (
                    <span key={id} className="px-2 py-0.5 rounded-lg bg-teal-100 text-teal-700 text-[11px] font-semibold border border-teal-200">
                      #{id}
                    </span>
                  ))}
                </div>
              ) : (
                <>
                  <input placeholder="Search…" value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs bg-white mb-1
                      focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all" />
                  <div className="border border-gray-200 rounded-lg max-h-36 overflow-y-auto bg-white divide-y divide-gray-50">
                    {filteredItems.length === 0 ? (
                      <p className="py-4 text-center text-xs text-gray-400">No results found.</p>
                    ) : filteredItems.map(item => {
                      const checked = formData.target_ids.includes(item.id);
                      return (
                        <label key={item.id}
                          className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs transition-colors
                            ${checked ? "bg-teal-50" : "hover:bg-gray-50"}`}>
                          <input type="checkbox" checked={checked}
                            onChange={() => toggleSelection(item.id)}
                            disabled={isSubmitting} className="rounded accent-teal-600" />
                          <span className={checked ? "text-teal-700 font-medium" : "text-gray-700"}>
                            {item.label}
                          </span>
                          {checked && <CheckCircle2 size={11} className="ml-auto text-teal-500 flex-shrink-0"/>}
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
              <FErr msg={fieldErrors.target_ids} />
            </div>
          )}
        </div>

        {/* Channels */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Channels
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(CHANNEL_CFG).map(([ch, cfg]) => {
              const locked = ch === ALWAYS_ON_CHANNEL;
              const active = formData.channels.includes(ch);
              return (
                <button key={ch} type="button" disabled={locked || isSubmitting}
                  onClick={() => handleChannelChange(ch)}
                  title={locked ? "Always included" : undefined}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all
                    ${active ? `${CH_COLORS[cfg.color]} border` : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}
                    ${locked ? "cursor-default" : "cursor-pointer"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-current" : "bg-gray-300"}`}/>
                  {cfg.label}
                  {locked  && <span className="ml-auto text-[10px] opacity-60">always</span>}
                  {active && !locked && <CheckCircle2 size={11} className="ml-auto flex-shrink-0"/>}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-100 px-1">
        <button onClick={onClose} disabled={isSubmitting}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600
            hover:bg-gray-50 disabled:opacity-50 transition-all">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={isSubmitting} aria-busy={isSubmitting}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold
            hover:bg-indigo-700 disabled:opacity-60 shadow-sm shadow-indigo-200 transition-all">
          {isSubmitting
            ? <><Loader2 size={14} className="animate-spin"/>{isEdit ? "Updating…" : "Creating…"}</>
            : <>{isEdit ? "Update" : "Create"}<ChevronRight size={14}/></>}
        </button>
      </div>

    </Modal>
  );
};

export default AnnouncementForm;