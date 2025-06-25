import React, { useState } from "react";
import DynamicTable from "../components/DynamicTable";
import PopupModal from "../components/PopupModal";
import CostCenterForm from "../components/CostCenterForm"; // this is the actual form

const CostCenter = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [data, setData] = useState([
    { id: 1, name: "IT", region: "South", status: "Active" },
    { id: 2, name: "HR", region: "North", status: "Inactive" },
  ]);

  const headers = [
    { label: "Name", key: "name", className: "w-1/3 px-4 py-3" },
    { label: "Region", key: "region", className: "w-1/3 px-4 py-3" },
    { label: "Status", key: "status", className: "w-1/3 text-center px-4 py-3" },
  ];

  const handleSelectItem = (item, checked) => {
    setSelectedItems((prev) =>
      checked ? [...prev, item] : prev.filter((i) => i.id !== item.id)
    );
  };

  const handleMenuToggle = (id) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  const handleDelete = (id) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEdit = (item) => {
    setEditData(item);
    setModalOpen(true);
    setMenuOpen(null);
  };

  const handleSave = (formData) => {
    if (editData) {
      setData((prev) =>
        prev.map((item) => (item.id === editData.id ? { ...item, ...formData } : item))
      );
    } else {
      setData((prev) => [...prev, { id: Date.now(), ...formData }]);
    }
    setModalOpen(false);
    setEditData(null);
  };

  return (
    <div className="w-full px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Cost Center Overview</h2>
        <button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add
        </button>
      </div>

      <div className="rounded-lg overflow-hidden shadow ring-1 ring-gray-200">
        <DynamicTable
          headers={headers}
          data={data}
          menuOpen={menuOpen}
          onMenuToggle={handleMenuToggle}
          onSelectItem={handleSelectItem}
          selectedItems={selectedItems}
          onNext={() => {}}
          onPrev={() => {}}
          currentPage={1}
          totalPages={1}
          renderActions={(item) => (
            <div className="flex flex-col space-y-1">
              <button
                className="text-blue-600 hover:underline text-sm"
                onClick={() => handleEdit(item)}
              >
                Edit
              </button>
              <button
                className="text-red-600 hover:underline text-sm"
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </button>
            </div>
          )}
        />
      </div>

      {modalOpen && (
  <PopupModal
    isOpen={modalOpen}
    onClose={() => setModalOpen(false)}
    size="xl" // 👈 This line makes the modal wider
  >
        <CostCenterForm
        initialData={editData}
        onSave={handleSave}
        onCancel={() => setModalOpen(false)}
        />
    </PopupModal>
    )}
    </div>
  );
};

export default CostCenter;
