import React from "react";
import MediaViewer from "../MediaViewer";

const MediaSection = ({ content }) => {
  if (!content || content.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Interactive Demos & Resources
        </h3>
        <div className="space-y-4">
          {content.map((item, index) => (
            <MediaViewer key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaSection;
