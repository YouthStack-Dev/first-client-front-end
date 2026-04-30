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
import AuditLogsModal from "../modals/AuditLogsModal";
import { useSearchParams } from "react-router-dom";
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

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
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

  const { vendorOptions } = useVendorOptions(null, !isVendorUser);

  const tenantId =
    user?.employee?.tenant_id ||
    user?.vendor_user?.tenant_id ||
    user?.tenant_id;

  const getVendorLabelById = useCallback(
    (id) => vendorOptions.find((v) => v.value === id)?.label || "—",
    [vendorOptions]
  );

  /* ================= STATE ================= */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("All");

  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedVehicleTypeName, setSelectedVehicleTypeName] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

    return params;
  }, [
    isVendorUser,
    user?.vendor_id,
    selectedVendor,
    debouncedSearchTerm,
    status,
  ]);

  /* ================= FETCH ================= */
  useEffect(() => {
    const params = buildFetchParams();
    if (params) {
      dispatch(fetchVehicleTypesThunk(params));
    }
  }, [buildFetchParams, dispatch]);

  const shouldShowNoVendorMessage = !isVendorUser && !selectedVendor;

  /* ================= FILTERS ================= */
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatus("All");
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

  // ✅ UPDATED: handleSubmit now shows API response message instead of hardcoded text
  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: selectedVehicleType.name,
        seats: Number(selectedVehicleType.seats),
        description: selectedVehicleType.description || "",
        is_active: selectedVehicleType.is_active,
      };

      if (!isVendorUser) {
        payload.vendor_id = selectedVehicleType.vendor_id;
      }

      if (modalMode === "edit") {
        // ✅ UPDATED: capture result and show API message
        const result = await dispatch(
          updateVehicleType({
            id: selectedVehicleType.vehicle_type_id,
            payload,
            vendor_id: payload.vendor_id,
          })
        ).unwrap();
        toast.success(result?.message || "Vehicle type updated");

      } else {
        // ✅ UPDATED: capture result and show API message
        const result = await dispatch(
          createVehicleType({
            payload,
            vendor_id: isVendorUser ? user.vendor_id : selectedVehicleType.vendor_id,
          })
        ).unwrap();
        toast.success(result?.message || "Vehicle type created");
      }

      const params = buildFetchParams();
      if (params) dispatch(fetchVehicleTypesThunk(params));

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
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
              onChange={(e) => setSearchTerm(e.target.value)}
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
            {!isVendorUser && (
              <ReusableButton
                module="vehicle"
                action="read"
                buttonName={"History"}
                icon={History}
                title="Audit History"
                disabled={shouldShowNoVendorMessage}
                onClick={() => {
                  setSelectedVehicleTypeName(null);
                  setShowAuditModal(true);
                }}
                className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md"
              />
            )}

            {!isVendorUser && (
              <div className="min-w-[200px] z-10 relative">
                <Select
                  options={vendorOptions}
                  value={selectedVendor}
                  onChange={setSelectedVendor}
                  isSearchable={true}
                  placeholder="Select vendor..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable={true}
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>
            )}

            <SelectField
              value={status}
              onChange={(newStatus) => setStatus(newStatus)}
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

      {shouldShowNoVendorMessage && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-center">
          <p className="text-yellow-800 font-medium">
            Please select a vendor to view vehicle types
          </p>
        </div>
      )}

      {!shouldShowNoVendorMessage && (
        <VehicleTypeList
          vehicleTypes={vehicleTypes}
          loading={loading}
          currentPage={currentPage}
          totalPages={Math.ceil(vehicleTypes.length / itemsPerPage)}
          totalItems={vehicleTypes.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          showPagination={true}
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
          // ✅ UPDATED: added async/await + toast on success and failure
          onStatusToggle={async (row) => {
            try {
              const result = await dispatch(
                toggleVehicleTypeStatus({
                  id: row.vehicle_type_id,
                  vendor_id: row.vendor_id,
                  is_active: !row.is_active,
                })
              ).unwrap();
              toast.success(result?.message || "Status updated successfully");
            } catch (error) {
              toast.error(typeof error === "string" ? error : "Failed to update status");
            }
          }}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={modalMode === "view" ? null : handleSubmit}
        mode={modalMode}
        submitText={modalMode === "edit" ? "Update" : "Create"}
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
                options={vendorOptions}
                value={vendorOptions.find(
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

      <AuditLogsModal
        isOpen={showAuditModal}
        onClose={() => {
          setShowAuditModal(false);
          setSelectedVehicleTypeName(null);
        }}
        apimodule="vehicle_type"
        moduleName={selectedVehicleTypeName || "Vehicle Type"}
        showUserColumn={true}
        selectedCompany={tenantId}
      />
    </div>
  );
};

export default ManageVehicleTypes;