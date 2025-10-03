import React, { useState } from 'react';
// import SearchBox from './SearchBox';
import TrackingVehicleDetails from '@components/TrackingVehicleDetails';
// import MapView from '@components/MapView';
import SearchBox from '@components/ui/SearchBox';
import MapView from '@components/MapView';

const TrackingScreen = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 m-1">
 

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBox 
            onVehicleSelect={handleVehicleSelect}
            selectedVehicle={selectedVehicle}
          />
        </div>
    
        {/* Two Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-280px)]">
          {/* Left Panel - Vehicle Details */}
          <div className="space-y-6">
            <TrackingVehicleDetails vehicle={selectedVehicle} />
          </div>

          {/* Right Panel - Map View */}
          <div className="h-full">
            <MapView vehicle={selectedVehicle} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingScreen;
