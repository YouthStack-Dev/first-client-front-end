import React, { useState } from "react";
import { useDispatch } from "react-redux";
import EntityModal from "@components/EntityModal";
import AssignEntityModal from "@components/modals/AssignEntityModal";
import VendorList from "@components/vendor/VendorList";
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
    <div className="min-h-screen  p-6">
      <div className=" mx-auto">
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
