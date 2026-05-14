import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Spinner } from "./IamPermissionUIAtoms";
import IamPermissionForm from "./IamPermissionForm";
import {
  createPermissionThunk,
  updatePermissionThunk,
  deletePermissionThunk,
  fetchPermissionByIdThunk,
} from "../../redux/features/iampermissions/Iampermissionsthunk";
import {
  clearCreateStatus,
  clearUpdateStatus,
  clearDeleteStatus,
  clearSelectedPermission,
  selectCreateLoading,
  selectCreateError,
  selectCreateSuccess,
  selectUpdateLoading,
  selectUpdateError,
  selectUpdateSuccess,
  selectDeleteLoading,
  selectDeleteError,
  selectDeleteSuccess,
  selectSelectedPermission,
  selectPermissionByIdLoading,
} from "../../redux/features/iampermissions/Iampermissionsslice";

// ─── ErrorBox ─────────────────────────────────────────────────────────────────
// Handles three error shapes:
//   1. Plain string
//   2. { message: "..." }          — our own API wrapper
//   3. { detail: [...] }           — FastAPI / Pydantic validation errors (422)
const parseError = (error) => {
  if (typeof error === "string") return error;

  // Pydantic validation errors: { detail: [{ msg, loc, ctx }] }
  if (Array.isArray(error?.detail)) {
    return error.detail
      .map((e) => {
        const field = e.loc?.slice(1).join(" → ") || "field";
        return `${field}: ${e.msg}`;
      })
      .join("\n");
  }

  return error?.message || error?.detail || "Something went wrong";
};

const ErrorBox = ({ error }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg px-[14px] py-[10px] mb-4 text-red-600 text-[13px] whitespace-pre-line">
    {parseError(error)}
  </div>
);

