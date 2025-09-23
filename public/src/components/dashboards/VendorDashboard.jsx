import React from 'react';
import DriverStats from './DriverStats';
import DriverMap from './DriverMap';
import TripTracker from './TripTracker.jsx';


const VendorDashboard = () => {
  const driverStats = {
    total: 20,
    active: 12,
    onDuty: 5,
    inactive: 3,
  };

  const mockDrivers = [
    { name: 'Ravi Kumar', vehicleNumber: 'ABC123', status: 'active', location: { lat: 12.9716, lng: 77.5946 } },
    { name: 'Sneha Reddy', vehicleNumber: 'XYZ789', status: 'on-duty', location: { lat: 28.6139, lng: 77.209 } },
    { name: 'John Fernandes', vehicleNumber: 'DEF456', status: 'inactive', location: null },
  ];

  const mockTrips = [
    { id: 1, vehicleNumber: 'ABC123', driverName: 'Ravi Kumar', status: 'completed', start: '8:00 AM', end: '10:00 AM' },
    { id: 2, vehicleNumber: 'XYZ789', driverName: 'Sneha Reddy', status: 'ongoing', start: '9:00 AM', end: null },
    { id: 3, vehicleNumber: 'DEF456', driverName: 'John Fernandes', status: 'scheduled', start: '11:00 AM', end: null },
  ];

  return (
    <div className="p-4">
     
      
      <DriverStats stats={driverStats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <DriverMap drivers={mockDrivers} />
        <TripTracker trips={mockTrips} />
      </div>
    </div>
  );
};

export default VendorDashboard;
