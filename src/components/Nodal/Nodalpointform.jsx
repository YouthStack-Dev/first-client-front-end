import { useState } from "react";
import { useSelector } from "react-redux";
import {
  selectNodalPointsLoading,
  selectNodalPointsError,
} from "../../redux/features/nodalPoints/Nodalpointsselectors";
import NodalPointMap from "./NodalPointMap";

const inputCls =
  "w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all";

const labelCls =
  "block text-[11px] font-medium uppercase tracking-wide text-slate-400 mb-1";

export default function NodalPointForm({
  mode = "create",
  initial = {},
  tenantId,
  onSave,
  onCancel,
}) {
  const loading = useSelector(selectNodalPointsLoading);
  const error   = useSelector(selectNodalPointsError);

  const [name, setName]         = useState(initial.name ?? "");
  const [isActive, setIsActive] = useState(initial.is_active ?? true);
  const [address, setAddress]   = useState(initial.address ?? "");
  const [lat, setLat]           = useState(initial.latitude  ? String(initial.latitude)  : "");
  const [lng, setLng]           = useState(initial.longitude ? String(initial.longitude) : "");
  const [addressFocused, setAddressFocused] = useState(false);

  const position =
    lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;

  const handleMapChange = ({ lat: newLat, lng: newLng, address: newAddr }) => {
    setLat(parseFloat(newLat).toFixed(6));
    setLng(parseFloat(newLng).toFixed(6));
    if (!addressFocused) setAddress(newAddr ?? "");
  };

  const handleCoordBlur = () => {
    const la = parseFloat(lat);
    const lo = parseFloat(lng);
    if (isNaN(la) || isNaN(lo) || !window.google?.maps) return;
    new window.google.maps.Geocoder().geocode(
      { location: { lat: la, lng: lo } },
      (results, status) => {
        if (status === "OK" && results?.[0]) setAddress(results[0].formatted_address);
      }
    );
  };

  const safeFloat = (val) => {
    if (val === "" || val == null) return undefined;
    const n = parseFloat(val);
    return isNaN(n) ? undefined : n;
  };

  const isValid = name.trim().length >= 2;

  const handleSubmit = () => {
    if (!isValid) return;
    if (mode === "create") {
      const payload = { tenant_id: tenantId, name: name.trim(), is_active: isActive };
      if (address.trim()) payload.address = address.trim();
      const latVal = safeFloat(lat);
      const lngVal = safeFloat(lng);
      if (latVal !== undefined) payload.latitude  = latVal;
      if (lngVal !== undefined) payload.longitude = lngVal;
      onSave(payload);
    } else {
      const payload = {};
      if (name.trim() !== initial.name)               payload.name      = name.trim();
      if (address.trim() !== (initial.address ?? "")) payload.address   = address.trim();
      const latVal = safeFloat(lat);
      const lngVal = safeFloat(lng);
      if (latVal !== undefined && latVal !== initial.latitude)  payload.latitude  = latVal;
      if (lngVal !== undefined && lngVal !== initial.longitude) payload.longitude = lngVal;
      if (isActive !== initial.is_active)             payload.is_active = isActive;
      onSave(payload);
    }
  };

  return (
    <div className="overflow-x-hidden rounded-xl border border-slate-200 bg-white">

      {/* Fields */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-2">

        {/* Row 1: Hub Name (small) + Address (bigger) */}
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[1fr_2fr]">
          <div>
            <label className={labelCls}>
              Hub name <span className="text-red-400">*</span>
            </label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter hub name"
            />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input
              className={inputCls}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onFocus={() => setAddressFocused(true)}
              onBlur={() => setAddressFocused(false)}
              placeholder="Enter address or click the map"
            />
          </div>
        </div>

        {/* Row 2: Latitude + Longitude + Status */}
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[1fr_1fr_120px]">
          <div>
            <label className={labelCls}>Latitude</label>
            <input
              className={inputCls}
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              onBlur={handleCoordBlur}
              placeholder="e.g. 12.9716"
            />
          </div>
          <div>
            <label className={labelCls}>Longitude</label>
            <input
              className={inputCls}
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              onBlur={handleCoordBlur}
              placeholder="e.g. 77.5946"
            />
          </div>
          <div className="flex flex-col justify-end">
            <label className={labelCls}>Status</label>
            <button
              onClick={() => setIsActive((v) => !v)}
              className={`h-9 w-full rounded-lg px-3 text-xs font-medium transition whitespace-nowrap ${
                isActive
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-red-50 text-red-500 border border-red-200"
              }`}
            >
              {isActive ? "● Active" : "● Inactive"}
            </button>
          </div>
        </div>

        {/* Coords badge */}
        {position && (
          <div className="flex items-center gap-2 w-fit rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-600">
              {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            </span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="px-4 pb-3">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <NodalPointMap
            position={position}
            address={address}
            onChange={handleMapChange}
            onAddressChange={(val) => setAddress(val)}
            isReadOnly={false}
            height={400}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="h-8 rounded-lg border border-slate-200 px-4 text-sm text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !isValid}
          className="h-8 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-40"
        >
          {loading ? "Saving…" : mode === "create" ? "Create hub" : "Save changes"}
        </button>
      </div>
    </div>
  );
}