import React from 'react';
import { 
  Truck, User, Phone, Mail, MapPin, Fuel, Gauge, Calendar, Settings 
} from 'lucide-react';

const TrackingVehicleDetails = ({ vehicle }) => {
  if (!vehicle) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Truck className="w-16 h-16 mx-auto mb-4" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle Selected</h3>
        <p className="text-gray-500">Search and select a vehicle to view its details and tracking information.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{vehicle.vehicleNumber}</h2>
            <p className="text-blue-100 mt-1">
              {vehicle.type} • {vehicle.model} ({vehicle.year})
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(vehicle.status)}`}>
            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Driver Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-500" />
            Driver Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center">
              <User className="w-4 h-4 text-gray-400 mr-3" />
              <span className="font-medium text-gray-900">{vehicle.driver.name}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-gray-600">{vehicle.driver.phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-gray-600">{vehicle.driver.email}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-gray-600">{vehicle.driver.experience} years experience</span>
            </div>
          </div>
        </div>

        {/* Vehicle Stats */}
        <div>
          {/* <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Gauge className="w-5 h-5 mr-2 text-blue-500" />
            Vehicle Stats
          </h3> */}
          <div className="grid grid-cols-2 gap-4">
            {/* Fuel */}
            {/* <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Fuel Level</p>
                  <p className="text-2xl font-bold text-green-700">{vehicle.fuel}%</p>
                </div>
                <Fuel className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-2 bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${vehicle.fuel}%` }}
                />
              </div>
            </div> */}

            {/* Speed */}
            {/* <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Speed</p>
                  <p className="text-2xl font-bold text-blue-700">{vehicle.speed} mph</p>
                </div>
                <Gauge className="w-8 h-8 text-blue-500" />
              </div>
            </div> */}
          </div>

          {/* <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Settings className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-sm text-gray-600">Total Mileage: </span>
              <span className="font-semibold text-gray-900 ml-1">{vehicle.mileage.toLocaleString()} miles</span>
            </div>
          </div> */}
        </div>

        {/* Location */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-500" />
            Current Location
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900 font-medium mb-2">{vehicle.location.address}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span>Last updated: {formatLastUpdated(vehicle.location.lastUpdated)}</span>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Coordinates: {vehicle.location.lat.toFixed(4)}, {vehicle.location.lng.toFixed(4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingVehicleDetails;
