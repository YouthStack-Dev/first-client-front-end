import GlobalApi  from "../../utils/GlobalApi";

const authApi = GlobalApi({
  reducerPath: "authApi",
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        data: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
export default authApi;
