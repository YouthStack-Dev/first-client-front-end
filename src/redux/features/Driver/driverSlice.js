import { createSlice } from '@reduxjs/toolkit';
import { addDriver } from './driverThunks';

const initialState = {
  drivers: [],           
  status: 'idle',        
  error: null,
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    clearDriverState: (state) => {
      state.drivers = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(addDriver.pending, (state) => {
        state.status = 'saving';
        state.error = null;
      })
      .addCase(addDriver.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.drivers.push(action.payload);  
      })
      .addCase(addDriver.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearDriverState } = driverSlice.actions;
export default driverSlice.reducer;
