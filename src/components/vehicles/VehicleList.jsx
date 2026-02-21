import { Edit, Eye } from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggleButton from "../ui/ReusableToggleButton";
import { ReusablePagination } from "../ui/ReusablePagination";

export const NewVehicleList = ({
  vehicles,
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
  const VehicleTableHeaders = [
    { key: "s_no", label: "S No." },
    { key: "vehicle_type_id", label: "Vehicle Type ID" },
    { key: "rc_number", label: "RC Number" },
    { key: "driver_id", label: "Driver" },
    { key: "rc_expiry_date", label: "RC Expiry" },
    { key: "insurance_expiry_date", label: "Insurance Expiry" },
    { key: "permit_expiry_date", label: "Permit Expiry" },
    { key: "puc_expiry_date", label: "PUC Expiry" },
    { key: "fitness_expiry_date", label: "Fitness Expiry" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  const getVehicleStatus = (vehicle) => vehicle.is_active ?? false;

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

  const getValueByKeyPath = (obj, keyPath) => {
    if (keyPath === "driver_id") {
      return obj.driver_id ? obj.driver_id : "Unassigned";
    }
    return keyPath.split(".").reduce((acc, key) => acc?.[key], obj) ?? "—";
  };

  // Calculate starting index for serial numbers
  const startIndex =
    showPagination && currentPage
      ? (currentPage - 1) * (itemsPerPage || 10)
      : 0;

  return (
    <div className="rounded-lg overflow-hidden shadow-sm mt-2 bg-white">
      <div className="overflow-auto h-[620px]">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b sticky top-0">
            <tr className="text-gray-600">
              {VehicleTableHeaders.map((header) => (
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
          <tbody className="bg-blue-50">
            {vehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={VehicleTableHeaders.length}
                  className="p-4 text-center text-gray-500"
                >
                  No vehicles found
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle, index) => (
                <tr
                  key={vehicle.vehicle_id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  {VehicleTableHeaders.map((header) => (
                    <td
                      key={header.key}
                      className={`px-4 py-3 text-sm ${
                        header.key === "actions" || header.key === "status"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {header.key === "s_no" ? (
                        showPagination ? (
                          startIndex + index + 1
                        ) : (
                          index + 1
                        )
                      ) : header.key === "status" ? (
                        <ReusableToggleButton
                          module="vehicle"
                          action="update"
                          isChecked={getVehicleStatus(vehicle)}
                          onToggle={() => onStatusToggle(vehicle)}
                          labels={{ on: "ACTIVE", off: "INACTIVE" }}
                          size="small"
                        />
                      ) : header.key === "rc_expiry_date" ||
                        header.key === "insurance_expiry_date" ||
                        header.key === "permit_expiry_date" ||
                        header.key === "puc_expiry_date" ||
                        header.key === "fitness_expiry_date" ? (
                        formatDate(vehicle[header.key])
                      ) : header.key === "actions" ? (
                        <div className="flex justify-center items-center gap-2">
                          <ReusableButton
                            module="vehicle"
                            action="read"
                            icon={Eye}
                            title="View Vehicle Details"
                            onClick={() => onView(vehicle)}
                            className="p-1 flex-shrink-0"
                          />
                          <ReusableButton
                            module="vehicle"
                            action="update"
                            icon={Edit}
                            title="Edit Vehicle"
                            onClick={() => onEdit(vehicle)}
                            className="p-1 flex-shrink-0"
                          />
                        </div>
                      ) : (
                        getValueByKeyPath(vehicle, header.key)
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
      {showPagination && vehicles.length > 0 && (
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

export default NewVehicleList;
