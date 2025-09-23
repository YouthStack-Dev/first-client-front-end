
export const mockDrivers  = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+1-555-0123',
    email: 'john.smith@email.com',
    licenseNumber: 'DL123456789',
    experience: 8
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '+1-555-0456',
    email: 'sarah.johnson@email.com',
    licenseNumber: 'DL987654321',
    experience: 12
  },
  {
    id: '3',
    name: 'Mike Davis',
    phone: '+1-555-0789',
    email: 'mike.davis@email.com',
    licenseNumber: 'DL456789123',
    experience: 5
  },
  {
    id: '4',
    name: 'Emma Wilson',
    phone: '+1-555-0321',
    email: 'emma.wilson@email.com',
    licenseNumber: 'DL789123456',
    experience: 15
  }
];

export const mockVehicles= [
  {
    id: '1',
    vehicleNumber: 'ABC-1234',
    driver: mockDrivers[0],
    type: 'Truck',
    model: 'Ford F-150',
    year: 2022,
    status: 'active',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main St, New York, NY 10001',
      lastUpdated: new Date().toISOString()
    },
    fuel: 75,
    speed: 45,
    mileage: 25400
  },
  {
    id: '2',
    vehicleNumber: 'XYZ-5678',
    driver: mockDrivers[1],
    type: 'Van',
    model: 'Mercedes Sprinter',
    year: 2023,
    status: 'active',
    location: {
      lat: 34.0522,
      lng: -118.2437,
      address: '456 Oak Ave, Los Angeles, CA 90210',
      lastUpdated: new Date(Date.now() - 300000).toISOString()
    },
    fuel: 60,
    speed: 35,
    mileage: 18200
  },
  {
    id: '3',
    vehicleNumber: 'DEF-9012',
    driver: mockDrivers[2],
    type: 'Sedan',
    model: 'Toyota Camry',
    year: 2021,
    status: 'inactive',
    location: {
      lat: 41.8781,
      lng: -87.6298,
      address: '789 Pine St, Chicago, IL 60601',
      lastUpdated: new Date(Date.now() - 1800000).toISOString()
    },
    fuel: 90,
    speed: 0,
    mileage: 32100
  },
  {
    id: '4',
    vehicleNumber: 'GHI-3456',
    driver: mockDrivers[3],
    type: 'SUV',
    model: 'BMW X5',
    year: 2023,
    status: 'maintenance',
    location: {
      lat: 29.7604,
      lng: -95.3698,
      address: '321 Elm St, Houston, TX 77001',
      lastUpdated: new Date(Date.now() - 7200000).toISOString()
    },
    fuel: 25,
    speed: 0,
    mileage: 15800
  }
];