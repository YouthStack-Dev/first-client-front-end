import React, { useState } from 'react';
import ShiftForm from '../components/ShiftForm';
import PopupModal from '../components/PopupModal';
import DynamicTable from '../components/DynamicTable';
import { History, Trash2, Edit } from 'lucide-react';
import { useModulePermission } from '../hooks/userModulePermission';
import PermissionDenied from '../components/PermissionDenied';

const DUMMY_HISTORY = [
  {
    id: 1,
    timestamp: '04/11/2024 18:30',
    user: 'basavaraju@mltcorporate.com',
    reason: 'NA',
    details: 'Logout Shift added at 04:30',
  },
  {
    id: 2,
    timestamp: '28/08/2024 12:00',
    user: 'basavaraju@mltcorporate.com',
    reason: 'NA',
    details: 'Female Constraints changed from "SECOND" to "FIRST" For Login Shift 21:00',
  },
  {
    id: 3,
    timestamp: '28/08/2024 11:58',
    user: 'darshan@moveinsync.com',
    reason: 'by darshan@moveinsync.com',
    details: 'For Logout Shift 23:00',
  },
];

const shiftHeaders = [
  { key: 'shiftType', label: 'Shift Type' },
  { key: 'time', label: 'Time' },
  { key: 'pickOrDrop', label: 'Pick/Drop' },
  { key: 'femaleConstraint', label: 'Female Constraint' },
  { key: 'genderVisibility', label: 'Gender Visibility' },
  { key: 'days', label: 'Days' },
];

const initialShiftData = [];

const ShiftManagement = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedShiftType, setSelectedShiftType] = useState('login');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [shiftList, setShiftList] = useState(initialShiftData);
  const [editId, setEditId] = useState(null);

  const { notFound } = useModulePermission('vehicles');
  if (notFound) return <PermissionDenied />;

  const [formData, setFormData] = useState({
    shiftType: '',
    hours: '',
    minutes: '',
    waitingTime: '',
    pickOn: 'pickdrop', // default
    gender: '',
    femaleConstraint: '',
    days: [],
  });

  const resetForm = () => {
    setFormData({
      shiftType: '',
      hours: '',
      minutes: '',
      waitingTime: '',
      pickOn: 'pickdrop',
      gender: '',
      femaleConstraint: '',
      days: [],
    });
    setEditId(null);
  };

  const handleAddShift = () => {
    resetForm();
    setShowPopup(true);
  };

  const handleCancel = () => {
    setShowPopup(false);
    setShowHistory(false);
    setOpenMenuId(null);
    resetForm();
  };

  const handleSave = () => {
    const newShift = {
      id: editId || Date.now(),
      shiftType: formData.shiftType,
      time: `${formData.hours.padStart(2, '0')}:${formData.minutes.padStart(2, '0')}`,
      pickOrDrop: formData.pickOn === 'pickdrop' ? 'Home' : 'Nodal',
      femaleConstraint: formData.femaleConstraint || 'DISABLED',
      genderVisibility: formData.gender || 'Not Available',
      days: formData.days.join(', '),
    };

    if (editId) {
      setShiftList((prev) =>
        prev.map((shift) => (shift.id === editId ? newShift : shift))
      );
    } else {
      setShiftList((prev) => [...prev, newShift]);
    }

    setShowPopup(false);
    resetForm();
  };

  const handleEdit = (row) => {
    const [hours, minutes] = row.time.split(':');
    setFormData({
      shiftType: row.shiftType,
      hours,
      minutes,
      waitingTime: '5',
      pickOn: row.pickOrDrop.toLowerCase() === 'home' ? 'pickdrop' : 'nodal',
      gender: row.genderVisibility.includes(',') ? 'any' : row.genderVisibility.toLowerCase(),
      femaleConstraint: row.femaleConstraint,
      days: row.days.split(',').map((d) => d.trim()),
    });
    setEditId(row.id);
    setShowPopup(true);
    setOpenMenuId(null);
  };

  const handleDelete = (row) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      setShiftList((prev) => prev.filter((item) => item.id !== row.id));
    }
  };

  const handleMenuToggle = (id) => {
    setOpenMenuId((prevId) => (prevId === id ? null : id));
  };

  const loginShifts = shiftList.filter((s) => s.shiftType === 'login');
  const logoutShifts = shiftList.filter((s) => s.shiftType === 'logout');

  return (
    <div className="w-full min-h-screen bg-gray-50 px-8 py-6">
      {/* Top Buttons */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleAddShift}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Add Shifts
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition"
        >
          <History size={18} />
          History
        </button>
      </div>

      {/* Modal: Add/Edit Shift */}
      {showPopup && (
        <PopupModal title="Add-on Shifts" onClose={handleCancel} isOpen={true}>
          <ShiftForm
            shiftType={formData.shiftType}
            setShiftType={(val) => setFormData((prev) => ({ ...prev, shiftType: val }))}
            hours={formData.hours}
            setHours={(val) => setFormData((prev) => ({ ...prev, hours: val }))}
            minutes={formData.minutes}
            setMinutes={(val) => setFormData((prev) => ({ ...prev, minutes: val }))}
            waitingTime={formData.waitingTime}
            setWaitingTime={(val) => setFormData((prev) => ({ ...prev, waitingTime: val }))}
            pickOn={formData.pickOn}
            setPickOn={(val) => setFormData((prev) => ({ ...prev, pickOn: val }))}
            gender={formData.gender}
            setGender={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
            femaleConstraint={formData.femaleConstraint}
            setFemaleConstraint={(val) => setFormData((prev) => ({ ...prev, femaleConstraint: val }))}
            days={formData.days}
            setDays={(val) => setFormData((prev) => ({ ...prev, days: val }))}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </PopupModal>
      )}

      {/* Modal: History */}
      {showHistory && (
        <PopupModal title="Shift History" onClose={handleCancel} isOpen={true}>
          <div className="max-h-[400px] overflow-y-auto text-sm space-y-3">
            {DUMMY_HISTORY.map((item) => (
              <div key={item.id} className="bg-gray-100 p-2 rounded border text-gray-800">
                <p>
                  <strong>Edited on {item.timestamp}</strong> by{' '}
                  <span className="text-blue-600">{item.user}</span>
                </p>
                <p>Reason: <em>{item.reason}</em></p>
                <p>{item.details}</p>
              </div>
            ))}
          </div>
        </PopupModal>
      )}

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-300 flex gap-4">
        {['login', 'logout'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedShiftType(type)}
            className={`px-6 py-2 -mb-px border-b-2 font-medium ${
              selectedShiftType === type
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
          >
            {type === 'login' ? 'Login Shifts' : 'Logout Shifts'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-4 bg-white rounded-lg shadow p-4 overflow-auto">
        <DynamicTable
          headers={shiftHeaders}
          data={selectedShiftType === 'login' ? loginShifts : logoutShifts}
          menuOpen={openMenuId}
          onMenuToggle={handleMenuToggle}
          renderActions={(row) => (
            <div className="flex gap-2 justify-center">
              <button
                className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                onClick={() => handleEdit(row)}
              >
                <Edit size={14} /> Edit
              </button>
              <button
                className="flex items-center gap-1 text-red-600 hover:underline text-sm"
                onClick={() => handleDelete(row)}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default ShiftManagement;
