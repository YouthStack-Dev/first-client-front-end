
import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { useGetBookingsQuery } from '../redux/rtkquery/clientRtk';



const ScheduledBookings = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [useRouting, setUseRouting] = useState(false);
  const [selectedShiftType, setSelectedShiftType] = useState("All");
  const [openNewRouteEditor, setOpenNewRouteEditor] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [shiftBookings, setShiftBookings]= useState([])

  const handleButtonClick = (shift) => {
    setSelectedShift(shift);
    console.log(" this is  the  modle scheduled shifts " ,shift );
    
    setShowBookingModal(true);
  };

  const { data: response, isLoading, isError, refetch } = useGetBookingsQuery(selectedDate, {
    skip: !selectedDate,
  });
  


useEffect(() => {
  if (selectedDate) {
    console.log("Selected Date:", selectedDate);
    console.log("Booking Data:", response?.TimeShifts);
  }
  setShiftBookings(response?.TimeShifts || []);
}, [selectedDate, response]);

const shiftOptions = [
  { label: 'Select option', value: 'Select option' },
  { label: 'Generate Route', value: 'Generate Route' },
  { label: 'Inter Shift Copy', value: 'Inter Shift Copy' },
  { label: 'Update Pickup Time', value: 'Update Pickup Time' },
  { label: 'Delete Route', value: 'Delete Route' },
  { label: 'Download', value: 'Download' },
  { label: 'Upload Vehicle', value: 'Upload Vehicle'}]

  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Main Content */}
      <div className=" mx-auto px-4 py-6">
        {/* Top Controls */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            {/* <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useRouting}
                onChange={(e) => setUseRouting(e.target.checked)}
                className="form-checkbox"
              />
              <span>Use Routing 2.0</span>
            </label> */}

            <select
              value={selectedShiftType}
              onChange={(e) => setSelectedShiftType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              {shiftOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <select
              value={selectedShiftType}
              onChange={(e) => setSelectedShiftType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="All">All</option>
              <option value="In">LogIn</option>
              <option value="Out">LogOut</option>
            </select>
            <label className="flex items-center gap-2">
              <span>Open New Route Editor</span>
              <div className="relative inline-block w-10">
                <input
                  type="checkbox"
                  checked={openNewRouteEditor}
                  onChange={(e) => setOpenNewRouteEditor(e.target.checked)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <span className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300"></span>
              </div>
            </label>
          </div>
        </div>

 
        {/* Scrollable Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-y-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Shift Time (Type)</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Employees (Routes)</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Manage Routes</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Vehicles/Vendors/Routes</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Employees (TripSheet)</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Fleet Mix</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Manage TripSheets</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Vehicles/Vendors/TripSheets</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {shiftBookings?.map((shift, index) => (
                    <tr key={index} className={shift.id === 1 ? "bg-orange-100" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {shift.bookingType === "LOGIN" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          {shift.shift} ({shift.bookingType})
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {/* {shift.routes?.length || 0 && (
                            <span className="text-gray-600">Routed: 
                              <button 
                                onClick={() => handleButtonClick(shift)}
                                className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                              >
                                {shift.routes?.length|| "Na"}
                              </button>
                            </span>
                          )} */}
                          {false && (
                            
                            <span className="text-gray-600">Custom: 
                            
                              <button 
                                onClick={() => handleButtonClick(shift)}
                                className="ml-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100"
                              >
                                {"CN"}
                              </button>
                              <AlertTriangle className="inline w-4 h-4 text-yellow-500 ml-1" />
                            </span>
                          )}
                          {shiftBookings.length && (
                            <span className="text-gray-600">Scheduled: 
                              <button 
                                onClick={() => handleButtonClick(shift)}
                                className="ml-1 px-2 py-0.5 bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
                              >
                               {shift.bookings.length || "NA"}
                              </button>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="form-checkbox" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {`1/1/${shift.routes.length}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {shift.bookings.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{"Fleetmix"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="form-checkbox" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{`1/1/${shift.routes.length}`}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
       {/* Booking Details Modal */}
       {showBookingModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 overflow-auto max-h-[90vh]">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Booking Details - {selectedShift.shift} ({selectedShift.bookingType})
        </h3>
        <button 
          onClick={() => setShowBookingModal(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Office</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drop Location</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {selectedShift.bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{booking.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{booking.customer.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{booking.customer.phoneNo}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{booking.customer.gender}</td>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal break-words max-w-xs">
                  {booking.customer.address}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal break-words max-w-xs">
                  {booking.pickupAddress}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal break-words max-w-xs">
                {booking  .dropAddress}
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