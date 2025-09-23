import React, { useState } from 'react';

import { MapPin, Car } from 'lucide-react';
import Card from '../ui/Card';
import SearchInput from '../ui/SearchInput';

const DriverMap = ({ drivers }) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);

  const handleSearch = () => {
    const trimmedSearch = searchValue.trim().toLowerCase();
    const found = drivers.find(d =>
      d.vehicleNumber.toLowerCase().includes(trimmedSearch)
    );
    
    console.log('Found driver:', found);
    setSelectedDriver(found || null);
  };
  

  return (
    <Card title="Driver Tracking" className="h-[400px] flex flex-col">
      <div className="mb-4 flex">
  <SearchInput
    placeholder="Search by vehicle number..."
    value={searchValue}
    onChange={setSearchValue}
    // Remove onSearch for now if not triggering properly
  />
  <button
    onClick={handleSearch}
    className="ml-2 bg-blue-500 text-white px-4 rounded"
  >
    Search
  </button>
</div>

      <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
        {selectedDriver ? (
          <div className="absolute inset-0 flex flex-col">
            <div className="p-3 bg-blue-500 text-white flex justify-between items-center">
              <div className="flex items-center">
                <Car className="h-5 w-5 mr-2" />
                <p className="font-semibold">{selectedDriver.name} - {selectedDriver.vehicleNumber}</p>
              </div>
              <div className="flex items-center">
                <span className={`inline-flex h-2.5 w-2.5 rounded-full mr-2 ${
                  selectedDriver.status === 'active' ? 'bg-green-400' :
                  selectedDriver.status === 'on-duty' ? 'bg-orange-400' : 'bg-red-400'
                }`}></span>
                <span className="text-sm capitalize">{selectedDriver.status}</span>
              </div>
            </div>
            <div className="flex-1 bg-gray-200 flex items-center justify-center relative">
              {selectedDriver.location ? (
                <iframe
                  title="Driver Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBMH_1rBwfQNTpIcZYE-VSDY5XZT5sF5FM&q=${selectedDriver.location.lat},${selectedDriver.location.lng}&zoom=14`}
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MapPin className="h-12 w-12 mb-2 text-gray-400" />
                  <p>No location data available for this driver</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <MapPin className="h-12 w-12 mb-3 text-gray-400" />
            <p className="mb-1">Search for a driver by vehicle number</p>
            <p className="text-sm text-gray-400">Examples: ABC123, XYZ789, DEF456</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DriverMap;
