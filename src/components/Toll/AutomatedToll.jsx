import React, { useState } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { CalendarDays, Download } from "lucide-react";
import DynamicTable from "../DynamicTable";
import PopupModal from "../PopupModal";
// import ManualTollForm from "../Toll/ManualTollForm";

const AutomatedToll = () => {
  const [tripId, setTripId] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [data, setData] = useState([]);

  const formattedRange = `${format(dateRange[0].startDate, "dd/MM/yyyy")} - ${format(
    dateRange[0].endDate,
    "dd/MM/yyyy"
  )}`;

  const headers = [
    { label: "Toll Name", key: "tollName" },
    { label: "Trip ID", key: "tripId" },
    { label: "Approval Status", key: "approvalStatus" },
    { label: "Toll Date", key: "tollDate" },
  ];

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

  const handleSave = (formData) => {
    if (editingRow) {
      setData((prev) =>
        prev.map((item) =>
          item.id === editingRow.id ? { ...item, ...formData } : item
        )
      );
    } else {
      setData((prev) => [...prev, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
    setEditingRow(null);
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
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

          {/* Trip ID Input */}
          <input
            type="text"
            placeholder="Trip ID"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          />
        </div>

        {/* Right-side Buttons */}
        <div className="flex items-center gap-2">
          <button title="Download" className="p-2 rounded hover:bg-gray-100">
            <Download size={16} className="text-blue-600" />
          </button>
          <button className="border px-3 py-1 rounded bg-white text-blue-600">
            Disapprove
          </button>
          <button className="border px-3 py-1 rounded bg-blue-600 text-white">
            Approve
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
        onNext={() => console.log("Next")}
        onPrev={() => console.log("Prev")}
        currentPage={1}
        totalPages={1}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onHistory={handleHistory}
      />

      {/* Modal */}
      {showModal && (
        <PopupModal
          title={editingRow ? "Edit Toll" : "Add Toll"}
          onClose={() => {
            setShowModal(false);
            setEditingRow(null);
          }}
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

export default AutomatedToll;
