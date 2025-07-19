// import { useState } from "react";
// import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute";
// import { Modal, InputField } from "../components/SmallComponents";
// import DynamicTable from "../components/DynamicTable";
// import { Edit, Trash2 } from "lucide-react";

// const ManageVehicleTypes = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [menuOpen, setMenuOpen] = useState(null);
//   const [editData, setEditData] = useState(null);

//   const initialFormData = {
//     vehicleTypeName: "",
//     description: "",
//     capacity: "",
//     fuelType: "",
//     comment: "",
//   };

//   const [formData, setFormData] = useState(initialFormData);
//   const fuelTypeOptions = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];

//   const formFields = [
//     {
//       label: "Vehicle Type Name *",
//       name: "vehicleTypeName",
//       type: "text",
//       placeholder: "Enter Vehicle Type Name",
//       required: true,
//     },
//     {
//       label: "Description",
//       name: "description",
//       type: "textarea",
//       placeholder: "Enter Description",
//       rows: 4,
//     },
//     {
//       label: "Capacity *",
//       name: "capacity",
//       type: "number",
//       placeholder: "Enter Capacity",
//       required: true,
//       min: 1,
//     },
//     {
//       label: "Fuel Type *",
//       name: "fuelType",
//       type: "select",
//       options: fuelTypeOptions,
//       required: true,
//     },
//     {
//       label: "Comment",
//       name: "comment",
//       type: "textarea",
//       placeholder: "Enter Comment",
//       rows: 3,
//     },
//   ];

//   const headers = [
//     { label: 'Vehicle Type Name', key: 'vehicleType', className: 'w-1/4' },
//     { label: 'Description', key: 'description', className: 'w-1/3' },
//     { label: 'Total Capacity', key: 'totalCap', className: 'w-1/6' },
//     { label: 'Fuel Type', key: 'fuleType', className: 'w-1/6' },
//   ];

//   const itemsPerPage = 5;
//   const totalPages = Math.ceil(sampleData.length / itemsPerPage);
//   const paginatedData = sampleData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   const onNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
//   const onPrev = () => currentPage > 1 && setCurrentPage(p => p - 1);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Form Submitted:", formData);
//     setIsModalOpen(false);
//     setFormData(initialFormData);
//     setEditData(null);
//   };

//   const handleEdit = (row) => {
//     setEditData(row);
//     setFormData({
//       vehicleTypeName: row.vehicleType,
//       description: row.description,
//       capacity: row.totalCap,
//       fuelType: row.fuleType,
//       comment: row.comment || "",
//     });
//     setIsModalOpen(true);
//   };

//   const handleDelete = (row) => {
//     console.log("Delete clicked for:", row);
//     // TODO: Add delete logic here
//   };

//   return (
//     <>
//       <HeaderWithActionNoRoute
//         title="Manage Vehicle Types"
//         buttonLabel="Add"
//         onButtonClick={() => {
//           setEditData(null);
//           setFormData(initialFormData);
//           setIsModalOpen(true);
//         }}
//       />

//       {/* Table Section */}
//       <div className="bg-white shadow rounded p-4 mt-4 overflow-auto max-h-[600px]">
//         <DynamicTable
//           headers={headers}
//           data={paginatedData}
//           menuOpen={menuOpen}
//           onMenuToggle={setMenuOpen}
//           onNext={onNext}
//           onPrev={onPrev}
//           currentPage={currentPage}
//           totalPages={totalPages}
//           renderActions={(row) => (
//             <div className="flex justify-center gap-2">
//               <button
//                 onClick={() => handleEdit(row)}
//                 className="text-blue-600 hover:underline text-sm flex items-center gap-1"
//               >
//                 <Edit size={16} />
//                 Edit
//               </button>
//               <button
//                 onClick={() => handleDelete(row)}
//                 className="text-red-600 hover:underline text-sm flex items-center gap-1"
//               >
//                 <Trash2 size={16} />
//                 Delete
//               </button>
//             </div>
//           )}
//         />
//       </div>

//       {/* Modal */}
//       <Modal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSubmit={handleSubmit}
//         title={editData ? "Edit Vehicle Type" : "Add Vehicle Type"}
//       >
//         <div className="space-y-4">
//           {formFields.map((field) => {
//             if (field.type === "textarea") {
//               return (
//                 <div key={field.name}>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     {field.label}
//                   </label>
//                   <textarea
//                     name={field.name}
//                     value={formData[field.name]}
//                     onChange={handleInputChange}
//                     placeholder={field.placeholder}
//                     rows={field.rows || 3}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   />
//                 </div>
//               );
//             }

