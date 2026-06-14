import React, { useEffect, useState } from "react";
import PopupModal from "./PopupModal";

const emptyForm = {
  min_km: "",
  max_km: "",
  rate: "",
  is_active: true,
};

/**
 * Add / Edit Slab modal.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onSubmit: (formData) => void
 *  - initialData: slab object | null (null => add mode)
 *  - saving: boolean
 *  - error: string | null
 */
const SlabFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  saving = false,
  error = null,
}) => {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [unlimited, setUnlimited] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      const isInfinite =
        initialData.max_km === null ||
        initialData.max_km === undefined ||
        initialData.max_km === "" ||
        initialData.max_km === Infinity;

      setForm({
        min_km: initialData.min_km ?? "",
        max_km: isInfinite ? "" : initialData.max_km,
        rate: initialData.rate ?? "",
        is_active:
          initialData.is_active ?? initialData.active ?? true,
      });
      setUnlimited(isInfinite);
    } else {
      setForm(emptyForm);
      setUnlimited(false);
    }
    setTouched(false);
  }, [isOpen, initialData]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isValid =
    form.min_km !== "" &&
    form.rate !== "" &&
    (unlimited || form.max_km !== "") &&
    (unlimited || Number(form.max_km) > Number(form.min_km));

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    onSubmit({
      min_km: Number(form.min_km),
      max_km: unlimited ? null : Number(form.max_km),
      rate: Number(form.rate),
      is_active: Boolean(form.is_active),
    });
  };

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Slab" : "Add Slab"}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Min KM */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Min KM <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={form.min_km}
            onChange={handleChange("min_km")}
            placeholder="0"
            className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              touched && form.min_km === ""
                ? "border-red-400"
                : "border-gray-300"
            }`}
          />
          {touched && form.min_km === "" && (
            <p className="mt-1 text-xs text-red-500">Min KM is required</p>
          )}
        </div>

        {/* Max KM */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Max KM <span className="text-red-500">*</span>
            </label>
            <label className="flex items-center gap-1 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={unlimited}
                onChange={(e) => setUnlimited(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Unlimited (∞)
            </label>
          </div>
          <input
            type="number"
            min="0"
            value={form.max_km}
            onChange={handleChange("max_km")}
            placeholder="10"
            disabled={unlimited}
            className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 ${
              touched && !unlimited && form.max_km === ""
                ? "border-red-400"
                : "border-gray-300"
            }`}
          />
          {touched &&
            !unlimited &&
            form.max_km !== "" &&
            Number(form.max_km) <= Number(form.min_km) && (
              <p className="mt-1 text-xs text-red-500">
                Max KM must be greater than Min KM
              </p>
            )}
          {touched && !unlimited && form.max_km === "" && (
            <p className="mt-1 text-xs text-red-500">Max KM is required</p>
          )}
        </div>

        {/* Rate */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Rate <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.rate}
            onChange={handleChange("rate")}
            placeholder="10"
            className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              touched && form.rate === ""
                ? "border-red-400"
                : "border-gray-300"
            }`}
          />
          {touched && form.rate === "" && (
            <p className="mt-1 text-xs text-red-500">Rate is required</p>
          )}
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            id="slab-active"
            type="checkbox"
            checked={Boolean(form.is_active)}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, is_active: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="slab-active"
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
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </PopupModal>
  );
};

export default SlabFormModal;