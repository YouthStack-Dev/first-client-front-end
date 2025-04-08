import Map from '../components/Map';
import { useState } from 'react';
import RouteGroups from '../components/RouteGroups';

const FIXED_POINT = { lat: 51.505, lng: -0.09 };

const vendors = [
  {
    id: 'v1',
    name: 'Speed Taxi',
    drivers: [
      { id: 'd1', name: 'John Doe' },
      { id: 'd2', name: 'Jane Smith' },
    ],
  },
  {
    id: 'v2',
    name: 'City Cabs',
    drivers: [
      { id: 'd3', name: 'Mike Johnson' },
      { id: 'd4', name: 'Sarah Wilson' },
    ],
  },
];

const Routing= () => {


  const handleBookingSelect = (id) => {
    setBookings(bookings.map(booking =>
      booking.id === id
        ? { ...booking, selected: !booking.selected }
        : booking
    ));
  };

  const handleMergeSelected = () => {
    const selectedBookings = bookings.filter(b => b.selected);
    if (selectedBookings.length < 2) return;

    const newGroupId = `group-${routeGroups.length + 1}`;
    const newGroup = {
      id: newGroupId,
      bookingIds: selectedBookings.map(b => b.id),
    };

    setBookings(bookings.map(booking =>
      booking.selected
        ? { ...booking, selected: false, routeGroupId: newGroupId }
        : booking
    ));

    setRouteGroups([...routeGroups, newGroup]);
  };

  const handleUnmergeRoute = (groupId) => {
    setRouteGroups(routeGroups.filter(group => group.id !== groupId));
    setBookings(bookings.map(booking =>
      booking.routeGroupId === groupId
        ? { ...booking, routeGroupId: undefined }
        : booking
    ));
  };

  const handleAssignVendor = (groupId, vendorId) => {
    setRouteGroups(routeGroups.map(group =>
      group.id === groupId
        ? { ...group, assignedVendor: vendorId, assignedDriver: undefined }
        : group
    ));
  };

  const handleAssignDriver = (groupId, driverId) => {
    setRouteGroups(routeGroups.map(group =>
      group.id === groupId
        ? { ...group, assignedDriver: driverId }
        : group
    ));
  };

   // Sample Data (Replace with actual state management/store)
   const [routeGroups, setRouteGroups] = useState([
    { id: "1", bookingIds: ["101", "102"], assignedVendor: "", assignedDriver: "" },
  ]);

  const [bookings, setBookings] = useState([
    { id: "101", customerName: "John Doe", location: { lat: 40.7128, lng: -74.0060 }, companyId: "C1" },
    { id: "102", customerName: "Jane Smith", location: { lat: 34.0522, lng: -118.2437 }, companyId: "C2" },
  ]);

  const [vendors, setVendors] = useState([
    { id: "V1", name: "Vendor A", drivers: [{ id: "D1", name: "Driver X" }, { id: "D2", name: "Driver Y" }] },
    { id: "V2", name: "Vendor B", drivers: [{ id: "D3", name: "Driver Z" }] },
  ]);

  // Function to assign a vendor to a route group
  const onAssignVendor = (groupId, vendorId) => {
    setRouteGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, assignedVendor: vendorId } : group
      )
    );
  };

  // Function to assign a driver to a route group
  const onAssignDriver = (groupId, driverId) => {
    setRouteGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, assignedDriver: driverId } : group
      )
    );
  };

  // Function to unmerge (remove) a route group
  const onUnmergeRoute = (groupId) => {
    setRouteGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId));
  };
  return (
    <div className="h-[calc(100vh-2rem)] flex">
      <div className="w-1/2 h-full rounded-lg overflow-hidden shadow-lg">
        <Map 
          bookings={bookings} 
          routeGroups={routeGroups}
          fixedPoint={FIXED_POINT} 
        />
      </div>
      <div className="w-1/2 pl-6 h-full overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Route Management</h1>
     
        <RouteGroups
          routeGroups={routeGroups}
          bookings={bookings}
          vendors={vendors}
          onAssignVendor={handleAssignVendor}
          onAssignDriver={handleAssignDriver}
          onUnmergeRoute={handleUnmergeRoute}
        />
      </div>
    </div>
  );
};

export default Routing;
