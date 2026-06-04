import { useState } from "react";
import { Spinner } from "./IamPermissionUIAtoms";

const EMPTY_FORM = { module: "", action: "", description: "", is_active: true };

// Label used above each field — uppercase tracking style
const FieldLabel = ({ children }) => (
  <label className="block text-slate-500 text-[11px] tracking-[0.08em] uppercase mb-[6px] font-semibold">
    {children}
  </label>
);

// Shared input/textarea base classes
// Focus ring is handled via Tailwind focus: variants — no JS state needed
const INPUT_BASE =
  "w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 " +
  "rounded-lg px-3 py-[10px] text-slate-900 text-[13px] outline-none " +
  "transition-all duration-150 placeholder:text-slate-300";

// ─── IamPermissionForm ────────────────────────────────────────────────────────
const IamPermissionForm = ({ initial, onSubmit, onCancel, loading, mode }) => {
  const [form, setForm] = useState(
    initial
      ? {
          module: initial.module || "",
          action: initial.action || "",
          description: initial.description || "",
          is_active: initial.is_active ?? true,
        }
      : EMPTY_FORM,
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.module.trim() && form.action.trim();

  const handleSubmit = () => {
    if (!valid || loading) return;
    onSubmit({
      module: form.module.trim(),
      action: form.action.trim(),
      description: form.description.trim() || null,
      is_active: form.is_active,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Live payload preview ── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-[14px] py-3">
        <p className="text-slate-400 text-[10px] tracking-[0.12em] uppercase font-semibold mb-2">
          {mode === "edit" ? "PUT" : "POST"} /api/v1/iam/permissions/
          {mode === "edit" && initial ? initial.permission_id : ""}
        </p>
        {/*
          Inline colours are intentional here — each token colour is driven
          by live form state (filled vs empty) and cannot be expressed as
          static Tailwind classes.
        */}
        <pre className="m-0 text-[12px] font-mono leading-[1.9]">
          <span className="text-slate-400">{"{\n"}</span>
          <span className="text-slate-400">{"  "}</span>
          <span className="text-indigo-500">"module"</span>
          <span className="text-slate-400">: </span>
          <span style={{ color: form.module ? "#16a34a" : "#cbd5e1" }}>
            "{form.module || "…"}"
          </span>
          <span className="text-slate-400">,{"\n"}</span>

          <span className="text-slate-400">{"  "}</span>
          <span className="text-indigo-500">"action"</span>
          <span className="text-slate-400">: </span>
          <span style={{ color: form.action ? "#0369a1" : "#cbd5e1" }}>
            "{form.action || "…"}"
          </span>
          <span className="text-slate-400">,{"\n"}</span>

          <span className="text-slate-400">{"  "}</span>
          <span className="text-indigo-500">"description"</span>
          <span className="text-slate-400">: </span>
          <span style={{ color: form.description ? "#7c3aed" : "#cbd5e1" }}>
            {form.description ? `"${form.description}"` : "null"}
          </span>
          <span className="text-slate-400">,{"\n"}</span>

          <span className="text-slate-400">{"  "}</span>
          <span className="text-indigo-500">"is_active"</span>
          <span className="text-slate-400">: </span>
          <span style={{ color: form.is_active ? "#16a34a" : "#dc2626" }}>
            {String(form.is_active)}
          </span>
          <span className="text-slate-400">{"\n}"}</span>
        </pre>
      </div>

      {/* ── Module ── */}
      <div>
        <FieldLabel>
          Module <span className="text-red-400">*</span>
        </FieldLabel>
        <input
          className={INPUT_BASE}
          placeholder="e.g. booking, driver, vehicle…"
          value={form.module}
          onChange={(e) => set("module", e.target.value)}
        />
      </div>

      {/* ── Action ── */}
      <div>
        <FieldLabel>
          Action <span className="text-red-400">*</span>
        </FieldLabel>
        <input
          className={INPUT_BASE}
          placeholder="e.g. create, read, update, delete…"
          value={form.action}
          onChange={(e) => set("action", e.target.value.toLowerCase())}
        />
      </div>

      {/* ── Description ── */}
      <div>
        <FieldLabel>
          Description{" "}
          <span className="normal-case tracking-normal text-[11px] text-slate-400 font-normal">
            (optional · null if empty)
          </span>
        </FieldLabel>
        <textarea
          className={`${INPUT_BASE} resize-none`}
          placeholder="What does this permission allow?"
          rows={2}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      {/* ── is_active toggle ── */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-[14px] py-3">
        <div>
          <p className="text-slate-900 text-[13px] font-semibold">is_active</p>
          <p className="text-slate-400 text-[12px] mt-[2px]">
            Enable or disable this permission system-wide
          </p>
        </div>

        {/*
          Toggle thumb position (left: 23px vs 3px) is driven by runtime state —
          kept as inline style intentionally since Tailwind can't safely generate
          arbitrary dynamic left values without safelisting.
        */}
        <button
          type="button"
          onClick={() => set("is_active", !form.is_active)}
          className={`relative w-[46px] h-[26px] rounded-full border-none cursor-pointer
            transition-colors duration-200 shrink-0
            ${form.is_active ? "bg-green-500" : "bg-slate-200"}`}
        >
          <span
            className="absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] block transition-all duration-200"
            style={{ left: form.is_active ? 23 : 3 }}
          />
        </button>
      </div>

      {/* ── Permission key preview ── */}
      {form.module && form.action && (
        <div className="flex items-center gap-2 text-[12px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <span>Permission key →</span>
          <code className="text-indigo-500 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-[2px] font-semibold">
            {form.module.toLowerCase()}:{form.action.toLowerCase()}
          </code>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="flex gap-[10px] pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !valid}
          className={`flex-1 flex items-center justify-center gap-2 py-[11px] rounded-lg
            border-none text-[13px] font-bold transition-all duration-150
            ${
              valid && !loading
                ? "text-white cursor-pointer shadow-[0_2px_10px_rgba(99,102,241,0.3)] hover:opacity-90"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          style={
            valid && !loading
              ? {
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  opacity: loading ? 0.7 : 1,
                }
              : undefined
          }
        >
          {loading ? (
            <>
              <Spinner /> Saving…
            </>
          ) : mode === "edit" ? (
            "Update Permission"
          ) : (
            "Create Permission"
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-[11px] rounded-lg border border-slate-200 bg-white
            hover:bg-slate-50 text-slate-500 text-[13px] font-medium
            cursor-pointer transition-colors duration-150"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default IamPermissionForm;
