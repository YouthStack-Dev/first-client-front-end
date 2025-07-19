// import React, { useState, useMemo } from "react";
// import AddVendorModal from "../components/modals/AddVendorModal";
// import DynamicTable from "../components/DynamicTable";
// import { Edit, Trash2, History } from "lucide-react";
// import PopupModal from "../components/PopupModal";

// const ManageVendor = () => {
//   const [vendors, setVendors] = useState([
//     {
//       vendor_id: 1,
//       vendor_name: "ABC Transport",
//       contact_person: "John Doe",
//       phone_number: "9876543210",
//       email: "abc@example.com",
//       address: "123, MG Road, Bengaluru",
//       is_active: true,
//     },
//   ]);

//   const [selectedItems, setSelectedItems] = useState([]);
//   const [menuOpen, setMenuOpen] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [vendorModalOpen, setVendorModalOpen] = useState(false);
//   const [editVendor, setEditVendor] = useState(null);
//   const [showHistory, setShowHistory] = useState(false);
//   const [historyVendor, setHistoryVendor] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("All");

//   const totalPages = 1;

//   const headers = [
//     { key: "sNo", label: "S No." },
//     { key: "vendor_name", label: "Vendor Name" },
//     { key: "contact_person", label: "Contact Person" },
//     { key: "phone_number", label: "Phone Number" },
//     { key: "email", label: "Email" },
//     { key: "address", label: "Address" },
//     { key: "is_active", label: "Status" },
    
//   ];

//   const handleMenuToggle = (id) => {
//     setMenuOpen(menuOpen === id ? null : id);
//   };

//   const handleSelectItem = (item, checked) => {
//     setSelectedItems((prev) =>
//       checked ? [...prev, item] : prev.filter((i) => i.vendor_id !== item.vendor_id)
//     );
//   };

//   const handleAddOrUpdateVendor = (vendor) => {
//     if (editVendor) {
//       setVendors((prev) =>
//         prev.map((v) =>
//           v.vendor_id === editVendor.vendor_id ? { ...v, ...vendor } : v
//         )
//       );
//     } else {
//       const newVendor = {
//         ...vendor,
//         vendor_id: Date.now(),
//         is_active: true,
//       };
//       setVendors((prev) => [...prev, newVendor]);
//     }
//     setVendorModalOpen(false);
//     setEditVendor(null);
//   };

//   const handleEdit = (vendor) => {
//     setEditVendor(vendor);
//     setVendorModalOpen(true);
//     setMenuOpen(null);
//   };

//   const handleDeactivate = (vendor) => {
//     if (window.confirm(`Deactivate vendor "${vendor.vendor_name}"?`)) {
//       setVendors((prev) =>
//         prev.map((v) =>
//           v.vendor_id === vendor.vendor_id ? { ...v, is_active: false } : v
//         )
//       );
//     }
//     setMenuOpen(null);
//   };

//   const handleHistory = (vendor) => {
//     setHistoryVendor(vendor);
//     setShowHistory(true);
//     setMenuOpen(null);
//   };

//   const onNext = () => setCurrentPage((p) => p + 1);
//   const onPrev = () => setCurrentPage((p) => p - 1);

//   const filteredVendors = useMemo(() => {
//     if (statusFilter === "All") return vendors;
//     return vendors.filter((v) =>
//       statusFilter === "Active" ? v.is_active : !v.is_active
//     );
//   }, [vendors, statusFilter]);

//   const vendorsWithSNo = useMemo(
//     () =>
//       filteredVendors.map((v, i) => ({
//         ...v,
//         sNo: i + 1 + (currentPage - 1) * 10,
//         is_active: v.is_active ? "Active" : "Inactive",
//       })),
//     [filteredVendors, currentPage]
//   );

//   return (
//     <div className="px-4 md:px-6 py-4">
//       {/* Header */}
//       <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
//         <h2 className="text-lg font-semibold">Manage Vendor</h2>
//         <div className="flex flex-wrap gap-2 items-center">
//           <div className="flex border rounded overflow-hidden text-sm">
//             {["All", "Active", "Inactive"].map((status) => (
//               <button
//                 key={status}
//                 onClick={() => setStatusFilter(status)}
//                 className={`px-4 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
//                   statusFilter === status
//                     ? "bg-blue-600 text-white"
//                     : "bg-white text-gray-700 hover:bg-gray-100"
//                 }`}
//                 aria-pressed={statusFilter === status}
//               >
//                 {status}
//               </button>
//             ))}
//           </div>
//           <button
//             onClick={() => {
//               setEditVendor(null);
//               setVendorModalOpen(true);
//             }}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//           >
//             + Add
//           </button>
//         </div>
//       </div>

