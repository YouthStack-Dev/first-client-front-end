import React from "react";
import { Eye, Edit } from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggleButton from "../ui/ReusableToggleButton";
import { ReusablePagination } from "../ui/ReusablePagination";

export const DriverList = ({
  drivers,
  onEdit,
  onView,
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
  const DriverTableHeaders = [
    { key: "s_no", label: "S No." },
    { key: "name", label: "Name" },
    { key: "license_number", label: "License No." },
    { key: "code", label: "Driver Code" },
    { key: "phone", label: "Driver Phone" },
    { key: "date_of_joining", label: "Date of Joining" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  // Read permissions from sessionStorage (keeps same logic as ReusableButton)
  const getPermissions = () => {
    const userPermissions = sessionStorage.getItem("userPermissions");
    if (userPermissions) {
      try {
        const { permissions } = JSON.parse(userPermissions) || [];
        return permissions || [];
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        return [];
      }
    }
    return [];
  };

  const permissions = getPermissions();

  const hasActionPermission = (module, action) => {
    const modulePermission = permissions.find((p) => p.module === module);
    return !!modulePermission && Array.isArray(modulePermission.action) && modulePermission.action.includes(action);
  };

  const canRead = hasActionPermission("driver", "read");
  const canUpdate = hasActionPermission("driver", "update");
  const showActions = canRead || canUpdate;

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

  const getValueByKeyPath = (obj, keyPath) =>
    keyPath.split(".").reduce((acc, key) => acc?.[key], obj) ?? "—";

  const visibleHeaders = DriverTableHeaders.filter(
    (h) => h.key !== "documentsUploaded" && (h.key !== "actions" || showActions)
  );

  // Calculate starting index for serial numbers when pagination is enabled
  const startIndex =
    showPagination && currentPage
      ? (currentPage - 1) * (itemsPerPage || 10)
      : 0;

  return (
    <div className="rounded-lg overflow-hidden shadow-sm mt-2 bg-blue-50">
      <div className="overflow-auto h-[620px]">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b sticky top-0">
            <tr className="text-gray-600">
              {visibleHeaders.map((header) => (
                <th
                  key={header.key}
                  className={`px-4 py-3 whitespace-nowrap ${
                    header.key === "actions" || header.key === "status"
                      ? "text-center"
                      : "text-left"
                  }`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleHeaders.length}
                  className="p-4 text-center text-gray-500"
                >
                  No drivers found
                </td>
              </tr>
            ) : (
              drivers.map((driver, index) => (
                <tr
                  key={driver.driver_id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  {visibleHeaders.map((header) => (
                    <td
                      key={header.key}
                      className={`px-4 py-3 text-sm ${
                        header.key === "actions" || header.key === "status"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {header.key === "s_no" ? (
                        // Calculate serial number based on current page if pagination is enabled
                        showPagination ? startIndex + index + 1 : index + 1
                      ) : header.key === "status" ? (
                        canUpdate ? (
                          <ReusableToggleButton
                            module="driver"
                            action="update"
                            isChecked={getDriverStatus(driver)}
                            onToggle={() => onStatusToggle && onStatusToggle(driver)}
                            labels={{ on: "ACTIVE", off: "INACTIVE" }}
                            size="small"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {driver.is_active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        )
                      ) : header.key === "date_of_joining" ? (
                        formatDate(driver.date_of_joining)
                      ) : header.key === "actions" ? (
                        <div className="flex justify-center items-center gap-2">
                          {canRead && (
                            <ReusableButton
                              module="driver"
                              action="read"
                              icon={Eye}
                              title="View Driver Details"
                              onClick={() => onView && onView(driver)}
                              className="p-1 flex-shrink-0"
                            />
                          )}
                          {canUpdate && (
                            <ReusableButton
                              module="driver"
                              action="update"
                              icon={Edit}
                              title="Edit Driver"
                              onClick={() => onEdit && onEdit(driver)}
                              className="p-1 flex-shrink-0"
                            />
                          )}
                        </div>
                      ) : (
                        getValueByKeyPath(driver, header.key)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

        {/* Reusable Pagination Component */}
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

export default DriverList;
