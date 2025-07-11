import { API_CLIENT } from '../../../Api/API_Client';

export const getTeams = ({ skip = 0, limit = 10 }) =>
  API_CLIENT.get(`/departments/?skip=${skip}&limit=${limit}`);

export const getEmployeesByDepartment = (departmentId) =>
  API_CLIENT.get(`/employees/${departmentId}`);
