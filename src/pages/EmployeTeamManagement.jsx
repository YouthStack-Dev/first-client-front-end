import React, { useState } from "react";
import ManageDepartment from "../pages/ManageDepartment";
// import ManageEmployees from "../pages/ManageEmployees";
import { Building2, Users } from "lucide-react";
import ManageEmployees from "./ManageEmployees";
import { logDebug } from "../utils/logger";
import PermissionDenied from "../components/PermissionDenied";
import { useModulePermissions } from "../hooks/usePermissions";

const EmployeTeamManagement = () => {
  const [activeTab, setActiveTab] = useState("departments"); // default tab
  const {  hasAccess,canCreate,canRead,canUpdate } = useModulePermissions('department_management');
logDebug("Permissions for department_management:", { hasAccess, canCreate, canRead, canUpdate });


   if (!hasAccess) {
    return <PermissionDenied/>
    
   }
  return (
    <div className="p-1 bg-app-background min-h-screen">
    
      {/* Tab Navigation */}
      <div className="bg-app-surface rounded-lg shadow-sm border border-app-border">
        <div className="flex border-b border-app-border">
          <button
            className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === "departments"
                ? "border-b-2 border-sidebar-primary-500 text-sidebar-primary-600 bg-sidebar-primary-50"
                : "text-app-text-secondary hover:text-app-text-primary hover:bg-sidebar-secondary-50"
            }`}
            onClick={() => setActiveTab("departments")}
          >
            <Building2 className="w-5 h-5 mr-2" />
            Manage Departments
          </button>
          <button
            className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === "employees"
                ? "border-b-2 border-sidebar-primary-500 text-sidebar-primary-600 bg-sidebar-primary-50"
                : "text-app-text-secondary hover:text-app-text-primary hover:bg-sidebar-secondary-50"
            }`}
            onClick={() => setActiveTab("employees")}
          >
            <Users className="w-5 h-5 mr-2" />
            Employee List
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "departments" && <ManageDepartment />}
          {activeTab === "employees" && <ManageEmployees />}
        </div>
      </div>
    </div>
  );
};



export default EmployeTeamManagement;