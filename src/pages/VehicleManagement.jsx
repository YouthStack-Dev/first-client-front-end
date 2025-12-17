import { useState, useEffect } from "react";
import ManageVehicleTypes from "@components/vehicles/VehicleType";
import ManageVehicles from "@components/vehicles/Vehicles";

const VehicleManagement = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("activeVehicleTab") || "types";
  });

  const tabs = [
    { key: "types", label: "Vehicle Types" },
    { key: "list", label: "Vehicles" },
  ];

  useEffect(() => {
    sessionStorage.setItem("activeVehicleTab", activeTab);
  }, [activeTab]);

  return (
    <div className="w-full bg-gray-50 p-6">
      {/* Tabs */}
      <div className="relative flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex-1 py-3 text-sm font-semibold
              ${activeTab === tab.key
                ? "text-blue-600"
                : "text-gray-500 hover:text-blue-600"
              }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-lg" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        {activeTab === "types" && <ManageVehicleTypes />}
        {activeTab === "list" && <ManageVehicles />}
      </div>
    </div>
  );
};


export default VehicleManagement;
