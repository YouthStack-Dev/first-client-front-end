import React, { useState } from 'react';

const tabs = ['General Info', 'Garage Info', 'Pricing Info'];

const AddContractForm = ({ onSubmit = (data) => console.log("Submitted:", data), onCancel = () => console.log("Cancelled") }) => {
  const [formData, setFormData] = useState({
    name: '',
    autoCorrect: 'Disabled',
    autoAudit: false,
    garageCalculation: false,
    shortCode: '',
    numberOfDuties: '',
    allottedKmPerMonth: '',
    minHoursPerDay: '',
    packageCostPerMonth: '',
    extraDutyPricing: '',
    costPerKmAfterMinKm: '',
    costPerHourAfterMinHours: '',
    garageKmOnReportingOff: '',
    garageKmOnReportingTo: '',
    garageHoursPerDay: '',
    baseDieselPrice: '',
    mileage: '',
    seatingCapacity: '7 (SUV)',
    acPriceAdjustmentPerKm: '',
    minTripsPerMonth: '',
    dieselPriceWindow: '',
  });

  const [dieselWindows, setDieselWindows] = useState([
    { startDate: '', endDate: '', price: '' },
  ]);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('General Info');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, dieselWindows, comment });
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onCancel();
  };

  const addDieselWindow = () => {
    setDieselWindows([...dieselWindows, { startDate: '', endDate: '', price: '' }]);
  };

  const removeDieselWindow = (index) => {
    setDieselWindows(dieselWindows.filter((_, i) => i !== index));
  };

  const handleDieselWindowChange = (index, field, value) => {
    const updated = dieselWindows.map((window, i) =>
      i === index ? { ...window, [field]: value } : window
    );
    setDieselWindows(updated);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'General Info':
        return (
          <>
            <Input label="Contract Name *" name="name" value={formData.name} onChange={handleChange} />
            <Select label="Auto Correct" name="autoCorrect" value={formData.autoCorrect} onChange={handleChange} options={['Enabled', 'Disabled']} />
            <Checkbox label="Auto Audit" name="autoAudit" checked={formData.autoAudit} onChange={handleChange} />
            <Checkbox label="Garage Calculation" name="garageCalculation" checked={formData.garageCalculation} onChange={handleChange} />
            <Input label="Short Code *" name="shortCode" value={formData.shortCode} onChange={handleChange} />
            <Input label="Number of Duties *" name="numberOfDuties" value={formData.numberOfDuties} onChange={handleChange} />
            <Input label="Allotted KM per Month *" name="allottedKmPerMonth" value={formData.allottedKmPerMonth} onChange={handleChange} />
            <Input label="Minimum Hours per Day *" name="minHoursPerDay" value={formData.minHoursPerDay} onChange={handleChange} />
          </>
        );
      case 'Garage Info':
        return (
          <>
            <Input label="Garage KM on Reporting off the Duty *" name="garageKmOnReportingOff" value={formData.garageKmOnReportingOff} onChange={handleChange} />
            <Input label="Garage KM on Reporting to Duty *" name="garageKmOnReportingTo" value={formData.garageKmOnReportingTo} onChange={handleChange} />
            <Input label="Garage Hours Per Day *" name="garageHoursPerDay" value={formData.garageHoursPerDay} onChange={handleChange} />
          </>
        );
      case 'Pricing Info':
        return (
          <>
            <Input label="Package Cost Per Month *" name="packageCostPerMonth" value={formData.packageCostPerMonth} onChange={handleChange} />
            <Input label="Pricing for Extra Duty *" name="extraDutyPricing" value={formData.extraDutyPricing} onChange={handleChange} />
            <Input label="Cost Per KM after min KM (₹) *" name="costPerKmAfterMinKm" value={formData.costPerKmAfterMinKm} onChange={handleChange} />
            <Input label="Cost Per Hour after min hours per Day *" name="costPerHourAfterMinHours" value={formData.costPerHourAfterMinHours} onChange={handleChange} />
            <Input label="Base Diesel Price *" name="baseDieselPrice" value={formData.baseDieselPrice} onChange={handleChange} />
            <Input label="Mileage *" name="mileage" value={formData.mileage} onChange={handleChange} />
            <Select label="Seating Capacity *" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} options={['4', '5', '6', '7 (SUV)', '8+']} />
            <Input label="AC Price Adjustment Per KM *" name="acPriceAdjustmentPerKm" value={formData.acPriceAdjustmentPerKm} onChange={handleChange} />
            <Input label="Minimum Trips Per Month *" name="minTripsPerMonth" value={formData.minTripsPerMonth} onChange={handleChange} />
            <Input label="Diesel Price Window" name="dieselPriceWindow" value={formData.dieselPriceWindow} onChange={handleChange} />

            <div className="mt-6 col-span-2">
              <label className="block mb-2 font-semibold text-sm text-gray-700">Diesel Price Window</label>
              {dieselWindows.map((window, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input type="date" value={window.startDate} onChange={(e) => handleDieselWindowChange(index, 'startDate', e.target.value)} className="border px-2 py-1 rounded" />
                  <input type="date" value={window.endDate} onChange={(e) => handleDieselWindowChange(index, 'endDate', e.target.value)} className="border px-2 py-1 rounded" />
                  <input type="number" placeholder="Price" value={window.price} onChange={(e) => handleDieselWindowChange(index, 'price', e.target.value)} className="border px-2 py-1 rounded w-24" />
                  <button type="button" onClick={() => removeDieselWindow(index)} className="text-red-600 text-xl">❌</button>
                </div>
              ))}
              <button type="button" onClick={addDieselWindow} className="text-blue-600 text-sm underline mt-1">Add More Window</button>
            </div>

            <div className="col-span-2 flex justify-between mt-4">
              <div className="flex-1">
                <label className="block mb-1 font-medium text-sm text-gray-700">Comment</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" rows={3} />
              </div>
              <div className="pl-4 pt-6">
                <button type="button" onClick={() => console.log('Show history')} className="text-blue-600 underline text-sm">History</button>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Contract</h2>

      <div className="flex space-x-4 mb-6">
        {tabs.map(tab => (
          <button key={tab} type="button" className={`px-4 py-2 rounded-t ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderTabContent()}
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">
          Cancel
        </button>
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
          Add Contract
        </button>
      </div>
    </form>
  );
};

const Input = ({ label, name, value, onChange }) => (
  <div>
    <label className="block mb-1 font-medium text-sm text-gray-700">{label}</label>
    <input type="text" name={name} value={value} onChange={onChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
  </div>
);

const Checkbox = ({ label, name, checked, onChange }) => (
  <div className="flex items-center space-x-2 pt-2">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="accent-blue-600" />
    <label className="text-sm text-gray-700">{label}</label>
  </div>
);

const Select = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block mb-1 font-medium text-sm text-gray-700">{label}</label>
    <select name={name} value={value} onChange={onChange} className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default AddContractForm;
