import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import EntityModal from "../components/EntityModal";
import AssignEntityModal from "../components/layout/AssignEntityModal";
import VendorList from "../components/vendor/VendorList";
import {
  createVendorThunk,
  updateVendorThunk,
} from "../redux/features/vendors/vendorThunk";

const VendorManagement = () => {
  const dispatch = useDispatch();

  // --- Modals State ---
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [entityModalMode, setEntityModalMode] = useState("create"); // 'create' | 'edit'
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [vendorToAssign, setVendorToAssign] = useState(null);

  // --- Handlers ---

  // Open Create Vendor Modal
  const handleAddVendor = () => {
    setEntityModalMode("create");
    setSelectedVendor(null);
    setIsEntityModalOpen(true);
  };

  // Open Assign/Edit Modal from VendorCard
  const handleAssignEntity = (vendor) => {
    setVendorToAssign(vendor);
    setIsAssignModalOpen(true);
  };

  // Submit Create/Edit Vendor Modal
  const handleEntitySubmit = (formData) => {
    if (entityModalMode === "create") {
      dispatch(createVendorThunk(formData));
    } else if (entityModalMode === "edit" && selectedVendor) {
      dispatch(updateVendorThunk({ id: selectedVendor.id, ...formData }));
    }
    setIsEntityModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Vendor Management</h1>
            <p className="text-gray-600">
              Manage all registered transportation vendors
            </p>
          </div>
          <button
            onClick={handleAddVendor}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </button>
        </div>

        {/* Vendor List */}
        <VendorList onAssignEntity={handleAssignEntity} />

        {/* Create/Edit Vendor Modal */}
        <EntityModal
          isOpen={isEntityModalOpen}
          onClose={() => setIsEntityModalOpen(false)}
          entityType="vendor"
          entityData={selectedVendor}
          onSubmit={handleEntitySubmit}
          mode={entityModalMode}
        />

        {/* Assign/Edit Vendor Modal */}
        <AssignEntityModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setVendorToAssign(null); // clear selection when closed
          }}
          sourceEntity={vendorToAssign}
        />
      </div>
    </div>
  );
};

export default VendorManagement;
