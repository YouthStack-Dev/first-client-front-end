import React from "react";
import { Edit, Trash2, FileText } from "lucide-react";

export const PolicyCard = ({ policy, onEdit, onDelete }) => {
  return (
    <div className="group w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 transition-colors duration-300">
            <FileText className="text-blue-600" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
              {policy.name}
            </h3>
            <span className="inline-flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {policy.id}
            </span>
          </div>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {policy.description}
        </p>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-end gap-3">
        <button
          onClick={() => onEdit(policy)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(policy)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
