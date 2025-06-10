import React, { useEffect, useState } from 'react';
import { Edit, Trash2,  } from 'lucide-react';
import DriverToolbar from '../components/driver/DriverToolbar';
import { driversData, DriverTableHeaders } from '../staticData/DriverData';


// Memoized Driver List Component

const DriverList = ({ drivers, isLoading }) => {
  const hiddenColumns = new Set(['documentsUploaded',]); // add any key you want to hide

  const canViewDocuments = false; // or true based on role/logic
  const visibleHeaders = DriverTableHeaders.filter(
    (header) => !hiddenColumns.has(header.key)
  );

  

  return (
    <div className="rounded-lg overflow-hidden shadow-sm mt-2">
      <div className="overflow-auto h-[620px]">
        <table className="min-w-full border-collapse">
        <thead className="bg-gray-50 border-b sticky top-0">
  <tr className="text-left text-gray-600">
    {visibleHeaders.map((header) => (
      <th key={header.key} className="px-4 py-3 whitespace-nowrap">
        {header.label}
      </th>
    ))}
  </tr>
</thead>

<tbody>
  {drivers?.length === 0 ? (
    <tr>
      <td colSpan={visibleHeaders.length} className="p-4 text-center text-gray-500">
        No drivers found
      </td>
    </tr>
  ) : (
    drivers.map((driver, index) => (
      <tr key={index} className="border-b hover:bg-gray-50 transition">
        {visibleHeaders.map((header) => (
          <td key={header.key} className="px-4 py-3 text-sm">
            {header.key === 'actions' ? (
              <div className="flex gap-2 justify-center">
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <Edit size={16} color="blue" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <Trash2 size={16} color="red" />
                </button>
              </div>
            ) : (
              driver[header.key] || '—'
            )}
          </td>
        ))}
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>
    </div>
  );
};

function ManageDrivers() {

  const [currentPage, setCurrentPage] = useState(1);


  const[driverModal,setDriverModal]=useState(false)


  



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


const vendors = [
  { id: 1, type: 'Vendor A' },
  { id: 2, type: 'Vendor B' },
  { id: 3, type: 'Vendor C' },
];

const handleFilterChange = ({ driverStatus, vendorType }) => {
  console.log('Filters:', driverStatus, vendorType);
};

const handleBulkUpload = () => {
  alert('Bulk Upload clicked');
};

const handleManageCompliance = () => {
  alert('Manage Compliance clicked');
};

  return (
    <>
    
    <>
      <DriverToolbar
        vendors={vendors}
        onFilterChange={handleFilterChange}
        onBulkUpload={handleBulkUpload}
        onManageCompliance={handleManageCompliance}
      />
      <DriverList drivers={driversData} isLoading={false} />
    </>
    </>
  );
}
export default React.memo(ManageDrivers);