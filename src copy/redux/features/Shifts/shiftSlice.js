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
  shifts: [],
  status: 'idle',
  error: null,
  editingShift: null,
  isModalOpen: false,
  pagination: {
    skip: 0,
    limit: 20,
    total: 0,
  },
};

const shiftSlice = createSlice({
  name: 'shift',
  initialState,
  reducers: {
    setEditingShift: (state, action) => {
      state.editingShift = action.payload;
      state.isModalOpen = true;
    },
    clearEditingShift: (state) => {
      state.editingShift = null;
    },
    clearShifts: (state) => {
      state.shifts = [];
      state.status = 'idle';
      state.error = null;
    },
    openModal: (state) => {
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingShift = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
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
        state.shifts = action.payload.items || action.payload;
        if (action.payload.total !== undefined) {
          state.pagination.total = action.payload.total;
        }
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

      // ➕ CREATE SHIFT (fetch all after create)
      .addCase(createShift.pending, (state) => {
        state.status = 'saving';
        state.error = null;
      })
      .addCase(createShift.fulfilled, (state) => {
        state.status = 'succeeded';
        state.isModalOpen = false;
      })
      .addCase(createShift.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ✏️ UPDATE SHIFT (fetch all after update)
      .addCase(updateShift.pending, (state) => {
        state.status = 'saving';
        state.error = null;
      })
      .addCase(updateShift.fulfilled, (state) => {
        state.status = 'succeeded';
        state.isModalOpen = false;
        state.editingShift = null;
      })
      .addCase(updateShift.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ❌ DELETE SHIFT (fetch all after delete)
      .addCase(deleteShiftById.pending, (state) => {
        state.status = 'deleting';
        state.error = null;
      })
      .addCase(deleteShiftById.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(deleteShiftById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  setEditingShift,
  clearEditingShift,
  clearShifts,
  openModal,
  closeModal,
  setPagination,
} = shiftSlice.actions;

// ✅ Selectors
export const selectShifts = (state) => state.shift.shifts;
export const selectShiftStatus = (state) => state.shift.status;
export const selectShiftError = (state) => state.shift.error;
export const selectEditingShift = (state) => state.shift.editingShift;
export const selectShiftModalOpen = (state) => state.shift.isModalOpen;
export const selectShiftPagination = (state) => state.shift.pagination;

export default shiftSlice.reducer;
