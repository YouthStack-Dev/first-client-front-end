import { useState } from "react";
import { useSelector } from "react-redux";
import { selectNodalPointsLoading } from "../../redux/features/nodalPoints/Nodalpointsselectors";

export default function NodalPointCard({
  hub,
  tenantId,
  onUpdate,
  onDelete,
  onEdit,
}) {
  const globalLoading = useSelector(selectNodalPointsLoading);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(hub.name);
  const [address, setAddress] = useState(hub.address ?? "");
  const [lat, setLat] = useState(hub.latitude ?? "");
  const [lng, setLng] = useState(hub.longitude ?? "");
  const [isActive, setIsActive] = useState(hub.is_active);

  const cancelEdit = () => {
    setName(hub.name);
    setAddress(hub.address ?? "");
    setLat(hub.latitude ?? "");
    setLng(hub.longitude ?? "");
    setIsActive(hub.is_active);
    setEditing(false);
  };

  const handleSave = async () => {
    const payload = {};

    if (name.trim() !== hub.name)
      payload.name = name.trim();

    if (address.trim() !== (hub.address ?? ""))
      payload.address = address.trim();

    if (parseFloat(lat) !== hub.latitude)
      payload.latitude = parseFloat(lat);

    if (parseFloat(lng) !== hub.longitude)
      payload.longitude = parseFloat(lng);

    if (isActive !== hub.is_active)
      payload.is_active = isActive;

    if (!Object.keys(payload).length) {
      setEditing(false);
      return;
    }

    const result = await onUpdate(
      hub.nodal_point_id,
      payload
    );

    if (!result?.error) setEditing(false);
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Deactivate "${hub.name}"? This is a soft delete — no data is lost.`
      )
    )
      return;

    onDelete(hub.nodal_point_id);
  };

  const inputCls =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  const statusCls = hub.is_active
    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
    : "bg-red-100 text-red-600 border border-red-200";

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div
      className={`group relative overflow-hidden bg-white rounded-[28px] border flex flex-col transition-all duration-300 ${
        editing
          ? "border-blue-500 shadow-2xl shadow-blue-100 col-span-2 scale-[1.01]"
          : "border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/70 hover:-translate-y-1"
      }`}
    >
      {/* Top Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500" />

      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0L6.343 16.657A8 8 0 1117.657 16.657z"
              />
              <circle cx="12" cy="11" r="3" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                className={`${inputCls} font-semibold`}
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                maxLength={150}
                placeholder="Hub name"
              />
            ) : (
              <>
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {hub.name}
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Hub ID #{hub.nodal_point_id}
                </p>
              </>
            )}
          </div>
        </div>

        <span
          className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${statusCls}`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          {hub.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 flex-1 space-y-4">
        {editing ? (
          <>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                Address
              </label>

              <input
                className={inputCls}
                value={address}
                onChange={(e) =>
                  setAddress(e.target.value)
                }
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Latitude
                </label>

                <input
                  className={inputCls}
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) =>
                    setLat(e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Longitude
                </label>

                <input
                  className={inputCls}
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) =>
                    setLng(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-700">
                Active Status
              </p>

              <button
                onClick={() =>
                  setIsActive((v) => !v)
                }
                className={`relative w-11 h-6 rounded-full transition ${
                  isActive
                    ? "bg-blue-600"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    isActive
                      ? "translate-x-5"
                      : ""
                  }`}
                />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-slate-400 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0L6.343 16.657A8 8 0 1117.657 16.657z"
                  />
                </svg>

                <p className="text-sm text-slate-700 leading-relaxed">
                  {hub.address || (
                    <span className="italic text-slate-400">
                      No address available
                    </span>
                  )}
                </p>
              </div>
            </div>

            {hub.latitude != null &&
                hub.longitude != null && (
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-2 w-fit">
                    <span>📍</span>

                    <span className="text-sm font-medium text-blue-700">
                        {Number(
                        hub.latitude
                        ).toFixed(4)}
                        ,{" "}
                        {Number(
                        hub.longitude
                        ).toFixed(4)}
                    </span>
                    </div>
                )}

            <p className="text-xs text-slate-400 pt-1">
              Created{" "}
              {formatDate(hub.created_at)} •
              Updated{" "}
              {formatDate(hub.updated_at)}
            </p>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 mt-4 border-t border-slate-100 flex justify-end gap-3">
        {editing ? (
          <>
            <button
              onClick={cancelEdit}
              disabled={globalLoading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={
                globalLoading || !name.trim()
              }
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:shadow-lg hover:scale-[1.02] transition disabled:opacity-40"
            >
              {globalLoading
                ? "Saving..."
                : "Save Changes"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleDelete}
              disabled={
                globalLoading ||
                !hub.is_active
              }
              className="px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition disabled:opacity-30"
            >
              Deactivate
            </button>

            <button
              onClick={() =>
                onEdit ? onEdit(hub) : setEditing(true)
              }
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}