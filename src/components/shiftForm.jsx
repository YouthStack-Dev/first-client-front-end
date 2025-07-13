// src/components/ShiftForm.jsx
import React from 'react';
import FormField from './FormField';

const ShiftForm = ({
  shiftCode, setShiftCode,
  shiftType, setShiftType,
  hours, setHours,
  minutes, setMinutes,
  days, setDays,
  avgSpeed, setAvgSpeed,
  waitingTime, setWaitingTime,
  pickOn, setPickOn,
  gender, setGender,
  femaleConstraint, setFemaleConstraint,
  office, setOffice,
  isActive, setIsActive,
  onCancel, onSave,
  errors = {}
}) => {
  const hourOptions = Array.from({ length: 13 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);
  const waitingTimeOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  const dayOptions = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const toggleDay = (day) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Shift Code" name="shiftCode" required error={errors.shiftCode}>
          <input
            type="text"
            placeholder="Enter shift code"
            className="w-full border px-3 py-2 rounded"
            value={shiftCode}
            onChange={(e) => setShiftCode(e.target.value)}
          />
        </FormField>

        <FormField label="Shift Type" name="shiftType" required error={errors.shiftType}>
          <select
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Type</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
        </FormField>

        <FormField label="Shift Time" name="timings" required error={errors.timings}>
          <div className="flex gap-4">
            <select
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-1/2 border px-3 py-2 rounded"
            >
              <option value="">Hours</option>
              {hourOptions.map((hr) => (
                <option key={hr} value={hr}>{hr} hr</option>
              ))}
            </select>
            <select
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-1/2 border px-3 py-2 rounded"
            >
              <option value="">Minutes</option>
              {minuteOptions.map((min) => (
                <option key={min} value={min}>{min} min</option>
              ))}
            </select>
          </div>
        </FormField>

        <FormField label="Days" name="days" required error={errors.days}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dayOptions.map((day) => (
              <label key={day} className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={day}
                  checked={days.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="capitalize text-sm">{day}</span>
              </label>
            ))}
          </div>
        </FormField>

        <FormField label="Waiting Time (mins)" name="waitingTime" required error={errors.waitingTime}>
          <select
            value={waitingTime}
            onChange={(e) => setWaitingTime(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Waiting Time</option>
            {waitingTimeOptions.map((min) => (
              <option key={min} value={min}>{min} min</option>
            ))}
          </select>
        </FormField>

        <FormField label="Pick On" name="pickOn" required error={errors.pickOn}>
          <select
            value={pickOn}
            onChange={(e) => setPickOn(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select</option>
            <option value="nodal">Nodal Point</option>
            <option value="pickdrop">Pick/Drop Point</option>
            <option value="pickup">Pickup</option>
            <option value="drop">Drop</option>
          </select>
        </FormField>

        <FormField label="Gender" name="gender" required error={errors.gender}>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="any">Any</option>
          </select>
        </FormField>

        {/* <FormField label="Office" name="office" error={errors.office}>
          <select
            value={office}
            onChange={(e) => setOffice(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Office</option>
            <option value="stonex">Stonex</option>
          </select>
        </FormField> */}

        <FormField label="Status" name="isActive">
          <label className="inline-flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="form-checkbox h-5 w-5 text-green-600"
            />
            <span className="text-sm text-gray-700">
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </label>
        </FormField>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ShiftForm;
