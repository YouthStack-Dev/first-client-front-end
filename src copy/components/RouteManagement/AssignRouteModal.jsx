import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { X } from "lucide-react";
import ToolBar from "../ui/ToolBar";

// Utility for time state initialization
function getInitialTimeState(bookings = []) {
  const timeState = {};
  bookings.forEach((b) => {
    timeState[b.id] = { hour: 0, minute: 0 };
  });
  return timeState;
}

const AssignRouteModal = ({
  show,
  onClose,
  route,
  vendors,
  mode = "assign",
  onSave,
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [assignedVendor, setAssignedVendor] = useState("");
  const [rowTimes, setRowTimes] = useState({});
  const modalRef = useRef(null);

  // Focus trap
  useEffect(() => {
    if (!show) return;
    const focusableEls = modalRef.current?.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    focusableEls?.[0]?.focus();

    const handleTab = (e) => {
      if (!modalRef.current) return;
      const els = Array.from(
        modalRef.current.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        )
      ).filter((el) => !el.disabled);

      if (e.key === "Tab") {
        const i = els.indexOf(document.activeElement);
        if (e.shiftKey && i === 0) {
          e.preventDefault();
          els[els.length - 1]?.focus();
        } else if (!e.shiftKey && i === els.length - 1) {
          e.preventDefault();
          els[0]?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [show]);

  // Initialize rowTimes when bookings change
  useEffect(() => {
    if (route?.bookings) {
      setRowTimes(getInitialTimeState(route.bookings));
      setSelectedRows([]);
    }
  }, [route?.bookings]);

  if (!show || !route) return null;

  const handleTimeChange = useCallback((id, type, value) => {
    setRowTimes((prev) => ({
      ...prev,
      [id]: { ...prev[id], [type]: Number(value) },
    }));
  }, []);

  const toggleRow = useCallback((id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(
    (data) => {
      setSelectedRows(
        selectedRows.length === data.length ? [] : data.map((b) => b.id)
      );
    },
    [selectedRows.length]
  );

  const handleVendorChange = useCallback((e) => {
    setAssignedVendor(e.target.value);
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        selectedRows,
        assignedVendor,
        rowTimes,
      });
    }
  };

  const assignHeaders = useMemo(
    () => [
      { label: "", key: "checkbox" },
      { label: "Employees", key: "employees" },
      { label: "Gender", key: "gender" },
      { label: "Pickup/Drop Point", key: "pickup" },
      { label: "Landmark", key: "landmark" },
      { label: "Office", key: "office" },
      { label: "Time", key: "time" },
      { label: "KM", key: "km" },
    ],
    []
  );

  const detailsHeaders = useMemo(
    () => [
      { label: "S. No", key: "serial" },
      { label: "Id", key: "id" },
      { label: "Name", key: "name" },
      { label: "Gender", key: "gender" },
      { label: "Phone No.", key: "phone" },
      { label: "Drop Location", key: "drop" },
      { label: "Landmark", key: "landmark" },
      { label: "Shift Details", key: "shift" },
      { label: "Trip Direction", key: "direction" },
      { label: "Office", key: "office" },
      { label: "Start Time", key: "start" },
      { label: "Reach Time", key: "reach" },
      { label: "Distance", key: "distance" },
      { label: "Extra Distance", key: "extra" },
      { label: "Service Level", key: "service" },
    ],
    []
  );

  // Table Component
  const Table = ({ headers, data = [] }) => (
    <div className="p-4 max-h-[70vh] overflow-y-auto overflow-x-auto">
      <table className="w-auto min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) =>
              h.key === "checkbox" ? (
                <th key={h.key} className="px-2 py-2 text-left">
                  <input
                    type="checkbox"
                    disabled={data.length === 0}
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={() => handleSelectAll(data)}
                    aria-label="Select All"
                  />
                </th>
              ) : (
                <th
                  key={h.key}
                  className="px-4 py-2 text-left font-medium whitespace-nowrap"
                >
                  {h.label}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center py-4 text-gray-500">
                No records found
              </td>
            </tr>
          ) : (
            data.map((b, idx) => (
              <tr key={b.id || idx} className="hover:bg-gray-50">
                {mode === "assign" ? (
                  <>
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(b.id)}
                        onChange={() => toggleRow(b.id)}
                        aria-label={`Select row for ${b.name || ""}`}
                      />
                    </td>
                    <td className="px-4 py-2">{b.name}</td>
                    <td className="px-4 py-2">{b.gender}</td>
                    <td className="px-4 py-2">{b.pickupDropPoint}</td>
                    <td className="px-4 py-2">{b.landmark}</td>
                    <td className="px-4 py-2">{b.office}</td>
                    <td className="px-4 py-2 flex gap-1">
                      <select
                        className="border rounded px-1 py-0.5 text-sm"
                        value={rowTimes[b.id]?.hour ?? 0}
                        onChange={(e) => handleTimeChange(b.id, "hour", e.target.value)}
                        aria-label="Hour"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                      <span>:</span>
                      <select
                        className="border rounded px-1 py-0.5 text-sm"
                        value={rowTimes[b.id]?.minute ?? 0}
                        onChange={(e) => handleTimeChange(b.id, "minute", e.target.value)}
                        aria-label="Minute"
                      >
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
                    {Object.values(b).map((val, i) => (
                      <td key={i} className="px-2 py-2">{val}</td>
                    ))}
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4"
      aria-modal="true"
      role="dialog"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-auto min-w-[90%] overflow-visible flex flex-col"
        tabIndex={-1}
      >
        {/* Toolbar Header */}
        <ToolBar
          title={
            <div className="flex flex-wrap items-center justify-between w-full gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold">Route ID: {route.routeId}</span>
                {route.shift && <span>Shift: {route.shift}</span>}
                {route.bookingType && <span>Booking Type: {route.bookingType}</span>}
                {route.landmark && <span>Landmark: {route.landmark}</span>}
                {route.km && <span>Distance: {route.km} km</span>}
              </div>
              <div className="flex items-center gap-2">
                {mode === "assign" && (
                  <>
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      type="button"
                    >
                      Make New Route
                    </button>
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      type="button"
                    >
                      Refresh Vehicles
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-200"
                  aria-label="Close"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          }
          rightElements={
            mode === "assign" && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium" htmlFor="vendor">
                  Assigned Vendor:
                </label>
                <select
                  id="vendor"
                  value={assignedVendor}
                  onChange={handleVendorChange}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="">Select Vendor</option>
                  {vendors?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <button className="text-blue-600 underline" type="button">
                  History
                </button>
                <button className="text-blue-600 underline" type="button">
                  Show Trips
                </button>
              </div>
            )
          }
        />

        {/* Warning */}
        {route.tripWarning && (
          <p className="text-red-600 font-medium px-6 mt-2">{route.tripWarning}</p>
        )}

        {/* Table */}
        <div className="p-6">
          <Table
            headers={mode === "assign" ? assignHeaders : detailsHeaders}
            data={route.bookings || []}
          />
        </div>

        {/* Footer Actions */}
        {mode === "assign" && (
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              type="button"
              disabled={selectedRows.length === 0 || !assignedVendor}
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignRouteModal;
