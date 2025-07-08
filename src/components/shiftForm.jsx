import React from 'react';
import FormField from './FormField';

const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ShiftForm = ({
  shiftType, setShiftType,
  hours, setHours,
  minutes, setMinutes,
  waitingTime, setWaitingTime,
  pickOn, setPickOn,
  gender, setGender,
  femaleConstraint, setFemaleConstraint,
  office, setOffice,
  days = [], setDays,
  onCancel, onSave,
  errors = {}
}) => {
  const hourOptions = Array.from({ length: 13 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 12 }, (_, i) => i * 5);
  const waitingTimeOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const toggleDay = (day) => {
    if (days.includes(day)) {
      setDays(days.filter((d) => d !== day));
    } else {
      setDays([...days, day]);
    }
  };

  return (
    <>
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


      <FormField label="Days" name="days">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allDays.map((day) => (
            <label key={day} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={days.includes(day)}
                onChange={() => toggleDay(day)}
              />
              {day}
            </label>
          ))}
        </div>
      </FormField>


      <FormField label="Timings" name="timings" required error={errors.timings}>
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

      <FormField label="Female Constraints" name="femaleConstraint">
        <select
          value={femaleConstraint}
          onChange={(e) => setFemaleConstraint(e.target.value)}
          disabled={gender !== 'female'}
          className="w-full border px-3 py-2 rounded disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">Disable</option>
          <option value="first_last">First/Last Female</option>
          <option value="second_second_last">Second(Second Last Female)</option>
          <option value="any_female">Any Female</option>
        </select>
      </FormField>

      <FormField label="Office" name="office" error={errors.office}>
        <input
          type="text"
          placeholder="Enter office name"
          value={office}
          onChange={(e) => setOffice(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </FormField>

     

      <div className="flex justify-end gap-3 mt-4">
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
    </>
  );
};

export default ShiftForm;
