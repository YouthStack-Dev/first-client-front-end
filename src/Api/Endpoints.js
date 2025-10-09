 const endpoint ={
    login:"/v1/auth/employee/login",
    superAdminLogin:"/v1/auth/admin/login",
    vendorLogin:"/v1/auth/vendor/login",
    getDepartments:"/v1/teams/",
    getEmployesByDepartment:"/v1/employees/",
    getTenants:"/v1/tenants",
    createEmployee:'/v1/employees/',
    createTeam:'/v1/teams/',
    updateEmployee:'/v1/employees/',
    getWeekOff:'/v1/weekoff-configs/',
    updateWeekOff:'/v1/weekoff-configs/',
}
export default endpoint