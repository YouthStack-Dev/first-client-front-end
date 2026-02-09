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

  // Update position when formData changes
  useEffect(() => {
    const coords = getCoordinates();
    if (
      coords &&
      (!position || position.lat !== coords.lat || position.lng !== coords.lng)
    ) {
      setPosition(coords);
    }
  }, [formData.latitude, formData.longitude]);

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

    const numValue = parseFloat(value) || 0;
    if (name === "latitude") {
      const lng = formData.longitude || 0;
      setPosition({ lat: numValue, lng: parseFloat(lng) });
    } else if (name === "longitude") {
      const lat = formData.latitude || 0;
      setPosition({ lat: parseFloat(lat), lng: numValue });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Side - Map */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-[450px]">
        <APIProvider apiKey={API_KEY} libraries={["places"]}>
          <MapContentComponent
            position={position}
            setPosition={handlePositionChange}
            setAddress={(value) =>
              !isReadOnly && setFormData((prev) => ({ ...prev, address: value }))
            }
            setLandmark={(value) =>
              !isReadOnly && setFormData((prev) => ({ ...prev, landmark: value }))
            }
            inputRef={inputRef}
            landmarkInputRef={landmarkInputRef}
            isReadOnly={isReadOnly}
          />
        </APIProvider>
      </div>

      {/* Right Side - Address Fields */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded shadow">
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleInputChange}
            placeholder="Enter address"
            className={`border p-2 rounded ${
              !formData.address ? "border-red-500 bg-red-50" : "border-gray-300"
            } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
            disabled={isReadOnly}
          />
          {!formData.address && !isReadOnly && (
            <p className="mt-1 text-sm text-red-500">Address is required</p>
          )}
        </label>

        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Latitude</span>
          <input
            type="number"
            name="latitude"
            value={formData.latitude || ""}
            onChange={handleCoordinateChange}
            placeholder="Latitude"
            className={`border p-2 rounded border-gray-300 ${
              isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            disabled={isReadOnly}
            step="any"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Longitude</span>
          <input
            type="number"
            name="longitude"
            value={formData.longitude || ""}
            onChange={handleCoordinateChange}
            placeholder="Longitude"
            className={`border p-2 rounded border-gray-300 ${
              isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            disabled={isReadOnly}
            step="any"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Landmark</span>
          <input
            ref={landmarkInputRef}
            type="text"
            name="landmark"
            value={formData.landmark || ""}
            onChange={handleInputChange}
            placeholder="Nearby landmark"
            className={`border p-2 rounded border-gray-300 ${
              isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            disabled={isReadOnly}
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
  const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Bangalore

  // Address Autocomplete
  useEffect(() => {
    if (!inputRef.current || isReadOnly) return;

    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current
        );
        const placeChangedListener = autocomplete.addListener(
          "place_changed",
          () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const newPosition = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
              setPosition(newPosition);
              if (place.formatted_address) {
                setAddress(place.formatted_address);
              } else if (place.name) {
                setAddress(place.name);
              }
              if (map) {
                map.panTo(newPosition);
                map.setZoom(14);
              }
            }
          }
        );
        clearInterval(interval);
        return () =>
          window.google.maps.event.removeListener(placeChangedListener);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [map, setPosition, setAddress, isReadOnly]);

  // Landmark Autocomplete
  useEffect(() => {
    if (!landmarkInputRef.current || isReadOnly) return;

    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          landmarkInputRef.current,
          {
            fields: ["name", "formatted_address"],
          }
        );

        if (position) {
          const circle = new window.google.maps.Circle({
            center: position,
            radius: 2000,
          });
          autocomplete.setBounds(circle.getBounds());
          autocomplete.setOptions({ strictBounds: false });
        }

        const placeChangedListener = autocomplete.addListener(
          "place_changed",
          () => {
            const place = autocomplete.getPlace();
            if (place && place.name) {
              setLandmark(place.name);
            } else if (place && place.formatted_address) {
              setLandmark(place.formatted_address);
            }
          }
        );
        clearInterval(interval);
        return () =>
          window.google.maps.event.removeListener(placeChangedListener);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [position, landmarkInputRef, setLandmark, isReadOnly]);

  return (
    <div className="relative w-full h-full">
      <Map
        defaultCenter={position || defaultCenter}
        defaultZoom={12}
        gestureHandling="greedy"
        disableDefaultUI={false}
        style={{ width: "100%", height: "100%" }}
      >
        {position && (
          <Marker
            position={position}
            title="Location"
            draggable={!isReadOnly}
            onDragEnd={(e) => {
              if (!isReadOnly) {
                const newPosition = {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                };
                setPosition(newPosition);
                if (map) {
                  map.panTo(newPosition);
                }
              }
            }}
          />
        )}
      </Map>

      {/* Search Box */}
      {!isReadOnly && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[300px]">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search location"
            className="border p-2 rounded shadow w-full bg-white"
          />
        </div>
      )}
    </div>
  );
};

export default TeamsMap;
