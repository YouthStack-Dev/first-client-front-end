import React from "react";
import { CheckCircle } from "lucide-react";

const GuidelinesSection = ({ guidelines }) => {
  if (!guidelines || guidelines.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Guidelines</h3>
      </div>
      <ul className="space-y-2">
        {guidelines.map((guideline, index) => (
          <li key={index} className="flex gap-2 text-gray-700">
            <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <span>{guideline}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GuidelinesSection;
