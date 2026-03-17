import { useEffect } from "react";
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

const ErrorBox = ({ error }) => (
  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>
    {typeof error === "string" ? error : error?.message || "Something went wrong"}
  </div>
);

// ─── Create Modal ─────────────────────────────────────────────────────────────
export const CreatePermissionModal = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const loading  = useSelector(selectCreateLoading);
  const error    = useSelector(selectCreateError);
  const success  = useSelector(selectCreateSuccess);

  useEffect(() => {
    if (success) {
      dispatch(clearCreateStatus());
      onSuccess?.("Permission created successfully");
      onClose();
    }
  }, [success]);

  return (
    <Modal title="Create Permission" subtitle="POST /api/v1/iam/permissions/" onClose={onClose}>
      {error && <ErrorBox error={error} />}
      <IamPermissionForm
        mode="create"
        loading={loading}
        onSubmit={(form) => dispatch(createPermissionThunk(form))}
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

  useEffect(() => {
    if (success) {
      dispatch(clearUpdateStatus());
      onSuccess?.("Permission updated successfully");
      onClose();
    }
  }, [success]);

  return (
    <Modal title="Edit Permission" subtitle={`PUT /api/v1/iam/permissions/${permission.permission_id}`} onClose={onClose}>
      {error && <ErrorBox error={error} />}
      <IamPermissionForm
        mode="edit"
        initial={permission}
        loading={loading}
        onSubmit={(form) => dispatch(updatePermissionThunk({ permissionId: permission.permission_id, payload: form }))}
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

  useEffect(() => {
    dispatch(fetchPermissionByIdThunk(permissionId));
    return () => dispatch(clearSelectedPermission());
  }, [permissionId]);

  const fields = permission ? [
    { key: "Permission ID", value: permission.permission_id,          color: "#475569" },
    { key: "Module",        value: permission.module,                 color: "#4f46e5" },
    { key: "Action",        value: permission.action,                 color: "#16a34a" },
    { key: "Description",   value: permission.description || "—",     color: "#64748b" },
    { key: "Status",        value: permission.is_active ? "Active" : "Inactive", color: permission.is_active ? "#15803d" : "#dc2626" },
    { key: "Created At",    value: permission.created_at || "—",      color: "#94a3b8" },
    { key: "Updated At",    value: permission.updated_at || "—",      color: "#94a3b8" },
  ] : [];

  return (
    <Modal title="Permission Details" subtitle={`GET /api/v1/iam/permissions/${permissionId}`} onClose={onClose}>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 10, color: "#6366f1", fontSize: 13 }}>
          <Spinner /> Loading…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {fields.map(({ key, value, color }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #f1f5f9" }}>
              <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 500, width: 120, flexShrink: 0 }}>{key}</span>
              <span style={{ color, fontSize: 13, fontWeight: 600, wordBreak: "break-all" }}>{String(value)}</span>
            </div>
          ))}

          <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
            <button
              onClick={onEdit}
              style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 10px rgba(99,102,241,0.3)" }}
            >
              Edit This Permission
            </button>
            <button
              onClick={onClose}
              style={{ padding: "11px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
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

  useEffect(() => {
    if (success) {
      dispatch(clearDeleteStatus());
      onSuccess?.(`Deleted permission #${permission.permission_id}`, "error");
      onClose();
    }
  }, [success]);

  return (
    <Modal title="Delete Permission" subtitle={`DELETE /api/v1/iam/permissions/${permission.permission_id}`} onClose={onClose} width={440}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Warning box */}
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>
                Delete <code style={{ background: "#fee2e2", padding: "1px 6px", borderRadius: 4 }}>{permission.module}:{permission.action}</code>?
              </p>
              <p style={{ color: "#ef4444", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                This action cannot be undone. It may break existing role assignments that depend on this permission (ID #{permission.permission_id}).
              </p>
            </div>
          </div>
        </div>

        {/* API pill */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
          <code style={{ color: "#dc2626", fontSize: 12 }}>
            DELETE /api/v1/iam/permissions/{permission.permission_id}
          </code>
        </div>

        {error && <ErrorBox error={error} />}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => dispatch(deletePermissionThunk(permission.permission_id))}
            disabled={loading}
            style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: loading ? "#f1f5f9" : "#dc2626", color: loading ? "#94a3b8" : "white", fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {loading ? <><Spinner /> Deleting…</> : "Yes, Delete"}
          </button>
          <button
            onClick={onClose}
            style={{ padding: "11px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};