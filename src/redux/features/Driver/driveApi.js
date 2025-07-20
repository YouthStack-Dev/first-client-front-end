import { API_CLIENT } from '../../../Api/API_Client';

export const createDriver = (vendor_id, payload) =>
  API_CLIENT.post(`/drivers/vendor/${vendor_id}/drivers/`, payload);