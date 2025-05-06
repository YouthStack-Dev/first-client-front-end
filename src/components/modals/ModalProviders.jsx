import { X } from 'lucide-react';

const RouteModal = ({ showModal, setShowModal, route }) => {
  if (!showModal || !route) return null;


  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-4 overflow-auto max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Route Employees - {route.id}
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Office</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Direction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time	</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extra Distance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Level</th>
          
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {route.routeBookings?.map(({booking:{customer} ,booking}) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm text-gray-900">{customer?.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{customer?.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{customer?.phoneNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{customer?.gender}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{booking?.pickupAddress}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{booking?.dropAddress}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{"office name "}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{booking?.bookingType}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{"start time "}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{" booking distance"}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{" extra time"}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{" calculate %"}</td>



                  

                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RouteModal;
