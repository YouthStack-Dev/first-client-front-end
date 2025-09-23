// src/redux/features/shiftCategory/shiftCategoryThunks.js

import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getCutoff, 
  postCutoff, putCutoff } from './shiftCategoryAPI';

/**
 * Fetches the existing cutoff data (returns all from API).
 */
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

/**
 * Saves cutoff data using POST if no ID, or PUT (with ID in body) if ID exists.
 */
export const saveCutoffData = createAsyncThunk(
  'shiftCategory/saveCutoffData',
  async ({ id, booking_cutoff, cancellation_cutoff }, { rejectWithValue }) => {
    try {
      const payload = { booking_cutoff, cancellation_cutoff };

      let response;
      if (id) {
        response = await putCutoff({ id, ...payload }); // Send `id` inside body
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
