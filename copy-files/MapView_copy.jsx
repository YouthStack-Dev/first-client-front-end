import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Clock, Car } from 'lucide-react';

const MapView = ({ vehicle }) => {
  const API_KEY = 'AIzaSyCI7CwlYJ6Qt5pQGW--inSsJmdEManW-K0';

  // Start with vehicle's initial position
  const [position, setPosition] = useState({
    lat: vehicle?.location.lat || 12.9716,   // fallback to Bangalore if undefined
    lng: vehicle?.location.lng || 77.5946
  });

  // Fake live movement by slightly changing lat/lng every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0001,  // very small movement
        lng: prev.lng + (Math.random() - 0.5) * 0.0001
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!vehicle) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <MapPin className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle Tracking</h3>
          <p className="text-gray-500">Select a vehicle to view its location on the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Map Header */}
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

      {/* Map Container */}
      <div className="flex-1 relative rounded-b-lg overflow-hidden">
        <APIProvider apiKey={API_KEY}>
          <Map
            defaultCenter={position}
            defaultZoom={15}
            style={{ width: '100%', height: '100%' }}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            <AdvancedMarker position={position}>
              {/* Car icon */}
              <Car className="w-8 h-8 text-blue-600" />
            </AdvancedMarker>
          </Map>
        </APIProvider>

        {/* Vehicle Info Popup */}
        {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-4 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-max z-10">
          <div className="text-sm font-semibold text-gray-900">{vehicle.vehicleNumber}</div>
          <div className="text-xs text-gray-600">{vehicle.driver.name}</div>
          <div className="text-xs text-gray-500 mt-1">{formatLastUpdated(vehicle.location.lastUpdated)}</div>
        </div> */}

        {/* Location Info Card */}
        {/* <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
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
        </div> */}
      </div>
    </div>
  );
};

export default MapView;
