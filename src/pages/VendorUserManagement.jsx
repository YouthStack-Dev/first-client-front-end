import React, { useState } from "react";
import ToolBar from "@components/ui/ToolBar";
import SearchInput from "@components/ui/SearchInput";
import ReusableButton from "../components/ui/ReusableButton";
import { logDebug } from "../utils/logger";

// Icons
import { UsersRound, History, UserPlus } from "lucide-react";
import AuditLogsModal from "../components/modals/AuditLogsModal";

const VendorUserManagement = () => {
  // 🔹 Added missing useState
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuditModal, setShowAuditModal] = useState(false);

  return (
    <div>
      <ToolBar
        onAddClick={() => logDebug("Add Department clicked")}
        addButtonLabel="Department"
        addButtonIcon={<UsersRound size={16} />}
        className="p-4 bg-white border rounded shadow-sm mb-4"
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <SearchInput
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
          </div>
        }
        rightElements={
          <div className="flex items-center gap-3">
            <ReusableButton
              module="team"
              action="delete"
              buttonName="History"
              icon={History}
              title="View Audit History"
              onClick={() => logDebug("View Audit History clicked")}
              className="text-white bg-blue-600 px-3 py-2 rounded-md flex items-center gap-2"
            />

            {/* Create Employee */}
            <ReusableButton
              module="employee"
              action="create"
              buttonName="Employee"
              icon={UserPlus}
              title="Create Employee"
              onClick={() => logDebug("Create Employee clicked")}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            />
          </div>
        }
      />

      <AuditLogsModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        moduleName="Team"
        showUserColumn={true}
        apimodule="team"
        selectedCompany={selectedCompany}
      />
    </div>
  );
};

export default VendorUserManagement;