// ─── Create Modal ─────────────────────────────────────────────────────────────
export const CreatePermissionModal = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const loading  = useSelector(selectCreateLoading);
  const error    = useSelector(selectCreateError);
  const success  = useSelector(selectCreateSuccess);

  // ✅ All deps declared — no stale closure risk
  useEffect(() => {
    if (success) {
      dispatch(clearCreateStatus());
      onSuccess?.("Permission created successfully");
      onClose();
    }
  }, [success, dispatch, onSuccess, onClose]);

  const handleSubmit = useCallback(
    (form) => dispatch(createPermissionThunk(form)),
    [dispatch]
  );

  return (
    <Modal title="Create Permission" subtitle="POST /api/v1/iam/permissions/" onClose={onClose}>
      {error && <ErrorBox error={error} />}
      <IamPermissionForm
        mode="create"
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
export const EditPermissionModal = ({ permission, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const loading  = useSelector(selectUpdateLoading);
  const error    = useSelector(selectUpdateError);
  const success  = useSelector(selectUpdateSuccess);

  // ✅ All deps declared
  useEffect(() => {
    if (success) {
      dispatch(clearUpdateStatus());
      onSuccess?.("Permission updated successfully");
      onClose();
    }
  }, [success, dispatch, onSuccess, onClose]);

  const handleSubmit = useCallback(
    (form) =>
      dispatch(
        updatePermissionThunk({ permissionId: permission.permission_id, payload: form })
      ),
    [dispatch, permission.permission_id]
  );

  return (
    <Modal
      title="Edit Permission"
      subtitle={`PUT /api/v1/iam/permissions/${permission.permission_id}`}
      onClose={onClose}
    >
      {error && <ErrorBox error={error} />}
      <IamPermissionForm
        mode="edit"
        initial={permission}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

// ─── View Modal ───────────────────────────────────────────────────────────────
export const ViewPermissionModal = ({ permissionId, onClose, onEdit }) => {
  const dispatch   = useDispatch();
  const permission = useSelector(selectSelectedPermission);
  const loading    = useSelector(selectPermissionByIdLoading);

  // ✅ All deps declared; cleanup clears selected permission on unmount
  useEffect(() => {
    dispatch(fetchPermissionByIdThunk(permissionId));
    return () => dispatch(clearSelectedPermission());
  }, [permissionId, dispatch]);

  // Field colour is data-driven (status active/inactive) — inline style is justified
  const fields = permission
    ? [
        { key: "Permission ID", value: permission.permission_id,                         color: "#475569" },
        { key: "Module",        value: permission.module,                                color: "#4f46e5" },
        { key: "Action",        value: permission.action,                                color: "#16a34a" },
        { key: "Description",   value: permission.description || "—",                    color: "#64748b" },
        { key: "Status",        value: permission.is_active ? "Active" : "Inactive",     color: permission.is_active ? "#15803d" : "#dc2626" },
        { key: "Created At",    value: permission.created_at || "—",                     color: "#94a3b8" },
        { key: "Updated At",    value: permission.updated_at || "—",                     color: "#94a3b8" },
      ]
    : [];

  return (
    <Modal
      title="Permission Details"
      subtitle={`GET /api/v1/iam/permissions/${permissionId}`}
      onClose={onClose}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-[10px] py-10 text-indigo-500 text-[13px]">
          <Spinner /> Loading…
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">

          {/* Field rows */}
          {fields.map(({ key, value, color }) => (
            <div
              key={key}
              className="flex items-center gap-3 px-[14px] py-[10px] bg-slate-50 rounded-lg border border-slate-100"
            >
              <span className="text-slate-400 text-[12px] font-medium w-[120px] shrink-0">
                {key}
              </span>
              {/* color is runtime data-driven — inline style justified */}
              <span
                className="text-[13px] font-semibold break-all"
                style={{ color }}
              >
                {String(value)}
              </span>
            </div>
          ))}

          {/* Action buttons */}
          <div className="flex gap-[10px] pt-[6px]">
            <button
              onClick={onEdit}
              className="flex-1 py-[11px] rounded-lg border-none text-white text-[13px]
                font-semibold cursor-pointer
                shadow-[0_2px_10px_rgba(99,102,241,0.3)] hover:opacity-90
                transition-opacity duration-150"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              Edit This Permission
            </button>
            <button
              onClick={onClose}
              className="px-5 py-[11px] rounded-lg border border-slate-200 bg-white
                hover:bg-slate-50 text-slate-500 text-[13px] font-medium
                cursor-pointer transition-colors duration-150"
            >
              Close
            </button>
          </div>

        </div>
      )}
    </Modal>
  );
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────
export const DeletePermissionModal = ({ permission, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const loading  = useSelector(selectDeleteLoading);
  const error    = useSelector(selectDeleteError);
  const success  = useSelector(selectDeleteSuccess);

  // ✅ Fixed: was incorrectly passing "error" as the toast type on a success event
  // ✅ All deps declared
  useEffect(() => {
    if (success) {
      dispatch(clearDeleteStatus());
      onSuccess?.(`Permission #${permission.permission_id} deleted successfully`);
      onClose();
    }
  }, [success, dispatch, onSuccess, onClose, permission.permission_id]);

  return (
    <Modal
      title="Delete Permission"
      subtitle={`DELETE /api/v1/iam/permissions/${permission.permission_id}`}
      onClose={onClose}
      width={440}
    >
      <div className="flex flex-col gap-4">

        {/* ── Warning box ── */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">

            {/* Warning icon */}
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <p className="text-red-600 text-[13px] font-semibold mb-1">
                Delete{" "}
                <code className="bg-red-100 px-[6px] py-[1px] rounded text-red-700">
                  {permission.module}:{permission.action}
                </code>
                ?
              </p>
              <p className="text-red-400 text-[12px] leading-relaxed m-0">
                This action cannot be undone. It may break existing role assignments
                that depend on this permission (ID #{permission.permission_id}).
              </p>
            </div>
          </div>
        </div>

        {/* ── API pill ── */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-[14px] py-[10px]">
          <code className="text-red-500 text-[12px]">
            DELETE /api/v1/iam/permissions/{permission.permission_id}
          </code>
        </div>

        {error && <ErrorBox error={error} />}

        {/* ── Action buttons ── */}
        <div className="flex gap-[10px]">
          <button
            onClick={() => dispatch(deletePermissionThunk(permission.permission_id))}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-[11px]
              rounded-lg border-none text-[13px] font-bold transition-colors duration-150
              ${loading
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              }`}
          >
            {loading ? <><Spinner /> Deleting…</> : "Yes, Delete"}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-[11px] rounded-lg border border-slate-200 bg-white
              hover:bg-slate-50 text-slate-500 text-[13px] font-medium
              cursor-pointer transition-colors duration-150"
          >
            Cancel
          </button>
        </div>

      </div>
    </Modal>
  );
};