import { API_CLIENT } from '../../../Api/API_Client';

// 🔽 Get all shifts with pagination
// export const getAllShifts = (skip = 0, limit = 20) =>
//   API_CLIENT.get(`/shifts/?skip=${skip}&limit=${limit}`);

// 🔽 Get shifts filtered by log_type (e.g., "in", "out")
// export const getShiftsByLogType = (logType, skip = 0, limit = 10) =>
//   API_CLIENT.get(`/shifts/log-type?log_type=${logType}&skip=${skip}&limit=${limit}`);

// ✅ Create a new shift
export const postShift = (payload) =>
  API_CLIENT.post(`/shifts/`, payload);

// 🔁 Update an existing shift by ID
export const putShift = (id, payload) =>
  API_CLIENT.put(`/shifts/${id}`, payload);

// ❌ Delete a shift by ID
export const deleteShift = (id) =>
  API_CLIENT.delete(`/shifts/${id}`);
