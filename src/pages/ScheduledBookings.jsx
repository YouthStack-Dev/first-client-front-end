import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, X } from 'lucide-react';
import { useGetBookingsQuery } from '../redux/rtkquery/clientRtk';

const ScheduledBookings = ({toogleRouting,isVisible,setRoutingData}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShiftType, setSelectedShiftType] = useState("All");
  const [openNewRouteEditor, setOpenNewRouteEditor] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [shiftBookings, setShiftBookings] = useState([]);

  const handleButtonClick = (shift) => {
    setSelectedShift(shift);
    setShowBookingModal(true);
  };

  
  const { data: response, isLoading, isError, refetch } = useGetBookingsQuery(selectedDate, {
    skip: !selectedDate,
    refetchOnMountOrArgChange: true, // Force refetch when the date changes
  });

  useEffect(() => {
    if (selectedDate) {
      setShiftBookings(response?.TimeShifts || []);
     
      
    }
  }, [selectedDate, response]);

  const shiftOptions = [
    { label: 'Select option', value: 'Select option' },
    { label: 'Generate Route', value: 'Generate Route' },
    { label: 'Inter Shift Copy', value: 'Inter Shift Copy' },
    { label: 'Update Pickup Time', value: 'Update Pickup Time' },
    { label: 'Delete Route', value: 'Delete Route' },
    { label: 'Download', value: 'Download' },
    { label: 'Upload Vehicle', value: 'Upload Vehicle'}
  ];

  const TripOptions = [
    { label: 'Select option', value: 'Select option' },
    { label: 'Generate Route', value: 'Generate Route' },
    { label: 'Inter Shift Copy', value: 'Inter Shift Copy' },
    { label: 'Update Pickup Time', value: 'Update Pickup Time' },
    { label: 'Delete Route', value: 'Delete Route' },
    { label: 'Download', value: 'Download' },
    { label: 'Upload Vehicle', value: 'Upload Vehicle'}
  ];
  let value = 0; 

  const incrementVendorIdIfNeeded = (routes) => {
   // Initialize outside the map so it doesn't reset on each iteration  
    routes.map((obj) => {
      value = obj.vendorId === null ? 0 : ++value; // Post-increment
    });
    return value;
  };
  

  const incrementVehicleIdIfNeeded = (routes) => {
    // Initialize outside the map so it doesn't reset on each iteration  
     routes.map((obj) => {
       value = obj.vehicleId === null ? 0 : ++value; // Post-increment
     });
     return value;
   };
  
   const handleRoutingview=(shift)=>{
   
    setRoutingData(shift?.routes)
    toogleRouting(true)
   }

  return (
    <div className="min-h-screen bg-gray-50 " style={{ display: isVisible ? "block" : "none" }}>
      <div className="mx-auto px-4 py-6">
        {/* Top Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Shift Type</label>
                <select
                  value={selectedShiftType}
                  onChange={(e) => setSelectedShiftType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="In">LogIn</option>
                  <option value="Out">LogOut</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Open New Route Editor</span>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={openNewRouteEditor}
                    onChange={(e) => setOpenNewRouteEditor(e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <span className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Routes Panel */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 p-3 border-b">
              <h2 className="text-lg font-semibold text-gray-700">Routes Management</h2>
              <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <select className="text-sm border rounded px-2 py-1 mr-2 w-32">
                            {shiftOptions.map((option, index) => (
                            <option key={index} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                            </select>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
                              GO
                            </button>
                          </div>
                          <div className='p-2 text-sm'>
                          {/* <span>Total:{'NUMBERS'}</span> <br />
                          <span>Total Custom:{'NUMBERS'}</span> */}
                        </div>   
                        </div>

                        
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm ">
                <thead className="bg-gray-100 font-bold  text-[13px] text-black">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Shift Time (Type)</th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Employees (Routes)</th>
                    <th className="px-4 py-3 text-left font-medium  uppercase tracking-wider">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-2 h-4 w-4" />
                        Manage Routes
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Vehicles/Vendors/Routes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shiftBookings?.map((shift, index) => (
                    <tr key={`route-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {shift.bookingType === "LOGIN" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          <span>{shift.shift} ({shift.bookingType})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">

                            <button 
                              onClick={() => handleButtonClick(shift)}
                              className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                            >
                          {shift.routes?.length===0 ?'Schedule':'Routed'} {shift.bookings.length || "0"}  
                            </button>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input type="checkbox" className="h-4 w-4" />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        <button onClick={()=>handleRoutingview(shift)} className='ml-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition'>
                     {`${shift?.routes?.length !== 0 ? incrementVendorIdIfNeeded(shift?.routes) : 0}/${shift?.routes?.length !== 0 ? incrementVehicleIdIfNeeded(shift?.routes) : 0}/${shift.routes.length}`}

                        </button>
                     
                        <div className="mt-2">
                          {selectedShiftType === "Upload Vehicle" && (
                            <div className="flex items-center">
                              <select className="text-sm border rounded px-2 py-1 mr-2 w-32">
                                <option>Upload Vehicle</option>
                              </select>
                              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
                                GO
                              </button>
                              <span className="ml-2 text-sm text-gray-500">0/2/34</span>
                              {index === 0 && <AlertTriangle className="w-4 h-4 text-amber-500 ml-2" />}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TripSheets Panel */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 p-3 border-b">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">TripSheets Management</h2>
              <div className="flex items-center">
                      
                          <div className="flex items-center">
                            <select className="text-sm border rounded px-2 py-1 mr-2 w-32">
                             { TripOptions.map((val,i)=><option key={i}>{val.label}</option>)}
                            </select>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
                              GO
                            </button>
                          </div>
                        </div>
            </div>
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm ">
            <thead className="bg-gray-100 font-bold  text-[13px] text-black">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Employees (TripSheet)</th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">Fleet Mix (Vehicle Occupancy)</th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-2 h-4 w-4" />
                        Manage TripSheets
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium   uppercase tracking-wider">Vehicles/Vendors/TripSheets</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shiftBookings?.map((shift, index) => (
                    <tr key={`tripsheet-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button 
                          onClick={() => handleButtonClick(shift)}
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                        {shift.bookings.length}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">Generated</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input type="checkbox" className="h-4 w-4" />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {`${shift?.totalVehicle || 0}/${shift?.totalVendor || 0}/${shift.tripsheet?.length ||0 }`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showBookingModal && selectedShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 overflow-auto max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">
                Booking Details - {selectedShift.shift} ({selectedShift.bookingType})
              </h3>
              <button 
                onClick={() => setShowBookingModal(false)}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Office</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop Location</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedShift.bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-900">{booking.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{booking.customer.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{booking.customer.phoneNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{booking.customer.gender}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-normal break-words max-w-xs">
                        {booking.customer.address}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-normal break-words max-w-xs">
                        {booking.pickupAddress}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-normal break-words max-w-xs">
                        {booking.dropAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledBookings;