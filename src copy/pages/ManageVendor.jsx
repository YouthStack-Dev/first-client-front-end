
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import AddVendorModal from "@components/modals/AddVendorModal";
import DynamicTable from "@components/DynamicTable";
import ToolBar from "@components/ui/ToolBar";
import { closeModal, openModal } from "@features/manageVendors/vendorSlice";

import {
  addVendor,
  fetchVendors,
  editVendor,
  removeVendor,
} from "@features/manageVendors/vendorThunks";

// ✅ Common mapper for Add/Edit
const mapVendorData = (source = {}, formData = {}) => ({
  vendor_name: formData.name ?? source.vendor_name ?? "",
  contact_person: formData.pointOfContact ?? source.contact_person ?? "",
  phone_number: formData.phoneNumber ?? source.phone_number ?? "",
  email: formData.email ?? source.email ?? "",
  address: formData.pickupDropPoint ?? source.address ?? "",
  is_active: formData.isActive ?? source.is_active ?? true,
});

const ManageVendor = () => {
  const dispatch = useDispatch();
  const { vendors, isModalOpen, selectedVendor } = useSelector(
    (state) => state.vendor
  );

  // ✅ Fetch vendors on first load
  useEffect(() => {
    if (vendors.length === 0) {
      dispatch(fetchVendors({ skip: 0, limit: 10 }));
    }
  }, [vendors.length, dispatch]);

  const handleAdd = () => dispatch(openModal(null));
  const handleEdit = (vendor) => dispatch(openModal(vendor));

  // ✅ Delete vendor with toast
  const handleDelete = async (vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.vendor_name}?`)) {
      try {
        await dispatch(removeVendor(vendor.vendor_id)).unwrap();
        toast.success(`Vendor "${vendor.vendor_name}" deleted successfully`);
      } catch (err) {
        toast.error(`Failed to delete "${vendor.vendor_name}"`);
        console.error(`❌ Delete Error for Vendor ID: ${vendor.vendor_id}`, err);
      }
    }
  };

  // ✅ Toggle active/inactive with toast
  const handleToggleStatus = async (vendor) => {
    const updatedStatus = !vendor.is_active;
    const payload = mapVendorData(vendor, { isActive: updatedStatus });

    try {
      await dispatch(editVendor({ id: vendor.vendor_id, vendorData: payload })).unwrap();
      toast.success(
        `Vendor "${vendor.vendor_name}" ${updatedStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      toast.error(`Failed to update status for "${vendor.vendor_name}"`);
      console.error(
        `❌ Failed to update status for Vendor ID: ${vendor.vendor_id}`,
        error
      );
    }
  };

  // ✅ Add/Edit vendor with toast
  const handleSave = async (formData) => {
    const payload = mapVendorData(selectedVendor, formData);

    try {
      if (selectedVendor) {
        await dispatch(editVendor({ id: selectedVendor.vendor_id, vendorData: payload })).unwrap();
        toast.success(`Vendor "${payload.vendor_name}" updated successfully`);
      } else {
        const result = await dispatch(addVendor(payload)).unwrap();
        toast.success(`Vendor "${result.vendor_name}" added successfully`);
      }
      dispatch(closeModal());
    } catch (err) {
      toast.error("Failed to save vendor");
      console.error("❌ Save Error:", err);
    }
  };

  const headers = useMemo(
    () => [
      { key: "vendor_name", label: "Vendor Name" },
      { key: "contact_person", label: "Contact Person" },
      { key: "phone_number", label: "Phone Number" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address" },
      {
        key: "is_active",
        label: "Status",
        render: (row) => (row.is_active ? "Active" : "Inactive"),
      },
    ],
    []
  );

  return (
    <div className="px-4 md:px-6 py-4">
      <ToolBar
        leftElements={
          <h1 className="text-xl font-semibold text-gray-800">Manage Vendors</h1>
        }
        rightElements={
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 
            bg-blue-600 text-white text-sm font-medium rounded-md 
            hover:bg-blue-700 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:ring-offset-2 transition-colors 
            shadow-sm hover:shadow-md">
            <span className="text-lg">➕</span>
            <span>Add Vendor</span>
          </button>
        }
      />

      <DynamicTable
        headers={headers}
        data={vendors}
        renderActions={(row) => (
          <div className="flex gap-2 text-sm">
            <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>
              Edit
            </button>
            <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>
              Delete
            </button>
            <button className="text-yellow-600 hover:underline" onClick={() => handleToggleStatus(row)}>
              {row.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        )}
      />

      {isModalOpen && (
        <AddVendorModal
          isOpen={isModalOpen}
          onClose={() => dispatch(closeModal())}
          initialData={selectedVendor}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ManageVendor;
