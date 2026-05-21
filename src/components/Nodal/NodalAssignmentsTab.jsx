import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Employee
import { fetchEmployeesThunk } from "../../redux/features/employees/employeesThunk";
import { selectAllEmployees } from "../../redux/features/employees/employeesSlice";
import { selectEmployeesLoading } from "../../redux/features/employees/employeesSelectors";

// Nodal assignment
import {
  bulkAssignNearest,
  removeNodalAssignment,
} from "../../redux/features/nodalAssignments/Nodalassignmentthunks";
import {
  selectBulkAssignLoading,
  selectBulkAssignResult,
  selectBulkAssignError,
  selectNodalAssignmentLoading,
} from "../../redux/features/nodalAssignments/Nodalassignmentselectors";
import { clearBulkResult } from "../../redux/features/nodalAssignments/Nodalassignmentslice";

import AssignNodalModal from "./AssignNodalModal";

/**
 * NodalAssignmentsTab
 * Props:
 *  - tenantId : string
 */
export default function NodalAssignmentsTab({ tenantId }) {
  const dispatch = useDispatch();

  const employees      = useSelector(selectAllEmployees);
  const empLoading     = useSelector(selectEmployeesLoading);
  const assignLoading  = useSelector(selectNodalAssignmentLoading);
  const bulkLoading    = useSelector(selectBulkAssignLoading);
  const bulkResult     = useSelector(selectBulkAssignResult);
  const bulkError      = useSelector(selectBulkAssignError);

  const [search, setSearch]           = useState("");
  const [filterHub, setFilterHub]     = useState("all");
  const [modalOpen, setModalOpen]     = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [removingId, setRemovingId]   = useState(null);

  // Fetch employees only if not already in store
  useEffect(() => {
    if (tenantId && employees.length === 0) {
      dispatch(fetchEmployeesThunk({ tenant_id: tenantId }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, tenantId]);

  // ── Re-fetch after bulk assign ────────────────────────────────────────────
  useEffect(() => {
    if (bulkResult) {
      dispatch(fetchEmployeesThunk({ tenant_id: tenantId }));
    }
  }, [bulkResult, dispatch, tenantId]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const refreshEmployees = () =>
    dispatch(fetchEmployeesThunk({ tenant_id: tenantId }));

  const handleOpenAssign = (emp) => {
    setSelectedEmp(emp);
    setModalOpen(true);
  };

  const handleRemove = async (emp) => {
    setRemovingId(emp.employee_id);
    await dispatch(
      removeNodalAssignment({
        employee_id: emp.employee_id,
        tenant_id: tenantId,
      })
    );
    setRemovingId(null);
    refreshEmployees();
  };

  const handleBulkAssign = () => {
    dispatch(clearBulkResult());
    dispatch(bulkAssignNearest({ tenant_id: tenantId }));
  };

  // ── Filter employees ──────────────────────────────────────────────────────
  const visible = employees.filter((emp) => {
    const matchSearch =
      search.trim() === "" ||
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_code?.toLowerCase().includes(search.toLowerCase());

    const matchHub =
      filterHub === "all"
        ? true
        : filterHub === "assigned"
        ? !!emp.nodal_point
        : !emp.nodal_point;

    return matchSearch && matchHub;
  });

  const assignedCount   = employees.filter((e) => !!e.nodal_point).length;
  const unassignedCount = employees.filter((e) => !e.nodal_point).length;

  return (
    <div className="space-y-4">

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Employees",
            value: employees.length,
            icon: "ti-users",
            iconBg: "bg-slate-100",
            iconColor: "text-slate-500",
            valueColor: "text-slate-800",
          },
          {
            label: "Assigned",
            value: assignedCount,
            icon: "ti-map-pin-check",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
            valueColor: "text-emerald-600",
          },
          {
            label: "Unassigned",
            value: unassignedCount,
            icon: "ti-map-pin-off",
            iconBg: "bg-red-50",
            iconColor: "text-red-400",
            valueColor: "text-red-500",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white px-5 py-4 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {s.label}
              </p>
              <h3 className={`text-3xl font-semibold mt-1.5 ${s.valueColor}`}>
                {s.value}
              </h3>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.iconBg}`}>
              <i className={`ti ${s.icon} text-lg ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Bulk assign result banner ── */}
      {bulkResult && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <i className="ti ti-circle-check text-emerald-500 text-base mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-700">
                Bulk assignment complete — {bulkResult.assigned} employee
                {bulkResult.assigned !== 1 ? "s" : ""} assigned
              </p>
              {bulkResult.skipped?.length > 0 && (
                <p className="text-xs text-emerald-600 mt-0.5">
                  {bulkResult.skipped.length} skipped:{" "}
                  {bulkResult.skipped
                    .map((s) => `#${s.employee_id} (${s.reason})`)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => dispatch(clearBulkResult())}
            className="text-emerald-400 hover:text-emerald-600"
          >
            <i className="ti ti-x text-sm" />
          </button>
        </div>
      )}

      {/* ── Bulk assign error ── */}
      {bulkError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {typeof bulkError === "string"
            ? bulkError
            : bulkError?.detail || "Bulk assign failed"}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or employee code…"
            className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>

        <select
          value={filterHub}
          onChange={(e) => setFilterHub(e.target.value)}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">All employees</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>

        <span className="text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 whitespace-nowrap">
          {visible.length} employee{visible.length !== 1 ? "s" : ""}
        </span>

        <button
          onClick={handleBulkAssign}
          disabled={bulkLoading}
          className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-60 whitespace-nowrap"
        >
          {bulkLoading ? (
            <>
              <i className="ti ti-loader-2 animate-spin text-sm" />
              Assigning…
            </>
          ) : (
            <>
              <i className="ti ti-bolt text-sm" />
              Bulk assign nearest
            </>
          )}
        </button>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  Employee Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  Nodal Hub
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {empLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-slate-100 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <i className="ti ti-map-pin-off text-slate-400 text-lg" />
                      </div>
                      <p className="text-xs font-medium text-slate-600">
                        No employees found
                      </p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search or filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visible.map((emp) => {
                  const hub        = emp.nodal_point;
                  const isRemoving = removingId === emp.employee_id;

                  return (
                    <tr
                      key={emp.employee_id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-blue-600">
                              {emp.name?.[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                          <span className="text-sm text-slate-700 font-medium">
                            {emp.name}
                          </span>
                        </div>
                      </td>

                      {/* Employee code */}
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                        {emp.employee_code ?? "—"}
                      </td>

                      {/* Nodal Hub */}
                      <td className="px-4 py-3">
                        {hub ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                              <i className="ti ti-map-pin text-[10px]" />
                              {hub.name}
                            </span>
                            {hub.is_overridden && (
                              <span
                                title="Manually assigned — protected from bulk assign"
                                className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-600"
                              >
                                <i className="ti ti-lock text-[10px]" />
                                Locked
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs text-slate-400">
                            <i className="ti ti-map-pin-off text-[10px]" />
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Active status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            emp.is_active
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              emp.is_active ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                          {emp.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenAssign(emp)}
                            disabled={assignLoading || isRemoving}
                            className="inline-flex items-center gap-1 h-7 px-3 rounded-lg border border-blue-200 bg-blue-50 text-xs font-medium text-blue-600 hover:bg-blue-100 transition disabled:opacity-50"
                          >
                            <i className="ti ti-map-pin text-[11px]" />
                            {hub ? "Re-assign" : "Assign"}
                          </button>

                          {hub && (
                            <button
                              onClick={() => handleRemove(emp)}
                              disabled={isRemoving || assignLoading}
                              className="inline-flex items-center gap-1 h-7 px-3 rounded-lg border border-red-200 bg-red-50 text-xs font-medium text-red-500 hover:bg-red-100 transition disabled:opacity-50"
                            >
                              {isRemoving ? (
                                <i className="ti ti-loader-2 animate-spin text-[11px]" />
                              ) : (
                                <i className="ti ti-trash text-[11px]" />
                              )}
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Assign Modal ── */}
      <AssignNodalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={selectedEmp}
        tenantId={tenantId}
        onSuccess={refreshEmployees}
      />
    </div>
  );
}