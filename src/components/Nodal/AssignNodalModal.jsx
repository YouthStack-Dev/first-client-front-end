import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { assignNodalPoint } from "../../redux/features/nodalAssignments/Nodalassignmentthunks";
import {
  selectNodalAssignmentLoading,
  selectNodalAssignmentError,
} from "../../redux/features/nodalAssignments/Nodalassignmentselectors";
import { clearNodalPointError } from "../../redux/features/nodalAssignments/Nodalassignmentslice";

import { fetchNodalPointsThunk } from "../../redux/features/nodalPoints/Nodalpointsthunk";
import {
  selectAllNodalPoints,
  clearNodalPointError as clearNodalError, 
} from "../../redux/features/nodalPoints/Nodalpointsslice";
import { selectNodalPointsLoading } from "../../redux/features/nodalPoints/Nodalpointsselectors";

export default function AssignNodalModal({
  isOpen,
  onClose,
  employee,
  tenantId,
  onSuccess,
}) {
  const dispatch = useDispatch();

  const loading     = useSelector(selectNodalAssignmentLoading);
  const error       = useSelector(selectNodalAssignmentError);
  const hubs        = useSelector(selectAllNodalPoints);
  const hubsLoading = useSelector(selectNodalPointsLoading);

  const [nodalPointId, setNodalPointId] = useState("");
  const [isOverridden, setIsOverridden] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNodalPointId("");
      setIsOverridden(employee?.nodal_point?.is_overridden ?? false);
      dispatch(clearNodalPointError()); // ← was: clearError() — clears assignment slice error
      dispatch(clearNodalError());      // ← clears nodal points slice error
      if (hubs.length === 0) {
        dispatch(fetchNodalPointsThunk({ tenant_id: tenantId, is_active: true, per_page: 100 }));
      }
    }
  }, [isOpen, employee, dispatch, tenantId]);

  if (!isOpen || !employee) return null;

  const isReassign = !!employee.nodal_point;
  const activeHubs = hubs.filter((h) => h.is_active);

  const handleSubmit = async () => {
    const payload = {
      employee_id: employee.employee_id,
      tenant_id: tenantId,
      is_overridden: isOverridden,
    };

    if (nodalPointId !== "") {
      payload.nodal_point_id = parseInt(nodalPointId, 10);
    }

    const result = await dispatch(assignNodalPoint(payload));
    if (!result.error) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              {isReassign ? "Re-assign Nodal Hub" : "Assign Nodal Hub"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{employee.name}</p>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition"
          >
            <i className="ti ti-x text-slate-400 text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {isReassign && (
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <i className="ti ti-map-pin text-blue-500 text-sm mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-700">Current hub</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  {employee.nodal_point.name}
                  {employee.nodal_point.is_overridden && (
                    <span className="ml-2 inline-flex items-center gap-1 text-amber-600">
                      <i className="ti ti-lock text-[10px]" /> Manually assigned
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Nodal Point dropdown */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Select Nodal Hub
              <span className="ml-1 text-slate-400 font-normal">(optional)</span>
            </label>

            {hubsLoading ? (
              <div className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center px-3 gap-2">
                <i className="ti ti-loader-2 animate-spin text-slate-400 text-sm" />
                <span className="text-xs text-slate-400">Loading hubs…</span>
              </div>
            ) : (
              <select
                value={nodalPointId}
                onChange={(e) => setNodalPointId(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              >
                <option value="">— Auto-assign nearest hub —</option>
                {activeHubs.map((hub) => (
                  <option key={hub.nodal_point_id} value={hub.nodal_point_id}>
                    {hub.name}
                  </option>
                ))}
              </select>
            )}

            <p className="text-xs text-slate-400 mt-1.5">
              Leave blank to auto-assign the nearest active hub based on the
              employee's stored coordinates.
            </p>
          </div>

          {/* Override toggle */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-700">
                Lock assignment (override)
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                When enabled, bulk auto-assign will skip this employee and keep
                this hub.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOverridden((v) => !v)}
              className={`relative mt-0.5 h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
                isOverridden ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  isOverridden ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600">
              <i className="ti ti-alert-circle text-sm" />
              {typeof error === "string"
                ? error
                : error?.detail || "Something went wrong"}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="h-8 px-4 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || hubsLoading}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <i className="ti ti-loader-2 animate-spin text-sm" />
                Assigning…
              </>
            ) : (
              <>
                <i className="ti ti-map-pin text-sm" />
                {isReassign ? "Re-assign" : "Assign"}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}