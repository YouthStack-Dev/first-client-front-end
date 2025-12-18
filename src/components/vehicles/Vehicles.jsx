import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { History } from "lucide-react";
import { toast } from "react-toastify";
import Select from "react-select";

import ToolBar from "../ui/ToolBar";
import SearchInput from "../ui/SearchInput";
import SelectField from "../ui/SelectField";
import ReusableButton from "../ui/ReusableButton";
import Modal from "@components/modals/Modal";

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

  /* ================= REDUX DATA ================= */
  const vehicles = useSelector(selectVehicles);
  const loading = useSelector(selectVehiclesLoading);
  const totalItems = useSelector(selectVehiclesTotal);

  /* ================= VENDORS ================= */
  const vendors = useVendorOptions();

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

  /* ================= FETCH PARAM BUILDER ================= */
  const buildFetchParams = useCallback(() => {
    const params = {
      skip: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    };

    // 🔥 Vendor logic (same as Vehicle Types)
    if (isVendorUser) {
      params.vendor_id = vendorId;
    } else if (selectedVendor?.value) {
      params.vendor_id = selectedVendor.value;
    } else {
      return null; // ❌ do not fetch without vendor
    }

    // 🔍 Debounced search
    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    // 🔄 Status mapping
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
    <div className="p-4 md:p-6">
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
          <div className="flex items-center gap-3">
            <ReusableButton
              module="audit_log"
              action="read"
              icon={History}
              title="Audit History"
              disabled={shouldShowNoVendorMessage}
              className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md"
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
              onChange={setStatus}
              disabled={shouldShowNoVendorMessage}
              options={[
                { label: "All Status", value: "All" },
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
            />
          </div>
        }
      />

      {/* EMPTY STATE */}
      {shouldShowNoVendorMessage && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-center">
          <p className="text-yellow-800 font-medium">
            Please select a vendor to view vehicles
          </p>
        </div>
      )}

      {/* LIST */}
      {!shouldShowNoVendorMessage && (
        <>
          {loading ? (
            <div className="mt-6 text-center">Loading vehicles...</div>
          ) : (
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
          )}
        </>
      )}

      {/* MODAL */}
      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        vehicleData={selectedVehicle}
        onSubmitSuccess={() => {
          toast.success("Vehicle saved successfully");
        }}
      />
    </div>
  );
};

export default NewVehicleManagement;
