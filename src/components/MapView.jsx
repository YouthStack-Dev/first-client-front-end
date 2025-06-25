import React from 'react';
import { MapPin, Navigation, Zap, Clock } from 'lucide-react';

const MapView = ({ vehicle }) => {
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

  const formatLastUpdated = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Map Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Navigation className="w-6 h-6 mr-2 text-blue-500" />
            Live Tracking
          </h3>
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            vehicle.status === 'active' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              vehicle.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            {vehicle.status === 'active' ? 'Live' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-b-lg overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-blue-200"></div>
            ))}
          </div>
        </div>

        {/* Vehicle Marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-blue-600 text-white p-3 rounded-full shadow-lg">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-max">
            <div className="text-sm font-semibold text-gray-900">{vehicle.vehicleNumber}</div>
            <div className="text-xs text-gray-600">{vehicle.driver.name}</div>
            <div className="text-xs text-gray-500 mt-1">{formatLastUpdated(vehicle.location.lastUpdated)}</div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-md border border-gray-200 transition-colors">
            <Zap className="w-4 h-4" />
          </button>
          <button className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-lg shadow-md border border-gray-200 transition-colors">
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* Location Info Card */}
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Current Location</h4>
              <p className="text-sm text-gray-600 mb-2">{vehicle.location.address}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatLastUpdated(vehicle.location.lastUpdated)}
                </div>
                <div>
                  Speed: {vehicle.speed} mph
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Coordinates</div>
              <div className="text-xs font-mono text-gray-600">
                {vehicle.location.lat.toFixed(4)}, {vehicle.location.lng.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
