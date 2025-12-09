import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Edit, Plus, Search } from "lucide-react";
import DynamicTable from "../DynamicTable";
import ToolBar from "../ui/ToolBar";
import { Modal } from "../../components/SmallComponents";
import InputField from "../InputField";
import {
  fetchVehicleTypes,
  createVehicleType,
  updateVehicleType,
  toggleVehicleTypeStatus,
  fetchVendorVehicleTypes,
} from "../../redux/features/managevehicletype/vehicleTypeThunks";
import { toast } from "react-toastify";
import VendorSelector from "../vendor/vendordropdown";
import SearchInput from "@components/ui/SearchInput";
import SelectField from "../ui/SelectField";

const ManageVehicleTypes = () => {
  const dispatch = useDispatch();

  const {
    byId,
    allIds,
    loading,
    fetched,
    vendorById, // vendor cache from the slice
    vendorLoading,
  } = useSelector((state) => state.vehicleType);

  const selectedVendor = useSelector((state) => state.vendor.selectedVendor);

  const vehicleTypes = allIds.map((id) => byId[id] || {});

  // Local UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeOnly, setActiveOnly] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localStatus, setLocalStatus] = useState({});

  // ---------------------------
  // Decide and dispatch the right fetch (ONLY here)
  // ---------------------------
  useEffect(() => {
    const vendorId = selectedVendor?.vendor_id;

    if (!vendorId || vendorId === "all") {
      // No vendor selected -> ensure tenant-level types are loaded
      if (!fetched) {
        dispatch(fetchVehicleTypes());
      }
      return;
    }

    // Vendor selected -> use cache if present, otherwise fetch vendor-specific list
    const cached = vendorById?.[vendorId];
    if (!cached) {
      dispatch(fetchVendorVehicleTypes(vendorId));
    }
    // if cached exists, do nothing (we'll use cached data)
  }, [selectedVendor, fetched, vendorById, dispatch]);

  const filteredVehicleTypes = vehicleTypes.filter((vt) => {
    if (!vt) return false;
    const name = (vt.name || "").toLowerCase();
    const desc = (vt.description || "").toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = name.includes(q) || desc.includes(q);
    const matchesStatus =
      activeOnly === undefined || vt.is_active === activeOnly;
    return matchesSearch && matchesStatus;
  });

  // ---------------------------
  // Determine table data (vendor cached list OR tenant default)
  // ---------------------------
  const vendorId = selectedVendor?.vendor_id;
  const vendorList = vendorId ? vendorById?.[vendorId] ?? null : null;

  const tableData = vendorList
    ? vendorList.filter((vt) =>
        (vt.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredVehicleTypes;

  // ---------------------------
  // Table headers
  // ---------------------------
  const headers = [
    { label: "Vehicle Type Name", key: "name", className: "text-left" },
    { label: "Description", key: "description", className: "text-left" },
    { label: "Seats", key: "seats", className: "text-center" },
    {
      label: "Active",
      key: "is_active",
      className: "text-center",
      render: (row) => {
        const id = row.id || row.vehicle_type_id;
        const isActive = localStatus[id] ?? row.is_active;
        return <div className="text-lg">{isActive ? "✅" : "❌"}</div>;
      },
    },
  ];

  // ---------------------------
  // Handlers
  // ---------------------------
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

  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setActiveOnly(value === "" ? undefined : value === "true");
  };

  const handleEdit = (row) => {
    const id = row.id || row.vehicle_type_id;
    if (!id) return;
    setEditingId(id);
    setFormData({
      name: row.name || "",
      description: row.description || "",
      seats: row.seats || "",
      is_active: row.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (row) => {
    const id = row.id || row.vehicle_type_id;
    if (!id) return;

    setLocalStatus((prev) => ({ ...prev, [id]: !(prev[id] ?? row.is_active) }));

    try {
      await dispatch(toggleVehicleTypeStatus(id)).unwrap();
      toast.success("Status updated");
    } catch (error) {
      setLocalStatus((prev) => ({ ...prev, [id]: row.is_active }));
      toast.error("Failed to update status");
    }
  };

  const renderActions = (row) => {
    const id = row.id || row.vehicle_type_id;
    const isActive = localStatus[id] ?? row.is_active;
    return (
      <div className="flex justify-center items-center gap-2">
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

        <button
          onClick={() => handleEdit(row)}
          className="text-blue-600 p-1.5 rounded"
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
        toast.success("Vehicle type updated");
      } else {
        await dispatch(createVehicleType(payload)).unwrap();
        toast.success("Vehicle type created");
      }

      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);

      // refresh tenant list after changes (still using tenant thunk)
      dispatch(fetchVehicleTypes());
    } catch (error) {
      toast.error("Failed to save vehicle type");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 bg-white shadow-sm p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              placeholder="Search vehicle types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
            />
          </div>

          <select
            value={activeOnly === undefined ? "" : activeOnly.toString()}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* VendorSelector: should update selectedVendor in Redux.
              DO NOT dispatch fetch here to avoid duplicate calls. */}
          <VendorSelector
            onChange={() => {
              /* noop here */
            }}
          />
        </div>

        <ToolBar
          module="driver"
          className="p-4 bg-white border rounded-lg shadow-sm mb-6"
          onAddClick={() => {
            setFormData({ is_active: true });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          addButtonLabel="Add Driver"
          addButtonIcon={<Plus size={16} />}
          searchBar={
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <SearchInput
                placeholder="Search vehicle type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
            </div>
          }
          rightElements={
            <div className="flex items-center gap-3">
              <SelectField className="p-2" />
            </div>
          }
        />
      </div>

      <DynamicTable
        headers={headers}
        data={tableData}
        loading={loading || vendorLoading}
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        renderActions={renderActions}
        showCheckboxes={false}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingId ? "Edit Vehicle Type" : "Add Vehicle Type"}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <InputField
            label="Vehicle Type Name *"
            name="name"
            value={formData.name ?? ""}
            onChange={handleInputChange}
            required
          />

          <InputField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description ?? ""}
            onChange={handleInputChange}
          />

          <InputField
            label="Seats *"
            name="seats"
            type="number"
            value={formData.seats ?? ""}
            onChange={handleInputChange}
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active ?? false}
              onChange={handleInputChange}
            />
            <label htmlFor="is_active">Active</label>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ManageVehicleTypes;
