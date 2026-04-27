import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { History } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";
import {
  useSearchParams,
} from "react-router-dom";

import ToolBar from "../ui/ToolBar";
import SearchInput from "../ui/SearchInput";
import SelectField from "../ui/SelectField";
import ReusableButton from "../ui/ReusableButton";

import { NewVehicleList } from "./NewVehicleList";
import VehicleFormModal from "./VehicleFormModal";

import {
  fetchVehiclesThunk,
  toggleVehicleStatus,
} from "../../redux/features/manageVehicles/vehicleThunk";

import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import {
  selectVehicles,
  selectVehiclesLoading,
  selectVehiclesTotal,
} from "../../redux/features/manageVehicles/vehicleSelectors";

import { useVendorOptions } from "../../hooks/useVendorOptions";
import AuditLogsModal from "../modals/AuditLogsModal";

/* ======================================================
   🔁 DEBOUNCE HOOK (SAME AS VEHICLE TYPES)
====================================================== */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const NewVehicleManagement = () => {
  const dispatch = useDispatch();

  /* ================= USER ================= */
  const user = useSelector(selectCurrentUser);
  const isVendorUser = user?.type === "vendor";
  const vendorId = user?.vendor_user?.vendor_id;
  
  const tenantId =
    user?.employee?.tenant_id ||
    user?.vendor_user?.tenant_id ||
    user?.tenant_id;


  /* ================= REDUX DATA ================= */
  const vehicles = useSelector(selectVehicles);
  const loading = useSelector(selectVehiclesLoading);
  const totalItems = useSelector(selectVehiclesTotal);

  /* ================= VENDORS ================= */
 const { vendorOptions } = useVendorOptions(null, !isVendorUser);

  /* ================= LOCAL STATE ================= */
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [status, setStatus] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // ✅ ADDED - Audit Modal State
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedVehicleName, setSelectedVehicleName] = useState(null);
 
  /* ================= FETCH PARAM BUILDER ================= */
  const buildFetchParams = useCallback(() => {
    const params = {
      skip: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    };

    if (isVendorUser) {
      params.vendor_id = vendorId;
    } else if (selectedVendor?.value) {
      params.vendor_id = selectedVendor.value;
    } else {
      return null;
    }

    if (debouncedSearchTerm.trim()) {
      params.rc_number = debouncedSearchTerm.trim();
    }

    if (status === "Active") params.is_active = true;
    if (status === "Inactive") params.is_active = false;

    return params;
  }, [
    currentPage,
    itemsPerPage,
    isVendorUser,
    vendorId,
    selectedVendor,
    debouncedSearchTerm,
    status,
  ]);

  /* ================= FETCH ================= */
  useEffect(() => {
    const params = buildFetchParams();
    if (params) {
      dispatch(fetchVehiclesThunk(params));
    }
  }, [buildFetchParams, dispatch]);

  /* ================= HANDLERS ================= */
  const handleOpenCreate = () => {
    if (!isVendorUser && !selectedVendor) {
      toast.warning("Please select a vendor first");
      return;
    }
    setModalMode("create");
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleToggle = async (vehicle) => {
    try {
      await dispatch(
        toggleVehicleStatus({
          vehicleId: vehicle.vehicle_id,
          isActive: !vehicle.is_active,
        })
      ).unwrap();
      toast.success("Vehicle status updated");
    } catch {
      toast.error("Failed to update vehicle status");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatus("All");
    setCurrentPage(1);
    if (!isVendorUser) setSelectedVendor(null);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const shouldShowNoVendorMessage = !isVendorUser && !selectedVendor;

  /* ================= UI ================= */
  return (
    <div className="p-1">
      <ToolBar
        onAddClick={handleOpenCreate}
        module="vehicle"
        addButtonLabel="Vehicle"
        addButtonDisabled={shouldShowNoVendorMessage}
        searchBar={
          <div className="flex gap-3 w-full">
            <SearchInput
              placeholder="Search by RC Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={shouldShowNoVendorMessage}
            />
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-200 rounded-md"
              disabled={shouldShowNoVendorMessage}
            >
              Clear
            </button>
          </div>
        }
        rightElements={
          <div className="flex flex-wrap items-center gap-3">
          {!isVendorUser && (
              <ReusableButton
                module="vehicle"
                action="read"
                buttonName={"History"}
                icon={History}
                title="Audit History"
                disabled={shouldShowNoVendorMessage}
                onClick={() => {
                  setSelectedVehicleName(null);
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
                  placeholder="Select vendor..."
                  isSearchable={true}
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
              onChange={setStatus}
              disabled={shouldShowNoVendorMessage}
              options={[
                { label: "All Status", value: "All" },
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
              className="min-w-[140px]"
            />
          </div>
        }
      />

      {shouldShowNoVendorMessage && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-center">
          <p className="text-yellow-800 font-medium">
            Please select a vendor to view vehicles
          </p>
        </div>
      )}

      {!shouldShowNoVendorMessage && (
        <div className="mt-4">
          {loading ? (
            <div className="py-6 text-center">Loading vehicles...</div>
          ) : (
            <>
              {/* Results Count with Vendor Info */}
              <div className="mb-3 text-sm text-gray-600">
                Showing {vehicles?.length} of {totalItems} vehicles
                {isVendorUser ? (
                  <span className="ml-2 text-blue-600">
                    (Vendor: {user?.vendor_name || user?.vendor_id})
                  </span>
                ) : selectedVendor ? (
                  <span className="ml-2 text-blue-600">
                    (Vendor: {selectedVendor.label})
                  </span>
                ) : null}
              </div>
              <NewVehicleList
              vehicles={vehicles}
              onEdit={(v) => {
                setSelectedVehicle(v);
                setModalMode("edit");
                setIsModalOpen(true);
              }}
              onView={(v) => {
                setSelectedVehicle(v);
                setModalMode("view");
                setIsModalOpen(true);
              }}
              onStatusToggle={handleToggle}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              showPagination
            />
            </>
          )}
        </div>
      )}

      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        vehicleData={selectedVehicle}
        onSubmitSuccess={() => {
          setIsModalOpen(false);
        }}
      />

      {/* ✅ AUDIT LOG MODAL (ONLY NEW ADDITION) */}
      <AuditLogsModal
        isOpen={showAuditModal}
        onClose={() => {
          setShowAuditModal(false);
          setSelectedVehicleName(null);
        }}
        apimodule="vehicle"
        moduleName={selectedVehicleName || "Vehicle"}
        showUserColumn={true}
        selectedCompany={tenantId}
      />
    </div>
  );
};

export default NewVehicleManagement;
