import React from "react";
import { Users, Merge, Save, Eye, Trash2, Split, Check } from "lucide-react";

const MergedRouteCard = ({
  mergedRoute,
  onSaveRoute,
  onUnmerge,
  onDelete,
  isSaved,
  isSelected,
  onToggleSelect,
}) => {
  return (
    <div
      className={`border rounded-lg p-3 ${
        isSelected
          ? "border-purple-500 bg-purple-100 shadow-sm"
          : "border-purple-300 bg-purple-50"
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Checkbox for selection */}
        <button
          onClick={() => onToggleSelect(mergedRoute.clusterId)}
          className={`flex-shrink-0 w-5 h-5 mt-1 rounded border flex items-center justify-center mr-3 ${
            isSelected
              ? "bg-purple-500 border-purple-500"
              : "bg-white border-gray-300"
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-purple-800 flex items-center gap-2">
              <Merge className="w-4 h-4" />
              Merged Route
              {isSelected && (
                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                  Visible
                </span>
              )}
            </h4>

            {/* Efficiency metrics if available */}
            {mergedRoute.efficiencyData && (
              <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                {mergedRoute.efficiencyData.improvementPercentage}% Efficient
              </div>
            )}
          </div>

          {/* Route details */}
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-purple-500" />
              <span className="text-purple-600">
                {mergedRoute.bookings.length} bookings
              </span>
            </div>
            <div className="text-purple-500">
              {mergedRoute.originalClusterIds.length} clusters
            </div>

            {/* Distance information */}
            {mergedRoute.efficiencyData && (
              <>
                <div className="text-gray-600">
                  Saved: {mergedRoute.efficiencyData.improvement.toFixed(1)}km
                </div>
                <div className="text-gray-600">
                  {mergedRoute.efficiencyData.optimizedDistance.toFixed(1)}km
                  total
                </div>
              </>
            )}
          </div>

          {/* Original cluster IDs */}
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Original Clusters:</p>
            <div className="flex flex-wrap gap-1">
              {mergedRoute.originalClusterIds.map((clusterId, index) => (
                <span
                  key={clusterId}
                  className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                >
                  {clusterId}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-200">
        <div className="flex items-center gap-2">
          {/* View/Show Route Button */}
          <button
            onClick={() => onToggleSelect(mergedRoute.clusterId)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium ${
              isSelected
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Eye className="w-3 h-3" />
            {isSelected ? "Hide Route" : "Show Route"}
          </button>

          {/* Save Button */}
          <button
            onClick={() => onSaveRoute(mergedRoute.clusterId)}
            disabled={isSaved}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium ${
              isSaved
                ? "bg-green-100 text-green-700 cursor-not-allowed"
                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            }`}
          >
            <Save className="w-3 h-3" />
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Unmerge Button */}
          <button
            onClick={() => onUnmerge(mergedRoute.clusterId)}
            className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200"
            title="Split back into original clusters"
          >
            <Split className="w-3 h-3" />
            Unmerge
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(mergedRoute.clusterId)}
            className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
            title="Delete merged route permanently"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>

      {/* Created time */}
      <div className="mt-2 text-xs text-gray-400">
        Created: {new Date(mergedRoute.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default MergedRouteCard;
