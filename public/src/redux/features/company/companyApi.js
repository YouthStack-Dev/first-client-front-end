import { API_CLIENT } from '../../../Api/API_Client';

// Fetch all companies
export const fetchCompaniesApi = async () => {
  const response = await API_CLIENT.get('/api/companies');
  return response.data; 
};

// Create a new company
export const createCompanyApi = (formData) => API_CLIENT.post('/api/companies', formData);


// Update a company by ID
export const updateCompanyApi = (companyId, formData) => {
  return API_CLIENT.put(`/api/companies/${companyId}`, formData);
};