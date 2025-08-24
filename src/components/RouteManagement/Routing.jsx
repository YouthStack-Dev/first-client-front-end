import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Route as RouteIcon,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Users,
  ArrowLeftRight,
  Heart,
} from "lucide-react";
import AssignRouteModal from "./AssignRouteModal";

/** Utility: Generate dummy routes */
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

/** Vendors list outside component */
const vendorsList = [
  { id: 1, name: "Vendor A" },
  { id: 2, name: "Vendor B" },
];

/** Indicators as functions */
const indicatorsList = [
  { icon: () => <Users size={14} className="text-pink-500" />, label: "Women in route" },
  { icon: () => <AlertTriangle size={14} className="text-yellow-500" />, label: "Over Capacity" },
  { icon: () => <AlertCircle size={14} className="text-blue-500" />, label: "Marshal Required" },
  { icon: () => <ArrowLeftRight size={14} className="text-green-500" />, label: "Back to Back trips" },
  { icon: () => <Heart size={14} className="text-red-500" />, label: "Special need employees" },
];

/** Table Row Component */
const RouteRow = React.memo(({ route, selectedRoutes, setSelectedRoutes, highlightFemales, openModal }) => {
  const hasFemale = route.bookings?.some((e) => e.gender?.toLowerCase() === "female");
  const highlightClass = highlightFemales && hasFemale ? "bg-pink-50" : "";

  const toggleRouteSelection = useCallback(() => {
    setSelectedRoutes((prev) =>
      prev.includes(route.routeId)
        ? prev.filter((r) => r !== route.routeId)
        : [...prev, route.routeId]
    );
  }, [route.routeId, setSelectedRoutes]);

  const handleOpenModal = useCallback(
    (mode) => openModal(route, mode),
    [openModal, route]
  );

  return (
    <tr className={`cursor-pointer ${highlightClass}`}>
      <td className="px-6 py-3 flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedRoutes.includes(route.routeId)}
          onChange={toggleRouteSelection}
          className="h-4 w-4 text-blue-600 rounded"
        />
        {hasFemale && <AlertCircle size={14} className="text-blue-500" />}
      </td>
      <td className="px-6 py-3">
        <button onClick={() => handleOpenModal("details")} className="text-blue-600 underline">
          ({route.routeBookings?.length || 0}) {route.distance ?? 0} km
        </button>
      </td>
      <td className="px-6 py-3 text-gray-600">{route.landmark}</td>
      <td className="px-6 py-3 text-gray-600 max-w-xs truncate">{route.nodalPoint || "N/A"}</td>
      <td className="px-6 py-3 max-w-xs truncate">
        <button
          onClick={() => handleOpenModal("assign")}
          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
        >
          Assign
        </button>
      </td>
    </tr>
  );
});

const Routing = ({ toggleRouting, routingData }) => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [highlightFemales, setHighlightFemales] = useState(false);
  const [modalMode, setModalMode] = useState("assign");
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const vendors = useMemo(() => vendorsList, []);

  useEffect(() => {
    setRoutes(routingData?.length ? routingData : generateDummyRoutes());
  }, [routingData]);

  const openModal = useCallback((route, mode) => {
    setSelectedRoute(route);
    setModalMode(mode);
    setAssignModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setAssignModalOpen(false), []);

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
            onClick={() => toggleRouting("booking")}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {/* Layout */}
        <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
          {/* Map Section */}
          <div className="w-1/2 p-4 bg-gray-50 flex items-center justify-center">Map Placeholder</div>

          {/* Controls + Table */}
          <div className="w-1/2 p-6 flex flex-col space-y-5 overflow-y-auto">
            {/* Filters + Actions */}
            <div className="flex flex-col bg-gray-50 p-4 rounded-lg space-y-3">
              {/* Top Row: Filter, Fleet, Female Constraint */}
              <div className="flex items-center gap-6 justify-between text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <label htmlFor="routeFilter" className="font-medium text-gray-700">Filter Routes:</label>
                  <select id="routeFilter" className="border rounded px-2 py-1 text-sm">
                    <option>All Routes</option>
                  </select>
                </div>
                <span>Fleet-mix - seaters: <span className="font-semibold">N/A</span></span>
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

              {/* Search */}
              <div className="flex items-center gap-2">
                <label htmlFor="searchInput" className="text-sm font-medium text-gray-700">Search:</label>
                <input
                  id="searchInput"
                  type="text"
                  placeholder="Search Employees, Vehicles, Routes & Landmarks"
                  className="border rounded px-3 py-1.5 text-sm w-full"
                />
              </div>

              {/* Vendor Select + Actions */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="vendorSelect" className="text-sm font-medium text-gray-700">Vendor:</label>
                  <select id="vendorSelect" className="border rounded px-2 py-1.5 text-sm">
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
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
                    {routes.map((route) => (
                      <RouteRow
                        key={route.routeId}
                        route={route}
                        selectedRoutes={selectedRoutes}
                        setSelectedRoutes={setSelectedRoutes}
                        highlightFemales={highlightFemales}
                        openModal={openModal}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Indicators */}
            <div className="bg-white rounded-lg shadow-sm p-3 border-l border-red-900">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Route Indicators</h3>
              <div className="space-y-2 text-[11px]">
                {indicatorsList.map((ind) => (
                  <div key={ind.label} className="flex items-center space-x-2">
                    {ind.icon()}
                    <span className="font-medium text-gray-700">{ind.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
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
