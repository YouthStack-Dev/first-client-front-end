import apiClient from '../../Api/API_Client';

const authApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login_user', // ✅ Correct path for FastAPI
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;
export default authApi; // ✅ REQUIRED for store.js to import properly
