import React from "react";
import { X, Merge } from "lucide-react";

const MergeConfirmationModal = ({
  showMergeModal,
  setShowMergeModal,
  selectedClusters,
  onConfirmMerge,
}) => {
  if (!showMergeModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Merge className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Merge Clusters
            </h3>
          </div>
          <button
            onClick={() => setShowMergeModal(false)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to merge {selectedClusters.size} clusters?
            This will combine all bookings into a single route.
          </p>

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Clusters to merge:
            </h4>
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedClusters).map((clusterId) => (
                <span
                  key={clusterId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  Cluster {clusterId}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowMergeModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirmMerge}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
            >
              Confirm Merge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergeConfirmationModal;
