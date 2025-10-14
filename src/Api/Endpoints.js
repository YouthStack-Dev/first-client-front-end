const endpoint = {
  //  Auth endpoints

  login: "/v1/auth/employee/login",
  superAdminLogin: "/v1/auth/admin/login",
  vendorLogin: "/v1/auth/vendor/login",

  //  Department and Employee endpoints
  getTenants: "/v1/tenants",
  getDepartments: "/v1/teams/",
  getEmployesByDepartment: "/v1/employees/",
  createEmployee: "/v1/employees/",
  createTeam: "/v1/teams/",
  updateEmployee: "/v1/employees/",
  getWeekOff: "/v1/weekoff-configs/",
  updateWeekOff: "/v1/weekoff-configs/",
  toggleEmployeStatus: "/v1/employees/",
  toggleTeamStatus: "/v1/teams/",

  //  Boookings
  booking: "/v1/bookings/",
};
export default endpoint;
