import React, { useEffect, useState } from "react";
import Modal from "../modals/Modal";
import { Plus, ToggleLeft, ToggleRight } from "lucide-react";
import ShiftForm from "./ShiftForm";
import ConfirmationModal from "../modals/ConfirmationModal";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAllShiftCategories,
  selectAllShifts,
  selectLoading,
} from "../../redux/features/shift/shiftSlice";
import { fetchShiftTrunk, createShiftTrunk, toggleShiftStatus } from "../../redux/features/shift/shiftTrunk";
import { toast } from "react-toastify";

const ShiftManagement = () => {
  const dispatch = useDispatch();
  const shifts = useSelector(selectAllShifts);
  const shiftCategories = useSelector(selectAllShiftCategories);
  const categories = useSelector((state) => state.shift.shiftCategories.byId);
  const loading = useSelector(selectLoading);

  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShifts, setSelectedShifts] = useState([]);
const loaded = useSelector((state) => state.shift.loaded);

useEffect(() => {
  if (!loaded) {
    dispatch(fetchShiftTrunk());
  }
}, [dispatch, loaded]);


  // Handlers
  const handleAddClick = () => {
    setEditingShift(null);
    setIsModalOpen(true);
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setIsModalOpen(true);
  };

  const handleDelete = (shift) => {
    setShiftToDelete(shift);
    setIsDeleteModalOpen(true);
  };

  const handleStatusToggle = async (shift) => {
    try {
      const result = await dispatch(toggleShiftStatus(shift.shift_id));
      if (toggleShiftStatus.fulfilled.match(result)) {
        toast.success(`Shift "${shift.shift_code}" status updated!`);
      } else {
        toast.error(result.payload || "Failed to toggle shift status");
      }
    } catch (error) {
      toast.error("Something went wrong while updating shift status");
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      const result = await dispatch(createShiftTrunk(data));
      if (createShiftTrunk.fulfilled.match(result)) {
        toast.success("Shift saved successfully!");
        setIsModalOpen(false);
        setEditingShift(null);
        dispatch(fetchShiftTrunk());
      } else {
        toast.error(result.payload || "Failed to save shift");
      }
    } catch (error) {
      toast.error("Something went wrong while saving shift");
    }
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    setShiftToDelete(null);
    // TODO: dispatch delete shift
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const formatTime = (shift_time) => shift_time?.slice(0, 5) || "N/A";

  // Selection handlers
  const handleSelectShift = (shiftId) => {
    setSelectedShifts((prev) =>
      prev.includes(shiftId)
        ? prev.filter((id) => id !== shiftId)
        : [...prev, shiftId]
    );
  };

  const handleSelectAll = () => {
    if (selectedShifts.length === filteredShifts.length) {
      setSelectedShifts([]);
    } else {
      setSelectedShifts(filteredShifts.map((s) => s.shift_id));
    }
  };

  const tabs = [
    { key: "all", label: "All Shifts" },
    { key: "login", label: "Login Shifts" },
    { key: "logout", label: "Logout Shifts" },
  ];

  // Filtering
  const filteredByTab = shifts.filter((shift) => {
    if (activeTab === "login") return shift.log_type?.toLowerCase() === "in";
    if (activeTab === "logout") return shift.log_type?.toLowerCase() === "out";
    return true;
  });

  const filteredShifts = filteredByTab.filter((shift) => {
    const query = searchTerm.toLowerCase();
    const categoryName = categories?.[shift.shiftCategoryId]?.name?.toLowerCase() || "";
    return (
      shift.shift_code?.toLowerCase().includes(query) ||
      shift.log_type?.toLowerCase().includes(query) ||
      formatTime(shift.shift_time).includes(query) ||
      shift.pickup_type?.toLowerCase().includes(query) ||
      categoryName.includes(query)
    );
  });

  return (
    <div className="p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white border rounded shadow-sm p-4 gap-3">
        <input
          type="text"
          placeholder="Search shifts..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all"
          >
            <Plus size={16} /> Add Shift
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-center py-2 text-sm font-semibold transition-all duration-300 ${
              activeTab === tab.key
                ? "bg-blue-600 text-white rounded-lg shadow-md"
                : "bg-white text-gray-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Shifts Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading shifts...</div>
          ) : (
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedShifts.length === filteredShifts.length && filteredShifts.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Log Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredShifts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? "No shifts found." : "No shifts available."}
                    </td>
                  </tr>
                ) : (
                  filteredShifts.map((shift) => (
                    <tr key={shift.shift_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={selectedShifts.includes(shift.shift_id)}
                          onChange={() => handleSelectShift(shift.shift_id)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{shift.shift_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{shift.log_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatTime(shift.shift_time)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{shift.pickup_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center text-lg">
                          {shift.is_active ? "✅" : "❌"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleStatusToggle(shift)}
                            className={`p-2 rounded-lg transition-colors ${
                              shift.is_active
                                ? "text-green-600 hover:text-green-800 hover:bg-green-50"
                                : "text-red-600 hover:text-red-800 hover:bg-red-50"
                            }`}
                            title={shift.is_active ? "Deactivate" : "Activate"}
                          >
                            {shift.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingShift(null);
        }}
        title={editingShift ? "Edit Shift" : "Add Shift"}
        size="lg"
      >
        <ShiftForm
          initialData={
            editingShift || {
              shift_code: "",
              log_type: "",
              shift_time: "",
              pickup_type: "",
              gender: "",
              waiting_time_minutes: 0,
              is_active: true,
            }
          }
          categories={shiftCategories}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingShift(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        show={isDeleteModalOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete this shift "${shiftToDelete?.shift_code}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setShiftToDelete(null);
        }}
      />
    </div>
  );
};

export default ShiftManagement;
