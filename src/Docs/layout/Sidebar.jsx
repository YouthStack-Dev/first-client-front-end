import React from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { colorClasses } from "../documentationData";

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  documentationData,
  selectedModule,
  selectedAction,
  expandedModules,
  toggleModule,
  selectAction,
}) => {
  return (
    <div
      className={`${
        sidebarOpen ? "w-80" : "w-0"
      } transition-all duration-300 bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden`}
    >
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Documentation</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">GoCab Platform Guide</p>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {Object.entries(documentationData).map(([moduleKey, module]) => {
              const Icon = module.icon;
              const isExpanded = expandedModules.includes(moduleKey);
              const colors = colorClasses[module.color];

              return (
                <div key={moduleKey} className="space-y-1">
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(moduleKey)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedModule === moduleKey
                        ? colors.bg
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 ${
                          selectedModule === moduleKey
                            ? colors.text
                            : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          selectedModule === moduleKey
                            ? colors.text
                            : "text-gray-700"
                        }`}
                      >
                        {module.title}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {/* Actions List */}
                  {isExpanded && (
                    <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-1">
                      {Object.entries(module.actions).map(
                        ([actionKey, action]) => (
                          <button
                            key={actionKey}
                            onClick={() => selectAction(moduleKey, actionKey)}
                            className={`w-full text-left p-2 rounded-lg transition-colors ${
                              selectedModule === moduleKey &&
                              selectedAction === actionKey
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <div className="text-sm font-medium">
                              {action.title}
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
