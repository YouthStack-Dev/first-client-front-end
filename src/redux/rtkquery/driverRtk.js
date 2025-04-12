import GlobalApi from "../../utils/GlobalApi";

const driverApi = GlobalApi({
  reducerPath: "driverApi",
  endpoints: (builder) => ({
    getDrivers: builder.query({
      query: () => ({
        url: "get-drivers",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetDriversQuery } = driverApi;
export default driverApi;
