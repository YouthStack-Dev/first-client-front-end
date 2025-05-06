import { API } from "../../Api/Endpoints";
import GlobalApi from "../../utils/GlobalApi";

const clientApi = GlobalApi({
  reducerPath: "clientApi",
  endpoints: (builder) => ({
    getClients: builder.query({
      query: () => ({
        url: API.CLIENT_API.GET_CLIENTS,
        method: "GET",
      }),
      transformResponse: (response) => response.clients, // 👈 just returns the array
    }),

    getVehicles:builder.query({
      query:()=>({
        url:API.GET_VEHICLES,
        method:"GET"
      })
    }),
    
    getBookings:builder.query({
      query:(date)=>({
      url:`api/get-bookings?date=${date}`,
      method:"GET"
      })
    }),

    searchClients: builder.query({
      query: (name) => ({
        url: `api/search?name=${encodeURIComponent(name)}`,
        method: "GET",
      }),
    }),
    
  }), 
  
 
});

export const { useGetClientsQuery ,useGetVehiclesQuery ,useGetBookingsQuery ,useSearchClientsQuery} = clientApi;
export default clientApi;
