import { Eye, Edit } from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggleButton from "../ui/ReusableToggleButton";
import { ReusablePagination } from "../ui/ReusablePagination";

const MODULE = "vehicle-type";

const VehicleTypeList = ({
  vehicleTypes = [],
  onView,
  onEdit,
  onStatusToggle,

  // pagination props (same as driver)
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const startIndex =
    showPagination && currentPage
      ? (currentPage - 1) * itemsPerPage
      : 0;

  return (
    <div className="rounded-lg overflow-hidden shadow-sm mt-2 bg-blue-50">
      {/* TABLE */}
      <div className="overflow-auto h-[500px]">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b sticky top-0">
            <tr className="text-gray-600">
              <th className="px-4 py-3 text-left">S No.</th>
              <th className="px-4 py-3 text-left">Vehicle Type</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-center">Seats</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {vehicleTypes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No vehicle types found
                </td>
              </tr>
            ) : (
              vehicleTypes.map((vt, index) => (
                <tr
                  key={vt.vehicle_type_id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-sm">
                    {startIndex + index + 1}
                  </td>

                  <td className="px-4 py-3 text-sm font-medium">
                    {vt.name}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600">
                    {vt.description || "—"}
                  </td>

                  <td className="px-4 py-3 text-sm text-center">
                    {vt.seats ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <ReusableToggleButton
                      module={MODULE}
                      action="update"
                      isChecked={vt.is_active}
                      onToggle={() => onStatusToggle(vt)}
                      size="small"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <ReusableButton
                        module={MODULE}
                        action="read"
                        icon={Eye}
                        title="View"
                        onClick={() => onView(vt)}
                        className="p-1"
                      />
                      <ReusableButton
                        module={MODULE}
                        action="update"
                        icon={Edit}
                        title="Edit"
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

      {/* PAGINATION – SAME AS DRIVER */}
      {showPagination && vehicleTypes.length > 0 && (
        <ReusablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default VehicleTypeList;
