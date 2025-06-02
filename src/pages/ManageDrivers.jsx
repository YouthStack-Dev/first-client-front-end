import React, { useEffect, useState } from 'react';
import { Edit, MoreVertical, Plus, Search, Trash2, ChevronLeft, ChevronRight  } from 'lucide-react';
import { InputField, Modal } from '../components/SmallComponents';

import { useGetDriversQuery } from '../redux/rtkquery/driverRtk';
import HeaderWithAction from '../components/HeaderWithAction';
import DriverToolbar from '../components/DriverToolbar';


// Memoized Driver List Component
const DriverList = React.memo(({ drivers, menuOpen ,onNext,onPrev,currentPage ,totalPages,isLoading}) => (
  <div className="rounded-lg overflow-hidden shadow-sm mt-2">
  {/* Table Container with Scroll */}
  <div className="overflow-auto h-[620px]">
    <table className="min-w-full border-collapse">
      {/* Table Header */}
      <thead className="bg-gray-50 border-b sticky top-0">
        <tr className="text-left text-gray-600">
          <th className="px-4 py-3 w-1/3">Driver Name</th>
          <th className="px-4 py-3 w-1/4">Phone Number</th>
          <th className="px-4 py-3 w-1/4">Vehicle Number</th>
          <th className="px-4 py-3 w-1/6 text-center">Actions</th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody>
        {drivers?.length === 0 ? (
          <tr>
            <td colSpan="4" className="p-4 text-center text-gray-500">
              No drivers found
            </td>
          </tr>
        ) : (
          drivers.map((driver) => (
            <tr key={driver.id} className="border-b hover:bg-gray-50 transition">
              <td className="px-4 py-3">{driver.name}</td>
              <td className="px-4 py-3">{driver.phoneNo}</td>
              <td className="px-4 py-3">{driver.vehicle.name}</td>
              <td className="px-4 py-3 text-center relative">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
                {menuOpen === driver.id && (
                  <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border p-2 z-10">
                    <button className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50">
                      <Edit size={18} color="blue" />
                      <span className="text-xs">Manage</span>
                    </button>
                    <button className="flex flex-col items-center px-3 py-2 text-gray-700 hover:bg-gray-50">
                      <Trash2 size={18} color="red" />
                      <span className="text-xs">Delete</span>
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
    
  </div>
  <div className="flex justify-center items-center gap-4 mt-4">
  <button
    onClick={onPrev}
    disabled={currentPage === 1}
    className={`flex items-center gap-2 px-4 py-2 rounded transition 
      ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
  >
    <ChevronLeft size={18} />
    Prev
  </button>

  <span className="text-sm text-gray-700 font-medium">
    Page {currentPage} of {totalPages}
  </span>

  <button
    onClick={onNext}
    disabled={currentPage === totalPages}
    className={`flex items-center gap-2 px-4 py-2 rounded transition 
      ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
  >
    Next
    <ChevronRight size={18} />
  </button>
</div>

</div>

));

function ManageDrivers() {

  const [currentPage, setCurrentPage] = useState(1);


  const[driverModal,setDriverModal]=useState(false)

  const { data, isLoading } = useGetDriversQuery();

  const drivers = [...(data?.driver || [])].reverse();

  console.log(" is loading ",isLoading);
  



const totalPages = Math.ceil(10 /30);
  


//  handle driver submit 
const handleDriverSubmit = (e) => {
  e.preventDefault();
  // 🔥 Your logic here
  console.log("Form submitted");

  // Example: Get values or send to API
  const formData = new FormData(e.target);
  const driverName = formData.get("driverName");
  const phoneNo = formData.get("phoneNo");
  const vehicleType = formData.get("vehicleType");

  console.log({ driverName, phoneNo, vehicleType });

  // Close the modal
  setDriverModal(false);
};
const [driverList, setDriverList] = useState([]);
useEffect(() => {
  if (data?.driver) {
    setDriverList([...data.driver].reverse());
  }
}, [data]);

useEffect(() => {
  const eventSource = new EventSource('http://fleetbackend.local:3000/api/driver-events');

  eventSource.addEventListener('connected', (e) => {
    console.log("SSE connection established");
  });

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received driver data:", data);
      setDriverList(Array.isArray(data) ? data.reverse() : [data]);
    } catch (err) {
      console.error("Error parsing SSE data:", err);
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE error:", err);
  };

  return () => {
    eventSource.close();
  };
}, []);

const vendors = [
  { id: 1, type: 'Vendor A' },
  { id: 2, type: 'Vendor B' },
  { id: 3, type: 'Vendor C' },
];

const handleFilterChange = ({ driverStatus, vendorType }) => {
  console.log('Filters:', driverStatus, vendorType);
  // Apply your filtering logic here
};

const handleBulkUpload = () => {
  alert('Bulk Upload clicked');
  // Show modal or navigate to upload page
};

const handleManageCompliance = () => {
  alert('Manage Compliance clicked');
  // Show compliance management UI
};

  return (
    <>
    
      <HeaderWithAction   title="Manage Drivers"  buttonLabel="Add Driver"    buttonRoute="driver-form"   />
     
      <DriverToolbar
        vendors={vendors}
        onFilterChange={handleFilterChange}
        onBulkUpload={handleBulkUpload}
        onManageCompliance={handleManageCompliance}
      />
      <DriverList drivers={drivers} menuOpen={null}  isLoading={isLoading}/>
    </>
  );
}
export default React.memo(ManageDrivers);