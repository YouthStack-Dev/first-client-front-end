import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Eye, EyeOff, Trash2, Truck } from "lucide-react";
import { toast } from "react-toastify";

import {
  fetchEscortsThunk,
  createEscortThunk,
  updateEscortThunk,
  deleteEscortThunk,
  toggleEscortActiveThunk,
  toggleEscortAvailableThunk,
  setEscortPasswordThunk,
} from "../redux/features/escort/escortThunks";

import {
  escortSelectors,
  selectEscortLoading,
  selectEscortError,
} from "../redux/features/escort/escortSlice";

import { genderOptions } from "../components/escort/constants";

import EscortTable from "../components/escort/EscortTable";
import EscortFormModal from "../components/modals/EscortFormModal";
import { useVendorOptions } from "../hooks/useVendorOptions";
import ToolBar from "../components/ui/ToolBar";

const EscortManagement = () => {
  const dispatch = useDispatch();

  const escorts = useSelector(escortSelectors.selectAll);
  const loading = useSelector(selectEscortLoading);
  const serverError = useSelector(selectEscortError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedEscort, setSelectedEscort] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());
  const [formErrors, setFormErrors] = useState({});
  const [passwordEscort, setPasswordEscort] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, escortId: null });
  const [selectedVendorId, setSelectedVendorId] = useState("");

  // ✅ Track the last fetched vendor filter so we don't re-fetch on every visit
  const lastFetchedVendorId = useRef(undefined); // undefined = never fetched

  const { vendorOptions } = useVendorOptions(null, true);

  function getInitialFormData() {
    return {
      vendor_id: null,
      name: "",
      phone: "",
      email: "",
      address: "",
      gender: "",
      is_active: true,
      is_available: true,
      password: "",
    };
  }

  // ✅ Only fetch when:
  //    1. First visit with no data in store (lastFetchedVendorId is undefined AND escorts is empty)
  //    2. Vendor filter actually changes
  useEffect(() => {
    const filterChanged = lastFetchedVendorId.current !== selectedVendorId;
    const isFirstVisit = lastFetchedVendorId.current === undefined;
    const hasNoData = escorts.length === 0;

    if (filterChanged || (isFirstVisit && hasNoData)) {
      lastFetchedVendorId.current = selectedVendorId;
      dispatch(
        fetchEscortsThunk(selectedVendorId ? { vendor_id: selectedVendorId } : {})
      );
    }
  }, [dispatch, selectedVendorId]);

  const handleCreate = () => {
    setModalMode("create");
    setSelectedEscort(null);
    setFormData(getInitialFormData());
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (escort) => {
  setModalMode("edit");
  setSelectedEscort(escort);

  setFormData({
    ...getInitialFormData(),
    ...escort,
    name: escort?.name ?? "",
    phone: escort?.phone ?? "",
    email: escort?.email ?? "",
    address: escort?.address ?? "",
    gender: escort?.gender ?? "",
  });

  setFormErrors({});
  setIsModalOpen(true);
};

const handleView = (escort) => {
  setModalMode("view");
  setSelectedEscort(escort);

  setFormData({
    ...getInitialFormData(),
    ...escort,
    name: escort?.name ?? "",
    phone: escort?.phone ?? "",
    email: escort?.email ?? "",
    address: escort?.address ?? "",
    gender: escort?.gender ?? "",
  });

  setIsModalOpen(true);
};

  const handleDelete = (escortId) => {
    setDeleteConfirm({ open: true, escortId });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.escortId;
    setDeleteConfirm({ open: false, escortId: null });
    try {
      await dispatch(deleteEscortThunk(id)).unwrap();
      toast.success("Escort deleted successfully!");
    } catch (err) {
      if (err?.errorCode === "ESCORT_NOT_FOUND") {
        toast.error("Escort already deleted or not found.");
      } else {
        toast.error(err?.message || "Failed to delete escort.");
      }
    }
  };

  const handleOnToggleActive = async (escort) => {
    try {
      await dispatch(
        toggleEscortActiveThunk({
          id: escort.escort_id,
          currentState: escort.is_active,
        })
      ).unwrap();
      toast.success(
        `Escort ${escort.is_active ? "deactivated" : "activated"} successfully!`
      );
    } catch (error) {
      toast.error(error?.message || "Failed to update active status");
    }
  };

  const handleOnToggleAvailable = async (escort) => {
    try {
      await dispatch(
        toggleEscortAvailableThunk({
          id: escort.escort_id,
          currentState: escort.is_available,
        })
      ).unwrap();
      toast.success(
        `Escort marked as ${escort.is_available ? "unavailable" : "available"}!`
      );
    } catch (error) {
      toast.error(error?.message || "Failed to update available status");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const phoneDigits = (formData.phone || "").replace(/\D/g, "");

    if (!formData.vendor_id) newErrors.vendor_id = "Vendor is required";
    if (!formData.name.trim()) newErrors.name = "Name required";
    if (!formData.phone.trim()) newErrors.phone = "Phone required";
    else if (phoneDigits.length < 10)
      newErrors.phone = "Phone must have at least 10 digits";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    setFormErrors(newErrors);
    return !Object.keys(newErrors).length;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const basePayload = {
        vendor_id: formData.vendor_id,
        name: formData.name?.trim(),
        phone: formData.phone?.trim(),
        is_active: !!formData.is_active,
        is_available: !!formData.is_available,
      };
      if (formData.email?.trim()) basePayload.email = formData.email.trim();
      if (formData.address?.trim()) basePayload.address = formData.address.trim();
      if (formData.gender) basePayload.gender = formData.gender;

      if (modalMode === "create") {
        const createPayload = { ...basePayload };
        if (formData.password?.trim()) {
          createPayload.password = formData.password.trim();
        }
        await dispatch(createEscortThunk(createPayload)).unwrap();
        toast.success("Escort created successfully!");
      } else {
        await dispatch(
          updateEscortThunk({
            id: selectedEscort.escort_id,
            data: basePayload,
          })
        ).unwrap();
        toast.success("Escort updated successfully!");
      }

      setIsModalOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to save escort");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = (escort) => {
    setPasswordEscort(escort);
    setResetPassword("");
    setConfirmResetPassword("");
    setResetPasswordError("");
    setShowResetPassword(false);
  };

  const closeResetPasswordModal = () => {
    if (isResettingPassword) return;
    setPasswordEscort(null);
    setResetPassword("");
    setConfirmResetPassword("");
    setResetPasswordError("");
  };

  const submitResetPassword = async () => {
    const value = resetPassword.trim();
    const confirmValue = confirmResetPassword.trim();

    if (!value) { setResetPasswordError("Password is required."); return; }
    if (value.length < 6) { setResetPasswordError("Password must be at least 6 characters."); return; }
    if (value !== confirmValue) { setResetPasswordError("Passwords do not match."); return; }

    setResetPasswordError("");
    setIsResettingPassword(true);
    try {
      await dispatch(
        setEscortPasswordThunk({
          escortId: passwordEscort.escort_id,
          newPassword: value,
        })
      ).unwrap();
      closeResetPasswordModal();
      toast.success("Password updated successfully!");
    } catch (err) {
      setResetPasswordError(err?.message || "Failed to reset password.");
      toast.error(err?.message || "Failed to reset password.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToolBar
        module="escort"
        onAddClick={handleCreate}
        addButtonLabel="Escort"
        leftElements={
          <div className="flex items-center gap-3">
            {/* Count badge */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500 font-medium">Total</span>
              <span className="text-sm font-bold text-gray-800">{escorts.length}</span>
            </div>

            {/* Vendor filter dropdown */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <Truck className="w-4 h-4 text-gray-400" />
              </div>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer min-w-[170px]"
              >
                <option value="">All Vendors</option>
                {vendorOptions.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Active filter clear badge */}
            {selectedVendorId && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <Truck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="text-xs text-blue-700 font-medium max-w-[120px] truncate">
                  {vendorOptions.find((v) => v.value === selectedVendorId)?.label}
                </span>
                <button
                  onClick={() => setSelectedVendorId("")}
                  className="text-blue-400 hover:text-blue-600 transition-colors flex-shrink-0"
                  aria-label="Clear vendor filter"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
        }
        className="bg-white rounded-lg shadow-sm mb-4"
      />

      {/* Table */}
      <EscortTable
        escorts={escorts}
        vendors={vendorOptions}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleOnToggleActive}
        onToggleAvailable={handleOnToggleAvailable}
        onResetPassword={handleResetPassword}
        isLoading={loading}
      />

      {/* Escort Form Modal */}
      <EscortFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        formData={formData}
        errors={{
          ...formErrors,
          server: serverError,
        }}
        vendors={vendorOptions}
        genderOptions={genderOptions}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Reset Password Modal */}
      {passwordEscort && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-lg border border-app-border bg-app-surface shadow-xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-sidebar-primary to-sidebar-secondary px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                Reset Escort Password
              </h2>
              <button
                type="button"
                onClick={closeResetPasswordModal}
                disabled={isResettingPassword}
                className="rounded p-1 text-white transition-colors hover:bg-app-secondary disabled:opacity-50"
                aria-label="Close password reset modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <p className="text-sm text-app-text-secondary">
                Set a new password for{" "}
                <span className="font-semibold text-app-text-primary">
                  {passwordEscort?.name || "selected escort"}
                </span>
                .
              </p>

              {/* New Password */}
              <div>
                <label className="mb-1 block text-sm font-medium text-app-text-secondary">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={isResettingPassword}
                    className="w-full rounded-lg border border-app-border bg-app-surface px-3 py-2 pr-10 text-app-text-primary focus:border-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/20"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword((v) => !v)}
                    disabled={isResettingPassword}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-app-text-secondary hover:text-app-text-primary disabled:opacity-50"
                    aria-label={showResetPassword ? "Hide password" : "Show password"}
                  >
                    {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-1 block text-sm font-medium text-app-text-secondary">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    value={confirmResetPassword}
                    onChange={(e) => setConfirmResetPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={isResettingPassword}
                    className="w-full rounded-lg border border-app-border bg-app-surface px-3 py-2 pr-10 text-app-text-primary focus:border-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/20"
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword((v) => !v)}
                    disabled={isResettingPassword}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-app-text-secondary hover:text-app-text-primary disabled:opacity-50"
                    aria-label={showResetPassword ? "Hide password" : "Show password"}
                  >
                    {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {resetPasswordError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {resetPasswordError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-app-border bg-app-tertiary px-6 py-4">
              <button
                type="button"
                onClick={closeResetPasswordModal}
                disabled={isResettingPassword}
                className="rounded-lg border border-app-border px-4 py-2 text-app-text-secondary transition-colors hover:bg-app-surface disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitResetPassword}
                disabled={isResettingPassword}
                className="rounded-lg bg-gradient-to-r from-sidebar-primary to-sidebar-secondary px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isResettingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 w-80 text-center">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-red-100 mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <p className="font-semibold text-gray-800 text-base mb-1">
              Delete escort?
            </p>
            <p className="text-sm text-gray-500 mb-5">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm({ open: false, escortId: null })}
                className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscortManagement;