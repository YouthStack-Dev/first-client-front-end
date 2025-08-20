import { useEffect, useState } from "react";
import {
  Route as RouteIcon,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Users,
  ArrowLeftRight,
  Heart,
} from "lucide-react";
import AssignRouteModal from "../components/modals/AssignRouteModal";

// ---------------- Dummy Data ----------------
const generateDummyRoutes = () =>
  Array.from({ length: 10 }, (_, i) => ({
    routeId: i + 1,
    office: i % 2 === 0 ? "Main Campus" : "Tech Park",
    shift: { date: "20 Aug", time: `${8 + (i % 5)}:30` },
    bookingType: i % 2 === 0 ? "Morning" : "Evening",
    landmark: i % 2 === 0 ? "Whitefield" : "Koramangala",
    routeBookings: [{ vehicleId: i + 1, vendorId: 100 + i }],
    bookings: [
      {
        id: `E${i}01`,
        name: `Emp${i}A`,
        gender: i % 3 === 0 ? "Female" : "Male",
        pickupDropPoint: "123 Main Street, City",
        landmark: "Near Park",
        office: "STONEX",
        km: Math.floor(Math.random() * 20) + 1,
      },
      {
        id: `E${i}02`,
        name: `Emp${i}B`,
        gender: i % 4 === 0 ? "Female" : "Male",
        pickupDropPoint: "456 Second Ave, City",
        landmark: "Near Mall",
        office: "STONEX",
        km: Math.floor(Math.random() * 20) + 1,
      },
    ],
    tripWarning: i % 2 === 0 ? "This trip requires marshall" : "",
    distance: Math.floor(Math.random() * 20) + 1,
  }));

const Routing = ({ toogleRouting }) => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [highlightFemales, setHighlightFemales] = useState(false);
  const [modalMode, setModalMode] = useState("assign");
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const vendors = [
    { id: 1, name: "Vendor A" },
    { id: 2, name: "Vendor B" },
  ];

  useEffect(() => setRoutes(generateDummyRoutes()), []);

  const openModal = (route, mode) => {
    setSelectedRoute(route);
    setModalMode(mode);
    setAssignModalOpen(true);
  };

  const closeModal = () => setAssignModalOpen(false);

  const indicators = [
    { icon: <Users size={14} className="text-pink-500" />, label: "Women in route" },
    { icon: <AlertTriangle size={14} className="text-yellow-500" />, label: "Over Capacity" },
    { icon: <AlertCircle size={14} className="text-blue-500" />, label: "Marshal Required" },
    { icon: <ArrowLeftRight size={14} className="text-green-500" />, label: "Back to Back trips" },
    { icon: <Heart size={14} className="text-red-500" />, label: "Special need employees" },
  ];

  return (
    <div className="bg-gray-100 p-4">
      <div className="max-w-[1800px] mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <RouteIcon className="w-6 h-6" />
            <h1 className="text-lg font-semibold">Route Planning Dashboard</h1>
          </div>
          <button
            onClick={() => toogleRouting("booking")}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
          {/* Map Panel */}
          <div className="w-1/2 p-4 bg-gray-50 flex items-center justify-center">Map Placeholder</div>

          {/* Right Panel */}
          <div className="w-1/2 p-6 flex flex-col space-y-5 overflow-y-auto">
            {/* Filters */}
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <select className="border rounded px-2 py-1 text-sm">
                  <option>All Routes</option>
                </select>
                <div className="text-sm text-gray-200">
                  {selectedRoute ? (
                    <>
                      {selectedRoute.shift?.date} {selectedRoute.shift?.time}{" "}
                      <span className="text-blue-300 cursor-pointer">{selectedRoute.bookingType}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">No shift selected</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-700">
                <span>Fleet-mix - seaters: <span className="font-semibold"></span></span>
                <span
                  className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded transition ${
                    highlightFemales ? "bg-pink-100 text-pink-600 font-semibold" : "text-blue-600 hover:text-blue-800"
                  }`}
                  onClick={() => setHighlightFemales(!highlightFemales)}
                >
                  Routes with female constraint
                  <AlertTriangle size={14} className="text-yellow-500" />
                </span>
              </div>

              <input
                type="text"
                placeholder="Search Employees, Vehicles, Routes & Landmarks"
                className="border rounded px-3 py-1.5 text-sm w-full"
              />

              <div className="flex items-center gap-4">
                <select className="border rounded px-2 py-1.5 text-sm">
                  <option value="">Select Vendor</option>
                </select>
                <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm">Assign Vendor</button>
                <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm">Merge Routes</button>
              </div>
            </div>

            {/* Routes Table */}
            <div className="rounded-lg shadow overflow-hidden">
              <div className="h-[400px] overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Select</th>
                      <th className="px-6 py-3 text-left font-medium">EMP Distance(Km)</th>
                      <th className="px-6 py-3 text-left font-medium">Landmark</th>
                      <th className="px-6 py-3 text-left font-medium">Nodal Point</th>
                      <th className="px-6 py-3 text-left font-medium">Vendor/Vehicle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {routes.map((route) => {
                      const hasFemale = route.bookings?.some((e) => e.gender.toLowerCase() === "female");
                      const highlightClass = highlightFemales && hasFemale ? "bg-pink-50" : "";

                      return (
                        <tr key={route.routeId} className={`cursor-pointer ${highlightClass}`}>
                          <td className="px-6 py-3 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedRoutes.includes(route.routeId)}
                              onChange={() =>
                                setSelectedRoutes((prev) =>
                                  prev.includes(route.routeId)
                                    ? prev.filter((r) => r !== route.routeId)
                                    : [...prev, route.routeId]
                                )
                              }
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            {hasFemale && <AlertCircle size={14} className="text-blue-500" />}
                          </td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => openModal(route, "details")}
                              className="text-blue-600 underline"
                            >
                              ({route.routeBookings.length}) {route.distance} km
                            </button>
                          </td>
                          <td className="px-6 py-3 text-gray-600">{route.landmark}</td>
                          <td className="px-6 py-3 text-gray-600 max-w-xs truncate">Nodals</td>
                          <td className="px-6 py-3 max-w-xs truncate">
                            <button
                              onClick={() => openModal(route, "assign")}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                            >
                              Assign
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Indicators */}
            <div className="bg-white rounded-lg shadow-sm p-3 border-l border-red-900">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Route Indicators</h3>
              <div className="space-y-2 text-[11px]">
                {indicators.map((ind, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    {ind.icon}
                    <span className="font-medium text-gray-700">{ind.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign / Details Modal */}
      {assignModalOpen && selectedRoute && (
        <AssignRouteModal
          show={assignModalOpen}
          route={selectedRoute}
          onClose={closeModal}
          vendors={vendors}
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default Routing;
