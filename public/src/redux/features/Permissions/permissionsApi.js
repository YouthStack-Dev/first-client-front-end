import { API_CLIENT } from '../../../Api/API_Client';

// Fetch all modules
export const fetchModulesApi = async () => {
  const response = await API_CLIENT.get("/api/modules");
  return response.data;
};