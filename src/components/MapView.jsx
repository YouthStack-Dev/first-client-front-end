import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Clock, Car } from 'lucide-react';

const MapView = () => {
  const API_KEY = import.meta.env.VITE_GOOGE_API
  // Static vehicle data
  const vehicle = {
    vehicleNumber: 'KA-01-AB-1234',
    status: 'active',
    location: {
      lat:   13.112509,
      lng: 77.525023,
      address: 'MG Road, Bengaluru, Karnataka',
      lastUpdated: new Date().toISOString(),
    },
    driver: {
      name: 'John Doe',
    },
    speed: 35,
  };

  // Initial fixed point (Bangalore)
  const initialPosition = { lat: 13.112509, lng: 77.525023 };

  const [position, setPosition] = useState(initialPosition);
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef(null);
  const mapRef = useRef(null);

  // Simulate live movement near Bangalore (bounded)
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        lat: initialPosition.lat + (Math.random() - 0.5) * 0.0002,
        lng: initialPosition.lng + (Math.random() - 0.5) * 0.0002,
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Close info overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setShowInfo(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatLastUpdated = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Navigation className="w-6 h-6 mr-2 text-blue-500" />
          Live Tracking
        </h3>
        <div
          className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            vehicle.status === 'active'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              vehicle.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          {vehicle.status === 'active' ? 'Live' : 'Offline'}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative rounded-b-lg overflow-hidden">
        <APIProvider apiKey={API_KEY}>
          <Map
            center={position}
            defaultZoom={15}
            onLoad={(map) => { mapRef.current = map; }}
            style={{ width: '100%', height: '100%' }}
            gestureHandling="cooperative"
            disableDefaultUI={false}
          >
            <AdvancedMarker position={position}>
              <div className="relative -translate-x-1/2 -translate-y-full">
                <Car className="w-8 h-8 text-blue-600" />
              </div>
            </AdvancedMarker>
          </Map>
        </APIProvider>

        {/* Info toggle button */}
        <div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 cursor-pointer"
          onClick={() => setShowInfo(!showInfo)}
        >
          <Car className="w-10 h-10 text-blue-600 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-100 transition-colors" />
        </div>

        {/* Recenter button */}
        <div
          className="absolute top-4 right-4 z-50 cursor-pointer"
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.panTo(position);
              mapRef.current.setZoom(15);
            }
          }}
        >
          <Navigation className="w-9 h-9 text-blue-600 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-100 transition-colors" />
        </div>

        {/* Vehicle info overlay */}
        {showInfo && (
          <div
            ref={infoRef}
            className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-max z-50"
          >
            <div className="text-sm font-semibold text-gray-900">{vehicle.vehicleNumber}</div>
            <div className="text-xs text-gray-600">{vehicle.driver.name}</div>
            <div className="text-xs text-gray-500 mt-1">{formatLastUpdated(vehicle.location.lastUpdated)}</div>
          </div>
        )}

        {/* Bottom location info card */}
        <div className="absolute bottom-4 left-4 right-4 md:max-w-md bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Current Location</h4>
              <p className="text-sm text-gray-600 mb-2">{vehicle.location.address}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatLastUpdated(vehicle.location.lastUpdated)}
                </div>
                <div>Speed: {vehicle.speed} mph</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Coordinates</div>
              <div className="text-xs font-mono text-gray-600">
                {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
