import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Edit, Trash2 } from "lucide-react";
import DynamicTable from "../DynamicTable";
import ToolBar from "../ui/ToolBar";
import { Modal } from "../../components/SmallComponents";
import InputField from "../InputField";
import { fetchVehicleTypes } from "../../redux/features/managevehicletype/vehicleTypeThunks";
import { toast } from "react-toastify";

const ManageVehicleTypes = () => {
  const dispatch = useDispatch();
  const { vehicleTypes = [], loading } = useSelector(
    (state) => state.vehicleType
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeOnly, setActiveOnly] = useState(1); // dynamic filter

  // Fetch vehicle types once vendor_id is available
   useEffect(() => {
    dispatch(fetchVehicleTypes({ active_only: activeOnly }));
  }, [dispatch, activeOnly]);

  const headers = [
    { label: "Vehicle Type Name", key: "name" },
    { label: "Description", key: "description" },
    { label: "Seats", key: "seats" },
    { label: "Active", key: "is_active" },
  ];

  const handleSelectItem = (item, isSelected) => {
    setSelectedItems((prev) =>
      isSelected
        ? [...prev, item]
        : prev.filter((i) => i.vehicle_type_id !== item.vehicle_type_id)
    );
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (row) => {
    setEditingId(row.vehicle_type_id);
    setFormData({
      name: row.name,
      description: row.description,
      seats: row.seats,
      is_active: row.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
      try {
        await dispatch(deleteVehicleType(row.vehicle_type_id));
        toast.success("Vehicle type deleted successfully");
        dispatch(fetchVehicleTypes({ active_only: activeOnly }));
      } catch (error) {
        toast.error("Failed to delete vehicle type");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      seats: Number(formData.seats),
      is_active: formData.is_active ?? true,
    };

    try {
      if (editingId) {
        await dispatch(updateVehicleType({ id: editingId, payload }));
        toast.success("Vehicle type updated successfully");
      } else {
        await dispatch(addVehicleType(payload));
        toast.success("Vehicle type created successfully");
      }

      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
      dispatch(fetchVehicleTypes({ active_only: activeOnly }));
    } catch (error) {
      toast.error("Failed to save vehicle type");
    }
  };

  return (
    <>
      <ToolBar
        className="mb-4 bg-white shadow-sm p-2 rounded-lg"
        onAddClick={() => {
          setFormData({ is_active: true });
          setEditingId(null);
          setIsModalOpen(true);
        }}
        addButtonLabel="Add Vehicle Type"
      />

      <DynamicTable
        headers={headers}
        data={vehicleTypes}
        loading={loading}
        onSelectItem={handleSelectItem}
        selectedItems={selectedItems}
        renderActions={(row) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(row)}
              className="text-blue-600 hover:bg-gray-100 p-1.5 rounded"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDelete(row)}
              className="text-red-600 hover:bg-gray-100 p-1.5 rounded"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingId ? "Edit Vehicle Type" : "Add Vehicle Type"}
      >
        <div className="space-y-4">
          <InputField
            label="Vehicle Type Name *"
            name="name"
            type="text"
            required
            value={formData.name || ""}
            onChange={handleInputChange}
          />
          <InputField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description || ""}
            onChange={handleInputChange}
          />
          <InputField
            label="Seats *"
            name="seats"
            type="number"
            min="1"
            required
            value={formData.seats || ""}
            onChange={handleInputChange}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active || false}
              onChange={handleInputChange}
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
