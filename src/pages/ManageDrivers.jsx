import React, { useEffect } from 'react';
import { Edit, MoreVertical, Plus, Search, Trash2, Truck, X } from 'lucide-react';
import { InputField, Modal } from '../components/SmallComponents';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDrivers } from '../redux/slices/driverSlice';


// Memoized Driver List Component
const DriverList = React.memo(({ drivers, menuOpen }) => (
  <div className="rounded-lg overflow-hidden shadow-sm mt-2">
  {/* Table Container with Scroll */}
  <div className="overflow-auto h-[400px]">
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
        {drivers.length === 0 ? (
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
              <td className="px-4 py-3">{driver.vehicle.vehicleNo}</td>
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
</div>

));

function ManageDrivers() {

  const dispatch = useDispatch();

 // Accessing Redux state
 const { list: drivers, loading, error } = useSelector((state) => state.driver);
 useEffect(() => {
  dispatch(fetchDrivers()); // Fetch drivers when the component mounts
}, [dispatch]);


  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Manage Drivers</h1>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Add driver"
          >
            <Plus size={20} />
            Add Driver
          </button>
        </div>

        <Modal isOpen={false} onClose={() => {}} title="Add New Driver">
          <form>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Driver Name"
                name="driverName"
                placeholder="Enter driver name"
                required
              />
              <InputField
                label="Phone Number"
                name="phoneNo"
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="relative mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Number
              </label>
              <div className="relative flex items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search vehicle number..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
                <button
                  type="button"
                  className="ml-2 p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                  aria-label="Add vehicle"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <InputField
              label="Vehicle Type"
              name="vehicleType"
              placeholder="Enter vehicle type"
              required
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Driver
              </button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={false} onClose={() => {}} title="Add Vehicle">
          <form>
            <InputField
              label="Vehicle Number"
              name="vehicleNo"
              placeholder="Enter vehicle number"
              required
            />
            <InputField
              label="Vehicle Type"
              name="vehicleType"
              placeholder="Enter vehicle type"
              required
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Vendor
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Vendor..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Vehicle
              </button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={false} onClose={() => {}} title="Edit driver">
          <form>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Driver Name"
                name="driverName"
                placeholder="Enter driver name"
                required
              />
              <InputField
                label="Phone Number"
                name="phoneNo"
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="relative mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Number
              </label>
              <div className="relative flex items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search vehicle number..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
                <button
                  type="button"
                  className="ml-2 p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                  aria-label="Add vehicle"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Driver
              </button>
            </div>
          </form>
        </Modal>
      </div>

      <DriverList drivers={drivers} menuOpen={null} />


    </>
  );
}

export default React.memo(ManageDrivers);