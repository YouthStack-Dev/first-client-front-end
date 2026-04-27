// components/AuditLogsModal.jsx
import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { logDebug } from "../../utils/logger";
import { API_CLIENT } from "../../Api/API_Client";

const AuditLogsModal = ({
  isOpen,
  onClose,
  moduleName,
  auditData = [],
  showUserColumn = true,
  apimodule = "employees",
  selectedCompany = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 5; // ✅ Change 1: was 10

  // ✅ Change 2: fetch all at once, no page param
  const fetchAuditLogs = async () => {
    try {
      const response = await API_CLIENT.get(
        `/audit-logs/module/${apimodule}?skip=0&limit=100&tenant_id=${selectedCompany}`
      );
      const data = response.data?.data;
      setAuditLogs(data?.audit_logs || []);
      setTotalCount(data?.pagination?.total_count || 0);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  // ✅ Change 2: only fetch on modal open, removed currentPage dependency
  useEffect(() => {
    if (isOpen && apimodule && selectedCompany) {
      fetchAuditLogs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchTerm("");
      setActionFilter("all");
      setExpandedLogs({});
    }
  }, [isOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionBadgeColor = (action) => {
    switch (action) {
      case "CREATE": return "bg-green-100 text-green-800 border-green-200";
      case "UPDATE": return "bg-blue-100 text-blue-800 border-blue-200";
      case "DELETE": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const toggleLogExpansion = (logId) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  const renderChanges = (log) => {
    const { action, user, new_values, description } = log.audit_data;
    const userName = user?.name || "Unknown User";
    const userEmail = user?.email || "No email";

    const descriptionBlock = description ? (
      <p className="text-sm font-medium mb-2">{description}</p>
    ) : null;

    // ─── CREATE ───────────────────────────────────────────────
    if (action === "CREATE") {
      const fields = Object.keys(new_values || {});
      if (fields.length === 0) {
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
            {descriptionBlock}
            <p className="text-green-900 text-sm">
              <span className="font-semibold">{userName}</span> ({userEmail}) created a new record.
            </p>
          </div>
        );
      }
      const fieldList = fields
        .map((field) => `${formatFieldName(field)}: ${String(new_values[field] ?? "")}`)
        .join(", ");
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
          {descriptionBlock}
          <p className="text-green-900 text-sm">
            <span className="font-semibold">{userName}</span> ({userEmail}) created a record with{" "}
            <span className="font-medium">{fieldList}</span>
          </p>
        </div>
      );
    }

    // ─── UPDATE ───────────────────────────────────────────────
    if (action === "UPDATE") {

      // ✅ Case 1 — { changed_fields: { field: { old, new } }, new_state: {} }
      if (new_values?.changed_fields) {
        const changedFields = Object.keys(new_values.changed_fields);

        if (changedFields.length === 0) {
          return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
              {descriptionBlock}
              <p className="text-amber-900 text-sm">
                <span className="font-semibold">{userName}</span> ({userEmail}) made an update with no field changes.
              </p>
            </div>
          );
        }

        return (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
            {descriptionBlock}
            <p className="text-amber-900 text-sm mb-3">
              <span className="font-semibold">{userName}</span> ({userEmail}) made the following changes:
            </p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-amber-100">
                  <th className="text-left px-3 py-2 text-amber-800 font-semibold border border-amber-200 w-1/3">Field</th>
                  <th className="text-left px-3 py-2 text-red-700 font-semibold border border-amber-200 w-1/3">Before</th>
                  <th className="text-left px-3 py-2 text-green-700 font-semibold border border-amber-200 w-1/3">After</th>
                </tr>
              </thead>
              <tbody>
                {changedFields.map((field, i) => (
                  <tr key={field} className={i % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                    <td className="px-3 py-2 font-medium text-gray-700 border border-amber-200">{formatFieldName(field)}</td>
                    <td className="px-3 py-2 text-red-600 border border-amber-200">
                      <span className="line-through">{String(new_values.changed_fields[field]?.old ?? "—")}</span>
                    </td>
                    <td className="px-3 py-2 text-green-600 font-medium border border-amber-200">{String(new_values.changed_fields[field]?.new ?? "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // ✅ Case 2 — { old: {...}, new: {...} }
      if (new_values?.old && new_values?.new) {
        const changedFields = Object.keys(new_values.old).filter(
          (key) => new_values.old[key] !== new_values.new[key]
        );
        if (changedFields.length === 0) {
          return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
              {descriptionBlock}
              <p className="text-amber-900 text-sm">
                <span className="font-semibold">{userName}</span> ({userEmail}) made an update with no field changes.
              </p>
            </div>
          );
        }
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
            {descriptionBlock}
            <p className="text-amber-900 text-sm mb-3">
              <span className="font-semibold">{userName}</span> ({userEmail}) made the following changes:
            </p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-amber-100">
                  <th className="text-left px-3 py-2 text-amber-800 font-semibold border border-amber-200 w-1/3">Field</th>
                  <th className="text-left px-3 py-2 text-red-700 font-semibold border border-amber-200 w-1/3">Before</th>
                  <th className="text-left px-3 py-2 text-green-700 font-semibold border border-amber-200 w-1/3">After</th>
                </tr>
              </thead>
              <tbody>
                {changedFields.map((field, i) => (
                  <tr key={field} className={i % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                    <td className="px-3 py-2 font-medium text-gray-700 border border-amber-200">{formatFieldName(field)}</td>
                    <td className="px-3 py-2 text-red-600 border border-amber-200">
                      <span className="line-through">{String(new_values.old[field] ?? "—")}</span>
                    </td>
                    <td className="px-3 py-2 text-green-600 font-medium border border-amber-200">{String(new_values.new[field] ?? "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // ✅ Case 3 — flat primitives, detect old_X / new_X pairs → 3-column table
      const fields = Object.keys(new_values || {});
      const primitiveFields = fields.filter(
        (f) => typeof new_values[f] !== "object"
      );
      if (primitiveFields.length > 0) {
        const pairedKeys = new Set();
        const pairedChangeRows = [];

        primitiveFields.forEach((field) => {
          if (field.startsWith("old_")) {
            const base = field.slice(4);
            const newKey = `new_${base}`;
            if (primitiveFields.includes(newKey)) {
              pairedKeys.add(field);
              pairedKeys.add(newKey);
              pairedChangeRows.push({
                base,
                oldVal: new_values[field],
                newVal: new_values[newKey],
              });
            }
          }
        });

        const unpaired = primitiveFields.filter((f) => !pairedKeys.has(f));

        return (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
            {descriptionBlock}
            <p className="text-amber-900 text-sm mb-3">
              <span className="font-semibold">{userName}</span> ({userEmail}) made the following changes:
            </p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-amber-100">
                  <th className="text-left px-3 py-2 text-amber-800 font-semibold border border-amber-200 w-1/3">Field</th>
                  <th className="text-left px-3 py-2 text-red-700 font-semibold border border-amber-200 w-1/3">Before</th>
                  <th className="text-left px-3 py-2 text-green-700 font-semibold border border-amber-200 w-1/3">After</th>
                </tr>
              </thead>
              <tbody>
                {pairedChangeRows.map(({ base, oldVal, newVal }, i) => (
                  <tr key={base} className={i % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                    <td className="px-3 py-2 font-medium text-gray-700 border border-amber-200">{formatFieldName(base)}</td>
                    <td className="px-3 py-2 text-red-600 border border-amber-200">
                      <span className="line-through">{String(oldVal ?? "—")}</span>
                    </td>
                    <td className="px-3 py-2 text-green-600 font-medium border border-amber-200">{String(newVal ?? "—")}</td>
                  </tr>
                ))}
                {unpaired.map((field, i) => (
                  <tr key={field} className={(pairedChangeRows.length + i) % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                    <td className="px-3 py-2 font-medium text-gray-700 border border-amber-200">{formatFieldName(field)}</td>
                    <td className="px-3 py-2 text-gray-400 border border-amber-200">—</td>
                    <td className="px-3 py-2 text-green-600 font-medium border border-amber-200">{String(new_values[field] ?? "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // ✅ Case 4 — only description
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
          {descriptionBlock}
          <p className="text-amber-900 text-sm">
            <span className="font-semibold">{userName}</span> ({userEmail}) made an update.
          </p>
        </div>
      );
    }

    // ─── DELETE ───────────────────────────────────────────────
    if (action === "DELETE") {
      const fields = Object.keys(new_values || {}).filter(
        (f) => typeof new_values[f] !== "object"
      );
      const fieldList = fields
        .map((field) => `${formatFieldName(field)}: ${String(new_values[field] ?? "")}`)
        .join(", ");
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
          {descriptionBlock}
          <p className="text-red-900 text-sm">
            <span className="font-semibold">{userName}</span> ({userEmail}) deleted a record
            {fieldList ? ` with ${fieldList}` : ""}.
          </p>
        </div>
      );
    }

    // ─── FALLBACK ─────────────────────────────────────────────
    return description ? (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
        <p className="text-gray-900 text-sm">
          <span className="font-semibold">{userName}</span> ({userEmail}): {description}
        </p>
      </div>
    ) : null;
  };

  const filteredLogs = auditLogs?.filter((log) => {
    const matchesSearch =
      log.audit_data.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.audit_data.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.audit_data.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction =
      actionFilter === "all" || log.audit_data.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  // ✅ Change 3: frontend pagination variables
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleClose = () => {
    setSearchTerm("");
    setActionFilter("all");
    setCurrentPage(1);
    setExpandedLogs({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">{moduleName} Audit Logs</h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by user name, email or description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                </select>
              </div>
            </div>
          </div>
          {/* ✅ Change 5: updated count display */}
          <div className="mt-3 text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold">{filteredLogs.length === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="font-semibold">
              {Math.min(startIndex + itemsPerPage, filteredLogs.length)}
            </span>{" "}
            of <span className="font-semibold">{filteredLogs.length}</span> logs
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                {showUserColumn && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* ✅ Change 4: use currentLogs instead of filteredLogs */}
              {currentLogs.map((log) => (
                <React.Fragment key={log.audit_id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(log.audit_data.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getActionBadgeColor(log.audit_data.action)}`}>
                        {log.audit_data.action}
                      </span>
                    </td>
                    {showUserColumn && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {log.audit_data.user?.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {log.audit_data.user?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleLogExpansion(log.audit_id)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                      >
                        {expandedLogs[log.audit_id] ? (
                          <><ChevronUp className="w-4 h-4" />Hide Details</>
                        ) : (
                          <><ChevronDown className="w-4 h-4" />Show Details</>
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedLogs[log.audit_id] && (
                    <tr>
                      <td colSpan={showUserColumn ? 4 : 3} className="px-6 py-4 bg-gray-50">
                        {renderChanges(log)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 bg-white">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit logs found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0 bg-gray-50">
            <div className="text-sm text-gray-600">
              Page <span className="font-semibold">{currentPage}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuditLogsModal;