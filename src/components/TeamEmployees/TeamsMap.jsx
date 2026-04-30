import React, { useRef, useState, useEffect, useCallback } from "react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";

const TeamsMap = ({ formData, setFormData, isReadOnly = false }) => {
  const API_KEY = import.meta.env.VITE_GOOGLE_API || "";
  const inputRef = useRef(null);
  const landmarkInputRef = useRef(null);

  const getCoordinates = () => {
    const lat = formData.latitude;
    const lng = formData.longitude;
    return lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
  };

  const [position, setPosition] = useState(getCoordinates());

  // ✅ FIX — sync position AND re-center map when formData changes from parent
  useEffect(() => {
    const coords = getCoordinates();
    if (coords) {
      setPosition(coords);
    }
  }, [formData.latitude, formData.longitude]);

  // ✅ FIX — also sync address field when formData.address changes from parent
  useEffect(() => {
    // address is already controlled via formData.address in the input
    // nothing extra needed here — just ensure position stays in sync
  }, [formData.address]);

  const handlePositionChange = useCallback(
    (newPosition) => {
      if (isReadOnly) return;
      setPosition(newPosition);
      setFormData((prev) => ({
        ...prev,
        latitude: newPosition ? String(newPosition.lat) : "",
        longitude: newPosition ? String(newPosition.lng) : "",
      }));
    },
    [isReadOnly, setFormData]
  );

  const handleInputChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoordinateChange = (e) => {
    if (isReadOnly) return;

    const { name, value } = e.target;
    handleInputChange(e);

    const newLat =
      name === "latitude"
        ? parseFloat(value) || 0
        : parseFloat(formData.latitude) || 0;

    const newLng =
      name === "longitude"
        ? parseFloat(value) || 0
        : parseFloat(formData.longitude) || 0;

    const newPosition = { lat: newLat, lng: newLng };
    setPosition(newPosition);

    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: newPosition }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          setFormData((prev) => ({
            ...prev,
            address: results[0].formatted_address,
          }));
        }
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Map */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-[450px]">
        <APIProvider apiKey={API_KEY} libraries={["places"]}>
          <MapContentComponent
            position={position}
            setPosition={handlePositionChange}
            setAddress={(value) =>
              !isReadOnly &&
              setFormData((prev) => ({ ...prev, address: value }))
            }
            setLandmark={(value) =>
              !isReadOnly &&
              setFormData((prev) => ({ ...prev, landmark: value }))
            }
            inputRef={inputRef}
            landmarkInputRef={landmarkInputRef}
            isReadOnly={isReadOnly}
          />
        </APIProvider>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded shadow">
        <label>
          Address *
          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleInputChange}
            disabled={isReadOnly}
            className="border p-2 rounded w-full"
          />
        </label>

        <label>
          Latitude
          <input
            type="number"
            name="latitude"
            value={formData.latitude || ""}
            onChange={handleCoordinateChange}
            disabled={isReadOnly}
            className="border p-2 rounded w-full"
          />
        </label>

        <label>
          Longitude
          <input
            type="number"
            name="longitude"
            value={formData.longitude || ""}
            onChange={handleCoordinateChange}
            disabled={isReadOnly}
            className="border p-2 rounded w-full"
          />
        </label>

        <label>
          Landmark
          <input
            ref={landmarkInputRef}
            type="text"
            name="landmark"
            value={formData.landmark || ""}
            onChange={handleInputChange}
            disabled={isReadOnly}
            className="border p-2 rounded w-full"
          />
        </label>
      </div>
    </div>
  );
};

const MapContentComponent = ({
  position,
  setPosition,
  setAddress,
  setLandmark,
  inputRef,
  landmarkInputRef,
  isReadOnly,
}) => {
  const map = useMap();
  const defaultCenter = { lat: 12.9716, lng: 77.5946 };

  // ✅ FIX — re-center map when position prop changes from parent
  useEffect(() => {
    if (map && position) {
      map.panTo(position);
    }
  }, [map, position]);

  const reverseGeocode = (lat, lng) => {
    if (!window.google || !window.google.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        setAddress(results[0].formatted_address);
      }
    });
  };

  useEffect(() => {
    if (!inputRef.current || isReadOnly) return;

    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current
        );

        const listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            const newPosition = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            setPosition(newPosition);
            setAddress(place.formatted_address || place.name);
            map?.panTo(newPosition);
            map?.setZoom(14);
          }
        });

        clearInterval(interval);
        return () => window.google.maps.event.removeListener(listener);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [map, isReadOnly]);

  return (
    <div className="relative w-full h-full">
      <Map
        defaultCenter={position || defaultCenter}
        defaultZoom={12}
        gestureHandling="greedy"
        style={{ width: "100%", height: "100%" }}
      >
        {position && (
          <Marker
            position={position}
            draggable={!isReadOnly}
            onDragEnd={(e) => {
              if (isReadOnly) return;
              const newPosition = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              };
              setPosition(newPosition);
              map?.panTo(newPosition);
              reverseGeocode(newPosition.lat, newPosition.lng);
            }}
          />
        )}
      </Map>

      {!isReadOnly && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[300px]">
          <input
            ref={inputRef}
            placeholder="Search location"
            className="border p-2 rounded w-full bg-white"
          />
        </div>
      )}
    </div>
  );
};

export default TeamsMap;