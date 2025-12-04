import { Calendar, MapPin, TrendingUp, Users } from "lucide-react";

export const reportModules = [
  {
    id: "bookings",
    title: "Booking Reports",
    description: "Track and analyze booking data",
    icon: Calendar,
    color: "blue",
  },
];

export const REPORT_TYPES = {
  BOOKING: "bookings",
  ROUTE: "route",
  VENDOR: "vendor",
  DRIVER: "driver",
};

export const BOOKING_STATUS_OPTIONS = [
  "Request",
  "Scheduled",
  "Confirmed",
  "Completed",
  "Cancelled",
];
export const ROUTE_STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
];

export const DummyauditLogs = [
  {
    audit_id: 23,
    tenant_id: "SAM001",
    module: "employee",
    created_at: "2025-11-26T06:41:47.222834",
    audit_data: {
      action: "CREATE",
      user: {
        type: "employee",
        id: "2",
        name: "Sample Tenant Employee Two",
        email: "emp2@emp.com",
      },
      description: "Created employee 'Chethan R' (Chethan962089@gmail.com)",
      new_values: {
        employee_id: 8,
        name: "Chethan R",
        email: "Chethan962089@gmail.com",
        phone: "9632728795",
        employee_code: "EMP2527",
        team_id: 1,
        is_active: true,
      },
      timestamp: "2025-11-26T06:41:47.224910",
      ip_address: "172.18.0.1",
      user_agent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    },
  },
  {
    audit_id: 21,
    tenant_id: "SAM001",
    module: "employee",
    created_at: "2025-11-26T06:36:37.368789",
    audit_data: {
      action: "UPDATE",
      user: {
        type: "employee",
        id: "2",
        name: "Sample Tenant Employee Two",
        email: "emp2@emp.com",
      },
      description:
        "Updated employee 'Sample Tenant Employee One' - changed fields: name, email, phone, employee_code, team_id, special_needs, special_needs_start_date, special_needs_end_date, address, latitude, longitude, gender",
      new_values: {
        old: {
          name: "Sample Tenant Employee One",
          email: "emp1@emp.com",
          phone: "9000515807",
          employee_code: "SAM001-EMP1",
          team_id: 1,
          address: "123 Main Street, Bangalore",
          latitude: "12.933462",
          longitude: "77.540188",
          gender: "Male",
        },
        new: {
          name: "Sample Tenant Employee One",
          email: "emp1@emp.com",
          phone: "9000515807",
          employee_code: "SAM001EMP1",
          team_id: 1,
          address: "123 Main Street, Bangalore",
          latitude: "12.980972",
          longitude: "77.632542",
          gender: "Male",
        },
      },
      timestamp: "2025-11-26T06:36:37.373942",
      ip_address: "172.18.0.1",
      user_agent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    },
  },
  {
    audit_id: 20,
    tenant_id: "SAM001",
    module: "employee",
    created_at: "2025-11-25T14:22:15.368789",
    audit_data: {
      action: "DELETE",
      user: {
        type: "employee",
        id: "1",
        name: "Admin User",
        email: "admin@emp.com",
      },
      description: "Deleted employee 'John Doe' (john.doe@email.com)",
      new_values: {
        employee_id: 5,
        name: "John Doe",
        email: "john.doe@email.com",
      },
      timestamp: "2025-11-25T14:22:15.370000",
      ip_address: "172.18.0.5",
      user_agent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  },
  {
    audit_id: 19,
    tenant_id: "SAM001",
    module: "employee",
    created_at: "2025-11-25T10:15:30.368789",
    audit_data: {
      action: "UPDATE",
      user: {
        type: "employee",
        id: "3",
        name: "HR Manager",
        email: "hr@emp.com",
      },
      description:
        "Updated employee 'Jane Smith' - changed fields: phone, address",
      new_values: {
        old: {
          phone: "9876543210",
          address: "Old Address, City",
        },
        new: {
          phone: "9876543211",
          address: "New Address, City",
        },
      },
      timestamp: "2025-11-25T10:15:30.370000",
      ip_address: "172.18.0.3",
      user_agent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  },
  {
    audit_id: 18,
    tenant_id: "SAM001",
    module: "employee",
    created_at: "2025-11-24T16:45:22.368789",
    audit_data: {
      action: "CREATE",
      user: {
        type: "employee",
        id: "2",
        name: "Sample Tenant Employee Two",
        email: "emp2@emp.com",
      },
      description: "Created employee 'Mike Johnson' (mike.j@email.com)",
      new_values: {
        employee_id: 7,
        name: "Mike Johnson",
        email: "mike.j@email.com",
        phone: "9988776655",
        employee_code: "EMP2526",
        team_id: 2,
        is_active: true,
      },
      timestamp: "2025-11-24T16:45:22.370000",
      ip_address: "172.18.0.2",
      user_agent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  },
  {
    audit_id: 17,
    tenant_id: "SAM001",
    module: "employee",
    created_at: "2025-11-24T09:30:10.368789",
    audit_data: {
      action: "UPDATE",
      user: {
        type: "employee",
        id: "1",
        name: "Admin User",
        email: "admin@emp.com",
      },
      description:
        "Updated employee 'Sarah Williams' - changed fields: team_id, is_active",
      new_values: {
        old: {
          team_id: 1,
          is_active: true,
        },
        new: {
          team_id: 3,
          is_active: false,
        },
      },
      timestamp: "2025-11-24T09:30:10.370000",
      ip_address: "172.18.0.1",
      user_agent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  },
  {
    audit_id: 16,
    tenant_id: "SAM001",
    module: "employee",
    created_at: "2025-11-23T14:20:15.368789",
    audit_data: {
      action: "CREATE",
      user: {
        type: "employee",
        id: "1",
        name: "Admin User",
        email: "admin@emp.com",
      },
      description: "Created employee 'David Brown' (david.b@email.com)",
      new_values: {
        employee_id: 6,
        name: "David Brown",
        email: "david.b@email.com",
        phone: "9123456780",
        employee_code: "EMP2525",
        team_id: 1,
        is_active: true,
      },
      timestamp: "2025-11-23T14:20:15.370000",
      ip_address: "172.18.0.1",
      user_agent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  },
];
