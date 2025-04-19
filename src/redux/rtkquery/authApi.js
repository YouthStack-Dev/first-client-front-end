import { API } from "../../Api/Endpoints";
import GlobalApi  from "../../utils/GlobalApi";

const authApi = GlobalApi({
  reducerPath: "authApi",
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials={ username: "superadmin1", password: "admin@123" }) => ({
        url: API.LOGIN,
        method: "POST",
        data: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
export default authApi;
