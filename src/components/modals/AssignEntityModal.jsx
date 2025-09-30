import React, { useState, useEffect } from "react";
import { X, Truck, Building2 } from "lucide-react";

const AssignEntityModal = ({
  isOpen,
  onClose,
  sourceEntity,      
  targetEntities = [], 
  assignedIds = [],   
  onSave
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected(assignedIds || []);
  }, [assignedIds]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Show only entities that match the search term
  const filteredList = search
    ? targetEntities.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (!isOpen) return null;

  const assignLabel =
    sourceEntity?.type === "vendor"
      ? "Assign Companies to Vendor"
      : "Assign Vendors to Company";

  const targetLabel =
    sourceEntity?.type === "vendor" ? "Companies" : "Vendors";

  // Determine icon based on type
  const getIcon = () => {
    if (sourceEntity?.type === "vendor") return Building2; // assigning companies
    return Truck; // assigning vendors
  };

  const EntityIcon = getIcon();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold">
            {assignLabel}: {sourceEntity?.name}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder={`Search ${targetLabel}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm"
        />

        {/* Target List */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredList.length === 0 && search && (
            <p className="text-sm text-gray-400 text-center">No {targetLabel} found</p>
          )}

          {filteredList.map((entity) => {
            const isSelected = selected.includes(entity.id);

            return (
              <div
                key={entity.id} // ✅ unique key
                onClick={() => toggleSelect(entity.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center space-x-3 ${
                  isSelected ? "bg-blue-50 border-blue-400" : "hover:bg-gray-50"
                }`}
              >
                <EntityIcon className="w-6 h-6 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{entity.name}</div>
                  {entity.email && (
                    <div className="text-xs text-gray-500 truncate">{entity.email}</div>
                  )}
                  {entity.phone && (
                    <div className="text-xs text-gray-500 truncate">{entity.phone}</div>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="w-4 h-4"
                />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selected)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Assign Selected ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignEntityModal;
