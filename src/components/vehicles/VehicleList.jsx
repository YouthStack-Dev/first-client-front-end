import { Edit, Eye } from "lucide-react";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggleButton from "../ui/ReusableToggleButton";

const VehicleList = ({
  vehicles,
  onNext,
  onPrev,
  currentPage,
  totalPages,
  isLoading,
  handleEdit,
  handleView,

  handleToggle,
}) => (
  <div className="rounded-lg border bg-white shadow-sm mt-4">
    <div className="overflow-auto max-h-[500px]">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-100 sticky top-0 z-1">
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
          {isLoading ? (
            <tr>
              <td colSpan="10" className="text-center p-4 text-gray-500">
                Loading...
              </td>
            </tr>
          ) : vehicles.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center p-4 text-gray-500">
                No vehicles found
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle, index) => (
              <tr
                key={vehicle.vehicle_id}
                className="border-t hover:bg-gray-50 transition-all"
              >
                <td className="px-4 py-2">
                  {index + 1 + (currentPage - 1) * 10}
                </td>
                <td className="px-4 py-2">{vehicle.vehicle_type_id || "-"}</td>
                <td className="px-4 py-2">{vehicle.rc_number || "-"}</td>
                <td className="px-4 py-2">
                  {vehicle.driver_id ? vehicle.driver_id : "Unassigned"}
                </td>
                <td className="px-4 py-2">
                  {vehicle.rc_expiry_date?.split("T")[0] || "-"}
                </td>
                <td className="px-4 py-2">
                  {vehicle.insurance_expiry_date?.split("T")[0] || "-"}
                </td>
                <td className="px-4 py-2">
                  {vehicle.permit_expiry_date?.split("T")[0] || "-"}
                </td>
                <td className="px-4 py-2">
                  {vehicle.puc_expiry_date?.split("T")[0] || "-"}
                </td>
                <td className="px-4 py-2">
                  {vehicle.fitness_expiry_date?.split("T")[0] || "-"}
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex justify-center items-center gap-4">
                    <div className="flex gap-2">
                      <ReusableButton
                        module="vehicle"
                        action="read"
                        icon={Eye}
                        title="View Vehicle"
                        onClick={() => handleView(vehicle)}
                        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                      />
                      <ReusableButton
                        module="vehicle"
                        action="update"
                        icon={Edit}
                        title="Edit Vehicle"
                        onClick={() => handleEdit(vehicle)}
                        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                      />
                    </div>

                    <ReusableToggleButton
                      module="vehicle"
                      action="update"
                      isChecked={vehicle.is_active ?? true}
                      onToggle={() => handleToggle(vehicle.vehicle_id)}
                      labels={{ on: "Active", off: "Inactive" }}
                      size="small"
                      className="scale-90"
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div className="flex justify-center items-center gap-4 py-4">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className={`flex items-center gap-2 px-4 py-2 rounded ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
      >
        Prev
      </button>
      <span className="text-sm text-gray-700 font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-2 px-4 py-2 rounded ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        Next
      </button>
    </div>
  </div>
);

export default VehicleList;
