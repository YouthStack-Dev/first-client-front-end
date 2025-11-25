import React, { useState } from "react";
import { Video, FileImage, Maximize2, Minimize2 } from "lucide-react";

const MediaViewer = ({ item }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleMinimize = () => {
    setIsFullscreen(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                item.type === "supademo" ? "bg-blue-100" : "bg-purple-100"
              }`}
            >
              {item.type === "supademo" && (
                <Video className="w-4 h-4 text-blue-600" />
              )}
              {item.type === "image" && (
                <FileImage className="w-4 h-4 text-purple-600" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          </div>
          {item.type === "supademo" && (
            <button
              onClick={handleFullscreen}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="View Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        <div className="p-4">
          {item.type === "supademo" && (
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
              <iframe
                src={item.url}
                loading="lazy"
                title={item.title}
                allow="clipboard-write"
                className="absolute inset-0 w-full h-full"
                allowFullScreen
              />
            </div>
          )}

          {item.type === "image" && (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && item.type === "supademo" && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4">
          <div className="w-full h-full max-w-7xl max-h-screen flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-300">{item.description}</p>
              </div>
              <button
                onClick={handleMinimize}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
                title="Exit Fullscreen"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 relative rounded-lg overflow-hidden">
              <iframe
                src={item.url}
                loading="lazy"
                title={item.title}
                allow="clipboard-write"
                className="absolute inset-0 w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaViewer;
