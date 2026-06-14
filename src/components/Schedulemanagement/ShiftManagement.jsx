import React, { useEffect, useState } from "react";
import Modal from "../modals/Modal";
import { Edit } from "lucide-react";
import ShiftForm from "./ShiftForm";
import ConfirmationModal from "../modals/ConfirmationModal";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAllShiftCategories,
  selectAllShifts,
  selectLoading,
} from "../../redux/features/shift/shiftSlice";
import {
  fetchShiftTrunk,
  createShiftTrunk,
  toggleShiftStatus,
  updateShiftTrunk,
} from "../../redux/features/shift/shiftTrunk";
import { toast } from "react-toastify";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggleButton from "../ui/ReusableToggleButton";
import ToolBar from "../ui/ToolBar";
import SearchInput from "@components/ui/SearchInput";
import { logDebug } from "../../utils/logger";

const ShiftManagement = () => {
  const dispatch = useDispatch();
  const shifts = useSelector(selectAllShifts);
  const shiftCategories = useSelector(selectAllShiftCategories);
  const categories = useSelector((state) => state.shift.shiftCategories.byId);
  const loading = useSelector(selectLoading);
  const loaded = useSelector((state) => state.shift.loaded);

  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShifts, setSelectedShifts] = useState([]);

  useEffect(() => {
    if (!loaded) dispatch(fetchShiftTrunk());
  }, [dispatch, loaded]);

  const handleAddClick = () => {
    setEditingShift(null);
    setIsModalOpen(true);
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (shift) => {
    try {
      const res = await dispatch(toggleShiftStatus(shift.shift_id)).unwrap();
      console.log("✅ Toggle success:", res);
      toast.success(`Shift "${shift.shift_code}" status updated!`);
    } catch (error) {
      console.error("❌ Toggle failed:", error);
      toast.error(error || "Failed to toggle shift status");
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        shift_time: data.shift_time.includes(":")
          ? data.shift_time.split(":").slice(0, 2).join(":")
          : data.shift_time,
      };

      if (editingShift && editingShift.shift_id) {
        await dispatch(
          updateShiftTrunk({ shift_id: editingShift.shift_id, data: formattedData })
        ).unwrap();
        toast.success("Shift updated successfully!");
      } else {
        await dispatch(createShiftTrunk(formattedData)).unwrap();
        toast.success("Shift created successfully!");
      }

      setIsModalOpen(false);
      setEditingShift(null);
      dispatch(fetchShiftTrunk());
    } catch (error) {
      const message =
        error?.detail?.message || error?.message || error || "Failed to save shift";
      toast.error(message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedShifts([]);
  };

  const formatTime = (t) => t?.slice(0, 5) || "N/A";

  const handleSelectShift = (id) => {
    setSelectedShifts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedShifts.length === filteredShifts.length) {
      setSelectedShifts([]);
    } else {
      setSelectedShifts(filteredShifts.map((s) => s.shift_id));
    }
  };

  // Row 1: top-level type tabs
  const typeTabs = [
    { key: "all", label: "All Shifts" },
    { key: "pickup", label: "Pickup" },
    { key: "nodal", label: "Nodal" },
  ];

  // Row 2: log type sub-tabs (only shown when pickup or nodal is selected)
  const logTabs = [
    { key: "in", label: "Login" },
    { key: "out", label: "Logout" },
  ];

  const activePickupType = activeTab.startsWith("pickup")
    ? "pickup"
    : activeTab.startsWith("nodal")
    ? "nodal"
    : "all";

  const activeLogType = activeTab.includes("_in")
    ? "in"
    : activeTab.includes("_out")
    ? "out"
    : null;

  const handleTypeTabClick = (key) => {
    setActiveTab(key);
    setSelectedShifts([]);
  };

  const handleLogTabClick = (logKey) => {
    if (activePickupType === "all") return;
    const newTab =
      activeLogType === logKey
        ? activePickupType
        : `${activePickupType}_${logKey}`;
    setActiveTab(newTab);
    setSelectedShifts([]);
  };

  const filteredByTab = shifts.filter((shift) => {
    const logType = shift.log_type?.toLowerCase();
    const pickupType = shift.pickup_type?.toLowerCase();

    if (activeTab === "pickup") return pickupType === "pickup";
    if (activeTab === "pickup_in") return pickupType === "pickup" && logType === "in";
    if (activeTab === "pickup_out") return pickupType === "pickup" && logType === "out";
    if (activeTab === "nodal") return pickupType === "nodal";
    if (activeTab === "nodal_in") return pickupType === "nodal" && logType === "in";
    if (activeTab === "nodal_out") return pickupType === "nodal" && logType === "out";
    return true; // "all"
  });

  const filteredShifts = filteredByTab.filter((shift) => {
    const query = searchTerm.toLowerCase();
    const categoryName =
      categories?.[shift.shiftCategoryId]?.name?.toLowerCase() || "";
    return (
      shift.shift_code?.toLowerCase().includes(query) ||
      shift.log_type?.toLowerCase().includes(query) ||
      formatTime(shift.shift_time).includes(query) ||
      shift.pickup_type?.toLowerCase().includes(query) ||
      categoryName.includes(query)
    );
  });

  return (
    <div className="">
      {/* Toolbar + Search on one line */}
      <ToolBar
        module="shift"
        className="p-4 bg-white border rounded-lg shadow-sm mb-4"
        onAddClick={handleAddClick}
        addButtonLabel="Add Shift"
        leftElements={
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by code, type, time..."
          />
        }
      />

      {/* Row 1: Type Tabs */}
      <div className="flex space-x-2 mb-2">
        {typeTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTypeTabClick(tab.key)}
            className={`flex-1 text-center py-2 text-sm font-semibold transition-all duration-300 rounded-lg ${
              activePickupType === tab.key ||
              (tab.key === "all" && activeTab === "all")
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-blue-100 hover:text-blue-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Row 2: Log Type Sub-Tabs (only when pickup or nodal selected) */}
      {activePickupType !== "all" && (
        <div className="flex space-x-2 mb-4">
          {logTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleLogTabClick(tab.key)}
              className={`flex-1 text-center py-2 text-sm font-semibold transition-all duration-300 rounded-lg border ${
                activeLogType === tab.key
                  ? "bg-blue-500 text-white shadow-sm border-blue-500"
                  : "bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600 border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Spacing when no sub-tabs shown */}
      {activePickupType === "all" && <div className="mb-4" />}

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
                      checked={
                        selectedShifts.length === filteredShifts.length &&
                        filteredShifts.length > 0
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Log Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup Type
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredShifts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? "No shifts match your search." : "No shifts available."}
                    </td>
                  </tr>
                ) : (
                  filteredShifts.map((shift) => (
                    <tr key={shift.shift_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedShifts.includes(shift.shift_id)}
                          onChange={() => handleSelectShift(shift.shift_id)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">{shift.shift_code}</td>
                      <td className="px-6 py-4">{shift.log_type}</td>
                      <td className="px-6 py-4">{formatTime(shift.shift_time)}</td>
                      <td className="px-6 py-4">{shift.pickup_type}</td>
                      <td className="px-6 py-4 text-center">
                        <ReusableToggleButton
                          module="shift"
                          action="update"
                          isChecked={shift.is_active}
                          onToggle={() => handleStatusToggle(shift)}
                          labels={{ on: "Active", off: "Inactive" }}
                          size="small"
                        />
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <ReusableButton
                          module="shift"
                          action="update"
                          icon={Edit}
                          title="Edit Shift"
                          onClick={() => handleEdit(shift)}
                          className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                        />
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

      <ConfirmationModal
        show={isDeleteModalOpen}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${shiftToDelete?.shift_code}"?`}
        onConfirm={() => setIsDeleteModalOpen(false)}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ShiftManagement;