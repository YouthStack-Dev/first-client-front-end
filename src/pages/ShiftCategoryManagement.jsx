import React, { useState } from "react";
import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute";
// Modal-related imports can be added when needed

const ShiftCategoryManagement = () => {
  const [category, setCategory] = useState("Default");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const shiftTypes = ["Morning", "Evening"];
  const shifts = ["A", "B", "C"];
  const cutoffTypes = ["ScheduleEdit", "ScheduleView"];

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      console.log("New Category Added:", newCategory);
      setCategory(newCategory);
      setNewCategory("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* ✅ Page Header */}
      <HeaderWithActionNoRoute
        title=""
        extraButtons={[
          {
            label: "History",
            variant: "gray",
            onClick: () => alert("Show history modal or page"),
          },
        ]}
      />

      {/* ✅ Side-by-Side Layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* ✅ Left Column: Shift Category */}
        <div className="bg-white rounded-lg shadow p-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Shift Category</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Category
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Select Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            >
              <option value="">Select</option>
              <option value="Default">Default</option>
              {/* Add dynamic categories if needed */}
            </select>
          </div>
        </div>

        {/* ✅ Right Column: Set Cut-Off Filters */}
        <div className="bg-white rounded-lg shadow p-4 flex-[2]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Set Cut-Off Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm block mb-1">Shift Type</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option>Select</option>
                {shiftTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm block mb-1">Shift</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option>Select</option>
                {shifts.map((shift) => (
                  <option key={shift}>{shift}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm block mb-1">Cutoff Type</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                {cutoffTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              className="text-sm text-blue-600 underline"
              onClick={() => alert("Show cutoff history")}
            >
              View Cut-Off History
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Info Text */}
      <div className="text-sm text-gray-600">
        Schedule Edit cutoff defines the number of hours before you can edit the schedule.
      </div>

      {/* ✅ Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Bulk Download
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Bulk Upload
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Click here for field Description
        </button>
      </div>

      {/* ✅ Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <h3 className="text-blue-600 font-semibold px-4 py-3 border-b">
          {category || "Default"}
        </h3>
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3">Shift Type</th>
              <th className="px-4 py-3">Shift Time</th>
              <th className="px-4 py-3">Available to Employee</th>
              <th className="px-4 py-3">Cut Off for Employee (hrs)</th>
              <th className="px-4 py-3">Available to SPOC</th>
              <th className="px-4 py-3">Cut Off for SPOC (hrs)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3">Monday</td>
              <td className="px-4 py-3">Morning</td>
              <td className="px-4 py-3">9 AM - 6 PM</td>
              <td className="px-4 py-3">Yes</td>
              <td className="px-4 py-3">4</td>
              <td className="px-4 py-3">Yes</td>
              <td className="px-4 py-3">3</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ✅ Save/Cancel */}
      <div className="flex justify-center gap-4">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Save
        </button>
        <button className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ShiftCategoryManagement;
