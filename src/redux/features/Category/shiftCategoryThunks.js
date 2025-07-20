import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getCutoff, 
  postCutoff, putCutoff } from './shiftCategoryAPI';


export const fetchCutoffData = createAsyncThunk(
  'shiftCategory/fetchCutoffData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCutoff();
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || 'Failed to fetch cutoff data'
      );
    }
  }
);

export const saveCutoffData = createAsyncThunk(
  'shiftCategory/saveCutoffData',
  async ({ id, booking_cutoff, cancellation_cutoff }, { rejectWithValue }) => {
    try {
      const payload = { booking_cutoff, cancellation_cutoff };

      let response;
      if (id) {
        response = await putCutoff({ id, ...payload }); 
      } else {
        response = await postCutoff(payload);
      }

      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.detail || err.message || 'Failed to save cutoff data'
      );
    }
  }
);
