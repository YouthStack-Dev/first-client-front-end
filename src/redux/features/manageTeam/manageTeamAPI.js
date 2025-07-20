

import { API_CLIENT } from '../../../Api/API_Client';

export const getTeams = ({ skip = 0, limit = 10 }) =>
  API_CLIENT.get(`/departments/?skip=${skip}&limit=${10}`);

export const getEmployeesByDepartment = (departmentId) =>
  API_CLIENT.get(`/employees/department/${departmentId}`);

export const createDepartmentAPI = (payload) =>
  API_CLIENT.post(`/departments/`, payload);

export const updateDepartmentAPI = (id, payload) =>
  API_CLIENT.put(`/departments/${id}`, payload);

export const deleteTeamsAPI = (id) =>
  API_CLIENT.delete(`/departments/${id}`);
