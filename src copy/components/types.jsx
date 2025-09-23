const Booking = {
    id: '',
    customerName: '',
    location: {
      lat: 0,
      lng: 0,
    },
    isFemale: false,
    needsMarshal: false,
    selected: false,
    routeGroupId: '',
    shiftTime: '',
    bookingType: 'login', // or 'logout'
    companyId: '',
  };
  
  const RouteGroup = {
    id: '',
    bookingIds: [],
    assignedVendor: '',
    assignedDriver: '',
  };
  
  const Vendor = {
    id: '',
    name: '',
    drivers: [],
  };
  
  const Driver = {
    id: '',
    name: '',
  };
  
  const Company = {
    id: '',
    name: '',
    employees: [],
    location: {
      lat: 0,
      lng: 0,
    },
  };
  
  const Employee = {
    id: '',
    name: '',
    isFemale: false,
    needsMarshal: false,
  };
  
  export { Booking, RouteGroup, Vendor, Driver, Company, Employee };