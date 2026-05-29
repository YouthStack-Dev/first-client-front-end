import { memo, useMemo } from "react";
import { Eye, Edit } from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggleButton from "../ui/ReusableToggleButton";
import { ReusablePagination } from "../ui/ReusablePagination";

// ─── constants ────────────────────────────────────────────────────────────────

const MODULE = "vehicle_type";

// ─── skeleton loader ──────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="border-b animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-gray-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

// ─── main component ───────────────────────────────────────────────────────────

/**
 * VehicleTypeList
 *
 * Props:
 *  vehicleTypes          – vehicle type[]
 *  onView                – (vt) => void
 *  onEdit                – (vt) => void
 *  onStatusToggle        – (vt) => void
 *  showPagination        – boolean (default false)
 *  currentPage           – number (default 1)
 *  totalPages            – number (default 1)
 *  totalItems            – number (default 0)
 *  itemsPerPage          – number (default 10)
 *  onPageChange          – (page) => void
 *  onItemsPerPageChange  – (n) => void
 *  isLoading             – boolean (default false)
 */
export const VehicleTypeList = ({
  vehicleTypes = [],
  onView,
  onEdit,
  onStatusToggle,
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm mt-2 flex flex-col">

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table
          className="min-w-full border-collapse text-sm"
          aria-label="Vehicle type list"
        >
          <caption className="sr-only">List of vehicle types</caption>

          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wide">
              <th className="px-4 py-3 w-16">S. No.</th>
              <th className="px-4 py-3">Vehicle type</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-center">Seats</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            ) : vehicleTypes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-8 h-8 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0M13 17H9m4 0h2m0 0a2 2 0 104 0M5 17H3m0 0V7a2 2 0 012-2h9.586a1 1 0 01.707.293l3.414 3.414A1 1 0 0119 9.414V13"
                      />
                    </svg>
                    <span>No vehicle types found</span>
                  </div>
                </td>
              </tr>
            ) : (
              vehicleTypes.map((vt, index) => (
                <tr
                  key={vt.vehicle_type_id ?? index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* S.No */}
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {startIndex + index + 1}
                  </td>

                  {/* Vehicle type name */}
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {vt.name ?? "—"}
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 text-gray-500">
                    {vt.description || "—"}
                  </td>

                  {/* Seats */}
                  <td className="px-4 py-3 text-center text-gray-700">
                    {vt.seats ?? "—"}
                  </td>

                  {/* Status toggle */}
                  <td className="px-4 py-3 text-center">
                    <ReusableToggleButton
                      module={MODULE}
                      action="update"
                      isChecked={vt.is_active ?? true}
                      onToggle={() => onStatusToggle(vt)}
                      labels={{ on: "Active", off: "Inactive" }}
                      size="small"
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <ReusableButton
                        module={MODULE}
                        action="read"
                        icon={Eye}
                        title="View vehicle type"
                        aria-label={`View ${vt.name}`}
                        onClick={() => onView(vt)}
                        className="p-1"
                      />
                      <ReusableButton
                        module={MODULE}
                        action="update"
                        icon={Edit}
                        title="Edit vehicle type"
                        aria-label={`Edit ${vt.name}`}
                        onClick={() => onEdit(vt)}
                        className="p-1"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {showPagination && totalPages > 1 && (
        <div className="border-t border-gray-100 bg-white">
          <ReusablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default memo(VehicleTypeList);