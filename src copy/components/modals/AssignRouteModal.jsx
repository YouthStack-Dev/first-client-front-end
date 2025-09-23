import React, { useState } from "react";
import { X } from "lucide-react";

const AssignRouteModal = ({ show, onClose, route, vendors, mode = "assign" }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [assignedVendor, setAssignedVendor] = useState("");

  if (!show || !route) return null;

  const toggleRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const assignHeaders = [
    { label: "", key: "checkbox" },
    "Employees",
    "Gender",
    "Pickup/Drop Point",
    "Landmark",
    "Office",
    "Time",
    "KM",
  ];

  const detailsHeaders = [
    "S. No",
    "Id",
    "Name",
    "Gender",
    "Phone No.",
    "Drop Location",
    "Landmark",
    "Shift Details",
    "Trip Direction",
    "Office",
    "Start Time",
    "Reach Time",
    "Distance",
    "Extra Distance",
    "Service Level",
  ];

  const Table = ({ headers, data }) => (
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((h, idx) =>
            h.key === "checkbox" ? (
              <th key={idx} className="px-2 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length}
                  onChange={() =>
                    setSelectedRows(
                      selectedRows.length === data.length ? [] : data.map((b) => b.id)
                    )
                  }
                />
              </th>
            ) : (
              <th key={idx} className="px-4 py-2 text-left font-medium">
                {typeof h === "string" ? h : h.label}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((b, index) => (
          <tr key={b.id}>
            {mode === "assign" ? (
              <>
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(b.id)}
                    onChange={() => toggleRow(b.id)}
                  />
                </td>
                <td className="px-4 py-2">{b.name}</td>
                <td className="px-4 py-2">{b.gender}</td>
                <td className="px-4 py-2">{b.pickupDropPoint}</td>
                <td className="px-4 py-2">{b.landmark}</td>
                <td className="px-4 py-2">{b.office}</td>
                <td className="px-4 py-2 flex gap-1">
                  <select className="border rounded px-1 py-0.5 text-sm">
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <span>:</span>
                  <select className="border rounded px-1 py-0.5 text-sm">
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">{b.km}</td>
              </>
            ) : (
              <>
                <td className="px-2 py-2">{index + 1}</td>
                <td className="px-2 py-2">{b.id}</td>
                <td className="px-2 py-2">{b.name}</td>
                <td className="px-2 py-2">{b.gender}</td>
                <td className="px-2 py-2">{b.phone}</td>
                <td className="px-2 py-2">{b.pickupDropPoint}</td>
                <td className="px-2 py-2">{b.landmark}</td>
                <td className="px-2 py-2">{b.shiftDetails}</td>
                <td className="px-2 py-2">{b.tripDirection}</td>
                <td className="px-2 py-2">{b.office}</td>
                <td className="px-2 py-2">{b.startTime}</td>
                <td className="px-2 py-2">{b.reachTime}</td>
                <td className="px-2 py-2">{b.distance}</td>
                <td className="px-2 py-2">{b.extraDistance}</td>
                <td className="px-2 py-2">{b.serviceLevel}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-xl p-6 relative shadow-2xl" style={{ minWidth: "600px", maxWidth: "95vw", minHeight: "200px" }}>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-semibold">
              {mode === "assign" ? `Route ID: ${route.routeId}` : `Route Details: ${route.routeId}`}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {route.tripWarning && <p className="text-red-600 font-medium mb-4">{route.tripWarning}</p>}

          {mode === "assign" && (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4 flex-wrap">
              <div>
                <label className="text-sm font-medium">Assigned Vendor:</label>
                <select
                  value={assignedVendor}
                  onChange={(e) => setAssignedVendor(e.target.value)}
                  className="ml-2 border rounded px-2 py-1 text-sm"
                >
                  <option value="">Select Vendor</option>
                  {vendors?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ml-auto flex gap-4 text-sm">
                <button className="text-blue-600 underline">History</button>
                <button className="text-blue-600 underline">Show Trips</button>
              </div>
            </div>
          )}

          <Table headers={mode === "assign" ? assignHeaders : detailsHeaders} data={route.bookings} />

          {mode === "assign" && (
            <div className="mt-4 flex justify-end gap-3 flex-wrap">
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Make New Route</button>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Refresh Vehicles</button>
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AssignRouteModal;
