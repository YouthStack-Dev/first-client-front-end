import { useState } from "react";
import ManageVehicleTypes from "@components/vehicles/VehicleType";
import ManageVehicles from "@components/vehicles/Vehicles";

const VehicleManagement = () => {
  const [activeTab, setActiveTab] = useState("types");

  const tabs = [
    { key: "types", label: "Vehicle Types" },
    { key: "list", label: "Vehicles" },
  ];

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
      <div className="bg-white p-6 rounded-xl shadow-lg">
        {activeTab === "types" && <ManageVehicleTypes />}
        {activeTab === "list" && <ManageVehicles />}
      </div>
    </div>
  );
};

export default VehicleManagement;
