import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

const MapInner = memo(
  ({ position, onPositionChange, onAddressChange, address, isReadOnly }) => {
    const map = useMap();
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState(address || "");
    const [showSearchBar, setShowSearchBar] = useState(true);

    useEffect(() => {
      setInputValue(address || "");
    }, [address]);

    useEffect(() => {
      if (!inputRef.current || isReadOnly) return;

      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          const autocomplete = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
              fields: ["geometry", "formatted_address", "name"],
            }
          );

          const listener = autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
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

            // ✅ Hide the search bar & dropdown
            setShowSearchBar(false);
            if (inputRef.current) inputRef.current.blur();
            setTimeout(() => {
              document.querySelectorAll(".pac-container").forEach((el) => {
                el.style.display = "none";
              });
            }, 150);
          });

          clearInterval(interval);
          return () => {
            if (window.google?.maps?.event?.removeListener) {
              window.google.maps.event.removeListener(listener);
            }
          };
        }
      }, 100);

      return () => clearInterval(interval);
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
                const newPos = {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                };
                onPositionChange(newPos);
                if (map) map.panTo(newPos);
              }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
              }}
            />
          )}
        </Map>

        {/* ✅ Search Bar — disappears after address selection */}
        {!isReadOnly && showSearchBar && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow w-[300px] z-50">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search company address"
              className="w-full border rounded px-3 py-2 text-sm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => {
                setTimeout(() => {
                  document.querySelectorAll(".pac-container").forEach((el) => {
                    el.style.display = "none";
                  });
                }, 100);
              }}
            />
          </div>
        )}

        {/* Optional: Button to re-show search bar */}
        {!showSearchBar && !isReadOnly && (
          <button
            className="absolute top-4 right-4 bg-white px-3 py-1 rounded shadow text-sm hover:bg-gray-100"
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
    const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

    const [position, setPosition] = useState(() => {
      if (formData?.latitude && formData?.longitude) {
        return {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude),
        };
      }
      return DEFAULT_CENTER;
    });

    useEffect(() => {
      if (formData?.latitude && formData?.longitude) {
        const newPos = {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude),
        };
        if (newPos.lat !== position.lat || newPos.lng !== position.lng) {
          setPosition(newPos);
        }
      }
    }, [formData?.latitude, formData?.longitude, position]);

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
        {API_KEY ? (
          <APIProvider apiKey={API_KEY} libraries={["places"]}>
            <MapInner
              position={position}
              onPositionChange={handlePositionChange}
              onAddressChange={handleAddressChange}
              address={formData?.address || ""}
              isReadOnly={isReadOnly}
            />
          </APIProvider>
        ) : (
          <div className="flex items-center justify-center h-[400px] bg-gray-200 text-gray-600">
            Google Maps API key missing. Add{" "}
            <strong>VITE_GOOGLE_API</strong> to your .env file.
          </div>
        )}
      </div>
    );
  }
);

CompanyAddressMap.displayName = "CompanyAddressMap";

export default CompanyAddressMap;
