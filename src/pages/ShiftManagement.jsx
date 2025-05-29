import React, { useState } from 'react';

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([
    {
      shiftName: '',
      startTime: '',
      endTime: '',
      cutoffs: {
        booking: '',
        adhoc: '',
        noShow: '',
        cancel: '',
        add: '',
      },
    },
  ]);

  const handleInputChange = (index, field, value) => {
    const updatedShifts = [...shifts];
    updatedShifts[index][field] = value;
    setShifts(updatedShifts);
  };

  const handleCutoffChange = (index, type, value) => {
    const updatedShifts = [...shifts];
    updatedShifts[index].cutoffs[type] = value;
    setShifts(updatedShifts);
  };

  const addShift = () => {
    setShifts([
      ...shifts,
      {
        shiftName: '',
        startTime: '',
        endTime: '',
        cutoffs: {
          booking: '',
          adhoc: '',
          noShow: '',
          cancel: '',
          add: '',
        },
      },
    ]);
  };

  const saveShifts = () => {
    console.log('Saving shifts:', shifts);
    // Send to backend
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Shift Management</h2>

      {shifts.map((shift, index) => (
        <div
          key={index}
          className="border p-4 mb-4 rounded-lg shadow-sm bg-white"
        >
          <div className="mb-3">
            <label className="block font-medium">Shift Name</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded mt-1"
              value={shift.shiftName}
              onChange={(e) =>
                handleInputChange(index, 'shiftName', e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block font-medium">Start Time</label>
              <input
                type="time"
                className="w-full border px-3 py-2 rounded mt-1"
                value={shift.startTime}
                onChange={(e) =>
                  handleInputChange(index, 'startTime', e.target.value)
                }
              />
            </div>
            <div>
              <label className="block font-medium">End Time</label>
              <input
                type="time"
                className="w-full border px-3 py-2 rounded mt-1"
                value={shift.endTime}
                onChange={(e) =>
                  handleInputChange(index, 'endTime', e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['booking', 'adhoc', 'noShow', 'cancel', 'add'].map((type) => (
              <div key={type}>
                <label className="block font-medium capitalize">
                  {type} Cutoff (mins before)
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border px-3 py-2 rounded mt-1"
                  value={shift.cutoffs[type]}
                  onChange={(e) =>
                    handleCutoffChange(index, type, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-4">
        <button
          onClick={addShift}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Shift
        </button>
        <button
          onClick={saveShifts}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save Shifts
        </button>
      </div>
    </div>
  );
};

export default ShiftManagement;
