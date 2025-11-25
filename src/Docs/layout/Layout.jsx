import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({
  children,
  sidebarOpen,
  setSidebarOpen,
  documentationData,
  selectedModule,
  selectedAction,
  expandedModules,
  toggleModule,
  selectAction,
  headerTitle,
  headerDescription,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          documentationData={documentationData}
          selectedModule={selectedModule}
          selectedAction={selectedAction}
          expandedModules={expandedModules}
          toggleModule={toggleModule}
          selectAction={selectAction}
        />

        <div className="flex-1 overflow-y-auto">
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            title={headerTitle}
            description={headerDescription}
          />

          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