//             return (
//               <InputField
//                 key={field.name}
//                 label={field.label}
//                 type={field.type}
//                 name={field.name}
//                 value={formData[field.name]}
//                 onChange={handleInputChange}
//                 placeholder={field.placeholder}
//                 option={field.options}
//                 required={field.required}
//                 min={field.min}
//               />
//             );
//           })}
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default ManageVehicleTypes;

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HeaderWithActionNoRoute from '../components/HeaderWithActionNoRoute';
import { Modal, InputField } from '../components/SmallComponents';
import DynamicTable from '../components/DynamicTable';
import { Edit, Trash2 } from 'lucide-react';
import {
  fetchVehicleTypes,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
} from '../redux/features/managevehicletype/vehicleTypeThunks';
import { setFormData, toggleModal, setEditingId, resetForm } from '../redux/features/managevehicletype/vehicleTypeSlice';

// ✅ Helper function to capitalize fuel_type for dropdown
const capitalizeFirst = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

const ManageVehicleTypes = () => {
  const dispatch = useDispatch();
  const { vehicleTypes, isModalOpen, formData, editingId } = useSelector((state) => state.vehicleType);
  const { user } = useSelector((state) => state.auth);

  const vendorId = user?.vendor_id || 1;

  useEffect(() => {
    if (vendorId && vehicleTypes.length === 0) {
      dispatch(fetchVehicleTypes(vendorId));
    }
  }, [vendorId, dispatch, vehicleTypes.length]);

  const headers = [
    { label: 'Vehicle Type Name', key: 'name', className: 'w-1/4' },
    { label: 'Description', key: 'description', className: 'w-1/3' },
    { label: 'Total Capacity', key: 'capacity', className: 'w-1/6' },
    { label: 'Fuel Type', key: 'fuel_type', className: 'w-1/6' },
  ];

  const formFields = [
    { label: 'Vehicle Type Name *', name: 'vehicle_type_name', type: 'text', required: true },
    { label: 'Description', name: 'description', type: 'textarea' },
    { label: 'Capacity *', name: 'capacity', type: 'number', required: true, min: 1 },
    { label: 'Fuel Type *', name: 'fuel_type', type: 'select', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'], required: true },
    { label: 'Comment', name: 'comment', type: 'textarea' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFormData({ ...formData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: formData.vehicle_type_name,
      description: formData.description,
      capacity: Number(formData.capacity),
      fuel_type: formData.fuel_type?.toLowerCase(),
      comment: formData.comment,
      vendor_id: vendorId,
    };
    if (editingId) {
      dispatch(updateVehicleType({ id: editingId, ...payload }));
    } else {
      dispatch(createVehicleType(payload));
    }
    dispatch(toggleModal(false));
    dispatch(resetForm());
  };

  const handleEdit = (row) => {
    dispatch(setEditingId(row.vehicle_type_id));
    dispatch(setFormData({
      vehicle_type_name: row.name,
      description: row.description,
      capacity: row.capacity,
      fuel_type: capitalizeFirst(row.fuel_type),
      comment: row.comment || '',
    }));
    dispatch(toggleModal(true));
  };

  const handleDelete = (row) => {
    if (window.confirm('Are you sure?')) {
      dispatch(deleteVehicleType(row.vehicle_type_id));
    }
  };

  return (
    <>
      <HeaderWithActionNoRoute
        title='Manage Vehicle Types'
        buttonLabel='Add'
        onButtonClick={() => {
          dispatch(resetForm());
          dispatch(toggleModal(true));
        }}
      />
      <div className='bg-white p-4 shadow rounded mt-4'>
        <DynamicTable
          headers={headers}
          data={vehicleTypes}
          menuOpen={null}
          onMenuToggle={() => {}}
          renderActions={(row) => (
            <div className='flex gap-2'>
              <button onClick={() => handleEdit(row)} className='text-blue-600 text-sm flex items-center gap-1'>
                <Edit size={16} /> Edit
              </button>
              <button onClick={() => handleDelete(row)} className='text-red-600 text-sm flex items-center gap-1'>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => dispatch(toggleModal(false))}
        onSubmit={handleSubmit}
        title={editingId ? 'Edit Vehicle Type' : 'Add Vehicle Type'}
      >
        <div className='space-y-4'>
          {formFields.map((field) => {
            if (field.type === 'textarea') {
              return (
                <div key={field.name}>
                  <label className='block text-sm font-medium mb-1'>{field.label}</label>
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className='w-full border rounded p-2'
                  />
                </div>
              );
            } else if (field.type === 'select') {
              return (
                <div key={field.name}>
                  <label className='block text-sm font-medium mb-1'>{field.label}</label>
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    required={field.required}
                    className='w-full border rounded p-2'
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            } else {
              return (
                <InputField
                  key={field.name}
                  {...field}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                />
              );
            }
          })}
        </div>
      </Modal>
    </>
  );
};

export default ManageVehicleTypes;

