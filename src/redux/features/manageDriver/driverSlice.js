// import { createSlice } from '@reduxjs/toolkit';
// import {
//   fetchDriversThunk,
//   createDriverThunk,
//   updateDriverThunk,
//   patchDriverStatusThunk,
// } from './driverThunks';

// const initialState = {
//   drivers: [],
//   selectedDrivers: [],
//   showModal: false,
//   editingDriverId: null,

//   apiStatus: {
//     fetchDrivers: { status: 'idle', error: null },
//     createDriver: { status: 'idle', error: null },
//     updateDriver: { status: 'idle', error: null },
//     patchDriverStatus: { status: 'idle', error: null },
//   },
// };

// const driverSlice = createSlice({
//   name: 'drivers',
//   initialState,
//   reducers: {
//     toggleModal(state, action) {
//       state.showModal = action.payload !== undefined ? action.payload : !state.showModal;
//     },
//     setEditingDriverId(state, action) {
//       state.editingDriverId = action.payload;
//     },
//     toggleSelectDriver(state, action) {
//       const id = action.payload;
//       state.selectedDrivers = state.selectedDrivers.includes(id)
//         ? state.selectedDrivers.filter((d) => d !== id)
//         : [...state.selectedDrivers, id];
//     },
//     clearSelectedDrivers(state) {
//       state.selectedDrivers = [];
//     },
//     setDrivers(state, action) {
//       state.drivers = action.payload;
//     },
//   },

//   extraReducers: (builder) => {
//     builder

//       // 🚚 Fetch Drivers
//       .addCase(fetchDriversThunk.pending, (state) => {
//         state.apiStatus.fetchDrivers = { status: 'loading', error: null };
//       })
//       .addCase(fetchDriversThunk.fulfilled, (state, action) => {
//         state.apiStatus.fetchDrivers = { status: 'succeeded', error: null };
//         state.drivers = action.payload;
//       })
//       .addCase(fetchDriversThunk.rejected, (state, action) => {
//         state.apiStatus.fetchDrivers = {
//           status: 'failed',
//           error: action.error?.message || 'Failed to fetch drivers',
//         };
//       })

//       // ➕ Create Driver
//       .addCase(createDriverThunk.pending, (state) => {
//         state.apiStatus.createDriver = { status: 'loading', error: null };
//       })
//       .addCase(createDriverThunk.fulfilled, (state, action) => {
//         state.apiStatus.createDriver = { status: 'succeeded', error: null };
//         state.drivers.unshift(action.payload);
//         state.showModal = false;
//         state.editingDriverId = null;
//       })
//       .addCase(createDriverThunk.rejected, (state, action) => {
//         state.apiStatus.createDriver = {
//           status: 'failed',
//           error: action.error?.message || 'Failed to create driver',
//         };
//       })

//       // ✏️ Update Driver
//       .addCase(updateDriverThunk.pending, (state) => {
//         state.apiStatus.updateDriver = { status: 'loading', error: null };
//       })
//       .addCase(updateDriverThunk.fulfilled, (state, action) => {
//         state.apiStatus.updateDriver = { status: 'succeeded', error: null };
//         const updated = action.payload;
//         const index = state.drivers.findIndex((d) => d.driver_id === updated.driver_id);
//         if (index !== -1) {
//           state.drivers[index] = { ...state.drivers[index], ...updated };
//         }
//         state.showModal = false;
//         state.editingDriverId = null;
//       })
//       .addCase(updateDriverThunk.rejected, (state, action) => {
//         state.apiStatus.updateDriver = {
//           status: 'failed',
//           error: action.error?.message || 'Failed to update driver',
//         };
//       })

//       // ✅ Patch Driver Status
//       .addCase(patchDriverStatusThunk.pending, (state) => {
//         state.apiStatus.patchDriverStatus = { status: 'loading', error: null };
//       })
//       .addCase(patchDriverStatusThunk.fulfilled, (state, action) => {
//         state.apiStatus.patchDriverStatus = { status: 'succeeded', error: null };
//         const updated = action.payload;
//         const index = state.drivers.findIndex((d) => d.driver_id === updated.driver_id);
//         if (index !== -1) {
//           state.drivers[index] = { ...state.drivers[index], ...updated };
//         }
//       })
//       .addCase(patchDriverStatusThunk.rejected, (state, action) => {
//         state.apiStatus.patchDriverStatus = {
//           status: 'failed',
//           error: action.error?.message || 'Failed to update status',
//         };
//       });
//   },
// });

