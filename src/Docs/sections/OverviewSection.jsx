import React from "react";
import { Info } from "lucide-react";

const OverviewSection = ({ overview }) => {
  if (!overview) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
      </div>
      <p className="text-gray-700 leading-relaxed">{overview}</p>
    </div>
  );
};

export default OverviewSection;