import React, { useState, useEffect, useMemo } from "react";
import { Car, RefreshCcw, Search, X, GitMerge, Building2 } from "lucide-react";
import ReusableButton from "@ui/ReusableButton";

// ✅ Custom Tooltip Component
const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[9999]
          bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5
          whitespace-nowrap shadow-lg pointer-events-none">
          {text}
          {/* Arrow pointing up */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
        </div>
      )}
    </div>
  );
};

const MapToolbar = ({
  selectedRoutes,
  selectedBookings,
  onMerge,
  onAssignVendor,
  onAssignVehicle,
  onSync,
  onSearch,
  panelType = "company",
  isMerging = false,
  routes = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const selectedRoutesHaveVendors = useMemo(() => {
    if (selectedRoutes.size === 0) return false;
    const selectedRouteIds = Array.from(selectedRoutes);
    return selectedRouteIds.every(routeId => {
      const route = routes.find(r => r.route_id === routeId);
      return route && route.vendor && Object.keys(route.vendor).length > 0;
    });
  }, [selectedRoutes, routes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) onSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const clearSearch = () => {
    setSearchQuery("");
    if (onSearch) onSearch("");
  };

  const hasSelection = selectedRoutes.size > 0;
  const canMerge = selectedRoutes.size >= 2 && !isMerging;
  const canAssignVehicle = hasSelection && selectedRoutesHaveVendors;

  const renderCompanyButtons = () => (
    <>
      {/* Merge */}
      <Tooltip
        text={selectedRoutes.size < 2 ? "Select at least 2 routes to merge" : "Merge selected routes"}
      >
        <ReusableButton
          module="route"
          action="update"
          icon={GitMerge}
          buttonName={
            <span className="flex items-center gap-1.5">
              {isMerging ? "Merging..." : "Merge"}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold leading-none ${
                canMerge ? "bg-white/25 text-white" : "bg-gray-200 text-gray-400"
              }`}>
                {selectedRoutes.size}
              </span>
            </span>
          }
          onClick={onMerge}
          disabled={!canMerge}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            canMerge
              ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-100 hover:bg-violet-700"
              : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
        />
      </Tooltip>

      {/* Assign Vendor */}
      <Tooltip
        text={
          !hasSelection
            ? "Select at least 1 route to assign vendor"
            : selectedRoutesHaveVendors
              ? "Reassign vendor to selected routes"
              : "Assign vendor to selected routes"
        }
      >
        <ReusableButton
          module="route"
          action="update"
          icon={Building2}
          buttonName={
            <span className="flex items-center gap-1.5">
              Assign Vendor
              {hasSelection && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold leading-none bg-white/25 text-white">
                  {selectedRoutes.size}
                </span>
              )}
            </span>
          }
          onClick={onAssignVendor}
          disabled={!hasSelection}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            hasSelection
              ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-100 hover:bg-amber-600"
              : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
        />
      </Tooltip>

      {/* Assign Vehicle */}
      <Tooltip
        text={
          !hasSelection
            ? "Select at least 1 route to assign vehicle"
            : !selectedRoutesHaveVendors
              ? "Selected routes must have a vendor assigned first"
              : "Assign vehicle to selected routes"
        }
      >
        <ReusableButton
          module="route"
          action="update"
          icon={Car}
          buttonName="Assign Vehicle"
          onClick={onAssignVehicle}
          disabled={!canAssignVehicle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            canAssignVehicle
              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-100 hover:bg-emerald-600"
              : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
        />
      </Tooltip>

      {/* Sync */}
      <Tooltip text="Refresh and sync all routes">
        <ReusableButton
          module="route"
          action="read"
          icon={RefreshCcw}
          buttonName="Sync"
          onClick={onSync}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        />
      </Tooltip>
    </>
  );

  const renderVendorButtons = () => (
    <>
      {/* Assign Vehicle */}
      <Tooltip
        text={!hasSelection ? "Select at least 1 route to assign vehicle" : "Assign vehicle to selected routes"}
      >
        <ReusableButton
          module="route"
          action="update"
          icon={Car}
          buttonName={
            <span className="flex items-center gap-1.5">
              Assign Vehicle
              {hasSelection && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold leading-none bg-white/25 text-white">
                  {selectedRoutes.size}
                </span>
              )}
            </span>
          }
          onClick={onAssignVehicle}
          disabled={!hasSelection}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            hasSelection
              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-100 hover:bg-emerald-600"
              : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
        />
      </Tooltip>

      {/* Sync */}
      <Tooltip text="Refresh and sync all routes">
        <ReusableButton
          module="route"
          action="read"
          icon={RefreshCcw}
          buttonName="Sync"
          onClick={onSync}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        />
      </Tooltip>
    </>
  );

  return (
    <div className="bg-white border-b border-gray-100 overflow-visible">

      {/* Main toolbar row */}
      <div className="px-3 pt-2.5 pb-2 flex items-center gap-2 flex-wrap overflow-visible">

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-visible">
          {panelType === "company" ? renderCompanyButtons() : renderVendorButtons()}
        </div>

        <div className="flex-1" />

        {/* Search + count */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search routes, employees..."
              className="pl-8 pr-8 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 focus:bg-white w-52 transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Route count pill */}
          <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-500 font-medium whitespace-nowrap">
            {routes.length} routes
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapToolbar;