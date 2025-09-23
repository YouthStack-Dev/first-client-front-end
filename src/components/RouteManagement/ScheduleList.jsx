import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
const ScheduleList = ({
  shiftBookings,
  totalLogin,
  totalLogout,
  selectedOption,
  setSelectedOption,
  shiftOptions,
  handleShiftOption,
  handleButtonClick,
  handleRoutingView,
  getVendorCount,
  getVehicleCount,
  selectedShift
}) => {


  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Actions toolbar */}
      <div className="flex justify-between items-center p-3 border-b">
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="text-sm border rounded px-2 py-1 w-40"
        >
          {shiftOptions.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
          onClick={() => handleShiftOption(selectedOption, selectedShift)}
        >
          GO
        </button>
      </div>

      {/* Shifts Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 text-[13px] text-black">
            <tr>
              {[
                "Shift Time (Type)",
                "Employees (Routes)",
                "Manage Routes",
                "Fleet Mix (Vehicle Occupancy)",
                "Vehicles/Vendors/Routes",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left font-medium uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-3">
                Total - Login: {totalLogin}, Logout: {totalLogout}
              </td>
              <td className="px-4 py-3">
                {shiftBookings.reduce(
                  (sum, s) => sum + (s.bookings?.length || 0),
                  0
                )}  
              </td>
              <td className="px-4 py-3"></td>
              <td className="px-4 py-3">Generated</td>
              <td className="px-4 py-3">
                {`${shiftBookings.reduce(
                  (sum, s) => sum + getVendorCount(s.routes),
                  0
                )}/${shiftBookings.reduce(
                  (sum, s) => sum + getVehicleCount(s.routes),
                  0
                )}/${shiftBookings.reduce(
                  (sum, s) => sum + (s.routes?.length || 0),
                  0
                )}`}
              </td>
            </tr>

            {shiftBookings.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-4 text-gray-500"
                >
                  No shifts available
                </td>
              </tr>
            ) : (
              shiftBookings.map((shift, idx) => (
                <tr
                  key={idx}
                  className={
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }
                >
                  <td className="px-4 py-3 flex items-center">
                    {shift.log_type === "in" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600 mr-2" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600 mr-2" />
                    )}
                    {shift.shift_time} ({shift.log_type})
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleButtonClick(shift)}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                    >
                      {shift.routes?.length === 0
                        ? "Schedule"
                        : "Routed"}{" "}
                      {shift.bookings?.length || 0}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <input type="checkbox" className="h-4 w-4" />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {shift.routes
                      ?.map(
                        (r) =>
                          `${r.vehicleType || "SEDAN"}:${
                            r.vehicleCount || 0
                          } (${r.occupancy || 0}%)`
                      )
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <button
                      onClick={() => handleRoutingView(shift)}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                    >
                      {`${getVendorCount(shift.routes)}/${getVehicleCount(
                        shift.routes
                      )}/${shift.routes?.length || 0}`}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleList;