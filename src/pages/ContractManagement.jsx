import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Pencil, Layers, Trash2, RefreshCw, Car } from "lucide-react";
import { toast } from "react-toastify";

import ContractFormModal from "../components/contract/Contractformmodal";
import ManageSlabsModal from "../components/contract/Manageslabsmodal";
import ContractSummaryModal from "../components/contract/Contractsummarymodal";
import ReusableButton from "../components/ui/ReusableButton";
import ReusableToggleButton from "../components/ui/ReusableToggleButton";
import { ReusablePagination } from "../components/ui/ReusablePagination";

import {
  fetchContractsThunk,
  createContractThunk,
  updateContractThunk,
  deleteContractThunk,
  toggleContractStatusThunk,
} from "../redux/features/contract/contractsSlice";

import { clearError } from "../redux/features/contract/contractsSlice";

import {
  selectContracts,
  selectContractsLoading,
  selectContractsError,
  selectContractsSaving,
  selectContractsSaveError,
} from "../redux/features/contract/contractsSelector";

import { useVendorOptions } from "../hooks/useVendorOptions";

/* ===== ERROR MESSAGE EXTRACTOR ===== */
const extractErrorMessage = (payload, fallback = "Something went wrong") =>
  payload?.detail?.message ||
  payload?.message ||
  (typeof payload === "string" ? payload : null) ||
  fallback;

