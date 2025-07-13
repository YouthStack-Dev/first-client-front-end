// src/redux/features/shiftCategory/shiftCategoryAPI.js

import { API_CLIENT } from '../../../Api/API_Client';

// GET /cutoff/
export const getCutoff = () => API_CLIENT.get('/cutoff/');

// POST /cutoff/
export const postCutoff = (payload) => API_CLIENT.post('/cutoff/', payload);

// PUT /cutoff/{id}/
export const putCutoff = (payload) => API_CLIENT.put(`/cutoff/`, payload); // 🔥 Correct endpoint

