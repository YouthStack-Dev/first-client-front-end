import { useEffect, useRef, useState, useCallback } from "react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";

const API_KEY        = import.meta.env.VITE_GOOGLE_API || "";
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };
const DEFAULT_ZOOM   = 13;

// ─── Street View panel ────────────────────────────────────────────────────────
function StreetViewPanel({ position, onClose }) {
  const containerRef = useRef(null);
  const svRef        = useRef(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !position || !window.google?.maps) return;
    setUnavailable(false);

    new window.google.maps.StreetViewService().getPanorama(
      { location: position, radius: 100, preference: "nearest" },
      (data, status) => {
        if (status !== "OK") {
          setUnavailable(true);
          return;
        }
        if (!svRef.current) {
          svRef.current = new window.google.maps.StreetViewPanorama(
            containerRef.current,
            {
              position,
              pov: { heading: 0, pitch: 0 },
              zoom: 1,
              addressControl: false,
              fullscreenControl: false,
              motionTrackingControl: false,
            }
          );
        } else {
          svRef.current.setPosition(position);
        }
      }
    );

    return () => {
      if (svRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(svRef.current);
        svRef.current = null;
      }
    };
  }, [position]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 border border-gray-200 rounded-lg shadow-md flex items-center justify-center hover:bg-white active:scale-95 transition-all duration-150"
        title="Back to map"
      >
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 bg-gray-900/75 text-white text-xs px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4a4 4 0 100 8 4 4 0 000-8zm0 10c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"/>
          </svg>
          Street view
        </span>
      </div>

      {unavailable ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400">
          <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.5 10.5a3 3 0 004.243 4.243M6.228 6.228A7.5 7.5 0 0021 12c-.97 2.04-2.52 3.77-4.41 4.96M3 12c.97-2.04 2.52-3.77 4.41-4.96"/>
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-300">Street view unavailable</p>
            <p className="text-xs text-gray-500 mt-1">No imagery found near this pin</p>
          </div>
          <button type="button" onClick={onClose} className="mt-1 text-xs text-gray-400 border border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">
            Back to map
          </button>
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full" />
      )}
    </div>
  );
}

