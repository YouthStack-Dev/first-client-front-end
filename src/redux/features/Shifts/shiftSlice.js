// src/redux/features/shift/shiftSlice.js

import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAllShifts,
  fetchShiftsByLogType,
  createShift,
  updateShift,
  deleteShiftById,
} from './shiftThunks';

const initialState = {
  shifts: [],           // All fetched shift records
  status: 'idle',       // idle | loading | succeeded | failed | saving | deleting
  error: null,          // Stores error messages (if any)
  editingShift: null,   // Used to pre-fill form when editing
};

const shiftSlice = createSlice({
  name: 'shift',
  initialState,
  reducers: {
    setEditingShift: (state, action) => {
      state.editingShift = action.payload;
    },
    clearEditingShift: (state) => {
      state.editingShift = null;
    },
    clearShifts: (state) => {
      state.shifts = [];
      state.status = 'idle';
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // 🚚 FETCH ALL
      .addCase(fetchAllShifts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllShifts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shifts = action.payload;
      })
      .addCase(fetchAllShifts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })


      // 🔍 FETCH BY LOG TYPE
      .addCase(fetchShiftsByLogType.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchShiftsByLogType.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shifts = action.payload;
      })
      .addCase(fetchShiftsByLogType.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })


      // ➕ CREATE SHIFT
      .addCase(createShift.pending, (state) => {
        state.status = 'saving';
        state.error = null;
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shifts.push(action.payload);
      })
      .addCase(createShift.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })


      // ✏️ UPDATE SHIFT
      .addCase(updateShift.pending, (state) => {
        state.status = 'saving';
        state.error = null;
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.shifts.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.shifts[index] = action.payload;
        }
      })
      .addCase(updateShift.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })


      // ❌ DELETE SHIFT
      .addCase(deleteShiftById.pending, (state) => {
        state.status = 'deleting';
        state.error = null;
      })
      .addCase(deleteShiftById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.shifts = state.shifts.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteShiftById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setEditingShift, clearEditingShift, clearShifts } = shiftSlice.actions;
export default shiftSlice.reducer;
