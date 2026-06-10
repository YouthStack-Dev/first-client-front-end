import React, { useState, useEffect, useMemo, useRef } from "react";
import { Download, History, X } from "lucide-react";   // ← added X
import { useSelector, useDispatch } from "react-redux";
import AuditLogsModal from "../components/modals/AuditLogsModal";
import DriverFormModal from "../components/driver/NewDriverFrom";
import DriverHistoryTab from "../components/driver/Driverhistorytab";   // ← NEW
import ToolBar from "../components/ui/ToolBar";
import SearchInput from "@components/ui/SearchInput";
import ReusableButton from "../components/ui/ReusableButton";
import SelectField from "../components/ui/SelectField";
import { useVendorOptions } from "../hooks/useVendorOptions";
import { logDebug } from "../utils/logger";
import { NewDriverList } from "../components/driver/NewDriverList";
import { selectCurrentUser } from "../redux/features/auth/authSlice";
import {
  driversSelectors,
  NewfetchDriversThunk,
  selectDriversLoading,
  selectDriversTotal,
} from "../redux/features/manageDriver/newDriverSlice";
import { toggleDriverStatusThunk } from "../redux/features/manageDriver/driverThunks";
import { toast } from "react-toastify";

// ----------------------------
// Status → API param map
// ----------------------------
const STATUS_PARAM_MAP = {
  Active:   { active_only: true  },
  Inactive: { active_only: false },
};

