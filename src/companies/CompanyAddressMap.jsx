import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

const GOOGLE_API_KEY = (import.meta.env.VITE_GOOGLE_API || "").trim();

const MapInner = memo(
  ({ position, onPositionChange, onAddressChange, address, isReadOnly }) => {
    const map = useMap();
    const inputRef = useRef(null);

    // ✅ Track the autocomplete listener in a ref so React's cleanup can remove it
    const autocompleteListenerRef = useRef(null);

    // ✅ showSearchBar defaults to false when address is pre-filled
    const [showSearchBar, setShowSearchBar] = useState(!address);
    const [inputValue, setInputValue] = useState(address || "");

    useEffect(() => {
      setInputValue(address || "");
    }, [address]);

    // ✅ Correct autocomplete lifecycle — listener stored in ref, cleanup always runs
    // ✅ Added max-attempt guard (5s) to avoid infinite polling
    useEffect(() => {
      if (!inputRef.current || isReadOnly) return;

      let autocompleteInstance = null;
      let attempts = 0;
      const MAX_ATTEMPTS = 50; 

      const interval = setInterval(() => {
        attempts++;

        if (attempts > MAX_ATTEMPTS) {
          clearInterval(interval);
          console.warn("[CompanyAddressMap] Google Maps places library did not load in time.");
          return;
        }

        if (!window.google?.maps?.places) return;

        clearInterval(interval);

        autocompleteInstance = new window.google.maps.places.Autocomplete(
          inputRef.current,
          { fields: ["geometry", "formatted_address", "name"] }
        );

        autocompleteListenerRef.current = autocompleteInstance.addListener(
          "place_changed",
          () => {
            const place = autocompleteInstance.getPlace();
            if (!place?.geometry) return;

            const newPos = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            const newAddress = place.formatted_address || place.name || "";

            setInputValue(newAddress);
            onPositionChange(newPos);
            onAddressChange(newAddress);

            if (map) {
              map.panTo(newPos);
              map.setZoom(14);
            }

            setShowSearchBar(false);
            
            if (inputRef.current) inputRef.current.blur();
          }
        );
      }, 100);

      return () => {
        clearInterval(interval);
        if (autocompleteListenerRef.current && window.google?.maps?.event) {
          window.google.maps.event.removeListener(
            autocompleteListenerRef.current
          );
          autocompleteListenerRef.current = null;
        }
      };
    }, [map, onPositionChange, onAddressChange, isReadOnly]);

    return (
      <div className="relative w-full h-full">
        <Map
          defaultCenter={position || DEFAULT_CENTER}
          defaultZoom={12}
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: "100%", height: "400px" }}
        >
          {position && (
            <Marker
              position={position}
              draggable={!isReadOnly}
              onDragEnd={(e) => {
                if (isReadOnly) return;
                const newPos = {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                };
                onPositionChange(newPos);
                if (map) map.panTo(newPos);
              }}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
              }}
            />
          )}
        </Map>

        {/* Search Bar — disappears after address selection */}
        {!isReadOnly && showSearchBar && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow w-[300px] z-50">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search company address"
              aria-label="Search company address" 
              className="w-full border rounded px-3 py-2 text-sm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => {
                if (inputRef.current) inputRef.current.blur();
              }}
            />
          </div>
        )}

        {/* Button to re-show search bar */}
        {!showSearchBar && !isReadOnly && (
          <button
            className="absolute top-4 right-4 bg-white px-3 py-1 rounded shadow text-sm hover:bg-gray-100"
            aria-label="Change company address" 
            onClick={() => setShowSearchBar(true)}
          >
            Change Address
          </button>
        )}
      </div>
    );
  }
);

MapInner.displayName = "MapInner";

const CompanyAddressMap = memo(
  ({ formData, setFormData, isReadOnly = false }) => {
    const [position, setPosition] = useState(() => {
      if (formData?.latitude && formData?.longitude) {
        return {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude),
        };
      }
      return null;
    });

    const [mapsLoadError, setMapsLoadError] = useState(null);

    const lastSyncedPos = useRef(null);

    useEffect(() => {
      if (!formData?.latitude || !formData?.longitude) return;

      const newPos = {
        lat: parseFloat(formData.latitude),
        lng: parseFloat(formData.longitude),
      };

      const last = lastSyncedPos.current;
      if (!last || last.lat !== newPos.lat || last.lng !== newPos.lng) {
        lastSyncedPos.current = newPos;
        setPosition(newPos);
      }
    }, [formData?.latitude, formData?.longitude]); 

    const handlePositionChange = useCallback(
      (pos) => {
        if (isReadOnly) return;
        setPosition(pos);
        setFormData((prev) => ({
          ...prev,
          latitude: pos.lat.toFixed(6),
          longitude: pos.lng.toFixed(6),
        }));
      },
      [isReadOnly, setFormData]
    );

    const handleAddressChange = useCallback(
      (addr) => {
        if (isReadOnly) return;
        setFormData((prev) => ({ ...prev, address: addr }));
      },
      [isReadOnly, setFormData]
    );

    return (
      <div className="bg-gray-100 rounded-lg overflow-hidden min-h-[400px] relative">
        {GOOGLE_API_KEY ? (
          <APIProvider
            apiKey={GOOGLE_API_KEY}
            libraries={["places"]}
            onError={() =>
              setMapsLoadError(
                "Failed to load Google Maps. Check your API key or network connection."
              )
            }
          >
            {mapsLoadError ? (
              <div className="flex items-center justify-center h-[400px] bg-red-50 text-red-600 text-sm px-6 text-center">
                {mapsLoadError}
              </div>
            ) : (
              <MapInner
                position={position}
                onPositionChange={handlePositionChange}
                onAddressChange={handleAddressChange}
                address={formData?.address || ""}
                isReadOnly={isReadOnly}
              />
            )}
          </APIProvider>
        ) : (
          <div className="flex items-center justify-center h-[400px] bg-gray-200 text-gray-600 text-sm px-6 text-center">
            Google Maps API key missing. Add{" "}
            <strong className="mx-1">VITE_GOOGLE_API</strong> to your .env
            file.
          </div>
        )}
      </div>
    );
  }
);

CompanyAddressMap.displayName = "CompanyAddressMap";

export default CompanyAddressMap;