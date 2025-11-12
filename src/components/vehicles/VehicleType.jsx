import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Edit, Search } from "lucide-react";
import DynamicTable from "../DynamicTable";
import ToolBar from "../ui/ToolBar";
import { Modal } from "../../components/SmallComponents";
import InputField from "../InputField";
import {
  fetchVehicleTypes,
  createVehicleType,
  updateVehicleType,
  toggleVehicleTypeStatus
} from "../../redux/features/managevehicletype/vehicleTypeThunks";
import { toast } from "react-toastify";
import VendorSelector from "../vendor/vendordropdown";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggleButton from "../ui/ReusableToggleButton";

const ManageVehicleTypes = () => {
  const dispatch = useDispatch();
  const { byId, allIds, loading } = useSelector((state) => state.vehicleType);
  const vehicleTypes = allIds.map((id) => byId[id]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeOnly, setActiveOnly] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state for optimistic toggle
  const [localStatus, setLocalStatus] = useState({});

const { fetched } = useSelector((state) => state.vehicleType);

useEffect(() => {
  if (!fetched) {
    dispatch(fetchVehicleTypes());
  }
}, [dispatch, fetched]);

  const filteredVehicleTypes = vehicleTypes.filter((vt) => {
    if (!vt) return false;
    const matchesSearch =
      vt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vt.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeOnly === undefined || vt.is_active === activeOnly;
    return matchesSearch && matchesStatus;
  });

  const headers = [
    { label: "Vehicle Type Name", key: "name", className: "text-left" },
    { label: "Description", key: "description", className: "text-left" },
    { label: "Seats", key: "seats", className: "text-center" },
    {
      label: "Active",
      key: "is_active",
      className: "text-center",
      render: (row) => {
        const isActive = localStatus[row.id] ?? row.is_active;
        return <div className="text-lg">{isActive ? "✅" : "❌"}</div>;
      },
    },
  ];

  const handleSelectItem = (item, isSelected) => {
    setSelectedItems((prev) =>
      isSelected ? [...prev, item] : prev.filter((i) => i.id !== item.id)
    );
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setActiveOnly(value === "" ? undefined : value === "true");
  };

  const handleEdit = (row) => {
    if (!row) return;
    setEditingId(row.id);
    setFormData({
      name: row.name || "",
      description: row.description || "",
      seats: row.seats || "",
      is_active: row.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (row) => {
    if (!row || !row.id) return;
    // Optimistic update
    setLocalStatus((prev) => ({
      ...prev,
      [row.id]: !(prev[row.id] ?? row.is_active),
    }));
    try {
      await dispatch(toggleVehicleTypeStatus(row.id)).unwrap();
      toast.success(
        `Vehicle type ${
          !(localStatus[row.id] ?? row.is_active) ? "activated" : "deactivated"
        } successfully`
      );
    } catch (error) {
      // Revert if API fails
      setLocalStatus((prev) => ({
        ...prev,
        [row.id]: row.is_active,
      }));
      toast.error(error?.message || "Failed to toggle vehicle type status");
    }
  };

  // const handleDelete = async (row) => {
  //   if (!row || !row.id) return;
  //   if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
  //     try {
  //       await dispatch(deleteVehicleType(row.id)).unwrap();
  //       toast.success("Vehicle type deleted successfully");
  //     } catch (error) {
  //       toast.error(error?.message || "Failed to delete vehicle type");
  //     }
  //   }
  // };

  const renderActions = (row) => {
    const isActive = localStatus[row.id] ?? row.is_active;

    return (
      <div className="flex justify-center items-center gap-2">
        {/* Toggle switch */}
        <button
          onClick={() => handleToggleStatus(row)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            isActive ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>

        {/* Edit */}
        <button
          onClick={() => handleEdit(row)}
          className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"
          title="Edit"
        >
          <Edit size={18} />
        </button>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      seats: Number(formData.seats),
      is_active: formData.is_active ?? true,
    };

    try {
      if (editingId) {
        await dispatch(updateVehicleType({ id: editingId, payload })).unwrap();
        toast.success("Vehicle type updated successfully");
      } else {
        await dispatch(createVehicleType(payload)).unwrap();
        toast.success("Vehicle type created successfully");
      }

      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
      dispatch(fetchVehicleTypes());
    } catch (error) {
      toast.error(error?.message || error || "Failed to save vehicle type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({});
    setEditingId(null);
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 bg-white shadow-sm p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search vehicle types..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
          </div>

          <select
            value={activeOnly === undefined ? "" : activeOnly.toString()}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <div className="w-full sm:w-auto">
              <VendorSelector
                onChange={(vendor) => {
                  dispatch(fetchVehicleTypes({ vendor_id: vendor.vendor_id }));
                }}
              />
            </div>
        </div>

        <ToolBar
            className="bg-transparent shadow-none p-0"
            leftElements={null} // or any search/filters you have
            rightElements={
              <button
                onClick={() => {
                  setFormData({ is_active: true });
                  setEditingId(null);
                  setIsModalOpen(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
              >
                Add Vehicle Type
              </button>
            }
          />
      </div>

      {/* Table */}
      <DynamicTable
        headers={headers}
        data={filteredVehicleTypes}
        loading={loading}
        onSelectItem={handleSelectItem}
        selectedItems={selectedItems}
        renderActions={renderActions}
        showCheckboxes={false}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        title={editingId ? "Edit Vehicle Type" : "Add Vehicle Type"}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <InputField
            label="Vehicle Type Name *"
            name="name"
            type="text"
            required
            value={formData.name || ""}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          <InputField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description || ""}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          <InputField
            label="Seats *"
            name="seats"
            type="number"
            min="1"
            required
            value={formData.seats || ""}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active || false}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Active
            </label>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ManageVehicleTypes;
