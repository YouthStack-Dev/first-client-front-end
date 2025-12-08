import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// ------------------------------------------------------
// THUNK — NOW INSIDE THIS FILE
// ------------------------------------------------------
export const NewfetchDriversThunk = createAsyncThunk(
  "newDriver/fetch",
  async (params, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get("/v1/drivers/vendor", {
        params,
      });

      return {
        ...response.data.data,
        append: params?.append || false, // important for pagination
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Something went wrong");
    }
  }
);

// ------------------------------------------------------
// ENTITY ADAPTER (NORMALIZED STATE)
// ------------------------------------------------------
const driversAdapter = createEntityAdapter({
  selectId: (driver) => driver.driver_id,
});

// ------------------------------------------------------
// INITIAL STATE
// ------------------------------------------------------
const initialState = driversAdapter.getInitialState({
  loading: false,
  loaded: false,
  error: null,
  total: 0,
  lastFetchParams: null,
});

// ------------------------------------------------------
// SLICE
// ------------------------------------------------------
const newDriverSlice = createSlice({
  name: "newDriver",
  initialState,
  reducers: {
    clearDrivers: (state) => {
      driversAdapter.removeAll(state);
      state.total = 0;
      state.loaded = false;
      state.lastFetchParams = null;
    },

    removeDriver: (state, action) => {
      driversAdapter.removeOne(state, action.payload);
      state.total = Math.max(0, state.total - 1);
    },

    resetLoading: (state) => {
      state.loading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // ------------------------------------------------------
      // PENDING
      // ------------------------------------------------------
      .addCase(NewfetchDriversThunk.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastFetchParams = action.meta.arg || null;
      })

      // ------------------------------------------------------
      // FULFILLED
      // ------------------------------------------------------
      .addCase(NewfetchDriversThunk.fulfilled, (state, action) => {
        const { items = [], total = 0, append } = action.payload;

        if (append) {
          // 🔥 APPEND MODE — for pagination / load more
          driversAdapter.upsertMany(state, items);
        } else {
          // 🔥 REPLACE MODE — initial load / filter change
          driversAdapter.setAll(state, items);
        }

        state.total = total;
        state.loaded = true;
        state.loading = false;
        state.error = null;
      })

      // ------------------------------------------------------
      // REJECTED
      // ------------------------------------------------------
      .addCase(NewfetchDriversThunk.rejected, (state, action) => {
        state.loading = false;
        state.loaded = false;
        state.error = action.payload || "Failed to load drivers";

        driversAdapter.removeAll(state); // clear on error
        state.total = 0;
      });
  },
});

// ------------------------------------------------------
// ACTIONS
// ------------------------------------------------------
export const { clearDrivers, removeDriver, resetLoading } =
  newDriverSlice.actions;

// ------------------------------------------------------
// REDUCER
// ------------------------------------------------------
export default newDriverSlice.reducer;

// ------------------------------------------------------
// SELECTORS
// ------------------------------------------------------
export const driversSelectors = driversAdapter.getSelectors(
  (state) => state.newDriver
);

export const selectDriversLoading = (state) => state.newDriver.loading;
export const selectDriversLoaded = (state) => state.newDriver.loaded;
export const selectDriversError = (state) => state.newDriver.error;
export const selectDriversTotal = (state) => state.newDriver.total;
export const selectLastFetchParams = (state) => state.newDriver.lastFetchParams;
