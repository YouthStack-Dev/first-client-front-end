import React, { useState } from 'react';

const vehicleOptions = [
  { value: 'MH12AB1234', label: 'MH12AB1234' },
  { value: 'DL5CA5555', label: 'DL5CA5555' },
  { value: 'KA01CD7890', label: 'KA01CD7890' },
];

const contractOptions = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Adhoc', label: 'Adhoc' },
  { value: 'Fixed Route', label: 'Fixed Route' },
];

const VehicleContractModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    vehicleRegistration: '',
    vehicleDisplayId: '',
    startDate: '',
    office: 'ALL',
    dayType: 'ALL',
    tripType: 'DEFAULT',
    startTime: '00:00:00',
    endTime: '23:59:59',
    direction: 'BOTH',
    contract: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted contract:', form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Vehicle Contract</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-lg font-semibold"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block mb-1">Vehicle Registration</label>
            <select
              name="vehicleRegistration"
              value={form.vehicleRegistration}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Vehicle</option>
              {vehicleOptions.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Vehicle Display ID</label>
            <input
              type="text"
              name="vehicleDisplayId"
              value={form.vehicleDisplayId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Office</label>
            <select
              name="office"
              value={form.office}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="ALL">ALL</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Day Type</label>
            <select
              name="dayType"
              value={form.dayType}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="ALL">ALL</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Trip Type</label>
            <select
              name="tripType"
              value={form.tripType}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="DEFAULT">DEFAULT</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1">End Time</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Direction</label>
            <select
              name="direction"
              value={form.direction}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="BOTH">BOTH</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Contract</label>
            <select
              name="contract"
              value={form.contract}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select Contract</option>
              {contractOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default VehicleContractModal;
