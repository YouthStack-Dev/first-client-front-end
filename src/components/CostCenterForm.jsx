import React, { useState, useEffect } from "react";

const dropdownFields = [
  { label: "Contract", key: "contract", options: ["Default (Rest All)"] },
  { label: "Bill Cost Entity", key: "billCostEntity", options: ["TRIP"] },
  { label: "Distribution Level 1", key: "distributionLevel1", options: ["EMPLOYEE"] },
  { label: "Cost Logic", key: "costLogic", options: ["Cost Logic"] },
  { label: "Trip Adjustment Cost Logic", key: "tripAdjustmentCostLogic", options: ["Trip Adjustment Cost Logic"] },
  { label: "Day Adjustment Cost Logic", key: "dayAdjustmentCostLogic", options: ["Day Adjustment Cost Logic"] },
  { label: "Consider No Show Trip", key: "considerNoShowTrip", options: ["Consider No Show Trip"] },
  { label: "Consider No Show Employee", key: "considerNoShowEmployee", options: ["Consider No Show Employee"] },
  { label: "Consider Cancelled Employees", key: "considerCancelledEmployees", options: ["TRUE", "FALSE"] },
  { label: "Escort Charge Login", key: "escortChargeLogin", options: ["Escort Charge Login"] },
  { label: "Escort Charge Logout", key: "escortChargeLogout", options: ["Escort Charge Logout"] },
  { label: "Escort Cost No Show Login", key: "escortCostNoShowLogin", options: ["Escort Cost No Show Login"] },
  { label: "Escort Cost No Show Logout", key: "escortCostNoShowLogout", options: ["Escort Cost No Show Logout"] },
  { label: "Toll Cost", key: "tollCost", options: ["Toll Cost"] },
  { label: "State Tax", key: "stateTax", options: ["State Tax"] },
  { label: "Escort Distribution Logic", key: "escortDistributionLogic", options: ["Escort Distribution Logic"] },
  { label: "Overhead Cost Distribution", key: "overheadCostDistribution", options: ["Overhead Cost Distribution"] },
];

const CostCenterForm = ({ initialData = {}, onSave, onCancel }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    const safeData = initialData || {};
    const initialState = {};
    dropdownFields.forEach((field) => {
      initialState[field.key] = safeData[field.key] || field.options[0] || "";
    });
    setForm(initialState);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dropdownFields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <select
              name={field.key}
              value={form[field.key]}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded bg-white"
            >
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default CostCenterForm;
