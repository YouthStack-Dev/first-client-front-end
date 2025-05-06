import { useEffect, useState } from 'react';
import { X, Users, Route, AlertCircle, AlertTriangle, ArrowLeftRight, Heart } from 'lucide-react';
import Map from '../components/Map';
import RouteModal from '../components/modals/ModalProviders';

const FIXED_POINT = { lat: 51.505, lng: -0.09 };

const Routing = ({ toogleRouting ,routingData}) => {

  useEffect(() => {
    if (routingData?.length) {
      setRoutes(routingData);
    }
  }, [routingData]);
  
  const [routes, setRoutes] = useState([]);


  const [selectedRoutes, setSelectedRoutes] = useState([]);

  const allRouteIds = routes.map(route => route.routeId);
  const allSelected = selectedRoutes.length === allRouteIds.length && allRouteIds.length > 0;

  const handleCheckboxChange = (routeId) => {
    setSelectedRoutes((prevSelected) =>
      prevSelected.includes(routeId)
        ? prevSelected.filter((id) => id !== routeId)
        : [...prevSelected, routeId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRoutes(allSelected ? [] : allRouteIds);
  };

  const [routeGroups] = useState([
    { id: "1", bookingIds: ["101", "102"], assignedVendor: "", assignedDriver: "" },
  ]);

  const [bookings] = useState([
    { id: "101", customerName: "John Doe", location: { lat: 40.7128, lng: -74.0060 }, companyId: "C1" },
    { id: "102", customerName: "Jane Smith", location: { lat: 34.0522, lng: -118.2437 }, companyId: "C2" },
  ]);
  const actions = [
    { value: "", label: "Select Action" },
    { value: "optimize", label: "Optimize Routes" },
    { value: "reset", label: "Reset Routes" },
    { value: "save", label: "Save Configuration" },
  ];
  const actions2 = [
    { value: "", label: "Select Action" },
    { value: "optimize", label: "Optimize Routes" },
    { value: "reset", label: "Reset Routes" },
    { value: "save", label: "Save Configuration" },
  ];

  const indicators = [
    {
      icon: <Users size={12} className=" text-pink-500 " />,
      label: 'Women in route',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700'
    },
    {
      icon: <AlertTriangle size={12}  className=" text-yellow-500" />,
      label: 'Over Capacity',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      icon: <AlertCircle size={12} className=" text-blue-500" />,
      label: 'Marshal Required',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      icon: <ArrowLeftRight size={12} className=" text-green-500" />,
      label: 'Back to Back trips',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      icon: <Heart size={12}  className=" text-red-500" />,
      label: 'Trip with special need employees',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ];

  const [routeModal,setRouteModal]=useState(false)
  const [selectedRoute,setSelectedRoute]=useState([])

  const handleEmployeShow=(route)=>{
    console.log(" this is the  route modal data " ,route);
    
    setRouteModal((priv)=>!priv)
    setSelectedRoute(route)
    console.log(" this  is the selected rouet emplyes data ",selectedRoute);
    
  }
  return (
    <div className=" bg-gray-100 p-6">
      <div className="max-w-[1800px] mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Route className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Route Planning Dashboard</h1>
            </div>
            <button
              onClick={() => toogleRouting(false)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Map Section */}
            <div className="w-1/2 p-4 bg-gray-50">
              <div className="h-full rounded-lg overflow-hidden shadow-inner">
              <Map
                  bookings={bookings}
                  routeGroups={routeGroups}
                  fixedPoint={FIXED_POINT}
                  className="z-10" // Add this class to set the map behind the modal
                />

              </div>
            </div>

            {/* Routes Section */}
            <div className="w-1/2 p-4 flex flex-col">
              {/* Controls */}
              <div className="flex justify-between items-center mb-4 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <select className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  {actions.map((action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
                <select className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  {actions.map((action) => (
                    <option key={action.value} value={action.value}>
                      {action.label}
                    </option>
                  ))}
                </select>
               
              </div>
              25 Apr 20:30 (Logout)
            </div>

              {/* Table */}
              <div className="flex rounded-lg shadow overflow-hidden  ">
                <div className="  h-[350px] overflow-x-auto ">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </th>
                      
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Distance (Km)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Landmark
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nodal Point
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendor/Vehicle
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {routes.map((route, index) => (
                        <tr
                          key={index}
                          className={`${
                            selectedRoutes.includes(route.id)
                              ? 'bg-blue-50'
                              : 'hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedRoutes.includes(route.id)}
                              onChange={() => handleCheckboxChange(route.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span>
                              <button  onClick={()=>handleEmployeShow(route)}   className=' text-blue-600'>
                              (  {route.routeBookings.length} ) 
                              </button>
                            
                            </span>
                       {route?.distance} km
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {'LandMark'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {'Nodals'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {'MLT/KAOQOSJANJBJ'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
               

              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 border-l border-red-900 mt-3">

              <h3 className="text-sm font-semibold text-gray-800 mb-4">Route Indicators</h3>
              <div className="space-y-2 text-[11px]">
                {indicators.map((indicator, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span>{indicator.icon}</span>
                    <span className="font-medium text-gray-700">{indicator.label}</span>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
              <RouteModal
          showModal={routeModal}
          setShowModal={setRouteModal}
          route={selectedRoute}
          className="fixed inset-0 z-50 bg-opacity-50 bg-black" // Ensuring it's on top
        />

    </div>
  );
};

export default Routing;


