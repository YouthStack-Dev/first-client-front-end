import React, { useEffect, useState } from "react";
import { X, Car, RefreshCw, AlertCircle } from "lucide-react";
import { API_CLIENT } from "../../Api/API_Client";

const ContractSummaryModal = ({ isOpen, onClose, vendorId, vendorName }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [activeOnly, setActiveOnly] = useState(false);

  /* ── fetch whenever modal opens or activeOnly filter changes ── */
  useEffect(() => {
    if (!isOpen || !vendorId) return;

    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await API_CLIENT.get(
          `/contracts/vendor/${vendorId}/contract-summary`,
          { params: { active_only: activeOnly } }
        );
        setData(res.data?.data ?? null);
      } catch (err) {
        setError(
          err?.response?.data?.detail?.message ||
          err?.response?.data?.message ||
          "Failed to load vehicle summary."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [isOpen, vendorId, activeOnly]);

  /* ── reset on close ── */
  const handleClose = () => {
    setData(null);
    setError(null);
    setActiveOnly(false);
    onClose();
  };

  if (!isOpen) return null;

  const items = data?.items ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl"
           style={{ maxHeight: "90vh" }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Car size={18} className="text-blue-600" />
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Contract Summary
              </h2>
              {vendorName && (
                <p className="text-xs text-gray-500">{vendorName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active-only toggle */}
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600 select-none">
              <div
                onClick={() => setActiveOnly((p) => !p)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  activeOnly ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    activeOnly ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
              Active only
            </label>

            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── KPI strip ── */}
        {data && !loading && (
          <div className="flex gap-4 border-b border-gray-100 bg-slate-50 px-6 py-3">
            <Stat label="Total Vehicles" value={data.total ?? items.length} color="text-gray-800" />
            <Stat
              label="Active"
              value={items.filter((i) => i.is_active).length}
              color="text-green-600"
            />
            <Stat
              label="Inactive"
              value={items.filter((i) => !i.is_active).length}
              color="text-red-500"
            />
            <Stat
              label="With Driver"
              value={items.filter((i) => i.driver_id).length}
              color="text-blue-600"
            />
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <RefreshCw size={20} className="mr-2 animate-spin" />
              Loading vehicle summary…
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} />
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No vehicles found for this vendor.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Vehicle",
                      "RC Number",
                      "Type",
                      "Contract",
                      "Driver",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {items.map((item) => (
                    <tr key={item.vehicle_id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-gray-800">
                        {item.vehicle_label || `Vehicle #${item.vehicle_id}`}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-600">
                        {item.rc_number || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">
                        {item.vehicle_type_name || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">
                        {item.contract_name || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">
                        {item.driver_name || (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end border-t border-gray-100 px-6 py-3">
          <button
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── tiny stat card ── */
const Stat = ({ label, value, color }) => (
  <div className="flex flex-col">
    <span className={`text-lg font-bold ${color}`}>{value}</span>
    <span className="text-xs text-gray-500">{label}</span>
  </div>
);

export default ContractSummaryModal;