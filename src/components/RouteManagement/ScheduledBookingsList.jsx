import React, { useState } from 'react';
import { 
  Map, 
  Truck, 
  Users, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  Play,
  X,
  User,
  ArrowRightCircle,
  ArrowLeftCircle
} from 'lucide-react';

const ScheduledBookingsList = ({ bookings = [], onGenerateRoute, onDeleteRoute }) => {
  const [selectedAction, setSelectedAction] = useState({});
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  const handleActionChange = (bookingId, action) => {
    setSelectedAction(prev => ({
      ...prev,
      [bookingId]: action
    }));
  };

  const handleExecuteAction = (bookingId) => {
    const action = selectedAction[bookingId];
    
    if (action === 'generate') {
      onGenerateRoute(bookingId);
    } else if (action === 'delete') {
      onDeleteRoute(bookingId);
    }
  };

  const openModal = (modalType, booking) => {
    setActiveModal(modalType);
    setModalData(booking);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const getStatusIcon = (status) => {
    return status === 'Scheduled' 
      ? <CheckCircle size={16} className="text-green-500" /> 
      : <AlertCircle size={16} className="text-amber-500" />;
  };

  // Modal components
  const RoutesModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Routes for {modalData.shiftType} Shift ({modalData.shiftTime})</h3>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Vehicle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {modalData.routes.map(route => (
                <tr key={route.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{route.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.vendor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.vehicle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button 
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const VendorsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Vendors for {modalData.shiftType} Shift ({modalData.shiftTime})</h3>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Routes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {modalData.vendors.map(vendor => (
                <tr key={vendor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vendor.routes.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button 
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const VehiclesModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Vehicles for {modalData.shiftType} Shift ({modalData.shiftTime})</h3>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {modalData.vehicles.map(vehicle => (
                <tr key={vehicle.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {vehicle.route || 'Not assigned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button 
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const EmployeesModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Employees for {modalData.shiftType} Shift ({modalData.shiftTime})</h3>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Office</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PickUp Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {modalData.employees.map(employee => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.office}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.pickup}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.drop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button 
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
  
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Shift Time/Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Employees</th>
                <th className="px-6 py-3">Routes</th>
                <th className="px-6 py-3">Vendors</th>
                <th className="px-6 py-3">Vehicles</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  {/* Shift Time/Type Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${booking.shiftType === 'LOGIN' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {booking.shiftType === 'LOGIN' ? (
                          <ArrowRightCircle size={18} className="text-green-600" />
                        ) : (
                          <ArrowLeftCircle size={18} className="text-red-600" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{booking.shiftTime}</div>
                        <div className={`text-sm font-semibold ${booking.shiftType === 'LOGIN' ? 'text-green-600' : 'text-red-600'}`}>
                          {booking.shiftType}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Status Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(booking.status)}
                      <span className={`ml-2 text-sm font-medium ${booking.status === 'Scheduled' ? 'text-green-700' : 'text-amber-700'}`}>
                        {booking.status}
                      </span>
                    </div>
                  </td>
                  
                  {/* Employees Count Column */}
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => openModal('employees', booking)}
                      className="flex items-center text-amber-600 hover:text-amber-800 transition-colors"
                    >
                      <User size={18} className="mr-2" />
                      <span className="font-medium">{booking.employeeCount}</span>
                    </button>
                  </td>
                  
                  {/* Routes Count Column */}
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => openModal('routes', booking)}
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Map size={18} className="mr-2" />
                      <span className="font-medium">{booking.routesCount}</span>
                    </button>
                  </td>
                  
                  {/* Vendor Count Column */}
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => openModal('vendors', booking)}
                      className="flex items-center text-green-600 hover:text-green-800 transition-colors"
                    >
                      <Users size={18} className="mr-2" />
                      <span className="font-medium">{booking.vendorCount}</span>
                    </button>
                  </td>
                  
                  {/* Vehicle Count Column */}
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => openModal('vehicles', booking)}
                      className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      <Truck size={18} className="mr-2" />
                      <span className="font-medium">{booking.vehicleCount}</span>
                    </button>
                  </td>
                  
                  {/* Actions Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <select 
                          value={selectedAction[booking.id] || ''}
                          onChange={(e) => handleActionChange(booking.id, e.target.value)}
                          className="appearance-none bg-gray-100 border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Action</option>
                          <option value="generate">Generate Route</option>
                          <option value="delete">Delete Route</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                      
                      <button
                        onClick={() => handleExecuteAction(booking.id)}
                        disabled={!selectedAction[booking.id]}
                        className={`p-2 rounded-lg flex items-center ${selectedAction[booking.id] 
                          ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                      >
                        <Play size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {bookings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Truck size={48} className="mx-auto text-gray-300 mb-3" />
              <p>No scheduled bookings found</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {activeModal === 'routes' && modalData && <RoutesModal />}
      {activeModal === 'vendors' && modalData && <VendorsModal />}
      {activeModal === 'vehicles' && modalData && <VehiclesModal />}
      {activeModal === 'employees' && modalData && <EmployeesModal />}
    </>
  );
};

export default ScheduledBookingsList;