//       <AddVendorModal
//         isOpen={vendorModalOpen}
//         onClose={() => {
//           setVendorModalOpen(false);
//           setEditVendor(null);
//         }}
//         initialData={editVendor}
//         onSave={handleAddOrUpdateVendor}
//       />

//       {showHistory && (
//         <PopupModal
//           title={`History - ${historyVendor?.vendor_name}`}
//           isOpen={true}
//           onClose={() => {
//             setShowHistory(false);
//             setHistoryVendor(null);
//           }}
//         >
//           <div className="text-sm">
//             <p className="mb-2">Static example history:</p>
//             <ul className="list-disc pl-5">
//               <li>Created on 01/01/2024</li>
//               <li>Phone updated to {historyVendor?.phone_number}</li>
//               <li>Status: {historyVendor?.is_active ? "Active" : "Inactive"}</li>
//             </ul>
//           </div>
//         </PopupModal>
//       )}

//       <DynamicTable
//         headers={headers}
//         data={vendorsWithSNo}
//         menuOpen={menuOpen}
//         onMenuToggle={handleMenuToggle}
//         onNext={onNext}
//         onPrev={onPrev}
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onSelectItem={handleSelectItem}
//         selectedItems={selectedItems}
//         renderActions={(row) => (
//           <div className="flex gap-2 text-sm">
//             <button
//               className="text-blue-600 hover:underline flex items-center gap-1"
//               onClick={() => handleEdit(row)}
//             >
//               <Edit size={14} /> Edit
//             </button>
//             <button
//               className="text-yellow-600 hover:underline flex items-center gap-1"
//               onClick={() => handleDeactivate(row)}
//             >
//               <Trash2 size={14} /> Deactivate
//             </button>
//             <button
//               className="text-gray-600 hover:underline flex items-center gap-1"
//               onClick={() => handleHistory(row)}
//             >
//               <History size={14} /> History
//             </button>
//           </div>
//         )}
//       />
//     </div>
//   );
// };

// export default ManageVendor;

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openModal, closeModal } from "../redux/features/manageVendors/vendorSlice";
import {
  fetchVendors,
  addVendor,
  editVendor,
  removeVendor,
} from "../redux/features/manageVendors/vendorThunks";
import AddVendorModal from "../components/modals/AddVendorModal";
import DynamicTable from "../components/DynamicTable";

const ManageVendor = () => {
  const dispatch = useDispatch();
  const { vendors, isModalOpen, selectedVendor } = useSelector((state) => state.vendor);
  const { user } = useSelector((state) => state.auth);

  const tenantId = user?.tenant_id || 1;

  // Fetch only once if vendors not loaded
  useEffect(() => {
    if (tenantId && vendors.length === 0) {
      dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
    }
  }, [tenantId, dispatch]);

  const handleAdd = () => dispatch(openModal(null));

  const handleEdit = (vendor) => dispatch(openModal(vendor));

  const handleDelete = (vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.vendor_name}?`)) {
      dispatch(removeVendor(vendor.vendor_id)).unwrap()
        .then(() => {
          dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
        })
        .catch((err) => console.error("Delete Error:", err));
    }
  };

  const handleSave = (formData) => {
    const mappedData = {
      vendor_name: formData.name,
      contact_person: formData.pointOfContact,
      phone_number: formData.phoneNumber,
      email: formData.email,
      address: formData.pickupDropPoint,
      tenant_id: tenantId,
      is_active: true,
    };

    if (selectedVendor) {
      dispatch(editVendor({ id: selectedVendor.vendor_id, vendorData: mappedData })).unwrap()
        .then(() => {
          dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
          dispatch(closeModal());
        })
        .catch((err) => console.error("Update Error:", err));
    } else {
      dispatch(addVendor(mappedData)).unwrap()
        .then(() => {
          dispatch(fetchVendors({ skip: 0, limit: 100, tenant_id: tenantId }));
          dispatch(closeModal());
        })
        .catch((err) => console.error("Add Error:", err));
    }
  };

  const headers = useMemo(() => [
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
  ], []);

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
            <button className="text-blue-600 hover:underline" onClick={() => handleEdit(row)}>Edit</button>
            <button className="text-red-600 hover:underline" onClick={() => handleDelete(row)}>Delete</button>
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
