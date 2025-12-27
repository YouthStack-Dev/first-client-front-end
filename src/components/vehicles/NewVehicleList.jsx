import { Eye, Edit } from "lucide-react";
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
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "—";

  return (
    <div className="rounded-lg border bg-white shadow-sm mt-4 flex flex-col">
      
      {/* 🔹 TABLE SCROLL AREA (FIXED HEIGHT LIKE DRIVER PAGE) */}
      <div className="overflow-auto h-[500px]">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="text-left text-gray-700">
              <th className="px-4 py-2">S. No.</th>
              <th className="px-4 py-2">Vehicle Type ID</th>
              <th className="px-4 py-2">RC Number</th>
              <th className="px-4 py-2">Driver</th>
              <th className="px-4 py-2">RC Expiry</th>
              <th className="px-4 py-2">Insurance Expiry</th>
              <th className="px-4 py-2">Permit Expiry</th>
              <th className="px-4 py-2">PUC Expiry</th>
              <th className="px-4 py-2">Fitness Expiry</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center p-4 text-gray-500">
                  No vehicles found
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle, index) => (
                <tr
                  key={vehicle.vehicle_id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">
                    {startIndex + index + 1}
                  </td>

                  <td className="px-4 py-2">
                    {vehicle.vehicle_type_id || "—"}
                  </td>

                  <td className="px-4 py-2">
                    {vehicle.rc_number || "—"}
                  </td>

                  <td className="px-4 py-2">
                    {vehicle.driver_id || "Unassigned"}
                  </td>

                  <td className="px-4 py-2">
                    {formatDate(vehicle.rc_expiry_date)}
                  </td>

                  <td className="px-4 py-2">
                    {formatDate(vehicle.insurance_expiry_date)}
                  </td>

                  <td className="px-4 py-2">
                    {formatDate(vehicle.permit_expiry_date)}
                  </td>

                  <td className="px-4 py-2">
                    {formatDate(vehicle.puc_expiry_date)}
                  </td>

                  <td className="px-4 py-2">
                    {formatDate(vehicle.fitness_expiry_date)}
                  </td>

                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <ReusableButton
                        module="vehicle"
                        action="read"
                        icon={Eye}
                        title="View Vehicle"
                        onClick={() => onView(vehicle)}
                        className="p-1"
                      />
                      <ReusableButton
                        module="vehicle"
                        action="update"
                        icon={Edit}
                        title="Edit Vehicle"
                        onClick={() => onEdit(vehicle)}
                        className="p-1"
                      />
                      <ReusableToggleButton
                        module="vehicle"
                        action="update"
                        isChecked={vehicle.is_active ?? true}
                        onToggle={() => onStatusToggle(vehicle)}
                        labels={{ on: "ACTIVE", off: "INACTIVE" }}
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

      {/* 🔹 PAGINATION (ALWAYS FIXED AT BOTTOM) */}
      {showPagination && vehicles.length > 0 && (
        <div className="border-t bg-white">
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
