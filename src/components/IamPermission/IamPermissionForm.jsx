import { useState } from "react";
import { Spinner } from "./IamPermissionUIAtoms";

const EMPTY_FORM = { module: "", action: "", description: "", is_active: true };

const IamPermissionForm = ({ initial, onSubmit, onCancel, loading, mode }) => {
  const [form, setForm] = useState(
    initial
      ? { module: initial.module || "", action: initial.action || "", description: initial.description || "", is_active: initial.is_active ?? true }
      : EMPTY_FORM
  );

  const [foc, setFoc] = useState({});
  const set   = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.module.trim() && form.action.trim();

  const inputStyle = (key) => ({
    width: "100%",
    background: foc[key] ? "white" : "#f8fafc",
    border: `1.5px solid ${foc[key] ? "#6366f1" : "#e2e8f0"}`,
    borderRadius: 8,
    padding: "10px 12px",
    color: "#0f172a",
    fontSize: 13,
    outline: "none",
    transition: "all 0.15s",
    boxSizing: "border-box",
  });

  const focusProps = (key) => ({
    onFocus: () => setFoc((f) => ({ ...f, [key]: true })),
    onBlur:  () => setFoc((f) => ({ ...f, [key]: false })),
  });

  const handleSubmit = () => {
    if (!valid || loading) return;
    onSubmit({
      module:      form.module.trim(),
      action:      form.action.trim(),
      description: form.description.trim() || null,
      is_active:   form.is_active,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Live payload preview */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
          {mode === "edit" ? "PUT" : "POST"} /api/v1/iam/permissions/{mode === "edit" && initial ? initial.permission_id : ""}
        </div>
        <pre style={{ margin: 0, fontSize: 12, fontFamily: "monospace", lineHeight: 1.9 }}>
          <span style={{ color: "#94a3b8" }}>{"{\n"}</span>
          <span style={{ color: "#94a3b8" }}>{"  "}</span><span style={{ color: "#6366f1" }}>"module"</span><span style={{ color: "#94a3b8" }}>:      </span><span style={{ color: form.module ? "#16a34a" : "#cbd5e1" }}>"{form.module || "…"}"</span><span style={{ color: "#94a3b8" }}>,{"\n"}</span>
          <span style={{ color: "#94a3b8" }}>{"  "}</span><span style={{ color: "#6366f1" }}>"action"</span><span style={{ color: "#94a3b8" }}>:      </span><span style={{ color: form.action ? "#0369a1" : "#cbd5e1" }}>"{form.action || "…"}"</span><span style={{ color: "#94a3b8" }}>,{"\n"}</span>
          <span style={{ color: "#94a3b8" }}>{"  "}</span><span style={{ color: "#6366f1" }}>"description"</span><span style={{ color: "#94a3b8" }}>: </span><span style={{ color: form.description ? "#7c3aed" : "#cbd5e1" }}>{form.description ? `"${form.description}"` : "null"}</span><span style={{ color: "#94a3b8" }}>,{"\n"}</span>
          <span style={{ color: "#94a3b8" }}>{"  "}</span><span style={{ color: "#6366f1" }}>"is_active"</span><span style={{ color: "#94a3b8" }}>:   </span><span style={{ color: form.is_active ? "#16a34a" : "#dc2626" }}>{String(form.is_active)}</span><span style={{ color: "#94a3b8" }}>{"\n}"}</span>
        </pre>
      </div>

      {/* Module */}
      <div>
        <label style={{ display: "block", color: "#64748b", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>
          Module <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          style={inputStyle("module")}
          {...focusProps("module")}
          placeholder="e.g. booking, driver, vehicle…"
          value={form.module}
          onChange={(e) => set("module", e.target.value)}
        />
      </div>

      {/* Action */}
      <div>
        <label style={{ display: "block", color: "#64748b", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>
          Action <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          style={inputStyle("action")}
          {...focusProps("action")}
          placeholder="e.g. create, read, update, delete…"
          value={form.action}
          onChange={(e) => set("action", e.target.value)}
        />
      </div>

      {/* Description */}
      <div>
        <label style={{ display: "block", color: "#64748b", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>
          Description{" "}
          <span style={{ color: "#94a3b8", textTransform: "none", letterSpacing: 0, fontSize: 11, fontWeight: 400 }}>(optional · null if empty)</span>
        </label>
        <textarea
          style={{ ...inputStyle("desc"), resize: "none" }}
          {...focusProps("desc")}
          placeholder="What does this permission allow?"
          rows={2}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      {/* is_active toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
        <div>
          <div style={{ color: "#0f172a", fontSize: 13, fontWeight: 600 }}>is_active</div>
          <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>Enable or disable this permission system-wide</div>
        </div>
        <button
          onClick={() => set("is_active", !form.is_active)}
          style={{ width: 46, height: 26, borderRadius: 13, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", background: form.is_active ? "#22c55e" : "#e2e8f0", flexShrink: 0 }}
        >
          <span style={{ position: "absolute", top: 3, left: form.is_active ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", display: "block", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
        </button>
      </div>

      {/* Permission key preview */}
      {form.module && form.action && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px" }}>
          <span>Permission key →</span>
          <code style={{ color: "#6366f1", background: "#eef2ff", border: "1px solid #e0e7ff", borderRadius: 6, padding: "2px 8px", fontWeight: 600 }}>
            {form.module.toLowerCase()}:{form.action.toLowerCase()}
          </code>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
        <button
          onClick={handleSubmit}
          disabled={loading || !valid}
          style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", cursor: valid && !loading ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: valid && !loading ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#f1f5f9",
            color: valid && !loading ? "white" : "#94a3b8",
            boxShadow: valid && !loading ? "0 2px 10px rgba(99,102,241,0.3)" : "none",
            opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <><Spinner /> Saving…</> : mode === "edit" ? "Update Permission" : "Create Permission"}
        </button>
        <button
          onClick={onCancel}
          style={{ padding: "11px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
          onMouseOut={e  => e.currentTarget.style.background = "white"}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default IamPermissionForm;