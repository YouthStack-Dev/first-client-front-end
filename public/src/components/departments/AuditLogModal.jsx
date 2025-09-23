import React from "react";

const AuditLogModal = ({ logs = [], isLoading = false }) => {
  return (
    <div className="max-h-96 overflow-y-auto">
      {isLoading ? (
        <div className="flex justify-center items-center py-8 text-gray-500">
          Loading audit logs...
        </div>
      ) : logs?.length > 0 ? (
        <table className="w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 border">ID</th>
              <th className="px-3 py-2 border">Action</th>
              <th className="px-3 py-2 border">Description</th>
              <th className="px-3 py-2 border">Changes</th>
              <th className="px-3 py-2 border">Changed By</th>
              <th className="px-3 py-2 border">Changed At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border">{log.id}</td>
                <td className="px-3 py-2 border">{log.action}</td>
                <td className="px-3 py-2 border">{log.action_description}</td>
                <td className="px-3 py-2 border">
                  {log.changes?.map((c, i) => (
                    <div key={i}>• {c}</div>
                  ))}
                </td>
                <td className="px-3 py-2 border">{log.changed_by}</td>
                <td className="px-3 py-2 border">
                  {new Date(log.changed_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex justify-center items-center py-8 text-gray-500">
          No audit logs found.
        </div>
      )}
    </div>
  );
};

export default AuditLogModal;
