import React, { useState } from 'react';
import ShiftForm from '../components/shiftForm';
import PopupModal from '../components/PopupModal';
import DynamicTable from '../components/DynamicTable';
import { History } from 'lucide-react';

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
  { key: 'officeVisibility', label: 'Office Visibility' },
];

const shiftData = [
  {
    id: 1,
    shiftType: 'login',
    time: '00:00',
    pickOrDrop: 'Home',
    femaleConstraint: 'FIRST',
    genderVisibility: 'MALE,FEMALE',
    officeVisibility: 'STONEX',
  },
  {
    id: 2,
    shiftType: 'login',
    time: '09:30',
    pickOrDrop: 'Home',
    femaleConstraint: 'FIRST',
    genderVisibility: 'Not Available',
    officeVisibility: 'Not Available',
  },
  {
    id: 3,
    shiftType: 'logout',
    time: '00:30',
    pickOrDrop: 'Home',
    femaleConstraint: 'FIRST',
    genderVisibility: 'MALE,FEMALE',
    officeVisibility: 'STONEX',
  },
  {
    id: 4,
    shiftType: 'logout',
    time: '07:00',
    pickOrDrop: 'Home',
    femaleConstraint: 'DISABLED',
    genderVisibility: 'MALE,FEMALE',
    officeVisibility: 'Not Available',
  },
];

const ShiftManagement = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedShiftType, setSelectedShiftType] = useState('login');
  const [openMenuId, setOpenMenuId] = useState(null);

  const [formData, setFormData] = useState({
    shiftType: '',
    hours: '',
    minutes: '',
    avgSpeed: '',
    waitingTime: '',
    pickOn: '',
    gender: '',
    femaleConstraint: '',
    office: '',
  });

  const resetForm = () => {
    setFormData({
      shiftType: '',
      hours: '',
      minutes: '',
      avgSpeed: '',
      waitingTime: '',
      pickOn: '',
      gender: '',
      femaleConstraint: '',
      office: '',
    });
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
    console.log('Shift Data:', formData);
    setShowPopup(false);
    resetForm();
  };

  const handleEdit = (row) => {
    const [hours, minutes] = row.time.split(':');
    setFormData({
      shiftType: row.shiftType,
      hours,
      minutes,
      avgSpeed: '40',
      waitingTime: '5',
      pickOn: 'pickdrop',
      gender: 'any',
      femaleConstraint: row.femaleConstraint,
      office: 'stonex',
    });
    setShowPopup(true);
    setOpenMenuId(null);
  };

  const handleMenuToggle = (id) => {
    setOpenMenuId((prevId) => (prevId === id ? null : id));
  };

  const loginShifts = shiftData.filter((s) => s.shiftType === 'login');
  const logoutShifts = shiftData.filter((s) => s.shiftType === 'logout');

  return (
    <div className="w-full min-h-screen bg-gray-50 px-8 py-6">
      {/* Custom Button Row */}
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

      {/* Popup Modal */}
      {showPopup && (
        <PopupModal title="Add-on Shifts" onClose={handleCancel}>
          <ShiftForm
            {...formData}
            setShiftType={(val) => setFormData((prev) => ({ ...prev, shiftType: val }))}
            setHours={(val) => setFormData((prev) => ({ ...prev, hours: val }))}
            setMinutes={(val) => setFormData((prev) => ({ ...prev, minutes: val }))}
            setAvgSpeed={(val) => setFormData((prev) => ({ ...prev, avgSpeed: val }))}
            setWaitingTime={(val) => setFormData((prev) => ({ ...prev, waitingTime: val }))}
            setPickOn={(val) => setFormData((prev) => ({ ...prev, pickOn: val }))}
            setGender={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
            setFemaleConstraint={(val) => setFormData((prev) => ({ ...prev, femaleConstraint: val }))}
            setOffice={(val) => setFormData((prev) => ({ ...prev, office: val }))}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </PopupModal>
      )}

      {/* History Modal */}
      {showHistory && (
        <PopupModal title="Shift History" onClose={handleCancel}>
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

      {/* Shift Tabs */}
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

      {/* Dynamic Table */}
      <div className="mt-4 bg-white rounded-lg shadow p-4 overflow-auto">
        <DynamicTable
          headers={shiftHeaders}
          data={selectedShiftType === 'login' ? loginShifts : logoutShifts}
          menuOpen={openMenuId}
          onMenuToggle={handleMenuToggle}
          renderActions={(row) => (
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
              onClick={() => handleEdit(row)}
            >
              Edit
            </button>
          )}
        />
      </div>
    </div>
  );
};

export default ShiftManagement;




