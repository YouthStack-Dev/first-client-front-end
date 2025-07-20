import { createAsyncThunk } from '@reduxjs/toolkit';
import { createDriver } from './driveApi';

export const addDriver = createAsyncThunk(
  'drivers/addDriver',
  async (driverData, { rejectWithValue }) => {
    try {
      const response = await createDriver(driverData);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to add driver');
    }
  }
);
