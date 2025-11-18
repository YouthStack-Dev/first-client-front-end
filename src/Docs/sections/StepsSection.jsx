import React from "react";
import { FileText } from "lucide-react";

const StepsSection = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Step-by-Step Guide
        </h3>
      </div>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </span>
            <span className="text-gray-700 pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default StepsSection;
