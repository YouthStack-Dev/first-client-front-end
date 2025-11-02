import React from "react";
import { Users, ChevronDown } from "lucide-react";

const ClusterCard = ({
  cluster,
  isSelected,
  onToggleSelect,
  onShowDetails,
  getClusterColor,
}) => {
  const clusterColor = getClusterColor(cluster.cluster_id);

  return (
    <div
      className={`border rounded-lg p-3 transition-all ${
        isSelected
          ? "border-blue-500 shadow-md bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(cluster.cluster_id)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 truncate">
            Cluster {cluster.cluster_id}
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-600">
                {cluster.bookings.length} bookings
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onShowDetails(cluster)}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-medium text-gray-700"
        >
          <span>{cluster.bookings.length}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default ClusterCard;
