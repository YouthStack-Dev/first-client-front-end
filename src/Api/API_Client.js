// src/api/api_client.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const apiClient = createApi({
  reducerPath: 'apiClient',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.gocab.tech', // Hosted FastAPI base URL
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token || localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: () => ({}),
});

export default apiClient;
