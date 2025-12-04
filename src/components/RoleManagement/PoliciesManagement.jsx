import { UsersRound } from "lucide-react";
import ToolBar from "../ui/ToolBar";
import SearchBar from "./SearchBar";
import { logDebug } from "../../utils/logger";
import { useState } from "react";
import { PolicyCard } from "./PolicyCard";
import { PolicyForm } from "../modals/PolicyFromModal";
import {
  transformPermissionsToModules,
  transformPermissionsToModulesWithDefaults,
} from "../../utils/permissionModules";
import {
  dummyPermission,
  existingPermission,
} from "../../staticData/permissionModules";
import { useSelector } from "react-redux";
import { selectPermissions } from "../../redux/features/auth/authSlice";

const PoliciesManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // "view" | "edit" | "create"
  const permission = useSelector(selectPermissions);
  const handleAddClick = () => {
    setModalMode("create");
    setSelectedPolicy(null);
    setIsModalOpen(true); // ← This was missing
    logDebug("Add Policy button clicked", "Creating new policy");
  };

  const samplePolicies = [
    {
      id: "POL-001",
      name: "Data Privacy Policy",
      description:
        "Outlines how personal data is collected, stored, and protected in accordance with GDPR and local regulations.",
    },
    {
      id: "POL-002",
      name: "Remote Work Policy",
      description:
        "Guidelines for employees working remotely, including communication expectations, security requirements, and equipment provisions.",
    },
    {
      id: "POL-003",
      name: "Code of Conduct",
      description:
        "Defines expected behaviors, ethical standards, and professional conduct for all employees and stakeholders.",
    },
  ];

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setModalMode("view"); // Start in view mode, user can switch to edit
    setIsModalOpen(true);
    logDebug(`Viewing policy: ${policy.name} (ID: ${policy.id})`);
  };

  const handleDelete = (policy) => {
    if (confirm(`Are you sure you want to delete "${policy.name}"?`)) {
      logDebug(`Deleted policy: ${policy.name}`);
      // Add your delete logic here
      alert(`Deleted policy: ${policy.name}`);
    }
  };

  const handleSavePermissions = (permissions, mode) => {
    if (mode === "create") {
      logDebug("Creating new policy with permissions:", permissions);
      // Add your create logic here
      alert("New policy created successfully!");
    } else {
      logDebug(`Saving permissions for: ${selectedPolicy.name}`);
      logDebug("Permissions data:", permissions);
      // Add your update logic here
      alert(`Permissions updated for ${selectedPolicy.name}`);
    }

    setIsModalOpen(false);
    setSelectedPolicy(null);
    setModalMode("view");
  };

  const handleCloseModal = () => {
    logDebug("Policy form closed");
    setIsModalOpen(false);
    setSelectedPolicy(null);
    setModalMode("view");
  };

  const handleModeChange = (newMode) => {
    logDebug(`Mode changed to: ${newMode}`);
    setModalMode(newMode);
  };

  // Filter policies based on search query
  const filteredPolicies = samplePolicies.filter(
    (policy) =>
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="">
      <ToolBar
        module={"policy"}
        onAddClick={handleAddClick}
        addButtonLabel="Policy"
        addButtonIcon={<UsersRound size={16} />}
        className="p-4 bg-white border rounded shadow-sm mb-4"
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder="Search policies by name, ID or description..."
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
        {filteredPolicies.map((policy) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}

        {filteredPolicies.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 text-lg">
              No policies found matching "{searchQuery}"
            </div>
            <div className="text-gray-400 text-sm mt-2">
              Try adjusting your search terms or create a new policy
            </div>
          </div>
        )}
      </div>

      <PolicyForm
        policy={selectedPolicy}
        isOpen={isModalOpen}
        onSave={handleSavePermissions}
        onClose={handleCloseModal}
        mode={modalMode}
        onModeChange={handleModeChange}
      />
    </div>
  );
};

export default PoliciesManagement;
