import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllShifts,
  getShiftsByLogType,
  postShift,
  putShift,
  deleteShift,
} from './shiftAPI';

// 🔄 Get All Shifts
export const fetchAllShifts = createAsyncThunk(
  'shift/fetchAllShifts',
  async ({ skip = 0, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await getAllShifts(skip, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch shifts');
    }
  }
);

// 🔍 Get Shifts by Log Type
export const fetchShiftsByLogType = createAsyncThunk(
  'shift/fetchShiftsByLogType',
  async (logType, { rejectWithValue }) => {
    try {
      const response = await getShiftsByLogType(logType);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch shifts by log type');
    }
  }
);

// ➕ Create Shift → then fetch all shifts
export const createShift = createAsyncThunk(
  'shift/createShift',
  async (shiftData, { rejectWithValue, dispatch }) => {
    try {
      await postShift(shiftData);
      const updated = await dispatch(fetchAllShifts());
      return { status: 'success', data: updated };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create shift');
    }
  }
);

// ✏️ Update Shift → then fetch all shifts
export const updateShift = createAsyncThunk(
  'shift/updateShift',
  async ({ id, ...updateData }, { rejectWithValue, dispatch }) => {
    try {
      await putShift(id, updateData);
      const updated = await dispatch(fetchAllShifts());
      return { status: 'success', data: updated };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update shift');
    }
  }
);

// ❌ Delete Shift → then fetch all shifts
export const deleteShiftById = createAsyncThunk(
  'shift/deleteShiftById',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await deleteShift(id);
      const updated = await dispatch(fetchAllShifts());
      return { status: 'success', data: updated };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete shift');
    }
  }
);
