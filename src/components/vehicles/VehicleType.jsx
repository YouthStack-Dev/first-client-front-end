import React, { useState, useEffect, useCallback } from "react";
import { History, Building } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import ToolBar from "../ui/ToolBar";
import SearchInput from "@components/ui/SearchInput";
import SelectField from "../ui/SelectField";
import ReusableButton from "../ui/ReusableButton";
import { Modal } from "../../components/SmallComponents";
import InputField from "../InputField";

import VehicleTypeList from "../vehicles/VehicleTypeList";

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

// Embedded debounce hook (no external file needed)
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // console.log(`🔄 Debounce timer started for "${value}" (delay: ${delay}ms)`);  // DEBUG: See if timer fires
    const handler = setTimeout(() => {
      // console.log(`✅ Debounced value updated to "${value}"`);  // DEBUG: Confirm update
      setDebouncedValue(value);
    }, delay);

    return () => {
      // console.log(`🛑 Debounce cleared (user still typing)`);  // DEBUG: See cancellations
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ManageVehicleTypes = () => {
  const dispatch = useDispatch();

  /* ================= USER ================= */
  const user = useSelector(selectCurrentUser);
  const isVendorUser = user?.type === "vendor";

  /* ================= DATA ================= */
  const vehicleTypes = useSelector(vehicleTypeSelectors.selectAll);
  const loading = useSelector(selectVehicleTypesLoading);

  const vendors = useVendorOptions();

  const getVendorLabelById = useCallback(
    (id) => vendors.find((v) => v.value === id)?.label || "—",
    [vendors]
  );

  /* ================= STATE ================= */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("All");

  // Debounce searchTerm (increased to 500ms for testing)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  /* ================= PARAM BUILDER ================= */
  const buildFetchParams = useCallback(() => {
    const params = {};

    if (isVendorUser) {
      params.vendor_id = user.vendor_id;
    } else if (selectedVendor?.value) {
      params.vendor_id = selectedVendor.value;
    } else {
      return null;
    }

    if (debouncedSearchTerm.trim()) {
      params.name = debouncedSearchTerm.trim();
    }

    if (status === "Active") params.active_only = 1;
    if (status === "Inactive") params.active_only = 0;

    // console.log("📦 Built params for fetch:", params);  // DEBUG: Check search/is_active in params
    return params;
  }, [isVendorUser, user?.vendor_id, selectedVendor, debouncedSearchTerm, status]);

  /* ================= FETCH ================= */
  useEffect(() => {
    const params = buildFetchParams();
    if (params) {
      // console.log("🚀 Dispatching fetch with params:", params);  // DEBUG: Confirm dispatch trigger
      dispatch(fetchVehicleTypesThunk(params));
    } else {
      // console.log("⏭️ Skipping fetch (no params)");  // DEBUG: Vendor check
    }
  }, [buildFetchParams, dispatch]);

  const shouldShowNoVendorMessage = !isVendorUser && !selectedVendor;

  /* ================= FILTERS ================= */
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatus("All");
    // Vendor stays selected
  };

  /* ================= MODAL ================= */
  const handleOpenCreateModal = () => {
    if (!isVendorUser && !selectedVendor) {
      toast.warning("Please select a vendor first");
      return;
    }

    setModalMode("create");
    setSelectedVehicleType({
      name: "",
      description: "",
      seats: "",
      is_active: true,
      vendor_id: isVendorUser ? user.vendor_id : selectedVendor.value,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === "edit") {
        await dispatch(
          updateVehicleType({
            id: selectedVehicleType.vehicle_type_id,
            payload: selectedVehicleType,
            vendor_id: selectedVehicleType.vendor_id,
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

  /* ================= UI ================= */
  return (
    <div className="p-4 md:p-6">
      <ToolBar
        onAddClick={handleOpenCreateModal}
        module={MODULE}
        addButtonLabel="Vehicle Type"
        addButtonDisabled={shouldShowNoVendorMessage}
        searchBar={
          <div className="flex gap-3 w-full">
            <SearchInput
              key="search"
              placeholder="Search vehicle types..."
              value={searchTerm}
              onChange={(e) => {
                // console.log(`⌨️ Raw search change: "${e.target.value}"`);  // DEBUG: Per-keystroke input
                setSearchTerm(e.target.value);
              }}
              disabled={shouldShowNoVendorMessage}
            />
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm bg-gray-200 rounded-md"
              disabled={shouldShowNoVendorMessage}
            >
              Clear
            </button>
          </div>
        }
        rightElements={
          <div className="flex gap-3 items-center">
            <ReusableButton
              module="audit_log"
              action="read"
              icon={History}
              title="Audit History"
              disabled={shouldShowNoVendorMessage}
            />

            {!isVendorUser && (
              <Select
                options={vendors}
                value={selectedVendor}
                onChange={setSelectedVendor}
                placeholder="Select vendor..."
                isClearable
              />
            )}

            <SelectField
              value={status}
              onChange={(newStatus) => {
                console.log(`🔄 Status changed to: "${newStatus}"`);  // DEBUG: Status trigger
                setStatus(newStatus);
              }}
              options={[
                { label: "All Status", value: "All" },
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
              disabled={shouldShowNoVendorMessage}
            />
          </div>
        }
      />

      {!shouldShowNoVendorMessage && (
        <VehicleTypeList
          vehicleTypes={vehicleTypes}
          loading={loading}
          onView={(row) => {
            setSelectedVehicleType(row);
            setModalMode("view");
            setIsModalOpen(true);
          }}
          onEdit={(row) => {
            setSelectedVehicleType(row);
            setModalMode("edit");
            setIsModalOpen(true);
          }}
          onStatusToggle={(row) =>
            dispatch(
              toggleVehicleTypeStatus({
                id: row.vehicle_type_id,
                vendor_id: row.vendor_id,
                is_active: !row.is_active,
              })
            )
          }
        />
      )}

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
            {modalMode === "view" ? (
              <div className="flex items-center gap-2 p-2 border rounded">
                <Building size={14} />
                {getVendorLabelById(selectedVehicleType?.vendor_id)}
              </div>
            ) : (
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
            )}
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
              seats: e.target.value === "" ? "" : Number(e.target.value),
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

        <div className="flex gap-2 mt-3">
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
          <label>Is Active</label>
        </div>
      </Modal>
    </div>
  );
};

export default ManageVehicleTypes;