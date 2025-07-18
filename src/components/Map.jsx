import { APIProvider } from '@vis.gl/react-google-maps';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import MapContent from './MapContent';
import { log } from '../utils/logger';

const fixedPoint = { lat: 12.9716, lng: 77.5946 }; // Company location (Bangalore)
const MAX_DISTANCE_KM = 20; // Define your maximum allowed distance in kilometers

// Simple Modal Component (you can replace this with a more robust UI library modal)
const Modal = ({ show, title, message, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4 text-red-600">{title}</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};


const EmployeeAddressGoogleMapView = ({formData}) => {
  const API_KEY = import.meta.env.VITE_GOOGLE_API || '';
  const [homePosition, setHomePosition] = useState(null);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitudeInput, setLatitudeInput] = useState('');
  const [longitudeInput, setLongitudeInput] = useState('');
  const [distance, setDistance] = useState(null);
  const [distanceError, setDistanceError] = useState('');
  const [showDistanceModal, setShowDistanceModal] = useState(false); // New state for modal visibility

  const landmarkInputRef = useRef(null);

  // Function to calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((point1, point2) => {
    if (!point1 || !point2) return null;

    const R = 6371; // Radius of Earth in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }, []);

  // Effect to update latitude/longitude input fields when homePosition changes
  useEffect(() => {
    if (homePosition) {
      setLatitudeInput(homePosition.lat.toFixed(6));
      setLongitudeInput(homePosition.lng.toFixed(6));
    } else {
      setLatitudeInput('');
      setLongitudeInput('');
    }
  }, [homePosition]);

  // Effect to calculate distance whenever homePosition changes
  useEffect(() => {
    const dist = calculateDistance(fixedPoint, homePosition);
    setDistance(dist);
    if (dist !== null && dist > MAX_DISTANCE_KM) {
      setDistanceError(`Home location is too far! (Max ${MAX_DISTANCE_KM} km)`);
      setShowDistanceModal(true); // Show modal if distance is too great
    } else {
      setDistanceError('');
      setShowDistanceModal(false); // Hide modal if distance is okay
    }
  }, [homePosition, calculateDistance]);

  // Handle manual latitude input
  const handleLatitudeChange = (e) => {
    const value = e.target.value;
    setLatitudeInput(value);
    const newLat = parseFloat(value);
    const currentLng = homePosition ? homePosition.lng : null;
    if (!isNaN(newLat) && currentLng !== null) {
      setHomePosition({ lat: newLat, lng: currentLng });
    } else if (!isNaN(newLat) && longitudeInput) {
        // If both are present, update home position
        setHomePosition({ lat: newLat, lng: parseFloat(longitudeInput) });
    }
  };

  // Handle manual longitude input
  const handleLongitudeChange = (e) => {
    const value = e.target.value;
    setLongitudeInput(value);
    const newLng = parseFloat(value);
    const currentLat = homePosition ? homePosition.lat : null;
    if (!isNaN(newLng) && currentLat !== null) {
      setHomePosition({ lat: currentLat, lng: newLng });
    } else if (!isNaN(newLng) && latitudeInput) {
        // If both are present, update home position
        setHomePosition({ lat: parseFloat(latitudeInput), lng: newLng });
    }
  };

  const handleSave = () => {
    if (!homePosition) {
      alert('Please set a home location first.');
      return;
    }
    if (distanceError) {
      setShowDistanceModal(true);
      return;
    }
  
    const updatedFormData = {
      gender:formData.gender,
      username: formData.employeeName,
      email: formData.emailId,
      employee_code: formData.employee_code
      ,
      address,
      latitude: String(homePosition.lat),
      longitude: String(homePosition.lng),
      landmark,
      special_need: formData.specialNeed,
      office: formData.office,
      alternate_mobile_number: formData.alternateMobileNumber,
      mobile_number: formData.mobileNumber,
      subscribe_via_email: formData.subscribeEmail,
      subscribe_via_sms: formData.subscribeSms,
      distance_from_company: distance ? Number(distance.toFixed(2)) : null
    };
  
    console.log('--- Final Payload ---');
    console.log(updatedFormData);
  
    alert('Home details saved and logged to console!');
  };
  
  

  return (
    <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Map */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-[450px]">
        <APIProvider apiKey={API_KEY} libraries={['places']}>
          <MapContent
            homePosition={homePosition}
            setHomePosition={setHomePosition}
            setAddress={setAddress}
            landmarkInputRef={landmarkInputRef}
            setLandmark={setLandmark}
          />
        </APIProvider>
      </div>

      {/* Right: Form fields */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded shadow">
        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Address</span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
            className="border p-2 rounded"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Latitude</span>
          <input
            type="number"
            value={latitudeInput}
            onChange={handleLatitudeChange}
            placeholder="Latitude"
            className="border p-2 rounded"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Longitude</span>
          <input
            type="number"
            value={longitudeInput}
            onChange={handleLongitudeChange}
            placeholder="Longitude"
            className="border p-2 rounded"
          />
        </label>
        {distance !== null && (
          <p className="text-gray-700">
            Distance from company: <strong>{distance.toFixed(2)} km</strong>
          </p>
        )}
        {distanceError && <p className="text-red-500 text-sm">{distanceError}</p>}

        <label className="flex flex-col">
          <span className="text-gray-700 mb-1">Landmark</span>
          <input
            ref={landmarkInputRef}
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="Nearby landmark"
            className="border p-2 rounded"
          />
        </label>

        <button
          onClick={handleSave}
          className="mt-4 bg-green-500 text-white p-2 rounded shadow hover:bg-green-600 transition disabled:bg-gray-400"
          disabled={!homePosition || !!distanceError}
        >
          Save Details
        </button>
      </div>

      {/* Modal Component */}
      <Modal
        show={showDistanceModal}
        title="Distance Warning"
        message={distanceError}
        onClose={() => setShowDistanceModal(false)}
      />
    </div>
  );
};

export default EmployeeAddressGoogleMapView ;