import { useState } from "react";
import ShiftManagement from "@components/Schedulemanagement/ShiftManagement";
import ShiftCategoryManagement from "@components/Schedulemanagement/ShiftCategoryManagement";

const ScheduleManagement = () => {
  const [activeTab, setActiveTab] = useState("shift");

  const tabs = [
    { key: "shift", label: "Shift Management" },
    { key: "shiftCategory", label: "Shift Category Management" },
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

      {/* Conditional Component Rendering */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        {activeTab === "shift" && <ShiftManagement />}
        {activeTab === "shiftCategory" && <ShiftCategoryManagement />}
      </div>
    </div>
  );
};

export default ScheduleManagement;
