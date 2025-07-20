import React, { useRef, useState, useEffect, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import MapContent from './MapContent';

const fixedPoint = { lat: 12.9716, lng: 77.5946 }; // Company location (Bangalore)
const MAX_DISTANCE_KM = 20;

const Modal = ({ show, title, message, onClose }) => {
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
};

const EmployeeAddressGoogleMapView = ({ formData, setFormData, setErrors, isReadOnly }) => {
  const API_KEY = import.meta.env.VITE_GOOGLE_API || '';
  const [homePosition, setHomePosition] = useState(
    formData.latitude && formData.longitude
      ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
      : null
  );
  const [distance, setDistance] = useState(formData.distance_from_company || null);
  const [distanceError, setDistanceError] = useState('');
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const landmarkInputRef = useRef(null);

  const calculateDistance = useCallback((point1, point2) => {
    if (!point1 || !point2) return null;
    const R = 6371;
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  useEffect(() => {
    const dist = calculateDistance(fixedPoint, homePosition);
    setDistance(dist);
    if (!isReadOnly) {
      setFormData((prev) => ({
        ...prev,
        distance_from_company: dist ? Number(dist.toFixed(2)) : null,
      }));
      if (dist !== null && dist > MAX_DISTANCE_KM) {
        setDistanceError(`Home location is too far! (Max ${MAX_DISTANCE_KM} km)`);
        setShowDistanceModal(true);
        setErrors((prev) => ({ ...prev, location: `Home location is too far! (Max ${MAX_DISTANCE_KM} km)` }));
      } else {
        setDistanceError('');
        setShowDistanceModal(false);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.location;
          return newErrors;
        });
      }
    }
  }, [homePosition, calculateDistance, setFormData, setErrors, isReadOnly]);

  const handleInputChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handlePositionChange = (position) => {
    if (isReadOnly) return;
    setHomePosition(position);
    setFormData((prev) => ({
      ...prev,
      latitude: position ? String(position.lat) : '',
      longitude: position ? String(position.lng) : '',
    }));
  };

  return (
    <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-[450px]">
        <APIProvider apiKey={API_KEY} libraries={['places']}>
          <MapContent
            homePosition={homePosition}
            setHomePosition={handlePositionChange}
            setAddress={(value) => !isReadOnly && setFormData((prev) => ({ ...prev, address: value }))}
            landmarkInputRef={landmarkInputRef}
            setLandmark={(value) => !isReadOnly && setFormData((prev) => ({ ...prev, landmark: value }))}
            isReadOnly={isReadOnly}
          />
        </APIProvider>
      </div>
      <div className="flex flex-col gap-4 bg-white p-4 rounded shadow">
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Address <span className="text-red-500">*</span></span>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter address"
            className={`border p-2 rounded ${formData.address ? 'border-gray-300' : 'border-red-500 bg-red-50'} ${
              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            disabled={isReadOnly}
          />
          {formData.address === '' && !isReadOnly && (
            <p className="mt-1 text-sm text-red-500">Address is required</p>
          )}
        </label>
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Latitude</span>
          <input
            type="number"
            name="latitude"
            value={formData.latitude}
            onChange={(e) => {
              if (isReadOnly) return;
              handleInputChange(e);
              setHomePosition((prev) => ({
                lat: parseFloat(e.target.value) || 0,
                lng: prev ? prev.lng : parseFloat(formData.longitude) || 0,
              }));
            }}
            placeholder="Latitude"
            className={`border p-2 rounded ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={isReadOnly}
          />
        </label>
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Longitude</span>
          <input
            type="number"
            name="longitude"
            value={formData.longitude}
            onChange={(e) => {
              if (isReadOnly) return;
              handleInputChange(e);
              setHomePosition((prev) => ({
                lat: prev ? prev.lat : parseFloat(formData.latitude) || 0,
                lng: parseFloat(e.target.value) || 0,
              }));
            }}
            placeholder="Longitude"
            className={`border p-2 rounded ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={isReadOnly}
          />
        </label>
        {distance !== null && (
          <p className="text-gray-700">
            Distance from company: <strong>{distance.toFixed(2)} km</strong>
          </p>
        )}
        {distanceError && !isReadOnly && <p className="text-red-500 text-sm">{distanceError}</p>}
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Landmark</span>
          <input
            ref={landmarkInputRef}
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleInputChange}
            placeholder="Nearby landmark"
            className={`border p-2 rounded ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={isReadOnly}
          />
        </label>
      </div>
      <Modal
        show={showDistanceModal}
        title="Distance Warning"
        message={distanceError}
        onClose={() => setShowDistanceModal(false)}
      />
    </div>
  );
};

export default EmployeeAddressGoogleMapView;