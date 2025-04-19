import { API } from "../../Api/Endpoints";
import GlobalApi from "../../utils/GlobalApi";

const driverApi = GlobalApi({
  reducerPath: "driverApi",
  endpoints: (builder) => ({
    getDrivers: builder.query({
      query: () => ({
        url: API.GET_DRIVERS,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetDriversQuery } = driverApi;
export default driverApi;
