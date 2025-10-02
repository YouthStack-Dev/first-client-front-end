import { useState } from "react";
import ManageVehicleTypes from "@components/vehicles/VehicleType";
import ManageVehicles from "@components/vehicles/Vehicles";

const VehicleManagement = () => {
  const [activeTab, setActiveTab] = useState("types"); // default tab

  return (
    <div>
      {/* Top Navigation */}
      <div className="flex  border-b p-1">
        <button
          className={`px-4 py-2 ${activeTab === "types" ? "border-b-2 border-blue-500 font-bold" : ""}`}
          onClick={() => setActiveTab("types")}
        >
          Manage Vehicle Types
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "list" ? "border-b-2 border-blue-500 font-bold" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Vehicle List
        </button>
      </div>

      {/* Conditional Component Rendering */}
      <div className="p-1">
        {activeTab === "types" && <ManageVehicleTypes />}
        {activeTab === "list" && <ManageVehicles />}
      </div>
    </div>
  );
};

export default VehicleManagement;
