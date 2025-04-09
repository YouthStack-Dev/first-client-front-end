import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";

// 1. Create the entity adapter
const driverAdapter = createEntityAdapter({
  // Optional: selectId, sortComparer
  selectId: (driver) => driver.id, // assuming your driver has a unique `id`
});

// 2. Get the initial state from the adapter
const initialState = driverAdapter.getInitialState({
  // You can add extra fields here if needed
  loading: false,
  error: null,
});

// 3. Create the slice
const driverSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    // CRUD using adapter's built-in methods
    setAllDrivers: driverAdapter.setAll,
    addDriver: driverAdapter.addOne,
    updateDriver: driverAdapter.updateOne,
    removeDriver: driverAdapter.removeOne,

    // Optional loading/error handlers
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

// 4. Export actions and reducer
export const {
  setAllDrivers,
  addDriver,
  updateDriver,
  removeDriver,
  setLoading,
  setError,
} = driverSlice.actions;

export default driverSlice.reducer;

// 5. Export selectors (useful for components)
export const {
  selectAll: selectAllDrivers,
  selectById: selectDriverById,
  selectIds: selectDriverIds,
} = driverAdapter.getSelectors((state) => state.drivers);
