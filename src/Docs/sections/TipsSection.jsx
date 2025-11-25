import React from "react";
import { AlertCircle } from "lucide-react";

const TipsSection = ({ tips }) => {
  if (!tips || tips.length === 0) return null;

  return (
    <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Tips & Best Practices
        </h3>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={index} className="flex gap-2 text-gray-700">
            <span className="text-amber-600">💡</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TipsSection;
