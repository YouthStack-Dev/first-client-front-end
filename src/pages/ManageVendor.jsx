
// import React, { useEffect, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { openModal, closeModal } from "../redux/features/managevendors/vendorSlice";
// import AddVendorModal from "../components/modals/AddVendorModal";
// import DynamicTable from "../components/DynamicTable";
// import { addVendor, fetchVendors  ,editVendor ,removeVendor} from "../redux/features/managevendors/vendorThunks";

// const ManageVendor = () => {
//   const dispatch = useDispatch();
//   const { vendors, isModalOpen, selectedVendor } = useSelector((state) => state.vendor);
//   const { user } = useSelector((state) => state.auth);

//   const tenantId = user?.tenant_id || 1;

//   // Fetch only once if vendors not loaded
//   useEffect(() => {
//     if (tenantId && vendors.length === 0) {
//       dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
//     }
//   }, [tenantId, dispatch]);

//   const handleAdd = () => dispatch(openModal(null));

//   const handleEdit = (vendor) => dispatch(openModal(vendor));

//   const handleDelete = (vendor) => {
//     if (window.confirm(`Are you sure you want to delete ${vendor.vendor_name}?`)) {
//       dispatch(removeVendor(vendor.vendor_id)).unwrap()
//         .then(() => {
//           dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
//         })
//         .catch((err) => console.error("Delete Error:", err));
//     }
//   };

//   const handleSave = (formData) => {
//     const mappedData = {
//       vendor_name: formData.name,
//       contact_person: formData.pointOfContact,
//       phone_number: formData.phoneNumber,
//       email: formData.email,
//       address: formData.pickupDropPoint,
//       tenant_id: tenantId,
//       is_active: true,
//     };

//     if (selectedVendor) {
//       dispatch(editVendor({ id: selectedVendor.vendor_id, vendorData: mappedData })).unwrap()
//         .then(() => {
//           dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
//           dispatch(closeModal());
//         })
//         .catch((err) => console.error("Update Error:", err));
//     } else {
//       dispatch(addVendor(mappedData)).unwrap()
//         .then(() => {
//           dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
//           dispatch(closeModal());
//         })
//         .catch((err) => console.error("Add Error:", err));
//     }
//   };

//   const headers = useMemo(() => [
//     { key: "vendor_name", label: "Vendor Name" },
//     { key: "contact_person", label: "Contact Person" },
//     { key: "phone_number", label: "Phone Number" },
//     { key: "email", label: "Email" },
//     { key: "address", label: "Address" },
//     {
//       key: "is_active",
//       label: "Status",
//       render: (row) => (row.is_active ? "Active" : "Inactive"),
//     },
//   ], []);

//   if (!tenantId) return <p className="p-4">Loading user info...</p>;

//   return (
//     <div className="px-4 md:px-6 py-4">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-semibold">Manage Vendors</h2>
//         <button
//           onClick={handleAdd}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
//         >
//           + Add Vendor
//         </button>
//       </div>

//       <DynamicTable
//         headers={headers}
//         data={vendors}
//         renderActions={(row) => (
//           <div className="flex gap-2 text-sm">
//             <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Edit</button>
//             <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Delete</button>
//           </div>
//         )}
//       />

//       {isModalOpen && (
//         <AddVendorModal
//           isOpen={isModalOpen}
//           onClose={() => dispatch(closeModal())}
//           initialData={selectedVendor}
//           onSave={handleSave}
//         />
//       )}
//     </div>
//   );
// };

// export default ManageVendor;


import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openModal, closeModal } from "../redux/features/managevendors/vendorSlice";
import AddVendorModal from "../components/modals/AddVendorModal";
import DynamicTable from "../components/DynamicTable";
import {
  addVendor,
  fetchVendors,
  editVendor,
  removeVendor,
} from "../redux/features/managevendors/vendorThunks";

const ManageVendor = () => {
  const dispatch = useDispatch();
  const { vendors, isModalOpen, selectedVendor } = useSelector((state) => state.vendor);
  const { user } = useSelector((state) => state.auth);

  const tenantId = user?.tenant_id || 1;

  useEffect(() => {
    if (tenantId && vendors.length === 0) {
      dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
    }
  }, [tenantId, vendors.length, dispatch]);

  const handleAdd = () => dispatch(openModal(null));

  const handleEdit = (vendor) => dispatch(openModal(vendor));

  const handleDelete = (vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.vendor_name}?`)) {
      dispatch(removeVendor(vendor.vendor_id))
        .unwrap()
        .then(() => {
          dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
        })
        .catch((err) => console.error("Delete Error:", err));
    }
  };

  const handleToggleStatus = (vendor) => {
    const updatedVendor = {
      ...vendor,
      is_active: !vendor.is_active,
    };

    dispatch(
      editVendor({
        id: vendor.vendor_id,
        vendorData: updatedVendor,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
      })
      .catch((err) => console.error("Toggle Status Error:", err));
  };

  const handleSave = (formData) => {
    const mappedData = {
      vendor_name: formData.name,
      contact_person: formData.pointOfContact,
      phone_number: formData.phoneNumber,
      email: formData.email,
      address: formData.pickupDropPoint,
      tenant_id: tenantId,
      is_active: formData.isActive ?? true, // Allow toggling from form or default to true
    };

    const action = selectedVendor
      ? editVendor({ id: selectedVendor.vendor_id, vendorData: mappedData })
      : addVendor(mappedData);

    action
      .unwrap()
      .then(() => {
        dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
        dispatch(closeModal());
      })
      .catch((err) => console.error("Save Error:", err));
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
