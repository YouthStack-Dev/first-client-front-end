import { memo, useMemo } from "react";
import { Eye, Edit } from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggleButton from "../ui/ReusableToggleButton";
import { ReusablePagination } from "../ui/ReusablePagination";

// ─── helpers (outside component — no re-creation on render) ──────────────────

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "—";

const getExpiryMeta = (dateStr) => {
  if (!dateStr) return { label: "—", classes: "text-gray-400", badge: null };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  expiry.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: formatDate(dateStr),
      classes: "text-red-700",
      badge: (
        <span className="ml-1 inline-block text-[10px] font-medium bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
          Expired
        </span>
      ),
    };
  }
  if (diffDays <= 30) {
    return {
      label: formatDate(dateStr),
      classes: "text-amber-700",
      badge: (
        <span className="ml-1 inline-block text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
          {diffDays}d
        </span>
      ),
    };
  }
  return { label: formatDate(dateStr), classes: "text-gray-700", badge: null };
};

// ─── expiry cell ──────────────────────────────────────────────────────────────

const ExpiryCell = ({ dateStr }) => {
  const { label, classes, badge } = getExpiryMeta(dateStr);
  return (
    <td className="px-4 py-3 whitespace-nowrap">
      <span className={`text-sm ${classes}`}>{label}</span>
      {badge}
    </td>
  );
};

// ─── filter bar ──────────────────────────────────────────────────────────────

const FILTERS = [
  { key: "all", label: "All" },
  { key: "expired", label: "Expired" },
  { key: "expiring", label: "Expiring soon (≤30d)" },
  { key: "valid", label: "Valid" },
];

const FilterBar = ({ activeFilter, onChange, counts }) => (
  <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50 flex-wrap">
    {FILTERS.map(({ key, label }) => {
      const isActive = activeFilter === key;
      const count = counts[key] ?? 0;
      return (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors
            ${
              isActive
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
            }`}
        >
          {label}
          {key !== "all" && (
            <span
              className={`text-[10px] font-semibold rounded-full px-1.5 py-0.5
                ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

// ─── skeleton loader ──────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="border-t animate-pulse">
    {Array.from({ length: 10 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-gray-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

// ─── main component ───────────────────────────────────────────────────────────

/**
 * NewVehicleList
 *
 * Props:
 *  vehicles              – vehicle[]
 *  onEdit                – (vehicle) => void
 *  onView                – (vehicle) => void
 *  onStatusToggle        – (vehicle) => void
 *  currentPage           – number
 *  totalPages            – number
 *  totalItems            – number
 *  itemsPerPage          – number
 *  onPageChange          – (page) => void
 *  onItemsPerPageChange  – (n) => void
 *  showPagination        – boolean (default false)
 *  isLoading             – boolean (default false)
 *  activeFilter          – "all"|"expired"|"expiring"|"valid" (default "all")
 *  onFilterChange        – (filter) => void   ← optional; hides bar if omitted
 */
export const NewVehicleList = ({
  vehicles = [],
  onEdit,
  onView,
  onStatusToggle,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showPagination = false,
  isLoading = false,
  activeFilter = "all",
  onFilterChange,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;

  const filterCounts = useMemo(() => {
    const counts = { all: vehicles.length, expired: 0, expiring: 0, valid: 0 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    vehicles.forEach((v) => {
      const dates = [
        v.rc_expiry_date,
        v.insurance_expiry_date,
        v.permit_expiry_date,
        v.puc_expiry_date,
        v.fitness_expiry_date,
      ].filter(Boolean);

      const hasExpired = dates.some((d) => new Date(d) < today);
      const hasExpiring = dates.some((d) => {
        const diff = Math.ceil((new Date(d) - today) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 30;
      });

      if (hasExpired) counts.expired += 1;
      else if (hasExpiring) counts.expiring += 1;
      else counts.valid += 1;
    });

    return counts;
  }, [vehicles]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm mt-4 flex flex-col">

      {/* FILTER BAR — only renders if parent passes onFilterChange */}
      {onFilterChange && (
        <FilterBar
          activeFilter={activeFilter}
          onChange={onFilterChange}
          counts={filterCounts}
        />
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table
          className="min-w-full border-collapse text-sm"
          aria-label="Vehicle list"
        >
          <caption className="sr-only">
            List of vehicles with compliance expiry dates
          </caption>

          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wide">
              <th className="px-4 py-3 w-12">S. No.</th>
              <th className="px-4 py-3">Vehicle type</th>
              <th className="px-4 py-3">RC number</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">RC expiry</th>
              <th className="px-4 py-3">Insurance expiry</th>
              <th className="px-4 py-3">Permit expiry</th>
              <th className="px-4 py-3">PUC expiry</th>
              <th className="px-4 py-3">Fitness expiry</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-gray-400 text-sm">
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
                    <span>No vehicles found</span>
                  </div>
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle, index) => (
                <tr
                  key={vehicle.vehicle_id ?? index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* S.No */}
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {startIndex + index + 1}
                  </td>

                  {/* Vehicle type */}
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {vehicle.vehicle_type_name ?? "—"}
                  </td>

                  {/* RC number */}
                  <td className="px-4 py-3 font-mono text-gray-700 tracking-wide">
                    {vehicle.rc_number || "—"}
                  </td>

                  {/* Driver */}
                  <td className="px-4 py-3">
                    {vehicle.driver_name ? (
                      <span className="text-gray-800">{vehicle.driver_name}</span>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Unassigned</span>
                    )}
                  </td>

                  {/* Expiry columns */}
                  <ExpiryCell dateStr={vehicle.rc_expiry_date} />
                  <ExpiryCell dateStr={vehicle.insurance_expiry_date} />
                  <ExpiryCell dateStr={vehicle.permit_expiry_date} />
                  <ExpiryCell dateStr={vehicle.puc_expiry_date} />
                  <ExpiryCell dateStr={vehicle.fitness_expiry_date} />

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <ReusableButton
                        module="vehicle"
                        action="read"
                        icon={Eye}
                        title="View vehicle"
                        aria-label={`View vehicle ${vehicle.rc_number || vehicle.vehicle_id}`}
                        onClick={() => onView(vehicle)}
                        className="p-1"
                      />
                      <ReusableButton
                        module="vehicle"
                        action="update"
                        icon={Edit}
                        title="Edit vehicle"
                        aria-label={`Edit vehicle ${vehicle.rc_number || vehicle.vehicle_id}`}
                        onClick={() => onEdit(vehicle)}
                        className="p-1"
                      />
                      <ReusableToggleButton
                        module="vehicle"
                        action="update"
                        isChecked={vehicle.is_active ?? true}
                        onToggle={() => onStatusToggle(vehicle)}
                        labels={{ on: "Active", off: "Inactive" }}
                        size="small"
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

export default memo(NewVehicleList);