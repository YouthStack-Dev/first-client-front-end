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

  //  Boookings
  booking: "/bookings/",
  updateBookingShift: "/bookings/",

  routesuggestion: "/grouping/bookings/routesuggestion",
  savedRoutes: "/routes/",
};
export default endpoint;
