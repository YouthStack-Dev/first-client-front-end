import React, { useState, useEffect, useCallback } from "react";
import { Eye, Edit, History } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import ToolBar from "../ui/ToolBar";
import DynamicTable from "../DynamicTable";
import SearchInput from "@components/ui/SearchInput";
import SelectField from "../ui/SelectField";
import ReusableButton from "../ui/ReusableButton";
import ReusableToggleButton from "../ui/ReusableToggleButton";
import { Modal } from "../../components/SmallComponents";
import InputField from "../InputField";

import {
  fetchVehicleTypesThunk,
  createVehicleType,
  updateVehicleType,
  toggleVehicleTypeStatus,
} from "../../redux/features/managevehicletype/vehicleTypeThunks";

import { useVendorOptions } from "../../hooks/useVendorOptions";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import {
  vehicleTypeSelectors,
  selectVehicleTypesLoading,
} from "../../redux/features/managevehicletype/vehicleTypeSlice";

import { toast } from "react-toastify";

const MODULE = "vehicle-type";

const ManageVehicleTypes = () => {
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);
  const isVendorUser = user?.type === "vendor";

  const vehicleTypes = useSelector(vehicleTypeSelectors.selectAll);
  const loading = useSelector(selectVehicleTypesLoading);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("All");

  const vendors = useVendorOptions();

  // ================= PARAM BUILDER =================
  const buildFetchParams = useCallback(() => {
    const params = {};

    if (isVendorUser) params.vendor_id = user.vendor_id;
    else if (selectedVendor?.value) params.vendor_id = selectedVendor.value;
    else return null;

    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (status !== "All") params.status = status;

    return params;
  }, [isVendorUser, user?.vendor_id, selectedVendor, searchTerm, status]);

  useEffect(() => {
    const params = buildFetchParams();
    if (params) dispatch(fetchVehicleTypesThunk(params));
  }, [buildFetchParams, dispatch]);

  const shouldShowNoVendorMessage = !isVendorUser && !selectedVendor;

  // ================= CLEAR FILTERS (ADDED) =================
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatus("All");
    if (!isVendorUser) setSelectedVendor(null);
  };

  // ================= MODAL =================
  const handleOpenCreateModal = () => {
    if (!isVendorUser && !selectedVendor) {
      toast.warning("Please select a vendor first");
      return;
    }

    setModalMode("create");
    setSelectedVehicleType({
      name: "",
      description: "",
      is_active: true,
      vendor_id: isVendorUser ? user.vendor_id : selectedVendor.value,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === "edit") {
        await dispatch(
          updateVehicleType({
            id: selectedVehicleType.vehicle_type_id,
            payload: selectedVehicleType,
          })
        ).unwrap();
        toast.success("Vehicle type updated");
      } else {
        await dispatch(createVehicleType(selectedVehicleType)).unwrap();
        toast.success("Vehicle type created");
      }

      const params = buildFetchParams();
      if (params) dispatch(fetchVehicleTypesThunk(params));
      setIsModalOpen(false);
    } catch {
      toast.error("Failed to save vehicle type");
    }
  };

  // ================= TABLE HEADERS (ADDED ACTIONS) =================
  const headers = [
    {
      label: "Vehicle Type",
      key: "name",
      className: "w-[220px] font-medium truncate",
    },
    {
      label: "Description",
      key: "description",
      className: "w-[380px] truncate text-gray-600",
    },
    {
      label: "Seats",
      key: "seats",
      className: "w-[120px] text-center",
    },
    {
      label: "Status",
      key: "status",
      className: "w-[140px] text-center",
      render: (row) => (
        <div className="flex justify-center">
          <ReusableToggleButton
            module={MODULE}
            action="update"
            isChecked={row.is_active}
            onToggle={() =>
              dispatch(toggleVehicleTypeStatus(row.vehicle_type_id))
            }
            size="small"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <ToolBar
        onAddClick={handleOpenCreateModal}
        module={MODULE}
        addButtonLabel="Vehicle Type"
        addButtonDisabled={shouldShowNoVendorMessage}
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <SearchInput
              placeholder="Search vehicle types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={shouldShowNoVendorMessage}
              className="flex-grow"
            />
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
              disabled={shouldShowNoVendorMessage}
            >
              Clear Filters
            </button>
          </div>
        }
        rightElements={
          <div className="flex flex-wrap items-center gap-3">
            <ReusableButton
              module="audit_log"
              action="read"
              icon={History}
              title="Audit History"
              disabled={shouldShowNoVendorMessage}
              className="bg-blue-600 text-white px-3 py-2 rounded-md"
            />

            {!isVendorUser && (
              <div className="min-w-[200px]">
                <Select
                  options={vendors}
                  value={selectedVendor}
                  onChange={setSelectedVendor}
                  placeholder="Select vendor..."
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>
            )}

            <SelectField
              value={status}
              onChange={setStatus}
              options={[
                { label: "All Status", value: "All" },
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
              className="min-w-[140px]"
              disabled={shouldShowNoVendorMessage}
            />
          </div>
        }
      />

      {shouldShowNoVendorMessage && (
        <div className="mt-6 p-4 bg-yellow-50 border rounded-lg text-center">
          Please select a vendor to view vehicle types
        </div>
      )}

      {!shouldShowNoVendorMessage && (
        <DynamicTable
          className="table-fixed"
          headers={headers}
          data={vehicleTypes}
          loading={loading}
          showCheckboxes={false}
          renderActions={(row) => (
            <div className="flex justify-center gap-2">
              <ReusableButton
                  module={MODULE}        // ✅ REQUIRED
                  action="read"          // ✅ REQUIRED
                  icon={Eye}
                  title="View"
                  onClick={() => {
                    setSelectedVehicleType(row);
                    setModalMode("view");
                    setIsModalOpen(true);
                  }}
                />
              <ReusableButton
                module={MODULE}        // ✅ REQUIRED
                action="update"        // ✅ REQUIRED
                icon={Edit}
                title="Edit"
                onClick={() => {
                  setSelectedVehicleType(row);
                  setModalMode("edit");
                  setIsModalOpen(true);
                }}
              />
            </div>
          )}
        />
      )}

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={modalMode === "view" ? null : handleSubmit}
        title={
          modalMode === "view"
            ? "View Vehicle Type"
            : modalMode === "edit"
            ? "Edit Vehicle Type"
            : "Add Vehicle Type"
        }
      >
        {!isVendorUser && (
          <div className="mb-3">
            <label className="text-xs font-medium">Vendor</label>
            <Select
              options={vendors}
              value={vendors.find(
                (v) => v.value === selectedVehicleType?.vendor_id
              )}
              onChange={(opt) =>
                setSelectedVehicleType((p) => ({
                  ...p,
                  vendor_id: opt?.value,
                }))
              }
            />
          </div>
        )}

        <InputField
          label="Vehicle Type Name"
          value={selectedVehicleType?.name || ""}
          readOnly={modalMode === "view"}
          onChange={(e) =>
            setSelectedVehicleType((p) => ({ ...p, name: e.target.value }))
          }
        />

        <InputField
              label="Number of Seats"
              type="number"
              value={selectedVehicleType?.seats || ""}
              readOnly={modalMode === "view"}
              onChange={(e) =>
                setSelectedVehicleType((p) => ({
                  ...p,
                  seats: Number(e.target.value),
                }))
              }
        />

        <InputField
          label="Description"
          value={selectedVehicleType?.description || ""}
          readOnly={modalMode === "view"}
          onChange={(e) =>
            setSelectedVehicleType((p) => ({
              ...p,
              description: e.target.value,
            }))
          }
        />

        <div className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            checked={selectedVehicleType?.is_active}
            disabled={modalMode === "view"}
            onChange={(e) =>
              setSelectedVehicleType((p) => ({
                ...p,
                is_active: e.target.checked,
              }))
            }
          />
          <label className="text-sm">Is Active</label>
        </div>
      </Modal>
    </div>
  );
};

export default ManageVehicleTypes;