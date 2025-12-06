import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import MapContent from "./MapContent";
const getCompanyLocation = () => {
  try {
    const companyLocation = localStorage.getItem("tenant");
    if (companyLocation) {
      const parsed = JSON.parse(companyLocation);
      return {
        lat: parseFloat(parsed.latitude),
        lng: parseFloat(parsed.longitude),
      };
    }
  } catch (error) {
    console.error("Error parsing company location from localStorage:", error);
  }

  // Fallback to Bangalore if not found in localStorage
  return { lat: 12.9716, lng: 77.5946 };
};
const fixedPoint = getCompanyLocation(); // Company location (Bangalore)
const MAX_DISTANCE_KM = 20;

const Modal = memo(({ show, title, message, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4 text-red-600">{title}</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          OK
        </button>
      </div>
    </div>
  );
});

Modal.displayName = "Modal";

const EmployeeAddressGoogleMapView = memo(
  ({
    formData,
    setFormData,
    setErrors,
    isReadOnly = false,
    handleInputChange,
  }) => {
    const API_KEY = import.meta.env.VITE_GOOGLE_API || "";

    // Use only latitude/longitude (backend field names)
    const getCoordinates = () => {
      const lat = formData.latitude;
      const lng = formData.longitude;
      return lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
    };

    const [homePosition, setHomePosition] = useState(getCoordinates());
    const [distance, setDistance] = useState(
      formData.distance_from_company || null
    );
    const [distanceError, setDistanceError] = useState("");
    const [showDistanceModal, setShowDistanceModal] = useState(false);
    const landmarkInputRef = useRef(null);

    const calculateDistance = useCallback((point1, point2) => {
      if (!point1 || !point2) return null;
      const R = 6371;
      const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
      const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((point1.lat * Math.PI) / 180) *
          Math.cos((point2.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }, []);

    // Update coordinates when formData changes
    useEffect(() => {
      const coords = getCoordinates();
      if (
        coords &&
        (!homePosition ||
          homePosition.lat !== coords.lat ||
          homePosition.lng !== coords.lng)
      ) {
        setHomePosition(coords);
      }
    }, [formData.latitude, formData.longitude]);

    useEffect(() => {
      const dist = calculateDistance(fixedPoint, homePosition);
      setDistance(dist);

      if (!isReadOnly && setFormData) {
        setFormData((prev) => ({
          ...prev,
          distance_from_company: dist ? Number(dist.toFixed(2)) : null,
        }));

        if (dist !== null && dist > MAX_DISTANCE_KM) {
          const errorMessage = `Home location is too far! (Max ${MAX_DISTANCE_KM} km)`;
          setDistanceError(errorMessage);
          setShowDistanceModal(true);
          if (setErrors) {
            setErrors((prev) => ({ ...prev, location: errorMessage }));
          }
        } else {
          setDistanceError("");
          setShowDistanceModal(false);
          if (setErrors) {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.location;
              return newErrors;
            });
          }
        }
      }
    }, [homePosition, calculateDistance, setFormData, setErrors, isReadOnly]);

    const handlePositionChange = useCallback(
      (position) => {
        if (isReadOnly || !setFormData) return;

        setHomePosition(position);
        setFormData((prev) => ({
          ...prev,
          // Use only backend field names
          latitude: position ? String(position.lat) : "",
          longitude: position ? String(position.lng) : "",
        }));
      },
      [isReadOnly, setFormData]
    );

    const handleAddressChange = useCallback(
      (value) => {
        if (!isReadOnly && setFormData) {
          setFormData((prev) => ({ ...prev, address: value }));
        }
      },
      [isReadOnly, setFormData]
    );

    const handleLandmarkChange = useCallback(
      (value) => {
        if (!isReadOnly && setFormData) {
          setFormData((prev) => ({ ...prev, landmark: value }));
        }
      },
      [isReadOnly, setFormData]
    );

    // Handle manual coordinate input
    const handleCoordinateChange = useCallback(
      (e) => {
        if (isReadOnly) return;

        const { name, value } = e.target;
        const numValue = parseFloat(value) || 0;

        if (handleInputChange) {
          handleInputChange(e);
        }

        // Update position when coordinates change
        if (name === "latitude") {
          const lng = formData.longitude || 0;
          setHomePosition({ lat: numValue, lng: parseFloat(lng) });
        } else if (name === "longitude") {
          const lat = formData.latitude || 0;
          setHomePosition({ lat: parseFloat(lat), lng: numValue });
        }
      },
      [isReadOnly, handleInputChange, formData.latitude, formData.longitude]
    );

    return (
      <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-[450px]">
          <APIProvider apiKey={API_KEY} libraries={["places"]}>
            <MapContent
              homePosition={homePosition}
              setHomePosition={handlePositionChange}
              setAddress={handleAddressChange}
              landmarkInputRef={landmarkInputRef}
              setLandmark={handleLandmarkChange}
              isReadOnly={isReadOnly}
            />
          </APIProvider>
        </div>

        <AddressInputPanel
          formData={formData}
          handleInputChange={handleInputChange}
          handleCoordinateChange={handleCoordinateChange}
          landmarkInputRef={landmarkInputRef}
          distance={distance}
          distanceError={distanceError}
          isReadOnly={isReadOnly}
        />

        <Modal
          show={showDistanceModal}
          title="Distance Warning"
          message={distanceError}
          onClose={() => setShowDistanceModal(false)}
        />
      </div>
    );
  }
);

