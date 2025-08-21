import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openModal, closeModal, updateVendorStatusLocally } from "../redux/features/managevendors/vendorSlice";
import AddVendorModal from "../components/modals/AddVendorModal";
import DynamicTable from "../components/DynamicTable";
import {
  addVendor,
  fetchVendors,
  editVendor,
  removeVendor,
  fetchVendorById,
} from "../redux/features/managevendors/vendorThunks";

// ✅ Common mapper for Add, Edit, Toggle
const mapVendorData = (source = {}, formData = {}, tenantId) => ({
  vendor_name: formData.name ?? source.vendor_name ?? "",
  contact_person: formData.pointOfContact ?? source.contact_person ?? "",
  phone_number: formData.phoneNumber ?? source.phone_number ?? "",
  email: formData.email ?? source.email ?? "",
  address: formData.pickupDropPoint ?? source.address ?? "",
  tenant_id: tenantId ?? source.tenant_id ?? 1,
  is_active: formData.isActive ?? source.is_active ?? true,
});

const ManageVendor = () => {
  const dispatch = useDispatch();
  const { vendors, isModalOpen, selectedVendor } = useSelector((state) => state.vendor);
  const { user } = useSelector((state) => state.auth);
  const tenantId = user?.tenant_id || 1;

  // ✅ Fetch vendors on first load
  useEffect(() => {
    if (tenantId && vendors.length === 0) {
      console.log(`📢 API Call: GET /vendors?skip=0&limit=100&tenant_id=${tenantId}`);
      dispatch(fetchVendors({ skip: 0, limit: 10, tenant_id: tenantId }));
    }
  }, [tenantId, vendors.length, dispatch]);

  const handleAdd = () => dispatch(openModal(null));
  const handleEdit = (vendor) => dispatch(openModal(vendor));

  // ✅ Delete vendor
  const handleDelete = async (vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.vendor_name}?`)) {
      try {
        console.log(`📢 API Call: DELETE /vendors/${vendor.vendor_id}`);
        await dispatch(removeVendor(vendor.vendor_id)).unwrap();
        console.log(`✅ Vendor deleted: ${vendor.vendor_name}`);
        console.log(`📢 API Call: GET /vendors?skip=0&limit=100&tenant_id=${tenantId}`);
        dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
      } catch (err) {
        console.error(`❌ Delete Error for Vendor ID: ${vendor.vendor_id}`, err);
      }
    }
  };

  // ✅ Toggle active/inactive — instant UI update + fetch that vendor
  const handleToggleStatus = async (vendor) => {
    const updatedStatus = !vendor.is_active;
    const payload = mapVendorData(vendor, { isActive: updatedStatus }, tenantId);

    console.log(`📢 API Call: PUT /vendors/${vendor.vendor_id} (Toggle Active to: ${updatedStatus})`);
    console.log("📦 Payload:", payload);

    // Instant UI update
    dispatch(updateVendorStatusLocally({ id: vendor.vendor_id, is_active: updatedStatus }));

    try {
      await dispatch(editVendor({ id: vendor.vendor_id, vendorData: payload })).unwrap();
      console.log(`✅ Status updated successfully for Vendor ID: ${vendor.vendor_id}`);

      // Re-fetch only this vendor to ensure backend sync
      console.log(`📢 API Call: GET /vendors/${vendor.vendor_id}`);
      dispatch(fetchVendorById(vendor.vendor_id));
    } catch (error) {
      console.error(`❌ Failed to update status for Vendor ID: ${vendor.vendor_id}`, error);
    }
  };

  // ✅ Add/Edit vendor
  const handleSave = async (formData) => {
    const payload = mapVendorData(selectedVendor, formData, tenantId);
    try {
      if (selectedVendor) {
        console.log(`📢 API Call: PUT /vendors/${selectedVendor.vendor_id}`);
        console.log("📦 Payload:", payload);
        await dispatch(editVendor({ id: selectedVendor.vendor_id, vendorData: payload })).unwrap();
        console.log(`✅ Vendor updated: ${selectedVendor.vendor_name}`);
      } else {
        console.log("📢 API Call: POST /vendors");
        console.log("📦 Payload:", payload);
        await dispatch(addVendor(payload)).unwrap();
        console.log(`✅ Vendor added: ${payload.vendor_name}`);
      }
      console.log(`📢 API Call: GET /vendors?skip=0&limit=100&tenant_id=${tenantId}`);
      dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
      dispatch(closeModal());
    } catch (err) {
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

  if (!tenantId) return <p className="p-4">Loading user info...</p>;

  return (
    <div className="px-4 md:px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Manage Vendors</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          + Add Vendor
        </button>
      </div>

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
            <button
              className="text-yellow-600 hover:underline"
              onClick={() => handleToggleStatus(row)}
            >
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
