import React from "react";
import { Trash2, Edit, MapPin, Navigation } from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggle from "../ui/ReusableToggle";

const NodalPointTable = ({
  nodalPoints = [],
  isLoading = false,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-4 py-3 flex gap-4">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded animate-pulse flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (!nodalPoints || nodalPoints.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-700 font-medium text-base mb-1">No nodal points found</p>
        <p className="text-gray-400 text-sm">Add a nodal hub to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Table header bar */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          Showing{" "}
          <span className="text-gray-900 font-semibold">{nodalPoints.length}</span>{" "}
          nodal point{nodalPoints.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["ID", "Name", "Address", "Latitude", "Longitude", "Status", "Actions"].map(
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
            {nodalPoints.map((point) => (
              <tr
                key={point.nodal_point_id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {/* ID */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {point.nodal_point_id}
                  </span>
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900">
                      {point.name}
                    </span>
                  </div>
                </td>

                {/* Address */}
                <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px]">
                  <span className="line-clamp-2">{point.address || "—"}</span>
                </td>

                {/* Latitude */}
                <td className="px-4 py-3 text-sm text-gray-600 font-mono whitespace-nowrap">
                  {point.latitude != null ? Number(point.latitude).toFixed(6) : "—"}
                </td>

                {/* Longitude */}
                <td className="px-4 py-3 text-sm text-gray-600 font-mono whitespace-nowrap">
                  {point.longitude != null ? Number(point.longitude).toFixed(6) : "—"}
                </td>

                {/* Status toggle */}
                <td className="px-4 py-3">
                  <ReusableToggle
                    module="nodal_point"
                    action="update"
                    isActive={point.is_active}
                    onToggle={() => onToggleActive(point)}
                    activeLabel="Active"
                    inactiveLabel="Inactive"
                    size="sm"
                    showLabels
                  />
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <ReusableButton
                      module="nodal_point"
                      action="update"
                      icon={Edit}
                      title="Edit Nodal Point"
                      onClick={() => onEdit(point)}
                      className="text-gray-500 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-all"
                    />
                    <ReusableButton
                      module="nodal_point"
                      action="delete"
                      icon={Trash2}
                      title="Deactivate Nodal Point"
                      onClick={() => onDelete(point)}
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NodalPointTable;