const ContractManagement = () => {
  const dispatch = useDispatch();

  const loading = useSelector(selectContractsLoading);
  const error = useSelector(selectContractsError);
  const saving = useSelector(selectContractsSaving);
  const saveError = useSelector(selectContractsSaveError);
  const contracts = useSelector(selectContracts);

  const permissions = useSelector((state) => state.auth?.permissions || []);

  const hasPermission = (module, action) => {
    const modulePermission = permissions.find((p) => p.module === module);
    return modulePermission?.action?.includes(action);
  };

  const { vendorList: vendors, loading: vendorsLoading } = useVendorOptions(
    null,
    true
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [syncing, setSyncing] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  const [slabsModalOpen, setSlabsModalOpen] = useState(false);
  const [activeContract, setActiveContract] = useState(null);

  const [togglingId, setTogglingId] = useState(null);

  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [forceDeleting, setForceDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (hasPermission("contract", "read") && selectedVendorId) {
      dispatch(fetchContractsThunk({ vendor_id: selectedVendorId }));
    }
  }, [dispatch, selectedVendorId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedVendorId, searchTerm]);

  if (!hasPermission("contract", "read")) {
    return (
      <div className="p-6 text-center text-red-600 font-medium">
        You do not have permission to view contracts.
      </div>
    );
  }

  /* ================= SYNC ================= */
  const handleSync = async () => {
    if (!selectedVendorId) return;
    setSyncing(true);
    try {
      await dispatch(fetchContractsThunk({ vendor_id: selectedVendorId }));
      toast.success("Contracts refreshed");
    } finally {
      setSyncing(false);
    }
  };

  const filteredContracts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return contracts;
    return contracts.filter((c) => {
      const name = (c.contract_name || c.name || "").toLowerCase();
      const vehicleType = (
        c.vehicle_type?.name ||
        c.vehicle_type_name ||
        ""
      ).toLowerCase();
      return name.includes(term) || vehicleType.includes(term);
    });
  }, [contracts, searchTerm]);

  const totalItems = filteredContracts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContracts.slice(start, start + itemsPerPage);
  }, [filteredContracts, currentPage, itemsPerPage]);

  const handleAddClick = () => {
    setEditingContract(null);
    dispatch(clearError());
    setFormModalOpen(true);
  };

  const handleEditClick = (contract) => {
    setEditingContract(contract);
    dispatch(clearError());
    setFormModalOpen(true);
  };

  /* ================= CREATE / UPDATE ================= */
  const handleFormSubmit = async (payload) => {
    const dataWithVendor = { ...payload, vendor_id: selectedVendorId };

    if (editingContract) {
      const contractId = editingContract.contract_id ?? editingContract.id;
      const result = await dispatch(
        updateContractThunk({ contractId, contractData: dataWithVendor })
      );

      if (result.error) {
        toast.error(extractErrorMessage(result.payload, "Failed to update contract"));
      } else {
        toast.success("Contract updated successfully");
        setFormModalOpen(false);
        setEditingContract(null);
      }
    } else {
      const result = await dispatch(createContractThunk(dataWithVendor));

      if (result.error) {
        toast.error(extractErrorMessage(result.payload, "Failed to create contract"));
      } else {
        toast.success("Contract created successfully");
        setFormModalOpen(false);
        setEditingContract(null);
      }
    }
  };

  const handleManageSlabsClick = (contract) => {
    setActiveContract(contract);
    setSlabsModalOpen(true);
  };

  /* ================= TOGGLE STATUS ================= */
  const handleToggleStatus = async (contract) => {
    const contractId = contract.contract_id ?? contract.id;
    const currentlyActive = contract.is_active ?? contract.status === "active";

    setTogglingId(contractId);
    try {
      const result = await dispatch(
        toggleContractStatusThunk({ contractId, isActive: !currentlyActive })
      );

      if (result.error) {
        toast.error(
          extractErrorMessage(result.payload, "Failed to update contract status")
        );
      } else {
        toast.success(
          `Contract ${!currentlyActive ? "activated" : "deactivated"} successfully`
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteClick = async (contract) => {
    const contractId = contract.contract_id ?? contract.id;

    const result = await dispatch(
      deleteContractThunk({ contractId, force: false })
    );

    if (result.type === deleteContractThunk.rejected.type) {
      if (result.payload?.type === "VEHICLE_CONFLICT") {
        setDeleteConfirm({ contractId });
      } else {
        toast.error(
          extractErrorMessage(result.payload, "Failed to delete contract")
        );
      }
    } else {
      toast.success("Contract deleted successfully");
    }
  };

  /* ================= FORCE DELETE ================= */
  const handleForceDelete = async () => {
    if (!deleteConfirm) return;

    setForceDeleting(true);
    try {
      const result = await dispatch(
        deleteContractThunk({ contractId: deleteConfirm.contractId, force: true })
      );

      if (result.error) {
        toast.error(
          extractErrorMessage(result.payload, "Failed to delete contract")
        );
      } else {
        toast.success("Contract removed and deleted successfully");
        dispatch(fetchContractsThunk({ vendor_id: selectedVendorId }));
      }
    } finally {
      setForceDeleting(false);
      setDeleteConfirm(null);
    }
  };

  /* ================= VENDOR NAME HELPER ================= */
  const selectedVendorName =
    vendors.find(
      (v) => String(v.vendor_id ?? v.id) === String(selectedVendorId)
    )?.name ||
    vendors.find(
      (v) => String(v.vendor_id ?? v.id) === String(selectedVendorId)
    )?.vendor_name ||
    "";

  return (
    <div className="px-4 py-3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Contract"
            disabled={!selectedVendorId}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedVendorId}
            onChange={(e) => setSelectedVendorId(e.target.value)}
            className="min-w-[220px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {vendorsLoading ? "Loading vendors..." : "Select Vendor"}
            </option>
            {vendors.map((vendor) => (
              <option
                key={vendor.vendor_id ?? vendor.id}
                value={vendor.vendor_id ?? vendor.id}
              >
                {vendor.name || vendor.vendor_name}
              </option>
            ))}
          </select>

          {/* Sync button */}
          {selectedVendorId && (
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || loading}
              title="Refresh contracts"
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={syncing || loading ? "animate-spin" : ""}
              />
              Sync
            </button>
          )}

          {/* Contract Summary button */}
          {selectedVendorId && (
            <button
              type="button"
              onClick={() => setSummaryModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-100"
            >
              <Car size={14} />
              Contract Summary
            </button>
          )}

          {hasPermission("contract", "create") && (
            <ReusableButton
              module="contract"
              action="create"
              buttonName="+ Add Contract"
              onClick={handleAddClick}
              disabled={!selectedVendorId}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition ${
                selectedVendorId
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "cursor-not-allowed bg-blue-300"
              }`}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Contract Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Vehicle Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {!selectedVendorId ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Please select a vendor to view contracts.
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Loading contracts...
                </td>
              </tr>
            ) : paginatedContracts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No contracts found.
                </td>
              </tr>
            ) : (
              paginatedContracts.map((contract) => {
                const contractId = contract.contract_id ?? contract.id;
                const isActive =
                  contract.is_active ?? contract.status === "active";

                return (
                  <tr key={contractId}>
                    <td className="px-4 py-2 text-gray-800">
                      {contract.contract_name || contract.name}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {contract.vehicle_type?.name ||
                        contract.vehicle_type_name ||
                        "-"}
                    </td>
                    <td className="px-4 py-2">
                      <ReusableToggleButton
                        module="contract"
                        action="update"
                        isChecked={isActive}
                        loading={togglingId === contractId}
                        onToggle={() => handleToggleStatus(contract)}
                        labels={{ on: "Active", off: "Inactive" }}
                        size="small"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ReusableButton
                          module="contract"
                          action="update"
                          icon={Pencil}
                          title="Edit"
                          size={16}
                          onClick={() => handleEditClick(contract)}
                          className="p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        />
                        <ReusableButton
                          module="contract"
                          action="update"
                          icon={Layers}
                          title="Manage Slabs"
                          size={16}
                          onClick={() => handleManageSlabsClick(contract)}
                          className="p-1.5 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                        />
                        <ReusableButton
                          module="contract"
                          action="delete"
                          icon={Trash2}
                          title="Delete"
                          size={16}
                          onClick={() => handleDeleteClick(contract)}
                          className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {selectedVendorId && !loading && totalItems > 0 && (
          <ReusablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Contract Form Modal */}
      <ContractFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingContract(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingContract}
        saving={saving}
        error={saveError}
        vendorId={selectedVendorId}
      />

      {/* Manage Slabs Modal */}
      <ManageSlabsModal
        isOpen={slabsModalOpen}
        onClose={() => {
          setSlabsModalOpen(false);
          setActiveContract(null);
        }}
        contract={activeContract}
      />

      {/* Contract Summary Modal */}
      <ContractSummaryModal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        vendorId={selectedVendorId}
        vendorName={selectedVendorName}
      />

      {/* Force Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-base font-semibold text-gray-800">
              Contract Assigned to Vehicles
            </h2>
            <p className="mb-5 text-sm text-gray-600">
              This contract is assigned to vehicles. Removing it will unassign
              all vehicles and deactivate the contract. Do you want to proceed?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={forceDeleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleForceDelete}
                disabled={forceDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {forceDeleting ? "Deleting..." : "Yes, Remove & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;