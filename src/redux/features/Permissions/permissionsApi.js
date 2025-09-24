import { API_CLIENT } from '../../../Api/API_Client';

// Fetch all permissions
export const fetchPermissionsApi = async () => {
  const response = await API_CLIENT.get("/v1/iam/permissions/?skip=0&limit=100");
  return response.data;
};
