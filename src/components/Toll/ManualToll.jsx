import React, { useState } from "react";
import { Download, Upload, Plus, CalendarDays } from "lucide-react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import DynamicTable from "../DynamicTable";
import PopupModal from "../PopupModal";
import ManualTollForm from "../toll/ManualTollForm";

const ManualToll = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [data, setData] = useState([]);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const formattedRange = `${format(dateRange[0].startDate, "dd/MM/yyyy")} - ${format(
    dateRange[0].endDate,
    "dd/MM/yyyy"
  )}`;

  const headers = [
    { label: "Toll Name", key: "tollName" },
    { label: "Date", key: "date" },
    { label: "Entity Type", key: "entityType" },
    { label: "Entity ID", key: "entityId" },
    { label: "Amount", key: "amount" },
  ];

  const handleSave = (formData) => {
    if (editingRow) {
      setData((prev) =>
        prev.map((item) => (item.id === editingRow.id ? { ...item, ...formData } : item))
      );
    } else {
      setData((prev) => [...prev, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
    setEditingRow(null);
  };

  const handleEdit = (item) => {
    setEditingRow(item);
    setShowModal(true);
  };

  const handleDelete = (item) => {
    if (confirm("Are you sure you want to delete this toll?")) {
      setData((prev) => prev.filter((d) => d.id !== item.id));
    }
  };

  const handleHistory = (item) => {
    alert(`Show history for Toll ID: ${item.id}`);
  };

  return (
    <div className="space-y-4 relative">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div
              onClick={() => setShowCalendar((prev) => !prev)}
              className="flex items-center border rounded px-2 py-1 text-sm bg-white cursor-pointer w-[220px]"
            >
              <span>{formattedRange}</span>
              <CalendarDays size={16} className="ml-2 text-gray-500" />
            </div>
            {showCalendar && (
              <div className="absolute z-10 mt-2">
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) => setDateRange([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={dateRange}
                  rangeColors={["#2563eb"]}
                />
              </div>
            )}
          </div>

          <label className="text-sm flex items-center gap-2">
            Show Inactive:
            <input
              type="checkbox"
              checked={showInactive}
              onChange={() => setShowInactive(!showInactive)}
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <Download size={16} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Upload size={16} />
          </button>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
            onClick={() => {
              setEditingRow(null);
              setShowModal(true);
            }}
          >
            <Plus size={14} /> ADD
          </button>
        </div>
      </div>

      {/* Table */}
      <DynamicTable
        headers={headers}
        data={data}
        selectedItems={selectedItems}
        onSelectItem={(item, checked) =>
          setSelectedItems((prev) =>
            checked ? [...prev, item] : prev.filter((i) => i.id !== item.id)
          )
        }
        onNext={() => {}}
        onPrev={() => {}}
        currentPage={1}
        totalPages={1}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onHistory={handleHistory}
      />

      {/* Modal */}
      {showModal && (
        <PopupModal
          title={editingRow ? "Edit Manual Toll" : "Add Manual Toll"}
          onClose={() => {
            setShowModal(false);
            setEditingRow(null);
          }}
          size="sm"
        >
          <ManualTollForm
            initialData={editingRow}
            onSave={handleSave}
            onClose={() => {
              setShowModal(false);
              setEditingRow(null);
            }}
          />
        </PopupModal>
      )}
    </div>
  );
};

export default ManualToll;
