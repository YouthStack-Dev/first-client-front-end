import { Eye, Edit, History } from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggleButton from "../ui/ReusableToggleButton";
import { ReusablePagination } from "../ui/ReusablePagination";

const DRIVER_TABLE_HEADERS = [
  { key: "s_no",            label: "S No."          },
  { key: "name",            label: "Name"            },
  { key: "license_number",  label: "License No."     },
  { key: "code",            label: "Driver Code"     },
  { key: "phone",           label: "Driver Phone"    },
  { key: "date_of_joining", label: "Date of Joining" },
  { key: "status",          label: "Status"          },
  { key: "actions",         label: "Actions"         },
];

const VISIBLE_HEADERS = DRIVER_TABLE_HEADERS.filter(
  (h) => h.key !== "documentsUploaded"
);

const CENTERED_KEYS = new Set(["actions", "status"]);

export const NewDriverList = ({
  drivers = [],
  loading = false,
  error = "",
  onEdit,
  onView,
  onHistory,          // ← NEW: opens the history tab/modal for this driver
  onStatusToggle,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showPagination = false,
  paginationClassName = "",
}) => {

  const getDriverStatus = (driver) => driver.is_active ?? false;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return isNaN(date)
      ? "—"
      : date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const getSerialNumber = (index) =>
    showPagination && currentPage
      ? (currentPage - 1) * (itemsPerPage || 10) + index + 1
      : index + 1;

  const renderCell = (header, driver, index) => {
    switch (header.key) {
      case "s_no":
        return getSerialNumber(index);

      case "status":
        return (
          <ReusableToggleButton
            module="driver"
            action="update"
            isChecked={getDriverStatus(driver)}
            onToggle={() => onStatusToggle?.(driver)}
            labels={{ on: "ACTIVE", off: "INACTIVE" }}
            size="small"
          />
        );

      case "date_of_joining":
        return formatDate(driver.date_of_joining);

      case "actions":
        return (
          <div className="flex justify-center items-center gap-2">
            {/* View */}
            <ReusableButton
              module="driver"
              action="read"
              icon={Eye}
              title="View Driver Details"
              onClick={() => onView?.(driver)}
              className="p-1 flex-shrink-0"
            />
            {/* Edit */}
            <ReusableButton
              module="driver"
              action="update"
              icon={Edit}
              title="Edit Driver"
              onClick={() => onEdit?.(driver)}
              className="p-1 flex-shrink-0"
            />
            {/* History ← NEW */}
            <ReusableButton
              module="driver"
              action="read"
              icon={History}
              title="View Driver History"
              onClick={() => onHistory?.(driver)}
              className="p-1 flex-shrink-0"
            />
          </div>
        );

      default:
        return driver[header.key] ?? "—";
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={VISIBLE_HEADERS.length} className="py-12 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500" />
              <span className="text-xs text-gray-500">Loading drivers...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={VISIBLE_HEADERS.length} className="py-12 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-red-500">Failed to load drivers: {error}</span>
            </div>
          </td>
        </tr>
      );
    }

    if (drivers.length === 0) {
      return (
        <tr>
          <td colSpan={VISIBLE_HEADERS.length} className="py-12 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-gray-500">No drivers found</span>
            </div>
          </td>
        </tr>
      );
    }

    return drivers.map((driver, index) => (
      <tr
        key={driver.driver_id ?? index}
        className="border-b hover:bg-gray-50 transition"
      >
        {VISIBLE_HEADERS.map((header) => (
          <td
            key={header.key}
            className={`px-4 py-3 text-sm ${
              CENTERED_KEYS.has(header.key) ? "text-center" : "text-left"
            }`}
          >
            {renderCell(header, driver, index)}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-sm mt-2 bg-white border border-gray-200 flex flex-col h-[680px]">
      <div className="overflow-auto flex-1">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b sticky top-0">
            <tr className="text-gray-600">
              {VISIBLE_HEADERS.map((header) => (
                <th
                  key={header.key}
                  className={`px-4 py-3 whitespace-nowrap text-xs font-semibold uppercase tracking-wide ${
                    CENTERED_KEYS.has(header.key) ? "text-center" : "text-left"
                  }`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>

      {showPagination && drivers.length > 0 && (
        <ReusablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          className={paginationClassName}
        />
      )}
    </div>
  );
};