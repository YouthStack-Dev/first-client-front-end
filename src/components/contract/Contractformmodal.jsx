import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import PopupModal from "./PopupModal";
import { useVendorOptions } from "../../hooks/useVendorOptions";

import { fetchVehicleTypesThunk } from "../../redux/features/managevehicletype/vehicleTypeThunks";
import {
  vehicleTypeSelectors,
  selectVehicleTypesLastFetchParams,
  selectVehicleTypesLoaded,
} from "../../redux/features/managevehicletype/vehicleTypeSlice";

const emptyForm = {
  vendor_id: "",
  vehicle_type_id: "",
  contract_name: "",
  is_active: true,
};

const ContractFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  saving = false,
  error = null,
}) => {
  const dispatch = useDispatch();

  const { vendorOptions } = useVendorOptions(null, true);

  const vehicleTypes = useSelector(vehicleTypeSelectors.selectAll);
  const lastFetchParams = useSelector(selectVehicleTypesLastFetchParams);
  const vehicleTypesLoaded = useSelector(selectVehicleTypesLoaded);

  const isEdit = Boolean(initialData);

  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);

  // --------------------------------------------------
  // Populate form
  // --------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setForm({
        vendor_id:
          initialData.vendor_id ??
          initialData.vendor?.vendor_id ??
          initialData.vendor?.id ??
          "",

        vehicle_type_id:
          initialData.vehicle_type_id ??
          initialData.vehicle_type?.vehicle_type_id ??
          initialData.vehicle_type?.id ??
          "",

        contract_name:
          initialData.contract_name ??
          initialData.name ??
          "",

        is_active:
          initialData.is_active ??
          initialData.status === "active",
      });
    } else {
      setForm(emptyForm);
    }

    setTouched(false);
  }, [isOpen, initialData]);

  // --------------------------------------------------
  // Fetch Vehicle Types — skip if already fetched for this vendor
  // --------------------------------------------------
  useEffect(() => {
    if (!isOpen || !form.vendor_id) return;

    const alreadyFetched =
      vehicleTypesLoaded &&
      String(lastFetchParams?.vendor_id) === String(form.vendor_id);

    if (alreadyFetched) return;

    dispatch(fetchVehicleTypesThunk({ vendor_id: Number(form.vendor_id) }));
  }, [dispatch, isOpen, form.vendor_id, vehicleTypesLoaded, lastFetchParams]);

  // --------------------------------------------------
  // Handle Change
  // --------------------------------------------------
  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    if (field === "vendor_id") {
      setForm((prev) => ({
        ...prev,
        vendor_id: value,
        vehicle_type_id: "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid =
    form.vendor_id !== "" &&
    form.vehicle_type_id !== "" &&
    form.contract_name.trim() !== "";

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    onSubmit({
      vendor_id: Number(form.vendor_id),
      vehicle_type_id: Number(form.vehicle_type_id),
      contract_name: form.contract_name.trim(),
      is_active: Boolean(form.is_active),
    });
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Contract" : "Add Contract"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Vendor */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Vendor <span className="text-red-500">*</span>
          </label>

          <select
            value={form.vendor_id}
            onChange={handleChange("vendor_id")}
            className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              touched && form.vendor_id === ""
                ? "border-red-400"
                : "border-gray-300"
            }`}
          >
            <option value="">Select Vendor</option>
            {vendorOptions.map((vendor) => (
              <option key={vendor.value} value={vendor.value}>
                {vendor.label}
              </option>
            ))}
          </select>

          {touched && form.vendor_id === "" && (
            <p className="mt-1 text-xs text-red-500">Vendor is required</p>
          )}
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Vehicle Type <span className="text-red-500">*</span>
          </label>

          <select
            value={form.vehicle_type_id}
            onChange={handleChange("vehicle_type_id")}
            disabled={!form.vendor_id}
            className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 ${
              touched && form.vehicle_type_id === ""
                ? "border-red-400"
                : "border-gray-300"
            }`}
          >
            <option value="">
              {form.vendor_id ? "Select Vehicle Type" : "Select Vendor First"}
            </option>
            {vehicleTypes.map((vt) => (
              <option key={vt.vehicle_type_id} value={vt.vehicle_type_id}>
                {vt.vehicle_type_name ||
                  vt.name ||
                  vt.vehicle_type?.vehicle_type_name}
              </option>
            ))}
          </select>

          {touched && form.vehicle_type_id === "" && (
            <p className="mt-1 text-xs text-red-500">
              Vehicle Type is required
            </p>
          )}
        </div>

        {/* Contract Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contract Name <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={form.contract_name}
            onChange={handleChange("contract_name")}
            placeholder="e.g. Sedan Contract"
            className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              touched && form.contract_name.trim() === ""
                ? "border-red-400"
                : "border-gray-300"
            }`}
          />

          {touched && form.contract_name.trim() === "" && (
            <p className="mt-1 text-xs text-red-500">
              Contract Name is required
            </p>
          )}
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            id="contract-status"
            type="checkbox"
            checked={Boolean(form.is_active)}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, is_active: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <label
            htmlFor="contract-status"
            className="text-sm font-medium text-gray-700"
          >
            Active
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </PopupModal>
  );
};

export default ContractFormModal;