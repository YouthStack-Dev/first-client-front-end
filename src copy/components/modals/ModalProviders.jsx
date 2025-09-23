import { X } from "lucide-react";
const RouteModal = ({ route, mode, onClose }) => {
  if (!route) return null;

  // Route info as key-value pairs
  const infoFields = [
    { label: "Office", value: route.office || "N/A" },
    { label: "Shift", value: `${route.shift?.date || "N/A"} ${route.shift?.time || ""}` },
    { label: "Booking Type", value: route.bookingType || "N/A" },
    { label: "Landmark", value: route.landmark || "N/A" },
    { label: "Distance", value: `${route.distance || "N/A"} km` },
    { label: "Employees", value: route.bookings?.length || 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50">
      <div className="bg-white w-[90%] h-[90%] rounded-lg overflow-hidden flex shadow-lg">
        {/* Left Panel: Route Info & Actions */}
        <div className="w-1/2 p-6 flex flex-col overflow-auto border-r">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {mode === "routing" ? "Assign Route" : "Route Details"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Route Info */}
          <div className="space-y-2 text-sm text-gray-700">
            {infoFields.map((field) => (
              <p key={field.label}>
                <strong>{field.label}:</strong> {field.value}
              </p>
            ))}

            {/* Employee List */}
            {route.bookings?.map((emp) => (
              <div key={emp.id} className="flex justify-between px-2 py-1 bg-gray-100 rounded">
                <span>{emp.name}</span>
                <span className="text-xs text-gray-500">{emp.gender}</span>
              </div>
            ))}

            {/* Actions */}
            {mode === "routing" && (
              <div className="mt-4 flex gap-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Assign Vendor
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Assign Vehicle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Map Placeholder */}
        <div className="w-1/2 bg-gray-200 flex items-center justify-center text-gray-500">
          Map Placeholder
        </div>
      </div>
    </div>
  );
};

export default RouteModal;

