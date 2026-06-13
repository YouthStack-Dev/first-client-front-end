import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import PopupModal from "./PopupModal";
import SlabFormModal from "./SlabFormModal";

import {
  createSlabThunk,
  updateSlabThunk,
  deleteSlabThunk,
} from "../../redux/features/contract/contractsThunk";

import { clearError } from "../../redux/features/contract/contractsSlice";

import {
  selectSlabsByContractId,
  selectContractsSaving,
  selectContractsSaveError,
} from "../../redux/features/contract/contractsSelector";

/* ===== ERROR MESSAGE EXTRACTOR ===== */
const extractErrorMessage = (payload, fallback = "Something went wrong") =>
  payload?.detail?.message ||
  payload?.message ||
  (typeof payload === "string" ? payload : null) ||
  fallback;

const ManageSlabsModal = ({ isOpen, onClose, contract }) => {
  const dispatch = useDispatch();

  const permissions = useSelector((state) => state.auth?.permissions || []);

  const hasPermission = (module, action) => {
    const modulePermission = permissions.find((p) => p.module === module);
    return modulePermission?.action?.includes(action);
  };

  const contractId = contract?.contract_id ?? contract?.id;

  const slabs = useSelector((state) =>
    selectSlabsByContractId(state, contractId)
  );

  const saveError = useSelector(selectContractsSaveError);
  const saving = useSelector(selectContractsSaving);

  const [slabModalOpen, setSlabModalOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleAddClick = () => {
    if (!hasPermission("contract", "update")) return;
    setEditingSlab(null);
    dispatch(clearError());
    setSlabModalOpen(true);
  };

  const handleEditClick = (slab) => {
    if (!hasPermission("contract", "update")) return;
    setEditingSlab(slab);
    dispatch(clearError());
    setSlabModalOpen(true);
  };

  /* ================= DELETE ================= */
  const handleDeleteClick = async (slab) => {
    if (!hasPermission("contract", "update")) return;

    const slabId = slab.slab_id ?? slab.id;
    setDeleting(true);

    try {
      const result = await dispatch(deleteSlabThunk({ contractId, slabId }));

      if (result.error) {
        toast.error(extractErrorMessage(result.payload, "Failed to delete slab"));
      } else {
        toast.success("Slab deleted successfully");
        setDeleteConfirmId(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSlabSubmit = async (payload) => {
    if (!hasPermission("contract", "update")) return;

    if (editingSlab) {
      const slabId = editingSlab.slab_id ?? editingSlab.id;
      const result = await dispatch(
        updateSlabThunk({ contractId, slabId, slabData: payload })
      );

      if (result.error) {
        toast.error(extractErrorMessage(result.payload, "Failed to update slab"));
      } else {
        toast.success("Slab updated successfully");
        setSlabModalOpen(false);
        setEditingSlab(null);
      }
    } else {
      const result = await dispatch(
        createSlabThunk({ contractId, slabData: payload })
      );

      if (result.error) {
        toast.error(extractErrorMessage(result.payload, "Failed to create slab"));
      } else {
        toast.success("Slab created successfully");
        setSlabModalOpen(false);
        setEditingSlab(null);
      }
    }
  };

  if (!contract) return null;
  if (!hasPermission("contract", "read")) return null;

  return (
    <>
      <PopupModal
        isOpen={isOpen}
        onClose={onClose}
        title={`${contract.contract_name || contract.name} Slabs`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            {hasPermission("contract", "update") && (
              <button
                type="button"
                onClick={handleAddClick}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Add Slab
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Min KM
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Max KM
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Rate
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {slabs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-400"
                    >
                      No slabs added yet.
                    </td>
                  </tr>
                ) : (
                  slabs.map((slab) => {
                    const slabId = slab.slab_id ?? slab.id;
                    const isConfirming = deleteConfirmId === slabId;

                    return (
                      <tr key={slabId}>
                        <td className="px-4 py-2 text-gray-700">
                          {slab.min_km}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {slab.max_km === null || slab.max_km === undefined
                            ? "∞"
                            : slab.max_km}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {slab.rate}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              slab.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {slab.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          {hasPermission("contract", "update") && (
                            <div className="flex justify-end gap-3">
                              {isConfirming ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={() => handleDeleteClick(slab)}
                                    className="font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                                  >
                                    {deleting ? "Deleting..." : "Confirm"}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleEditClick(slab)}
                                    className="font-medium text-blue-600 hover:text-blue-800"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(slabId)}
                                    className="font-medium text-red-600 hover:text-red-800"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PopupModal>

      <SlabFormModal
        isOpen={slabModalOpen}
        onClose={() => {
          setSlabModalOpen(false);
          setEditingSlab(null);
        }}
        onSubmit={handleSlabSubmit}
        initialData={editingSlab}
        saving={saving}
        error={null}
      />
    </>
  );
};

export default ManageSlabsModal;