const RouteGroups = ({
    routeGroups,
    bookings,
    vendors,
    onAssignVendor,
    onAssignDriver,
    onUnmergeRoute,
  }) => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Merged Routes</h2>
        <div className="space-y-4">
          {routeGroups.map((group) => (
            <div key={group.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">Route Group {group.id}</h3>
                <button
                  onClick={() => onUnmergeRoute(group.id)}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Unmerge
                </button>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                Bookings: {group.bookingIds.map(id => 
                  bookings.find(b => b.id === id)?.customerName
                ).join(', ')}
              </div>
  
              <div className="space-y-2">
                <select
                  value={group.assignedVendor || ''}
                  onChange={(e) => onAssignVendor(group.id, e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
  
                {group.assignedVendor && (
                  <select
                    value={group.assignedDriver || ''}
                    onChange={(e) => onAssignDriver(group.id, e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                  >
                    <option value="">Select Driver</option>
                    {vendors
                      .find((v) => v.id === group.assignedVendor)
                      ?.drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default RouteGroups;
  