import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  // getAllShifts,
  // getShiftsByLogType,
  postShift,
  putShift,
  deleteShift,
} from './shiftAPI';


// 🔄 Get All Shifts
// export const fetchAllShifts = createAsyncThunk(
//   'shift/fetchAllShifts',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await getAllShifts();
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.detail || 'Failed to fetch shifts'
//       );
//     }
//   }
// );


// // 🔍 Get Shifts by Log Type
// export const fetchShiftsByLogType = createAsyncThunk(
//   'shift/fetchShiftsByLogType',
//   async (logType, { rejectWithValue }) => {
//     try {
//       const response = await getShiftsByLogType(logType);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.detail || 'Failed to fetch shifts by log type'
//       );
//     }
//   }
// );

// ➕ Create Shift
export const createShift = createAsyncThunk(
  'shift/createShift',
  async (shiftData, { rejectWithValue }) => {
    try {
      const response = await postShift(shiftData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to create shift'
      );
    }
  }
);


// ✏️ Update Shift
export const updateShift = createAsyncThunk(
  'shift/updateShift',
  async (shiftData, { rejectWithValue }) => {
    try {
      const response = await putShift(shiftData.id, shiftData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to update shift'
      );
    }
  }
);


// ❌ Delete Shift
export const deleteShiftById = createAsyncThunk(
  'shift/deleteShiftById',
  async (id, { rejectWithValue }) => {
    try {
      await deleteShift(id);
      return id; // return deleted ID so slice can filter it
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Failed to delete shift'
      );
    }
  }
);
