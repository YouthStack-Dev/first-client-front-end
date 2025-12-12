import { useState, useEffect } from "react";
import ManageVehicleTypes from "@components/vehicles/ManageVehicleTypes";
import ManageVehicles from "@components/vehicles/ManageVehicles";

const VehicleManagement = () => {
  // Load last active tab from sessionStorage, fallback to "types"
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("activeVehicleTab") || "types";
  });

  const tabs = [
    { key: "types", label: "Vehicle Types" },
    { key: "list", label: "Vehicles" },
  ];

  // Persist tab selection to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("activeVehicleTab", activeTab);
  }, [activeTab]);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      {/* Top Tabs */}
      <div className="relative flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex-1 text-center py-3 text-sm font-semibold transition-all duration-300
              ${
                activeTab === tab.key
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-blue-600"
              }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-lg"></span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}

      {activeTab === "types" && <ManageVehicleTypes />}
      {activeTab === "list" && <ManageVehicles />}
    </div>
  );
};

export default VehicleManagement;
