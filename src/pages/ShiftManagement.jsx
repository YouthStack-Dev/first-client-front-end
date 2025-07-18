// // ShiftManagement.jsx
// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import ShiftForm from '../components/ShiftForm';
// import PopupModal from '../components/PopupModal';
// import DynamicTable from '../components/DynamicTable';
// import { Trash2, Edit } from 'lucide-react';
// import { useModulePermission } from '../hooks/userModulePermission';
// import PermissionDenied from '../components/PermissionDenied';
// import {
//   fetchShiftsByLogType,
//   fetchAllShifts,
//   createShift,
//   updateShift,
//   deleteShiftById,
// } from '../redux/features/Shifts/shiftThunks';
// import { API_CLIENT } from "../Api/API_Client";

// const shiftHeaders = [
//   { key: 'shift_code', label: 'Shift Code' },
//   { key: 'log_type', label: 'Type' },
//   { key: 'shift_time', label: 'Time' },
//   { key: 'pickup_type', label: 'Pickup Type' },
//   { key: 'waiting_time_minutes', label: 'Waiting Time' },
//   { key: 'day', label: 'Day' },
// ];

// const TABS = [
//   { key: 'all', label: 'All Shifts' },
//   { key: 'login', label: 'Login Shifts' },
//   { key: 'logout', label: 'Logout Shifts' },
// ];

// const ShiftManagement = () => {
//   const dispatch = useDispatch();
//   const { canRead, canWrite, notFound } = useModulePermission('shift_management');
//   const { shifts } = useSelector((state) => state.shift);

//   const [activeTab, setActiveTab] = useState('all');
//   const [showPopup, setShowPopup] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [tenantList, setTenantList] = useState([]);
//   const [formData, setFormData] = useState({
//     shiftCode: '',
//     shiftType: '',
//     hours: '',
//     minutes: '',
//     days: [],
//     waitingTime: '',
//     pickOn: '',
//     gender: '',
//     isActive: true,
//     office: '',
//     femaleConstraint: '',
//   });

//   useEffect(() => {
//     if (!canRead) return;

//     if (activeTab === 'all') {
//       dispatch(fetchAllShifts());
//     } else {
//       dispatch(fetchShiftsByLogType(activeTab === 'login' ? 'in' : 'out'));
//     }
//   }, [dispatch, canRead, activeTab]);

//   // Optional: fetch tenant list if needed
//   // useEffect(() => {
//   //   API_CLIENT.get('/tenants/?skip=0&limit=10')
//   //     .then((res) => setTenantList(res.data))
//   //     .catch((err) => console.error('Error fetching tenants:', err));
//   // }, []);

//   if (notFound) return <PermissionDenied />;

//   const resetForm = () => {
//     setFormData({
//       shiftCode: '',
//       shiftType: '',
//       hours: '',
//       minutes: '',
//       days: [],
//       waitingTime: '',
//       pickOn: '',
//       gender: '',
//       isActive: true,
//       office: '',
//       femaleConstraint: '',
//     });
//     setEditId(null);
//   };

//   const handleAddShift = () => {
//     resetForm();
//     setShowPopup(true);
//   };

//   const handleSave = () => {
//     const selectedTenant = tenantList.find(t => t.tenant_name === formData.office);

//     const payload = {
//       shift_code: formData.shiftCode,
//       log_type: formData.shiftType === 'login' ? 'in' : 'out',
//       shift_time: `${formData.hours.padStart(2, '0')}:${formData.minutes.padStart(2, '0')}:00`,
//       day: formData.days.map((d) => d.toLowerCase()),
//       waiting_time_minutes: Number(formData.waitingTime),
//       pickup_type: formData.pickOn,
//       gender: formData.gender,
//       is_active: formData.isActive,
//       tenant_id: selectedTenant?.tenant_id || 1,
//     };

//     if (editId) {
//       dispatch(updateShift({ ...payload, id: editId }));
//     } else {
//       dispatch(createShift(payload));
//     }

//     setShowPopup(false);
//     resetForm();
//   };

//   const handleEdit = (shift) => {
//     const [hours, minutes] = shift.shift_time.split(':');
//     setFormData({
//       shiftCode: shift.shift_code,
//       shiftType: shift.log_type === 'in' ? 'login' : 'logout',
//       hours,
//       minutes,
//       days: Array.isArray(shift.day) ? shift.day : [shift.day],
//       waitingTime: shift.waiting_time_minutes.toString(),
//       pickOn: shift.pickup_type,
//       gender: shift.gender,
//       isActive: shift.is_active,
//       office: '',
//       femaleConstraint: '',
//     });
//     setEditId(shift.id);
//     setShowPopup(true);
//   };

//   const handleDelete = (shift) => {
//     if (window.confirm('Are you sure you want to delete this shift?')) {
//       dispatch(deleteShiftById(shift.id));
//     }
//   };

//   const expandedShiftData = shifts.flatMap((shift) => {
//     const days = Array.isArray(shift.day) ? shift.day : [shift.day];
//     return days.map((day) => ({
//       ...shift,
//       day: day.charAt(0).toUpperCase() + day.slice(1),
//     }));
//   });

//   return (
//     <div className="w-full min-h-screen bg-gray-50 px-8 py-6">
//       <div className="flex justify-between items-center mb-4">
//         <button
//           onClick={handleAddShift}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           + Add Shift
//         </button>
//       </div>

//       {/* Tabs */}
//       <div className="flex space-x-4 border-b mb-4">
//         {TABS.map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => setActiveTab(tab.key)}
//             className={`px-4 py-2 text-sm font-medium border-b-2 ${
//               activeTab === tab.key
//                 ? 'border-blue-600 text-blue-600'
//                 : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {showPopup && (
//         <PopupModal title="Shift Form" isOpen={true} onClose={() => setShowPopup(false)}>
//           <ShiftForm
//             {...formData}
//             tenantList={tenantList}
//             setShiftCode={(val) => setFormData((prev) => ({ ...prev, shiftCode: val }))}
//             setShiftType={(val) => setFormData((prev) => ({ ...prev, shiftType: val }))}
//             setHours={(val) => setFormData((prev) => ({ ...prev, hours: val }))}
//             setMinutes={(val) => setFormData((prev) => ({ ...prev, minutes: val }))}
//             setDays={(val) => setFormData((prev) => ({ ...prev, days: val }))}
//             setWaitingTime={(val) => setFormData((prev) => ({ ...prev, waitingTime: val }))}
//             setPickOn={(val) => setFormData((prev) => ({ ...prev, pickOn: val }))}
//             setGender={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
//             setFemaleConstraint={(val) => setFormData((prev) => ({ ...prev, femaleConstraint: val }))}
//             setOffice={(val) => setFormData((prev) => ({ ...prev, office: val }))}
//             setIsActive={(val) => setFormData((prev) => ({ ...prev, isActive: val }))}
//             onCancel={() => setShowPopup(false)}
//             onSave={handleSave}
//           />
//         </PopupModal>
//       )}

//       <div className="mt-4 bg-white rounded shadow p-4">
//         <DynamicTable
//           headers={shiftHeaders}
//           data={expandedShiftData}
//           onMenuToggle={() => {}}
//           renderActions={(row) => (
//             <div className="flex gap-2">
//               <button onClick={() => handleEdit(row)} className="text-blue-600 hover:underline">
//                 <Edit size={14} />
//               </button>
//               <button onClick={() => handleDelete(row)} className="text-red-600 hover:underline">
//                 <Trash2 size={14} />
//               </button>
//             </div>
//           )}
//         />
//       </div>
//     </div>
//   );
// };

// export default ShiftManagement;


// ShiftManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ShiftForm from '../components/shiftForm';
import PopupModal from '../components/PopupModal';
import DynamicTable from '../components/DynamicTable';
import { Trash2, Edit } from 'lucide-react';
import { useModulePermission } from '../hooks/userModulePermission';
import PermissionDenied from '../components/PermissionDenied';
import {
  fetchShiftsByLogType,
  fetchAllShifts,
  createShift,
  updateShift,
  deleteShiftById,
} from '../redux/features/Shifts/shiftThunks';
import { API_CLIENT } from "../Api/API_Client";

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const shiftHeaders = [
  { key: 'shift_code', label: 'Shift Code' },
  { key: 'log_type', label: 'Type' },
  { key: 'shift_time', label: 'Time' },
  { key: 'pickup_type', label: 'Pickup Type' },
  { key: 'waiting_time_minutes', label: 'Waiting Time' },
  ...DAYS.map(day => ({ key: day, label: day.charAt(0).toUpperCase() + day.slice(1) })),
];

const TABS = [
  { key: 'all', label: 'All Shifts' },
  { key: 'login', label: 'Login Shifts' },
  { key: 'logout', label: 'Logout Shifts' },
];

const ShiftManagement = () => {
  const dispatch = useDispatch();
  const { canRead, canWrite, notFound } = useModulePermission('shift_management');
  const { shifts } = useSelector((state) => state.shift);

  const [activeTab, setActiveTab] = useState('all');
  const [showPopup, setShowPopup] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tenantList, setTenantList] = useState([]);
  const [formData, setFormData] = useState({
    shiftCode: '',
    shiftType: '',
    hours: '',
    minutes: '',
    days: [],
    waitingTime: '',
    pickOn: '',
    gender: '',
    isActive: true,
    office: '',
    femaleConstraint: '',
  });

  useEffect(() => {
    if (!canRead) return;

    if (activeTab === 'all') {
      dispatch(fetchAllShifts());
    } else {
      dispatch(fetchShiftsByLogType(activeTab === 'login' ? 'in' : 'out'));
    }
  }, [dispatch, canRead, activeTab]);

  // Optional: fetch tenant list
  // useEffect(() => {
  //   API_CLIENT.get('/tenants/?skip=0&limit=10')
  //     .then((res) => setTenantList(res.data))
  //     .catch((err) => console.error('Error fetching tenants:', err));
  // }, []);

  if (notFound) return <PermissionDenied />;

  const resetForm = () => {
    setFormData({
      shiftCode: '',
      shiftType: '',
      hours: '',
      minutes: '',
      days: [],
      waitingTime: '',
      pickOn: '',
      gender: '',
      isActive: true,
      office: '',
      femaleConstraint: '',
    });
    setEditId(null);
  };

  const handleAddShift = () => {
    resetForm();
    setShowPopup(true);
  };

  const handleSave = () => {
    const selectedTenant = tenantList.find(t => t.tenant_name === formData.office);

    const payload = {
      shift_code: formData.shiftCode,
      log_type: formData.shiftType === 'login' ? 'in' : 'out',
      shift_time: `${formData.hours.padStart(2, '0')}:${formData.minutes.padStart(2, '0')}:00`,
      day: formData.days.map((d) => d.toLowerCase()),
      waiting_time_minutes: Number(formData.waitingTime),
      pickup_type: formData.pickOn,
      gender: formData.gender,
      is_active: formData.isActive,
      tenant_id: selectedTenant?.tenant_id || 1,
    };

    if (editId) {
      dispatch(updateShift({ ...payload, id: editId }));
    } else {
      dispatch(createShift(payload));
    }

    setShowPopup(false);
    resetForm();
  };

  const handleEdit = (shift) => {
    const [hours, minutes] = shift.shift_time.split(':');
    setFormData({
      shiftCode: shift.shift_code,
      shiftType: shift.log_type === 'in' ? 'login' : 'logout',
      hours,
      minutes,
      days: Array.isArray(shift.day) ? shift.day : [shift.day],
      waitingTime: shift.waiting_time_minutes.toString(),
      pickOn: shift.pickup_type,
      gender: shift.gender,
      isActive: shift.is_active,
      office: '',
      femaleConstraint: '',
    });
    setEditId(shift.id);
    setShowPopup(true);
  };

  const handleDelete = (shift) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      dispatch(deleteShiftById(shift.id));
    }
  };

  const transformedShifts = shifts.map((shift) => {
    const shiftDays = Array.isArray(shift.day) ? shift.day : [shift.day];
    const dayColumns = DAYS.reduce((acc, day) => {
      acc[day] = shiftDays.includes(day) ? '✅' : '';
      return acc;
    }, {});
    return {
      ...shift,
      ...dayColumns,
    };
  });

  return (
    <div className="w-full min-h-screen bg-gray-50 px-8 py-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleAddShift}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Shift
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showPopup && (
        <PopupModal title="Shift Form" isOpen={true} onClose={() => setShowPopup(false)}>
          <ShiftForm
            {...formData}
            tenantList={tenantList}
            setShiftCode={(val) => setFormData((prev) => ({ ...prev, shiftCode: val }))}
            setShiftType={(val) => setFormData((prev) => ({ ...prev, shiftType: val }))}
            setHours={(val) => setFormData((prev) => ({ ...prev, hours: val }))}
            setMinutes={(val) => setFormData((prev) => ({ ...prev, minutes: val }))}
            setDays={(val) => setFormData((prev) => ({ ...prev, days: val }))}
            setWaitingTime={(val) => setFormData((prev) => ({ ...prev, waitingTime: val }))}
            setPickOn={(val) => setFormData((prev) => ({ ...prev, pickOn: val }))}
            setGender={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
            setFemaleConstraint={(val) => setFormData((prev) => ({ ...prev, femaleConstraint: val }))}
            setOffice={(val) => setFormData((prev) => ({ ...prev, office: val }))}
            setIsActive={(val) => setFormData((prev) => ({ ...prev, isActive: val }))}
            onCancel={() => setShowPopup(false)}
            onSave={handleSave}
          />
        </PopupModal>
      )}

      <div className="mt-4 bg-white rounded shadow p-4 overflow-x-auto">
        <DynamicTable
          headers={shiftHeaders}
          data={transformedShifts}
          onMenuToggle={() => {}}
          renderActions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => handleEdit(row)} className="text-blue-600 hover:underline">
                <Edit size={14} />
              </button>
              <button onClick={() => handleDelete(row)} className="text-red-600 hover:underline">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default ShiftManagement;
