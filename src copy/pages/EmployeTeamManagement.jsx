import React, { useState } from "react";
import ManageDepartment from "../pages/ManageDepartment";
import ManageEmployees from "./ManageEmployees";
import { logDebug } from "../utils/logger";
import { useModulePermissions } from "../hooks/usePermissions";
import PermissionDenied from "@components/PermissionDenied";

// default tab

   

const EmployeTeamManagement = () => {
  const [activeTab, setActiveTab] = useState("departments"); // default tab
  const {  hasAccess,canCreate,canRead,canUpdate } = useModulePermissions('department_management');
logDebug("Permissions for department_management:", { hasAccess, canCreate, canRead, canUpdate });
if (!hasAccess) {
  return <PermissionDenied/>
  
 }

  return (
    <div>
      {/* Top Navigation */}
      <div className="flex  border-b p-1">
        <button
          className={`px-4 py-2 ${activeTab === "departments" ? "border-b-2 border-blue-500 font-bold" : ""}`}
          onClick={() => setActiveTab("departments")}
        >
          ManageDepartment
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "employees" ? "border-b-2 border-blue-500 font-bold" : ""}`}
          onClick={() => setActiveTab("employees")}
        >
          ManageEmployees
        </button>
      </div>

      {/* Conditional Component Rendering */}
      <div className="p-1">
          {activeTab === "departments" && <ManageDepartment />}
          {activeTab === "employees" && <ManageEmployees />}
        </div>
    </div>
  );
};

export default EmployeTeamManagement;
