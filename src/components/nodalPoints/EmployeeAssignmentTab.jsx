import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { UserCheck, X, Navigation, RefreshCw, Trash2, Users } from "lucide-react";

import {
  assignNodalPointThunk,
  removeEmployeeAssignmentThunk,
  bulkAssignNearestThunk,
  fetchEmployeeAssignmentThunk,
} from "../../redux/features/nodalPoints/nodalPointsThunks";
import {
  selectAssignmentLoading,
  selectAssignmentError,
  selectLastBulkResult,
  clearBulkResult,
} from "../../redux/features/nodalPoints/nodalPointsSlice";
import { nodalPointSelectors } from "../../redux/features/nodalPoints/nodalPointsSlice";

import { API_CLIENT } from "../../Api/API_Client";
import ReusableButton from "../ui/ReusableButton";
import SearchInput from "../ui/SearchInput";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";

// ─── Internal helper: labelled form field ──────────────────────────────────────
const FormField = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-app-text-secondary mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// ─── Assign Modal ──────────────────────────────────────────────────────────────
const AssignModal = ({
  isOpen,
  employee,
  nodalPoints,
  tenantId,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const assignmentLoading = useSelector(selectAssignmentLoading);

  const [selectedNodalPointId, setSelectedNodalPointId] = useState("");
  const [isOverridden, setIsOverridden] = useState(false);
  const [assignmentErrors, setAssignmentErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSelectedNodalPointId("");
      setIsOverridden(false);
      setAssignmentErrors({});
    }
  }, [isOpen, employee]);

  const validate = () => {
    const errs = {};
    if (!selectedNodalPointId) errs.nodal_point_id = "Please select a nodal point";
    setAssignmentErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await dispatch(
        assignNodalPointThunk({
          employee_id: employee.employee_id,
          tenant_id: tenantId,
          nodal_point_id: parseInt(selectedNodalPointId),
          is_overridden: isOverridden,
        })
      ).unwrap();
      toast.success(`Nodal point assigned to ${employee.name} successfully!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to assign nodal point");
    }
  };

  if (!isOpen) return null;

  const activePoints = nodalPoints.filter((p) => p.is_active);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-app-surface rounded-lg shadow-xl max-w-md w-full border border-app-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-sidebar-primary to-sidebar-secondary px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            Assign Nodal Point
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-app-secondary rounded transition-colors text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {employee && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Assigning to:{" "}
                <span className="font-semibold">{employee.name}</span>
              </p>
              {employee.email && (
                <p className="text-xs text-blue-600 mt-0.5">{employee.email}</p>
              )}
            </div>
          )}

          <FormField
            label="Nodal Point"
            required
            error={assignmentErrors.nodal_point_id}
          >
            <select
              value={selectedNodalPointId}
              onChange={(e) => {
                setSelectedNodalPointId(e.target.value);
                setAssignmentErrors((p) => ({ ...p, nodal_point_id: null }));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-app-primary focus:border-app-primary bg-app-surface text-app-text-primary ${
                assignmentErrors.nodal_point_id
                  ? "border-red-500"
                  : "border-app-border"
              }`}
            >
              <option value="">-- Select Nodal Point --</option>
              {activePoints.map((p) => (
                <option key={p.nodal_point_id} value={p.nodal_point_id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={isOverridden}
                onChange={(e) => setIsOverridden(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-5 h-5 border rounded-md flex items-center justify-center transition-all duration-300 ${
                  isOverridden
                    ? "bg-gradient-to-r from-sidebar-primary to-sidebar-secondary border-transparent"
                    : "bg-app-surface border-app-border group-hover:border-sidebar-secondary"
                }`}
              >
                {isOverridden && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-app-text-secondary">
              Mark as overridden (protects from bulk auto-reassignment)
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3 border-t border-app-border bg-app-tertiary">
          <button
            onClick={onClose}
            disabled={assignmentLoading}
            className="px-4 py-2 border border-app-border text-app-text-secondary rounded-lg hover:bg-app-surface transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={assignmentLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sidebar-primary to-sidebar-secondary text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {assignmentLoading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Assigning...
              </>
            ) : (
              <>
                <UserCheck size={16} />
                Assign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Bulk Result Modal ─────────────────────────────────────────────────────────
const BulkResultModal = ({ result, onClose }) => {
  if (!result) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Bulk Assignment Complete
        </h3>
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-green-600">{result.assigned ?? 0}</span>{" "}
            employee(s) assigned
          </p>
          {result.skipped && result.skipped.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">
                Skipped ({result.skipped.length}):
              </p>
              <ul className="max-h-32 overflow-y-auto text-xs text-gray-500 space-y-1 border border-gray-200 rounded p-2 bg-gray-50">
                {result.skipped.map((s, i) => (
                  <li key={i}>
                    Employee #{s.employee_id} — {s.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const EmployeeAssignmentTab = ({ tenantId }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const nodalPoints = useSelector(nodalPointSelectors.selectAll);
  const assignmentLoading = useSelector(selectAssignmentLoading);
  const lastBulkResult = useSelector(selectLastBulkResult);

  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [assignments, setAssignments] = useState({}); // { employee_id: assignment }
  const [searchTerm, setSearchTerm] = useState("");
  const [assignModal, setAssignModal] = useState({ open: false, employee: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, employee: null });
  const [showBulkResult, setShowBulkResult] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const effectiveTenantId = tenantId || currentUser?.tenant_id;

  // ─── Load employees ────────────────────────────────────────────────────────
  const loadEmployees = useCallback(async () => {
    if (!effectiveTenantId) return;
    setEmpLoading(true);
    try {
      const res = await API_CLIENT.get("/employees/", {
        params: { tenant_id: effectiveTenantId, is_active: true, limit: 200 },
      });
      const items = res.data?.data?.items || res.data?.data || [];
      setEmployees(Array.isArray(items) ? items : []);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setEmpLoading(false);
    }
  }, [effectiveTenantId]);

  // ─── Load assignments for all employees ───────────────────────────────────
  const loadAssignments = useCallback(
    async (empList) => {
      if (!effectiveTenantId || !empList.length) return;
      const results = await Promise.allSettled(
        empList.map((emp) =>
          API_CLIENT.get(`/nodal-points/employees/${emp.employee_id}`, {
            params: { tenant_id: effectiveTenantId },
          })
        )
      );
      const map = {};
      results.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          const data = result.value?.data?.data;
          if (data) map[empList[idx].employee_id] = data;
        }
      });
      setAssignments(map);
    },
    [effectiveTenantId]
  );

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    if (employees.length > 0) loadAssignments(employees);
  }, [employees, loadAssignments]);

  // ─── Show bulk result when it arrives ─────────────────────────────────────
  useEffect(() => {
    if (lastBulkResult) setShowBulkResult(true);
  }, [lastBulkResult]);

  // ─── Filtered employees ────────────────────────────────────────────────────
  const filteredEmployees = employees.filter((emp) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      String(emp.employee_id).includes(q)
    );
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAssignSuccess = () => {
    loadAssignments(employees);
  };

  const handleRemoveAssignment = async () => {
    const emp = deleteConfirm.employee;
    setDeleteConfirm({ open: false, employee: null });
    try {
      await dispatch(
        removeEmployeeAssignmentThunk({
          employee_id: emp.employee_id,
          tenant_id: effectiveTenantId,
        })
      ).unwrap();
      toast.success(`Assignment removed for ${emp.name}`);
      setAssignments((prev) => {
        const next = { ...prev };
        delete next[emp.employee_id];
        return next;
      });
    } catch (err) {
      toast.error(err?.message || "Failed to remove assignment");
    }
  };

  const handleBulkAssign = async () => {
    setIsBulkLoading(true);
    try {
      await dispatch(
        bulkAssignNearestThunk({ tenant_id: effectiveTenantId })
      ).unwrap();
      // reload assignments after bulk
      await loadAssignments(employees);
    } catch (err) {
      toast.error(err?.message || "Bulk assignment failed");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleCloseBulkResult = () => {
    setShowBulkResult(false);
    dispatch(clearBulkResult());
  };

  return (
    <div>
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search by name, email, or ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ReusableButton
          module="nodal_point"
          action="update"
          buttonName={isBulkLoading ? "Assigning…" : "Bulk Assign Nearest"}
          icon={RefreshCw}
          title="Auto-assign nearest hub to all employees (skips overridden)"
          onClick={handleBulkAssign}
          loading={isBulkLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm whitespace-nowrap"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {empLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-4 py-3 flex gap-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-100 rounded animate-pulse flex-1" />
                ))}
              </div>
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium">No employees found</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-medium text-gray-600">
                Showing{" "}
                <span className="text-gray-900 font-semibold">
                  {filteredEmployees.length}
                </span>{" "}
                employee{filteredEmployees.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["ID", "Employee", "Email", "Assigned Hub", "Overridden", "Actions"].map(
                      (col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.map((emp) => {
                    const assignment = assignments[emp.employee_id];
                    return (
                      <tr
                        key={emp.employee_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* ID */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            {emp.employee_id}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {emp.name}
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {emp.email || "—"}
                        </td>

                        {/* Assigned Hub */}
                        <td className="px-4 py-3">
                          {assignment ? (
                            <div className="flex items-center gap-1.5">
                              <Navigation className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                              <span className="text-sm text-gray-800 font-medium">
                                {assignment.name || assignment.nodal_point?.name || "—"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Not assigned</span>
                          )}
                        </td>

                        {/* Overridden */}
                        <td className="px-4 py-3">
                          {assignment ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                assignment.is_overridden
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-gray-100 text-gray-600 border border-gray-200"
                              }`}
                            >
                              {assignment.is_overridden ? "Yes" : "No"}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <ReusableButton
                              module="nodal_point"
                              action="update"
                              icon={UserCheck}
                              title={assignment ? "Re-assign Hub" : "Assign Hub"}
                              onClick={() =>
                                setAssignModal({ open: true, employee: emp })
                              }
                              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                            />
                            {assignment && (
                              <ReusableButton
                                module="nodal_point"
                                action="update"
                                icon={Trash2}
                                title="Remove Assignment"
                                onClick={() =>
                                  setDeleteConfirm({ open: true, employee: emp })
                                }
                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Assign Modal */}
      <AssignModal
        isOpen={assignModal.open}
        employee={assignModal.employee}
        nodalPoints={nodalPoints}
        tenantId={effectiveTenantId}
        onClose={() => setAssignModal({ open: false, employee: null })}
        onSuccess={handleAssignSuccess}
      />

      {/* Delete confirm */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 w-80 text-center">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-red-100 mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <p className="font-semibold text-gray-800 text-base mb-1">
              Remove assignment?
            </p>
            <p className="text-sm text-gray-500 mb-5">
              The nodal point assignment for{" "}
              <span className="font-medium">{deleteConfirm.employee?.name}</span>{" "}
              will be removed.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm({ open: false, employee: null })}
                className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveAssignment}
                className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Result Modal */}
      {showBulkResult && (
        <BulkResultModal
          result={lastBulkResult}
          onClose={handleCloseBulkResult}
        />
      )}
    </div>
  );
};

export default EmployeeAssignmentTab;
