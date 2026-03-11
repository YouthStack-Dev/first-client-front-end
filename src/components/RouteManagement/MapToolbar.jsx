import React, { useState, useEffect, useMemo } from "react";
import { Car, RefreshCcw, Search, X, GitMerge, Building2, Shield, Send } from "lucide-react"; // ✅ added Send
import ReusableButton from "@ui/ReusableButton";

// ✅ Custom Tooltip Component
const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && text && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[9999]
          bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5
          whitespace-nowrap shadow-lg pointer-events-none">
          {text}
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
  onAssignEscort,
  onAssignVendor,
  onAssignVehicle,
  onDispatch,        // ✅ NEW
  onSync,
  onSearch,
  panelType = "company",
  isMerging = false,
  routes = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const selectedRoutesHaveVendors = useMemo(() => {
    if (selectedRoutes.size === 0) return false;
    return Array.from(selectedRoutes).every(routeId => {
      const route = routes.find(r => r.route_id === routeId);
      return route && route.vendor && Object.keys(route.vendor).length > 0;
    });
  }, [selectedRoutes, routes]);

  // ✅ NEW — check if any selected route has a driver (dispatchable)
  const dispatchableCount = useMemo(() => {
    if (selectedRoutes.size === 0) return 0;
    return Array.from(selectedRoutes).filter(routeId => {
      const route = routes.find(r => r.route_id === routeId);
      return route?.driver?.name && route.driver.name !== "Not assigned";
    }).length;
  }, [selectedRoutes, routes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) onSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const clearSearch = () => { setSearchQuery(""); if (onSearch) onSearch(""); };

  const hasSelection      = selectedRoutes.size > 0;
  const canMerge          = selectedRoutes.size >= 2 && !isMerging;
  const canAssignVehicle  = hasSelection && selectedRoutesHaveVendors;
  const canDispatch       = dispatchableCount > 0; // ✅ NEW
  const selectedCount     = selectedRoutes.size;

  // ✅ NEW — shared Dispatch button used in both company + vendor panels
  const DispatchButton = () => (
    <Tooltip
      text={
        !hasSelection
          ? "Select at least 1 route to dispatch"
          : dispatchableCount === 0
            ? "Selected routes have no driver assigned"
            : `Dispatch ${dispatchableCount} route${dispatchableCount !== 1 ? "s" : ""}`
      }
    >
      <ReusableButton
        module="route"
        action="update"
        icon={Send}
        buttonName={
          hasSelection && dispatchableCount > 0
            ? `Dispatch (${dispatchableCount})`
            : "Dispatch"
        }
        onClick={onDispatch}
        disabled={!canDispatch}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          canDispatch
            ? "bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-100 hover:bg-indigo-600"
            : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
        }`}
      />
    </Tooltip>
  );

  const renderCompanyButtons = () => (
    <>
      <span className={`text-xs px-2 py-1 rounded-md font-semibold border whitespace-nowrap ${
        hasSelection ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-gray-50 text-gray-500 border-gray-200"
      }`}>
        {selectedCount} selected
      </span>

      {/* Merge */}
      <Tooltip text={selectedRoutes.size < 2 ? "Select at least 2 routes to merge" : "Merge selected routes"}>
        <ReusableButton
          module="route" action="update" icon={GitMerge}
          buttonName={isMerging ? "Merging..." : "Merge"}
          onClick={onMerge} disabled={!canMerge}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            canMerge
              ? "bg-white text-violet-700 border-violet-300 hover:bg-violet-50"
              : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
        />
      </Tooltip>

      <div className="h-6 w-px bg-gray-200 mx-0.5" />

      {/* Assign Vendor */}
      <Tooltip text={
        !hasSelection ? "Select at least 1 route to assign vendor"
          : selectedRoutesHaveVendors ? "Reassign vendor to selected routes"
          : "Assign vendor to selected routes"
      }>
        <ReusableButton
          module="route" action="update" icon={Building2}
          buttonName="Assign Vendor" onClick={onAssignVendor} disabled={!hasSelection}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            hasSelection
              ? "bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
              : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
        />
      </Tooltip>

      {/* Assign Escort */}
      <Tooltip text={!hasSelection ? "Select at least 1 route to assign escort" : "Assign escort to selected route"}>
        <ReusableButton
          module="route" action="update" icon={Shield}
          buttonName="Assign Escort" onClick={onAssignEscort} disabled={!hasSelection}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            hasSelection
              ? "bg-white text-fuchsia-700 border-fuchsia-300 hover:bg-fuchsia-50"
              : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
        />
      </Tooltip>

      <div className="h-6 w-px bg-gray-200 mx-0.5" />

      {/* Assign Vehicle */}
      <Tooltip text={
        !hasSelection ? "Select at least 1 route to assign vehicle"
          : !selectedRoutesHaveVendors ? "Selected routes must have a vendor assigned first"
          : "Assign vehicle to selected routes"
      }>
        <ReusableButton
          module="route" action="update" icon={Car}
          buttonName="Assign Vehicle" onClick={onAssignVehicle} disabled={!canAssignVehicle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            canAssignVehicle
              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-100 hover:bg-emerald-600"
              : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
        />
      </Tooltip>

      <div className="h-6 w-px bg-gray-200 mx-0.5" />

      {/* ✅ NEW — Dispatch */}
      <DispatchButton />

      <div className="h-6 w-px bg-gray-200 mx-0.5" />

      {/* Sync */}
      <Tooltip text="Refresh and sync all routes">
        <ReusableButton
          module="route" action="read" icon={RefreshCcw} buttonName="Sync" onClick={onSync}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        />
      </Tooltip>
    </>
  );

  const renderVendorButtons = () => (
    <>
      <span className={`text-xs px-2 py-1 rounded-md font-semibold border whitespace-nowrap ${
        hasSelection ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-gray-50 text-gray-500 border-gray-200"
      }`}>
        {selectedCount} selected
      </span>

      {/* Assign Vehicle */}
      <Tooltip text={!hasSelection ? "Select at least 1 route to assign vehicle" : "Assign vehicle to selected routes"}>
        <ReusableButton
          module="route" action="update" icon={Car}
          buttonName="Assign Vehicle" onClick={onAssignVehicle} disabled={!hasSelection}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            hasSelection
              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-100 hover:bg-emerald-600"
              : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
        />
      </Tooltip>

      {/* Assign Escort */}
      <Tooltip text={!hasSelection ? "Select at least 1 route to assign escort" : "Assign escort to selected route"}>
        <ReusableButton
          module="route" action="update" icon={Shield}
          buttonName="Assign Escort" onClick={onAssignEscort} disabled={!hasSelection}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            hasSelection
              ? "bg-white text-fuchsia-700 border-fuchsia-300 hover:bg-fuchsia-50"
              : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
          }`}
        />
      </Tooltip>

      <div className="h-6 w-px bg-gray-200 mx-0.5" />

      {/* ✅ NEW — Dispatch */}
      <DispatchButton />

      <div className="h-6 w-px bg-gray-200 mx-0.5" />

      {/* Sync */}
      <Tooltip text="Refresh and sync all routes">
        <ReusableButton
          module="route" action="read" icon={RefreshCcw} buttonName="Sync" onClick={onSync}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        />
      </Tooltip>
    </>
  );

  return (
    <div className="bg-white border-b border-gray-100 overflow-visible">
      <div className="px-3 pt-2.5 pb-2 flex items-center gap-2 flex-wrap overflow-visible">
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
              <button onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" title="Clear search">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-500 font-medium whitespace-nowrap">
            {routes.length} routes
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapToolbar;