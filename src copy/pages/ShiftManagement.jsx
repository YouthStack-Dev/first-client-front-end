import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ShiftForm from '@components/shiftForm';
import PopupModal from '@components/PopupModal';
import DynamicTable from '@components/DynamicTable';
import ToolBar from '@components/ui/ToolBar';
import { Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchShiftsByLogType,
  fetchAllShifts,
  createShift,
  updateShift,
  deleteShiftById,
} from '../redux/features/Shifts/shiftThunks';
import {
  setEditingShift,
  clearEditingShift,
  openModal,
  closeModal,
  selectShifts,
  selectEditingShift,
  selectShiftModalOpen,
} from '../redux/features/Shifts/shiftSlice';

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

const initialForm = {
  shiftCode: '',
  shiftType: '',
  hours: '',
  minutes: '',
  days: [],
  waitingTime: '',
  pickOn: '',
  gender: '',
  isActive: true,
};

// ✅ Helper function to map a shift to formData
const mapShiftToForm = (shift) => {
  const [hours, minutes] = shift.shift_time.split(':');
  return {
    shiftCode: shift.shift_code,
    shiftType: shift.log_type === 'in' ? 'login' : 'logout',
    hours,
    minutes,
    days: Array.isArray(shift.day) ? shift.day : [shift.day],
    waitingTime: shift.waiting_time_minutes.toString(),
    pickOn: shift.pickup_type,
    gender: shift.gender,
    isActive: shift.is_active,
  };
};

const ShiftManagement = () => {
  const dispatch = useDispatch();
  const shifts = useSelector(selectShifts);
  const editingShift = useSelector(selectEditingShift);
  const isModalOpen = useSelector(selectShiftModalOpen);

  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState(initialForm);

  // 🔄 Load shifts on mount or tab change
  useEffect(() => {
    if (shifts.length === 0) {
      if (activeTab === 'all') dispatch(fetchAllShifts());
      else if (activeTab === 'login') dispatch(fetchShiftsByLogType('in'));
      else if (activeTab === 'logout') dispatch(fetchShiftsByLogType('out'));
    }
  }, [dispatch, activeTab, shifts.length]);

  // 📝 Prefill form when editingShift changes
  useEffect(() => {
    if (editingShift) setFormData(mapShiftToForm(editingShift));
    else setFormData(initialForm);
  }, [editingShift]);

  const handleAddShift = () => {
    dispatch(clearEditingShift());
    dispatch(openModal());
  };

  const handleSave = () => {
    const logTypeMap = { login: "in", logout: "out" };
    const payload = {
      shift_code: formData.shiftCode,
      log_type: logTypeMap[formData.shiftType] || formData.shiftType,
      shift_time: `${String(formData.hours).padStart(2, "0")}:${String(formData.minutes).padStart(2, "0")}:00`,
      day: (formData.days || []).map(d => d.toLowerCase()),
      waiting_time_minutes: Number(formData.waitingTime),
      pickup_type: formData.pickOn,
      gender: formData.gender,
      is_active: formData.isActive,
    };

    const action = editingShift
      ? updateShift({ ...payload, id: editingShift.id })
      : createShift(payload);

    dispatch(action)
      .unwrap()
      .then(() => {
        toast.success(`Shift "${formData.shiftCode}" ${editingShift ? 'updated' : 'added'} successfully`);
        dispatch(closeModal()); // ✅ close only on success
      })
      .catch(() => toast.error(`Failed to ${editingShift ? 'update' : 'add'} shift`));
  };

  const handleEdit = (shift) => {
    dispatch(setEditingShift(shift));
  };

  const handleDelete = (shift) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      dispatch(deleteShiftById(shift.id))
        .unwrap()
        .then(() => toast.success(`Shift "${shift.shift_code}" deleted successfully`))
        .catch(() => toast.error('Failed to delete shift'));
    }
  };

  const transformedShifts = shifts
    .filter(shift => {
      if (activeTab === 'login') return shift.log_type === 'in';
      if (activeTab === 'logout') return shift.log_type === 'out';
      return true;
    })
    .map(shift => {
      const shiftDays = Array.isArray(shift.day) ? shift.day : [shift.day];
      const dayColumns = DAYS.reduce((acc, day) => {
        acc[day] = shiftDays.includes(day) ? '✅' : '';
        return acc;
      }, {});
      return { ...shift, ...dayColumns };
    });

  return (
    <div className="w-full min-h-screen bg-gray-50 px-8 py-6">
      <ToolBar
        title="Shift Management"
        onAddClick={handleAddShift}
        addButtonLabel="Add Shift"
        addButtonIcon={<Plus size={16} />}
      />

      <div className="flex space-x-4 border-b mb-6 mt-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isModalOpen && (
        <PopupModal title="Shift Form" isOpen={true} onClose={() => dispatch(closeModal())}>
          <ShiftForm
            formData={formData}
            setFormData={setFormData}
            onCancel={() => dispatch(closeModal())}
            onSave={handleSave}
          />
        </PopupModal>
      )}

      <div className="mt-4 bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <DynamicTable
            headers={shiftHeaders}
            data={transformedShifts}
            onMenuToggle={() => {}}
            renderActions={(row) => (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleEdit(row)}
                  className="p-2 rounded-full hover:bg-blue-50 text-blue-600"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(row)}
                  className="p-2 rounded-full hover:bg-red-50 text-red-600"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ShiftManagement;
