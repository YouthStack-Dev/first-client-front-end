// src/redux/features/managevehicletype/vehicleTypeSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  // fetchVehicleTypes,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
} from './vehicleTypeThunks';

const initialState = {
  vehicleTypes: [],
  loading: false,
  error: null,
  isModalOpen: false,
  editingId: null,
  formData: {
    vehicle_type_name: '',
    description: '',
    is_active: true,
  },
};

const vehicleTypeSlice = createSlice({
  name: 'vehicleType',
  initialState,
  reducers: {
    setFormData(state, action) {
      state.formData = action.payload;
    },
    toggleModal(state, action) {
      state.isModalOpen = action.payload;
    },
    setEditingId(state, action) {
      state.editingId = action.payload;
    },
    resetForm(state) {
      state.formData = initialState.formData;
      state.editingId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔄 Fetch vehicle types
      // .addCase(fetchVehicleTypes.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchVehicleTypes.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.vehicleTypes = action.payload;
      // })
      // .addCase(fetchVehicleTypes.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })

      // ➕ Add new vehicle type
      .addCase(createVehicleType.fulfilled, (state, action) => {
        state.vehicleTypes.push(action.payload);
      })

      // ✏️ Update existing vehicle type
      .addCase(updateVehicleType.fulfilled, (state, action) => {
        const index = state.vehicleTypes.findIndex(
          (vt) => vt.vehicle_type_id === action.payload.vehicle_type_id
        );
        if (index !== -1) {
          state.vehicleTypes[index] = action.payload;
        }
      })

      // ❌ Delete vehicle type
      .addCase(deleteVehicleType.fulfilled, (state, action) => {
        state.vehicleTypes = state.vehicleTypes.filter(
          (vt) => vt.vehicle_type_id !== action.payload
        );
      });
  },
});

export const {
  setFormData,
  toggleModal,
  setEditingId,
  resetForm,
} = vehicleTypeSlice.actions;

export default vehicleTypeSlice.reducer;
