// ✅ Slice: src/redux/features/managevehicletype/vehicleTypeSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchVehicleTypes,
  fetchVehicleTypeById, // ✅ Added
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
} from './vehicleTypeThunks';

const initialState = {
  vehicleTypes: [],
  singleVehicleType: null,  // ✅ For fetching a single vehicle type
  loading: false,
  error: null,
  isModalOpen: false,
  editingId: null,
  formData: {
    vehicle_type_name: '',
    description: '',
    capacity: '',
    fuel_type: '',
    comment: '',
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
      state.singleVehicleType = null;  // ✅ Reset single vehicle when form resets
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔄 Fetch All
      .addCase(fetchVehicleTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicleTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleTypes = action.payload;
      })

      // ✅ Fetch Single by ID
      .addCase(fetchVehicleTypeById.pending, (state) => {
        state.loading = true;
        state.singleVehicleType = null;
      })
      .addCase(fetchVehicleTypeById.fulfilled, (state, action) => {
        state.loading = false;
        state.singleVehicleType = action.payload;
      })
      .addCase(fetchVehicleTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ➕ Create
      .addCase(createVehicleType.fulfilled, (state, action) => {
        state.vehicleTypes.push(action.payload);
      })

      // ✏️ Update
      .addCase(updateVehicleType.fulfilled, (state, action) => {
        const index = state.vehicleTypes.findIndex(
          (vt) => vt.vehicle_type_id === action.payload.vehicle_type_id
        );
        if (index !== -1) state.vehicleTypes[index] = action.payload;
      })

      // ❌ Delete
      .addCase(deleteVehicleType.fulfilled, (state, action) => {
        state.vehicleTypes = state.vehicleTypes.filter(
          (vt) => vt.vehicle_type_id !== action.payload
        );
      });
  },
});

export const { setFormData, toggleModal, setEditingId, resetForm } = vehicleTypeSlice.actions;
export default vehicleTypeSlice.reducer;
