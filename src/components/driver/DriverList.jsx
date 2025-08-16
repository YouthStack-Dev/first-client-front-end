import { Edit, Eye } from "lucide-react";

export const DriverList = ({ drivers, onEdit, onView, onStatusToggle }) => {
  const DriverTableHeaders = [
    { key: 's_no', label: 'S No.' },
    { key: 'name', label: 'Name' },
    { key: 'license_number', label: 'License No.' },
    { key: 'driver_code', label: 'Driver Code' }, // Changed from driver_id to driver_code
    { key: 'vendor.vendor_name', label: 'Vendor' },
    { key: 'mobile_number', label: 'Driver Phone' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const getDriverStatus = (driver) => (driver.is_active ? 'ACTIVE' : 'INACTIVE');
  
  const getValueByKeyPath = (obj, keyPath) =>
    keyPath.split('.').reduce((acc, key) => acc?.[key], obj) ?? '—';
  
  const visibleHeaders = DriverTableHeaders.filter(h => h.key !== 'documentsUploaded');

  return (
    <div className="rounded-lg overflow-hidden shadow-sm mt-2 bg-blue-50">
      <div className="overflow-auto h-[620px]">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 border-b sticky top-0">
            <tr className="text-left text-gray-600">
              {visibleHeaders.map(header => (
                <th key={header.key} className="px-4 py-3 whitespace-nowrap">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={visibleHeaders.length} className="p-4 text-center text-gray-500">
                  No drivers found
                </td>
              </tr>
            ) : (
              drivers.map((driver, index) => (
                <tr key={driver.driver_id} className="border-b hover:bg-gray-50 transition">
                  {visibleHeaders.map(header => (
                    <td key={header.key} className="px-4 py-3 text-sm">
                      {header.key === 's_no' ? (
                        index + 1
                      ) : header.key === 'status' ? (
                        <button
                          onClick={() => onStatusToggle(driver)}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            getDriverStatus(driver) === 'ACTIVE'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {getDriverStatus(driver)}
                        </button>
                      ) : header.key === 'actions' ? (
                        <div className="flex gap-2 items-center justify-center">
                          {/* View Button */}
                          <button
                            onClick={() => onView(driver)}
                            className="p-1 hover:bg-blue-100 rounded-full transition-colors group"
                            title="View Driver Details"
                          >
                            <Eye size={16} className="text-blue-600 group-hover:text-blue-800" />
                          </button>
                          
                          {/* Edit Button */}
                          <button
                            onClick={() => onEdit(driver)}
                            className="p-1 hover:bg-green-100 rounded-full transition-colors group"
                            title="Edit Driver"
                          >
                            <Edit size={16} className="text-green-600 group-hover:text-green-800" />
                          </button>
                        </div>
                      ) : (
                        getValueByKeyPath(driver, header.key)
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