// export const {
//   toggleModal,
//   setEditingDriverId,
//   toggleSelectDriver,
//   clearSelectedDrivers,
//   setDrivers,
// } = driverSlice.actions;

// export default driverSlice.reducer;



import { createSlice } from '@reduxjs/toolkit';
import {
  fetchDriversThunk,
  createDriverThunk,
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
    toggleModal(state, action) {
      state.showModal = action.payload !== undefined ? action.payload : !state.showModal;
    },
    setEditingDriverId(state, action) {
      state.editingDriverId = action.payload;
    },
    toggleSelectDriver(state, action) {
      const id = action.payload;
      state.selectedDrivers = state.selectedDrivers.includes(id)
        ? state.selectedDrivers.filter((d) => d !== id)
        : [...state.selectedDrivers, id];
    },
    clearSelectedDrivers(state) {
      state.selectedDrivers = [];
    },
    setDrivers(state, action) {
      state.drivers = action.payload;
    },
    updateDriverStatusLocally(state, action) {
      const { driver_id, status } = action.payload;
      const index = state.drivers.findIndex((d) => d.driver_id === driver_id);
      if (index !== -1) {
        state.drivers[index].status = status;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // 🚚 Fetch Drivers
      .addCase(fetchDriversThunk.pending, (state) => {
        state.apiStatus.fetchDrivers = { status: 'loading', error: null };
      })
      .addCase(fetchDriversThunk.fulfilled, (state, action) => {
        state.apiStatus.fetchDrivers = { status: 'succeeded', error: null };
        state.drivers = action.payload;
      })
      .addCase(fetchDriversThunk.rejected, (state, action) => {
        state.apiStatus.fetchDrivers = {
          status: 'failed',
          error: action.error?.message || 'Failed to fetch drivers',
        };
      })

      // ➕ Create Driver
      .addCase(createDriverThunk.pending, (state) => {
        state.apiStatus.createDriver = { status: 'loading', error: null };
      })
      .addCase(createDriverThunk.fulfilled, (state, action) => {
        state.apiStatus.createDriver = { status: 'succeeded', error: null };
        state.drivers.unshift(action.payload);
        state.showModal = false;
        state.editingDriverId = null;
      })
      .addCase(createDriverThunk.rejected, (state, action) => {
        state.apiStatus.createDriver = {
          status: 'failed',
          error: action.error?.message || 'Failed to create driver',
        };
      })

      // ✏️ Update Driver
      .addCase(updateDriverThunk.pending, (state) => {
        state.apiStatus.updateDriver = { status: 'loading', error: null };
      })
      .addCase(updateDriverThunk.fulfilled, (state, action) => {
        state.apiStatus.updateDriver = { status: 'succeeded', error: null };
        const updated = action.payload;
        const index = state.drivers.findIndex((d) => d.driver_id === updated.driver_id);
        if (index !== -1) {
          state.drivers[index] = { ...state.drivers[index], ...updated };
        }
        state.showModal = false;
        state.editingDriverId = null;
      })
      .addCase(updateDriverThunk.rejected, (state, action) => {
        state.apiStatus.updateDriver = {
          status: 'failed',
          error: action.error?.message || 'Failed to update driver',
        };
      })

      // ✅ Patch Driver Status
      .addCase(patchDriverStatusThunk.pending, (state) => {
        state.apiStatus.patchDriverStatus = { status: 'loading', error: null };
      })
      .addCase(patchDriverStatusThunk.fulfilled, (state, action) => {
        state.apiStatus.patchDriverStatus = { status: 'succeeded', error: null };
        const updated = action.payload;
        const index = state.drivers.findIndex((d) => d.driver_id === updated.driver_id);
        if (index !== -1) {
          state.drivers[index] = { ...state.drivers[index], ...updated };
        }
      })
      .addCase(patchDriverStatusThunk.rejected, (state, action) => {
        state.apiStatus.patchDriverStatus = {
          status: 'failed',
          error: action.error?.message || 'Failed to update status',
        };
      });
  },
});

export const {
  toggleModal,
  setEditingDriverId,
  toggleSelectDriver,
  clearSelectedDrivers,
  setDrivers,
  updateDriverStatusLocally,
} = driverSlice.actions;

export default driverSlice.reducer;
