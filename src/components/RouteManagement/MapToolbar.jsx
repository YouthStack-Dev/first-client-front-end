import React from "react";
import { Merge, Truck, Car, RefreshCcw } from "lucide-react";
import ReusableButton from "@ui/ReusableButton";

const MapToolbar = ({
  selectedRoutes,
  onMerge,
  onAssignVendor,
  onAssignVehicle,
  onSync, // ✅ NEW PROP
  panelType = "company",
  isMerging = false,
}) => {
  const renderCommonButtons = () => (
    <>
      {/* Sync Button */}
      <ReusableButton
        module="route"
        action="read"
        icon={RefreshCcw}
        buttonName="Sync"
        title="Refresh and sync all routes"
        onClick={onSync}
        className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium 
                   bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
      />
    </>
  );

  const renderCompanyButtons = () => (
    <>
      {/* Merge Button */}
      <ReusableButton
        module="route"
        action="update"
        icon={Merge}
        buttonName={isMerging ? "Merging..." : `Merge (${selectedRoutes.size})`}
        title={
          selectedRoutes.size < 2
            ? "Select at least 2 routes to merge"
            : "Merge selected routes"
        }
        onClick={onMerge}
        disabled={selectedRoutes.size < 2 || isMerging}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
          selectedRoutes.size >= 2 && !isMerging
            ? "bg-purple-600 text-white hover:bg-purple-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      />

      {/* Assign Vendor */}
      <ReusableButton
        module="route"
        action="update"
        icon={Truck}
        buttonName={`Assign Vendor (${selectedRoutes.size})`}
        title={
          selectedRoutes.size === 0
            ? "Select at least 1 route to assign vendor"
            : "Assign vendor to selected routes"
        }
        onClick={onAssignVendor}
        disabled={selectedRoutes.size === 0}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
          selectedRoutes.size > 0
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      />

      {renderCommonButtons()}
    </>
  );

  const renderVendorButtons = () => (
    <>
      {/* Assign Vehicle */}
      <ReusableButton
        module="route"
        action="update"
        icon={Car}
        buttonName={`Assign Vehicle (${selectedRoutes.size})`}
        title={
          selectedRoutes.size === 0
            ? "Select at least 1 route to assign vehicle"
            : "Assign vehicle to selected routes"
        }
        onClick={onAssignVehicle}
        disabled={selectedRoutes.size === 0}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
          selectedRoutes.size > 0
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      />

      {renderCommonButtons()}
    </>
  );

  return (
    <div className="bg-gray-50 border-b border-gray-300">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {panelType === "company"
              ? renderCompanyButtons()
              : renderVendorButtons()}
          </div>

          {/* Right Side: Selection Count */}
          <div className="flex items-center">
            {selectedRoutes.size > 0 && (
              <div className="text-xs text-gray-600 font-medium">
                {selectedRoutes.size} route
                {selectedRoutes.size !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapToolbar;