// Separate component for address input panel
const AddressInputPanel = memo(
  ({
    formData,
    handleInputChange,
    handleCoordinateChange,
    landmarkInputRef,
    distance,
    distanceError,
    isReadOnly,
  }) => {
    const getInputClasses = (hasError = false) =>
      `border p-2 rounded ${
        hasError ? "border-red-500 bg-red-50" : "border-gray-300"
      } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`;

    return (
      <div className="flex flex-col gap-4 bg-white p-4 rounded shadow">
        <AddressField
          value={formData.address || ""}
          onChange={handleInputChange}
          isReadOnly={isReadOnly}
          className={getInputClasses(!formData.address)}
        />

        <CoordinateField
          label="Latitude"
          name="latitude"
          value={formData.latitude || ""}
          onChange={handleCoordinateChange}
          isReadOnly={isReadOnly}
          className={getInputClasses()}
        />

        <CoordinateField
          label="Longitude"
          name="longitude"
          value={formData.longitude || ""}
          onChange={handleCoordinateChange}
          isReadOnly={isReadOnly}
          className={getInputClasses()}
        />

        {distance !== null && (
          <div className="text-gray-700">
            <span className="text-sm">Distance from company: </span>
            <strong>{distance.toFixed(2)} km</strong>
          </div>
        )}

        {distanceError && !isReadOnly && (
          <p className="text-red-500 text-sm">{distanceError}</p>
        )}

        <LandmarkField
          ref={landmarkInputRef}
          value={formData.landmark || ""}
          onChange={handleInputChange}
          isReadOnly={isReadOnly}
          className={getInputClasses()}
        />
      </div>
    );
  }
);

// Individual field components for better reusability
const AddressField = memo(({ value, onChange, isReadOnly, className }) => (
  <label className="flex flex-col">
    <span className="text-gray-700 mb-1">
      Address <span className="text-red-500">*</span>
    </span>
    <input
      type="text"
      name="address"
      value={value}
      onChange={onChange}
      placeholder="Enter address"
      className={className}
      disabled={isReadOnly}
    />
    {!value && !isReadOnly && (
      <p className="mt-1 text-sm text-red-500">Address is required</p>
    )}
  </label>
));

const CoordinateField = memo(
  ({ label, name, value, onChange, isReadOnly, className }) => (
    <label className="flex flex-col">
      <span className="text-gray-700 mb-1">{label}</span>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={label}
        className={className}
        disabled={isReadOnly}
        step="any"
      />
    </label>
  )
);

const LandmarkField = React.forwardRef(
  ({ value, onChange, isReadOnly, className }, ref) => (
    <label className="flex flex-col">
      <span className="text-gray-700 mb-1">Landmark</span>
      <input
        ref={ref}
        type="text"
        name="landmark"
        value={value}
        onChange={onChange}
        placeholder="Nearby landmark"
        className={className}
        disabled={isReadOnly}
      />
    </label>
  )
);

// Display names for debugging
EmployeeAddressGoogleMapView.displayName = "EmployeeAddressGoogleMapView";
AddressInputPanel.displayName = "AddressInputPanel";
AddressField.displayName = "AddressField";
CoordinateField.displayName = "CoordinateField";
LandmarkField.displayName = "LandmarkField";

export default EmployeeAddressGoogleMapView;