// ─── Map inner ────────────────────────────────────────────────────────────────
function MapInner({
  position,
  onChange,
  isReadOnly,
  searchValue,
  onSearchChange,
  streetView,
  onStreetViewOpen,
  onStreetViewClose,
}) {
  const map      = useMap();
  const inputRef = useRef(null);
  const acRef    = useRef(null);

  useEffect(() => {
    if (map && position) map.panTo(position);
  }, [map, position]);

  useEffect(() => {
    if (!inputRef.current || isReadOnly) return;

    const interval = setInterval(() => {
      if (!window.google?.maps?.places) return;
      clearInterval(interval);

      acRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ["geometry", "formatted_address", "name"],
      });

      acRef.current.addListener("place_changed", () => {
        const place = acRef.current.getPlace();
        if (!place.geometry?.location) return;

        const lat     = place.geometry.location.lat();
        const lng     = place.geometry.location.lng();
        const address = place.formatted_address || place.name || "";

        if (inputRef.current) inputRef.current.value = address;
        onSearchChange(address);
        onChange({ lat, lng, address });

        map?.panTo({ lat, lng });
        map?.setZoom(16);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [map, isReadOnly, onChange, onSearchChange]);

  const reverseGeocode = useCallback((lat, lng) => {
    if (!window.google?.maps) {
      onChange({ lat, lng, address: "" });
      return;
    }
    new window.google.maps.Geocoder().geocode(
      { location: { lat, lng } },
      (results, status) => {
        const address = status === "OK" && results?.[0]
          ? results[0].formatted_address
          : "";
        if (inputRef.current) inputRef.current.value = address;
        onSearchChange(address);
        onChange({ lat, lng, address });
      }
    );
  }, [onChange, onSearchChange]);

  const handleMapClick = useCallback((e) => {
    if (isReadOnly) return;
    reverseGeocode(e.detail.latLng.lat, e.detail.latLng.lng);
  }, [isReadOnly, reverseGeocode]);

  const handleDragEnd = useCallback((e) => {
    if (isReadOnly) return;
    reverseGeocode(e.latLng.lat(), e.latLng.lng());
  }, [isReadOnly, reverseGeocode]);

  const zoomIn   = () => map?.setZoom((map.getZoom() ?? DEFAULT_ZOOM) + 1);
  const zoomOut  = () => map?.setZoom((map.getZoom() ?? DEFAULT_ZOOM) - 1);
  const recenter = () => { if (position) { map?.panTo(position); map?.setZoom(16); } };

  return (
    <div className="relative w-full h-full">

      {/* Map layer */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${streetView ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

        {/* Search box */}
        {!isReadOnly && (
          <div className="absolute top-5 left-1/2 z-20 w-[92%] max-w-xl -translate-x-1/2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search location"
                defaultValue={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="
                  w-full h-12 rounded-2xl
                  border border-slate-200
                  bg-white/95 backdrop-blur-md
                  pl-11 pr-4 text-sm text-slate-800
                  shadow-lg shadow-slate-200/40
                  placeholder:text-slate-400
                  focus:outline-none focus:ring-4
                  focus:ring-blue-100 focus:border-blue-500
                  transition-all
                "
              />
            </div>
          </div>
        )}

        <Map
          defaultCenter={position || DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI
          style={{ width: "100%", height: "100%" }}
          onClick={handleMapClick}
        >
          {position && (
            <Marker position={position} draggable={!isReadOnly} onDragEnd={handleDragEnd} />
          )}
        </Map>

        {/* Custom controls — zoom + recenter */}
        {!isReadOnly && (
          <div className="absolute bottom-4 right-3 z-10 flex flex-col gap-1.5">
            {position && (
              <button type="button" onClick={recenter} title="Recenter on pin"
                className="w-9 h-9 bg-white border border-gray-200 rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all duration-150">
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"/><path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                </svg>
              </button>
            )}
            <button type="button" onClick={zoomIn} title="Zoom in"
              className="w-9 h-9 bg-white border border-gray-200 rounded-t-lg shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <div className="-my-1 h-px bg-gray-200 mx-1"/>
            <button type="button" onClick={zoomOut} title="Zoom out"
              className="w-9 h-9 bg-white border border-gray-200 rounded-b-lg shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M5 12h14"/>
              </svg>
            </button>
          </div>
        )}

        {/* Street View button — Google Maps pegman icon */}
        {!isReadOnly && position && (
          <button
            type="button"
            onClick={onStreetViewOpen}
            title="Street View"
            className="
              absolute bottom-4 right-14 z-10
              w-9 h-9
              bg-white border border-gray-200
              rounded-lg shadow-md
              flex items-center justify-center
              hover:bg-yellow-50 hover:border-yellow-300
              active:scale-95
              transition-all duration-150
            "
          >
            {/* Google Maps pegman / Street View SVG icon */}
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Head */}
              <circle cx="12" cy="5.5" r="2.5" fill="#F9AB00"/>
              {/* Body */}
              <path d="M9 10.5C9 9.12 10.12 8 11.5 8h1C13.88 8 15 9.12 15 10.5V15H9v-4.5z" fill="#4285F4"/>
              {/* Left arm */}
              <path d="M9 10.5L6.5 13" stroke="#4285F4" strokeWidth="1.8" strokeLinecap="round"/>
              {/* Right arm */}
              <path d="M15 10.5L17.5 13" stroke="#4285F4" strokeWidth="1.8" strokeLinecap="round"/>
              {/* Left leg */}
              <path d="M10.5 15L9.5 19" stroke="#4285F4" strokeWidth="1.8" strokeLinecap="round"/>
              {/* Right leg */}
              <path d="M13.5 15L14.5 19" stroke="#4285F4" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Street View overlay */}
      {streetView && position && (
        <div className="absolute inset-0 z-30">
          <StreetViewPanel position={position} onClose={onStreetViewClose} />
        </div>
      )}
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export default function NodalPointMap({
  position,
  address = "",
  onChange,
  onAddressChange,
  isReadOnly = false,
  height = 420,
}) {
  const [streetView, setStreetView] = useState(false);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white"
      style={{ height }}
    >
      <APIProvider apiKey={API_KEY} libraries={["places"]}>
        <MapInner
          position={position}
          onChange={onChange}
          isReadOnly={isReadOnly}
          searchValue={address}
          onSearchChange={onAddressChange}
          streetView={streetView}
          onStreetViewOpen={() => setStreetView(true)}
          onStreetViewClose={() => setStreetView(false)}
        />
      </APIProvider>
    </div>
  );
}