const NewDriverManagement = () => {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [status, setStatus] = useState("All");

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedDriverName, setSelectedDriverName] = useState(null);

  // ── History modal state ── NEW
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyDriver, setHistoryDriver] = useState(null);

  const debounceTimerRef = useRef(null);

  const user = useSelector(selectCurrentUser);
  const isVendorUser = user?.type === "vendor";
  const tenantId =
    user?.employee?.tenant_id ||
    user?.vendor_user?.tenant_id ||
    user?.tenant_id;

  const drivers    = useSelector(driversSelectors.selectAll);
  const loading    = useSelector(selectDriversLoading);
  const totalItems = useSelector(selectDriversTotal);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const skip       = (currentPage - 1) * itemsPerPage;

  const { vendorOptions } = useVendorOptions(null, !isVendorUser);

  // ----------------------------
  // Search debounce — 300ms, min 2 chars
  // ----------------------------
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (searchInput.trim() === "") {
      setSearchTerm("");
      setCurrentPage(1);
      return () => clearTimeout(debounceTimerRef.current);
    }

    if (searchInput.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        setSearchTerm(searchInput.trim());
        setCurrentPage(1);
      }, 300);
    }

    return () => clearTimeout(debounceTimerRef.current);
  }, [searchInput]);

  // ----------------------------
  // Shared base params builder
  // ----------------------------
  const buildBaseParams = () => {
    const params = {};

    if (isVendorUser) {
      params.vendor_id = user.vendor_id;
    } else if (selectedVendor?.value) {
      params.vendor_id = selectedVendor.value;
    } else {
      return null;
    }

    if (searchTerm.length >= 2) {
      params.search = searchTerm;
    }

    if (STATUS_PARAM_MAP[status]) {
      Object.assign(params, STATUS_PARAM_MAP[status]);
    }

    return params;
  };

  const fetchParams = useMemo(() => {
    const base = buildBaseParams();
    if (!base) return null;
    const params = { ...base, skip, limit: itemsPerPage };
    return Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== null && v !== undefined)
    );
  }, [skip, itemsPerPage, isVendorUser, user?.vendor_id, selectedVendor, searchTerm, status]);

  const exportParams = useMemo(() => buildBaseParams(), [
    isVendorUser, user?.vendor_id, selectedVendor, searchTerm, status,
  ]);

  useEffect(() => {
    if (fetchParams) {
      logDebug("Fetching drivers with params:", fetchParams);
      dispatch(NewfetchDriversThunk(fetchParams));
    }
  }, [fetchParams, dispatch]);

  useEffect(() => {
    if (isVendorUser) setSelectedVendor(null);
  }, [isVendorUser]);

  // ----------------------------
  // Search handlers
  // ----------------------------
  const handleSearchInputChange = (e) => setSearchInput(e.target.value);

  const handleClearSearch = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // ----------------------------
  // Modal handlers
  // ----------------------------
  const handleOpenCreateModal = () => {
    if (!isVendorUser && !selectedVendor) {
      toast.error("Please select a vendor first to add drivers.");
      return;
    }
    setModalMode("create");
    setSelectedDriver(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (driver) => {
    setModalMode("edit");
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (driver) => {
    setModalMode("view");
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
  };

  const handleSubmitSuccess = (message) => {
    toast.success(message);
    if (fetchParams) dispatch(NewfetchDriversThunk(fetchParams));
  };

  // ── History modal handlers ── NEW
  const handleOpenHistory = (driver) => {
    setHistoryDriver(driver);
    setShowHistoryModal(true);
  };

  const handleCloseHistory = () => {
    setShowHistoryModal(false);
    setHistoryDriver(null);
  };

  // ----------------------------
  // Pagination handlers
  // ----------------------------
  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  // ----------------------------
  // Vendor handler
  // ----------------------------
  const handleVendorSelect = (option) => {
    setSelectedVendor(option);
    setCurrentPage(1);
  };

  // ----------------------------
  // Status toggle
  // ----------------------------
  const handleStatusToggle = async (driver) => {
    if (!driver?.driver_id) {
      toast.error("Driver information is missing");
      return;
    }

    const vendorId = isVendorUser ? user.vendor_id : selectedVendor?.value;
    if (!vendorId) {
      toast.error("Please select a vendor first");
      return;
    }

    const toastId = toast.loading("Updating driver status...");
    try {
      await dispatch(
        toggleDriverStatusThunk({ driver_id: driver.driver_id, vendor_id: vendorId })
      ).unwrap();
      toast.update(toastId, {
        render: "Driver status updated successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
      });
      if (fetchParams) dispatch(NewfetchDriversThunk(fetchParams));
    } catch (error) {
      toast.update(toastId, {
        render: error?.message || "Failed to update driver status",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
      });
      logDebug("Error toggling driver status:", error);
    }
  };

  // ----------------------------
  // Filter & export handlers
  // ----------------------------
  const handleStatusFilter = (value) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    handleClearSearch();
    setStatus("All");
    setCurrentPage(1);
    if (!isVendorUser) setSelectedVendor(null);
    toast.success("Filters cleared");
  };

  const handleExport = () => {
    if (!exportParams) {
      toast.error("Please select a vendor to export drivers.");
      return;
    }
    logDebug("Exporting drivers with params:", exportParams);
    toast.info("Export feature coming soon.");
  };

  // ----------------------------
  // Derived flags
  // ----------------------------
  const shouldShowNoVendorMessage = !isVendorUser && !selectedVendor;
  const isValidFetchState         = isVendorUser || !!selectedVendor;
  const isSearchBelowMinChars     = searchInput.trim().length === 1;

  return (
    <div className="p-1">

      {/* ── Toolbar ── */}
      <ToolBar
        onAddClick={handleOpenCreateModal}
        module="driver"
        addButtonLabel="Driver"
        addButtonDisabled={shouldShowNoVendorMessage}
        searchBar={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="flex-grow relative">
              <SearchInput
                placeholder="Search drivers by name, license number, or phone... (min. 2 characters)"
                value={searchInput}
                onChange={handleSearchInputChange}
                className="flex-grow"
                disabled={shouldShowNoVendorMessage}
              />
              {isSearchBelowMinChars && (
                <p className="mt-1 text-xs text-amber-600">
                  Type 1 more character to search
                </p>
              )}
            </div>
            <button
              onClick={handleClearFilters}
              disabled={shouldShowNoVendorMessage}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Filters
            </button>
          </div>
        }
        rightElements={
          <div className="flex flex-wrap items-center gap-3">
            {/* {!isVendorUser && ( */}
              <ReusableButton
                module="driver"
                action="read"
                buttonName="History"
                icon={History}
                title="Audit History"
                disabled={shouldShowNoVendorMessage}
                onClick={() => setShowAuditModal(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md"
              />
            {/* )} */}

            <ReusableButton
              module="driver"
              action="read"
              icon={Download}
              title="Export Driver CSV"
              onClick={handleExport}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg bg-gray-100 hover:bg-green-100 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              size={18}
              disabled={shouldShowNoVendorMessage}
            />

            {!isVendorUser && (
              <div className="min-w-[200px]">
                <select
                  value={selectedVendor?.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) { handleVendorSelect(null); return; }
                    const opt = vendorOptions.find(
                      (o) => String(o.value) === String(val)
                    );
                    if (opt) handleVendorSelect(opt);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 hover:border-gray-400 bg-white"
                >
                  <option value="">Select vendor...</option>
                  {vendorOptions.map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <SelectField
              value={status}
              onChange={handleStatusFilter}
              options={[
                { label: "All Status", value: "All"      },
                { label: "Active",     value: "Active"   },
                { label: "Inactive",   value: "Inactive" },
              ]}
              className="min-w-[140px]"
              disabled={shouldShowNoVendorMessage}
            />
          </div>
        }
      />

      {/* ── No vendor selected ── */}
      {shouldShowNoVendorMessage && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-800 font-medium">
            Please select a vendor to view drivers
          </p>
          <p className="text-yellow-600 text-sm mt-1">
            Choose a vendor from the dropdown above to see their drivers
          </p>
        </div>
      )}

      {/* ── Main content ── */}
      {isValidFetchState && (
        <>
          {!loading && (
            <div className="mt-4 mb-2 text-sm text-gray-600">
              Showing {drivers.length} of {totalItems} drivers
              {isVendorUser ? (
                <span className="ml-2 text-blue-600">
                  (Vendor: {user.vendor_name || user.vendor_id})
                </span>
              ) : selectedVendor ? (
                <span className="ml-2 text-blue-600">
                  (Vendor: {selectedVendor.label})
                </span>
              ) : null}
              {searchTerm.length >= 2 && (
                <span className="ml-2 text-green-600">
                  | Search: "{searchTerm}"
                </span>
              )}
            </div>
          )}

          {/* ← onHistory wired up here */}
          <NewDriverList
            drivers={drivers}
            loading={loading}
            onEdit={handleOpenEditModal}
            onView={handleOpenViewModal}
            onHistory={handleOpenHistory}
            onStatusToggle={handleStatusToggle}
            showPagination={true}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}

      {/* ── Driver form modal ── */}
      <DriverFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        driverData={selectedDriver}
        onSubmitSuccess={handleSubmitSuccess}
        userType={user?.type}
        vendors={vendorOptions}
      />

      {/* ── Audit history modal ── */}
      <AuditLogsModal
        isOpen={showAuditModal}
        onClose={() => {
          setShowAuditModal(false);
          setSelectedDriverName(null);
        }}
        apimodule="driver"
        moduleName={selectedDriverName || "Driver"}
        showUserColumn={true}
        selectedCompany={tenantId}
      />

      {/* ── Driver History Modal ── NEW */}
      {showHistoryModal && historyDriver && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCloseHistory}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Driver History
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {historyDriver.name ?? `Driver #${historyDriver.driver_id}`}
                  {historyDriver.code && (
                    <span className="ml-2 text-blue-500">· {historyDriver.code}</span>
                  )}
                </p>
              </div>
              <button
                onClick={handleCloseHistory}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* History tab content */}
            <div className="px-6">
              <DriverHistoryTab driverId={historyDriver.driver_id} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NewDriverManagement;