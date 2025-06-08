// import { Team, Employee, Booking } from '../types/Team';

export const mockTeams= [
  {
    id: 1,
    name: 'Team Alpha',
    manager: 'Alice Johnson',
    active: 4,
    inactive: 1,
  },
  {
    id: 2,
    name: 'Team Beta',
    manager: 'Bob Smith',
    active: 3,
    inactive: 2,
  },
  {
    id: 3,
    name: 'Team Gamma',
    manager: 'Carol Davis',
    active: 6,
    inactive: 0,
  },
];

export const mockEmployees= [
  // Team Alpha employees
  { id: 1, name: 'John Doe', teamId: 1, status: 'active', email: 'john@company.com', phone: '+1234567890', position: 'Developer' },
  { id: 2, name: 'Jane Smith', teamId: 1, status: 'active', email: 'jane@company.com', phone: '+1234567891', position: 'Designer' },
  { id: 3, name: 'Mike Wilson', teamId: 1, status: 'active', email: 'mike@company.com', phone: '+1234567892', position: 'Analyst' },
  { id: 4, name: 'Sarah Brown', teamId: 1, status: 'active', email: 'sarah@company.com', phone: '+1234567893', position: 'Manager' },
  { id: 5, name: 'Tom Davis', teamId: 1, status: 'inactive', email: 'tom@company.com', phone: '+1234567894', position: 'Developer' },
  
  // Team Beta employees
  { id: 6, name: 'Lisa Garcia', teamId: 2, status: 'active', email: 'lisa@company.com', phone: '+1234567895', position: 'Developer' },
  { id: 7, name: 'David Miller', teamId: 2, status: 'active', email: 'david@company.com', phone: '+1234567896', position: 'Tester' },
  { id: 8, name: 'Emma Taylor', teamId: 2, status: 'active', email: 'emma@company.com', phone: '+1234567897', position: 'Designer' },
  { id: 9, name: 'Chris Anderson', teamId: 2, status: 'inactive', email: 'chris@company.com', phone: '+1234567898', position: 'Developer' },
  { id: 10, name: 'Amy White', teamId: 2, status: 'inactive', email: 'amy@company.com', phone: '+1234567899', position: 'Analyst' },
  
  // Team Gamma employees
  { id: 11, name: 'Robert Johnson', teamId: 3, status: 'active', email: 'robert@company.com', phone: '+1234567800', position: 'Lead Developer' },
  { id: 12, name: 'Jennifer Lee', teamId: 3, status: 'active', email: 'jennifer@company.com', phone: '+1234567801', position: 'UI Designer' },
  { id: 13, name: 'Kevin Brown', teamId: 3, status: 'active', email: 'kevin@company.com', phone: '+1234567802', position: 'DevOps' },
  { id: 14, name: 'Michelle Davis', teamId: 3, status: 'active', email: 'michelle@company.com', phone: '+1234567803', position: 'Product Manager' },
  { id: 15, name: 'Steven Wilson', teamId: 3, status: 'active', email: 'steven@company.com', phone: '+1234567804', position: 'QA Engineer' },
  { id: 16, name: 'Rachel Martinez', teamId: 3, status: 'active', email: 'rachel@company.com', phone: '+1234567805', position: 'Business Analyst' },
];

export const mockBookings= [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'John Doe',
    date: '2024-01-15',
    time: '09:00',
    pickup: 'Home',
    destination: 'Office',
    status: 'completed',
    createdAt: '2024-01-14T10:00:00Z'
  },
  {
    id: 2,
    employeeId: 1,
    employeeName: 'John Doe',
    date: '2024-01-16',
    time: '18:00',
    pickup: 'Office',
    destination: 'Airport',
    status: 'confirmed',
    createdAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 3,
    employeeId: 2,
    employeeName: 'Jane Smith',
    date: '2024-01-15',
    time: '08:30',
    pickup: 'Hotel',
    destination: 'Client Office',
    status: 'completed',
    createdAt: '2024-01-14T16:00:00Z'
  }
];