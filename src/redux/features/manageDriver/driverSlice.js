// src/redux/features/manageDriver/driverSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchDriversThunk,
  createDriverThunk, // ✅ rename here
  updateDriverThunk,
  patchDriverStatusThunk,
} from './driverThunks';


const initialState = {
  drivers: [],
  selectedDrivers: [],
  showModal: false,
  editingDriverId: null,

  apiStatus: {
    fetchDrivers: { status: 'idle', error: null },
    createDriver: { status: 'idle', error: null },
    updateDriver: { status: 'idle', error: null },
    patchDriverStatus: { status: 'idle', error: null },
  },
};

const driverSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    toggleModal(state) {
      state.showModal = !state.showModal;
    },
    setEditingDriverId(state, action) {
      state.editingDriverId = action.payload;
    },
    toggleSelectDriver(state, action) {
      const id = action.payload;
      if (state.selectedDrivers.includes(id)) {
        state.selectedDrivers = state.selectedDrivers.filter((i) => i !== id);
      } else {
        state.selectedDrivers.push(id);
      }
    },
    clearSelectedDrivers(state) {
      state.selectedDrivers = [];
    },
  },

  extraReducers: (builder) => {
    // ============================
    // 🚚 Fetch Drivers
    // ============================
    builder
      .addCase(fetchDriversThunk.pending, (state) => {
        state.apiStatus.fetchDrivers.status = 'loading';
        state.apiStatus.fetchDrivers.error = null;
      })
      .addCase(fetchDriversThunk.fulfilled, (state, action) => {
        state.apiStatus.fetchDrivers.status = 'succeeded';
        state.drivers = action.payload;
      })
      .addCase(fetchDriversThunk.rejected, (state, action) => {
        state.apiStatus.fetchDrivers.status = 'failed';
        state.apiStatus.fetchDrivers.error = action.payload || action.error.message;
      });

          // ============================
      // ➕ Create Driver
      // ============================
      builder
        .addCase(createDriverThunk.pending, (state) => {
          state.apiStatus.createDriver.status = 'loading';
          state.apiStatus.createDriver.error = null;
        })
        .addCase(createDriverThunk.fulfilled, (state, action) => {
          state.apiStatus.createDriver.status = 'succeeded';
          state.drivers.unshift(action.payload);
        })
        .addCase(createDriverThunk.rejected, (state, action) => {
          state.apiStatus.createDriver.status = 'failed';
          state.apiStatus.createDriver.error = action.payload || action.error.message;
        });


    // ============================
    // ✏️ Update Driver
    // ============================
    builder
      .addCase(updateDriverThunk.pending, (state) => {
        state.apiStatus.updateDriver.status = 'loading';
        state.apiStatus.updateDriver.error = null;
      })
      .addCase(updateDriverThunk.fulfilled, (state, action) => {
        state.apiStatus.updateDriver.status = 'succeeded';
        const updated = action.payload;
        const index = state.drivers.findIndex((d) => d.driver_id === updated.driver_id);
        if (index !== -1) {
          state.drivers[index] = { ...state.drivers[index], ...updated };
        }
      })
      .addCase(updateDriverThunk.rejected, (state, action) => {
        state.apiStatus.updateDriver.status = 'failed';
        state.apiStatus.updateDriver.error = action.payload || action.error.message;
      });

    // ============================
    // ✅ Patch Driver Status
    // ============================
    builder
      .addCase(patchDriverStatusThunk.pending, (state) => {
        state.apiStatus.patchDriverStatus.status = 'loading';
        state.apiStatus.patchDriverStatus.error = null;
      })
      .addCase(patchDriverStatusThunk.fulfilled, (state, action) => {
        state.apiStatus.patchDriverStatus.status = 'succeeded';
        const updated = action.payload;
        const index = state.drivers.findIndex((d) => d.driver_id === updated.driver_id);
        if (index !== -1) {
          state.drivers[index] = { ...state.drivers[index], ...updated };
        }
      })
      .addCase(patchDriverStatusThunk.rejected, (state, action) => {
        state.apiStatus.patchDriverStatus.status = 'failed';
        state.apiStatus.patchDriverStatus.error = action.payload || action.error.message;
      });
  },
});

export const {
  toggleModal,
  setEditingDriverId,
  toggleSelectDriver,
  clearSelectedDrivers,
} = driverSlice.actions;

export default driverSlice.reducer;
