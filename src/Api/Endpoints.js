const endpoint = {
  //  Auth endpoints

  login: "/auth/employee/login",
  superAdminLogin: "/auth/admin/login",
  vendorLogin: "/auth/vendor/login",

  //  Department and Employee endpoints
  getTenants: "/tenants",
  getDepartments: "/teams/",
  getEmployesByDepartment: "/employees/",
  createEmployee: "/employees/",
  createTeam: "/teams/",
  updateEmployee: "/employees/",
  deleteEmployee: "/employees/",
  getWeekOff: "/weekoff-configs/",
  updateWeekOff: "/weekoff-configs/",
  toggleEmployeStatus: "/employees/",
  toggleTeamStatus: "/teams/",
  VendorUser: "/vendor-users/",
  Vendor: "/vendors/",

  //  Boookings
  booking: "/bookings/",
  updateBookingShift: "/bookings/",

  routesuggestion: "/grouping/bookings/routesuggestion",
  savedRoutes: "/routes/",

  //  Nodal Points
  nodalPoints: "/nodal-points/",
  nodalPointById: (id) => `/nodal-points/${id}`,
  nodalPointNearest: "/nodal-points/nearest",
  nodalPointEmployeeAssign: (employeeId) =>
    `/nodal-points/employees/${employeeId}/assign`,
  nodalPointEmployeeAssignment: (employeeId) =>
    `/nodal-points/employees/${employeeId}`,
  nodalPointBulkAssignNearest: "/nodal-points/employees/bulk-assign-nearest",
};
export default endpoint;
