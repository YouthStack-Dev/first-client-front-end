// import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
// import { NewfetchDriversThunk } from "./driverThunks";
// import { logDebug } from "../../../utils/logger";

// // ------------------------------------------------------
// // ENTITY ADAPTER (NORMALIZES DATA)
// // ------------------------------------------------------
// const driversAdapter = createEntityAdapter({
//   selectId: (driver) => driver.driver_id, // unique primary key
// });

// // ------------------------------------------------------
// // INITIAL STATE
// // ------------------------------------------------------
// const initialState = driversAdapter.getInitialState({
//   loading: false,
//   loaded: false,
//   error: null,
//   total: 0,
//   lastFetchParams: null, // Track last fetch parameters
// });

// // ------------------------------------------------------
// // SLICE
// // ------------------------------------------------------
// const newDriverSlice = createSlice({
//   name: "newDriver", // Updated name to match store key
//   initialState,
//   reducers: {
//     // You can add any additional reducers here if needed
//     clearDrivers: (state) => {
//       driversAdapter.removeAll(state);
//       state.total = 0;
//       state.loaded = false;
//       state.lastFetchParams = null;
//     },

//     // Example: Remove a single driver
//     removeDriver: (state, action) => {
//       driversAdapter.removeOne(state, action.payload);
//       state.total = Math.max(0, state.total - 1);
//     },

//     // Reset loading state manually if needed
//     resetLoading: (state) => {
//       state.loading = false;
//     },
//   },

//   extraReducers: (builder) => {
//     builder
//       .addCase(NewfetchDriversThunk.pending, (state, action) => {
//         state.loading = true;
//         state.error = null;
//         // Store the parameters we're trying to fetch with
//         state.lastFetchParams = action.meta.arg;
//       })

//       .addCase(NewfetchDriversThunk.fulfilled, (state, action) => {
//         const { total, items } = action.payload;

//         // Set all drivers (replace existing)
//         driversAdapter.setAll(state, items);

//         state.total = total;
//         state.loading = false;
//         state.loaded = true;
//         state.error = null;

//         logDebug(" this is the state in slice ", state.loading);
//       })

//       .addCase(NewfetchDriversThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.loaded = false;
//         state.error = action.payload || "Something went wrong";

//         // Clear data on error
//         driversAdapter.removeAll(state);
//         state.total = 0;
//       });
//   },
// });

// // ------------------------------------------------------
// // ACTIONS
// // ------------------------------------------------------
// export const { clearDrivers, removeDriver, resetLoading } =
//   newDriverSlice.actions;

// // ------------------------------------------------------
// // REDUCER
// // ------------------------------------------------------
// export default newDriverSlice.reducer;

// // ------------------------------------------------------
// // SELECTORS
// // ------------------------------------------------------
// // Export adapter selectors
// export const driversAdapterSelectors = driversAdapter.getSelectors();

// // Custom selectors for the newDriver slice
// export const newDriverSelectors = {
//   // Entity adapter selectors
//   selectAll: (state) => driversAdapterSelectors.selectAll(state.newDriver),
//   selectById: (state, id) =>
//     driversAdapterSelectors.selectById(state.newDriver, id),
//   selectIds: (state) => driversAdapterSelectors.selectIds(state.newDriver),
//   selectEntities: (state) =>
//     driversAdapterSelectors.selectEntities(state.newDriver),
//   selectTotal: (state) => driversAdapterSelectors.selectTotal(state.newDriver),

//   // Custom selectors
//   selectLoading: (state) => state.newDriver.loading,
//   selectLoaded: (state) => state.newDriver.loaded,
//   selectError: (state) => state.newDriver.error,
//   selectTotalCount: (state) => state.newDriver.total,
//   selectLastFetchParams: (state) => state.newDriver.lastFetchParams,

//   // Combined selector for pagination info
//   selectPaginationInfo: (state) => ({
//     loading: state.newDriver.loading,
//     loaded: state.newDriver.loaded,
//     total: state.newDriver.total,
//     error: state.newDriver.error,
//   }),

//   // Selector for specific driver by ID
//   selectDriverById: (state, driverId) => {
//     return driversAdapterSelectors.selectById(state.newDriver, driverId);
//   },
// };

// export const NewfetchDriversThunk = createAsyncThunk(
//   "drivers/fetchAll",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       // params may contain: page, limit, search, status, vendorId etc.
//       const response = await API_CLIENT.get("/v1/drivers/vendor", {
//         params, // 👈 attach query params here
//       });

//       if (response?.data?.success) {
//         return {
//           items: response.data.data.items,
//           total: response.data.data.total || 0,
//           params, // returning params can help reducer store pagination state
//         };
//       } else {
//         return rejectWithValue(
//           response.data.message || "Failed to fetch drivers"
//         );
//       }
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );
