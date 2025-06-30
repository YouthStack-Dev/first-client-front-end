import React, { useState } from "react";
import { Plus } from "lucide-react";
import PopupModal from "../components/PopupModal";
import AdjustmentPenaltyForm from "../components/AdjustmentPenaltyForm";
import DynamicTable from "../components/DynamicTable";
import HeaderWithActionNoRoute from "../components/HeaderWithActionNoRoute";

const AdjustmentPenalty = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingData, setEditingData] = useState(null);

  const headers = [
    { label: "Date", key: "dutyDate" },
    { label: "Type", key: "adjustmentType" },
    { label: "Amount", key: "amount" },
    { label: "Reason", key: "comment" },
  ];

  const [data, setData] = useState([
    {
      id: 1,
      entityType: "VEHICLE",
      vehicleId: "V001",
      dutyDate: "2025-06-23",
      adjustmentType: "Toll",
      amount: "100",
      comment: "Adjustment for delay",
    },
    {
      id: 2,
      entityType: "TRIP",
      vehicleId: "V002",
      dutyDate: "2025-06-22",
      adjustmentType: "Delay",
      amount: "150",
      comment: "Late trip",
    },
  ]);

  const handleEdit = (item) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setData((prev) => prev.filter((d) => d.id !== item.id));
    }
  };

  const handleHistory = (item) => {
    alert(`Show history for ${item.vehicleId || item.id}`);
  };

  const handleFormSave = (updatedItem) => {
    if (editingData) {
      setData((prev) =>
        prev.map((d) => (d.id === updatedItem.id ? updatedItem : d))
      );
    } else {
      setData((prev) => [...prev, { ...updatedItem, id: Date.now() }]);
    }
    setIsModalOpen(false);
    setEditingData(null);
  };

  return (
    <div className="space-y-4">
      {/* Page Title Header */}
      <HeaderWithActionNoRoute title="Adjustment / Penalty" />

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingData(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={16} /> Add Adjustment / Penalty
        </button>
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
      {isModalOpen && (
        <PopupModal
          title={
            editingData ? "Edit Adjustment / Penalty" : "Add Adjustment / Penalty"
          }
          onClose={() => {
            setIsModalOpen(false);
            setEditingData(null);
          }}
        >
          <AdjustmentPenaltyForm
            onClose={() => {
              setIsModalOpen(false);
              setEditingData(null);
            }}
            initialData={editingData}
            onSave={handleFormSave}
          />
        </PopupModal>
      )}
    </div>
  );
};

export default AdjustmentPenalty;
