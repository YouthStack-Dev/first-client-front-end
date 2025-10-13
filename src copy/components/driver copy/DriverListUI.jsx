 
import { Edit, Trash2 } from 'lucide-react';
 
 export const DriverListUI = ({ 
    drivers = [],
    headers = [],
    onEdit = () => {},
    onDelete = () => {},
    onStatusToggle = () => {},
    loading = false,
    emptyMessage = 'No drivers found',
    statusConfig = {
      active: { class: 'bg-green-100 text-green-800', label: 'ACTIVE' },
      inactive: { class: 'bg-red-100 text-red-800', label: 'INACTIVE' }
    }
  }) => {
    const visibleHeaders = headers.filter(h => h.key !== 'documentsUploaded');
  
    if (loading) {
      return <p className="p-4 text-gray-500">Loading drivers...</p>;
    }
  
    return (
      <div className="rounded-lg overflow-hidden shadow-sm mt-2">
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
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                drivers.map((driver, index) => (
                  <tr key={driver.driver_id} className="border-b hover:bg-gray-50 transition">
                    {visibleHeaders.map(header => (
                      <td key={header.key} className="px-4 py-3 text-sm">
                        {header.key === 's_no' ? (
                          index + 1
                        ) : header.key === 'actions' ? (
                          <div className="flex gap-2 items-center justify-center">
                            <button
                              onClick={() => onStatusToggle(driver)}
                              title="Click to toggle status"
                              className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                                driver.is_active ? statusConfig.active.class : statusConfig.inactive.class
                              }`}
                            >
                              {driver.is_active ? statusConfig.active.label : statusConfig.inactive.label}
                            </button>
                            <button 
                              onClick={() => onEdit(driver)} 
                              className="p-1 hover:bg-gray-100 rounded-full"
                              aria-label={`Edit driver ${driver.driver_id}`}
                            >
                              <Edit size={16} color="blue" />
                            </button>
                            <button 
                              onClick={() => onDelete(driver.driver_id)} 
                              className="p-1 hover:bg-gray-100 rounded-full"
                              aria-label={`Delete driver ${driver.driver_id}`}
                            >
                              <Trash2 size={16} color="red" />
                            </button>
                          </div>
                        ) : (
                          header.render 
                            ? header.render(driver) 
                            : driver[header.key] || '—'
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
  