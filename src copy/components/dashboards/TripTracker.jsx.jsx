import React from 'react';

const TripTracker = ({ trips }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 h-[400px] overflow-auto">
      <h2 className="text-xl font-semibold mb-4">Trip Tracker</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2">Trip ID</th>
            <th className="border-b p-2">Driver</th>
            <th className="border-b p-2">Vehicle</th>
            <th className="border-b p-2">Status</th>
            <th className="border-b p-2">Start Time</th>
            <th className="border-b p-2">End Time</th>
          </tr>
        </thead>
        <tbody>
          {trips.map(trip => (
            <tr key={trip.id} className="odd:bg-gray-50">
              <td className="p-2">{trip.id}</td>
              <td className="p-2">{trip.driverName}</td>
              <td className="p-2">{trip.vehicleNumber}</td>
              <td className={`p-2 capitalize ${
                trip.status === 'completed' ? 'text-green-600' :
                trip.status === 'ongoing' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {trip.status}
              </td>
              <td className="p-2">{trip.start}</td>
              <td className="p-2">{trip.end || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TripTracker;
