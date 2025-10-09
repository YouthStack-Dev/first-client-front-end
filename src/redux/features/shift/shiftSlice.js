import { createSlice, createSelector } from "@reduxjs/toolkit";
import { fetchShiftTrunk, createShiftTrunk, toggleShiftStatus,  updateShiftTrunk } from "./shiftTrunk";

// --- Helper to normalize data from API (expects array of shifts) ---
const normalizeShiftsData = (shiftArray) => {
  const shifts = {};
  const shiftCategories = {};
  const shiftIds = [];

  shiftArray.forEach((shift) => {
    const { shiftCategory, ...shiftWithoutCategory } = shift;

    shifts[shift.shift_id] = {
      ...shiftWithoutCategory,
      shiftCategoryId: shift.shiftCategoryId || null,
    };
    shiftIds.push(shift.shift_id);

    if (shiftCategory && !shiftCategories[shiftCategory.id]) {
      shiftCategories[shiftCategory.id] = shiftCategory;
    }
  });

  return { shifts, shiftCategories, shiftIds };
};

const shiftSlice = createSlice({
  name: "shift",
  initialState: {
    shifts: { byId: {}, allIds: [] },
    shiftCategories: { byId: {}, allIds: [] },
    selectedShifts: [],
    loading: false,
    loaded: false,
    error: null,
  },
  reducers: {
    addSelectedShift: (state, action) => {
      if (!state.selectedShifts.includes(action.payload)) {
        state.selectedShifts.push(action.payload);
      }
    },
    removeSelectedShift: (state, action) => {
      state.selectedShifts = state.selectedShifts.filter(
        (id) => id !== action.payload
      );
    },
    clearSelectedShifts: (state) => {
      state.selectedShifts = [];
    },
    addShift: (state, action) => {
      const shift = action.payload;
      state.shifts.byId[shift.shift_id] = {
        ...shift,
        shiftCategoryId: shift.shiftCategoryId || null,
      };
      if (!state.shifts.allIds.includes(shift.shift_id)) {
        state.shifts.allIds.push(shift.shift_id);
      }
    },
    updateShift: (state, action) => {
      const shift = action.payload;
      if (state.shifts.byId[shift.shift_id]) {
        state.shifts.byId[shift.shift_id] = {
          ...state.shifts.byId[shift.shift_id],
          ...shift,
          shiftCategoryId: shift.shiftCategoryId || null,
        };
      }
    },
    deleteShift: (state, action) => {
      const shiftId = action.payload;
      delete state.shifts.byId[shiftId];
      state.shifts.allIds = state.shifts.allIds.filter((id) => id !== shiftId);
      state.selectedShifts = state.selectedShifts.filter((id) => id !== shiftId);
    },
    addShiftCategory: (state, action) => {
      const category = action.payload;
      state.shiftCategories.byId[category.id] = category;
      if (!state.shiftCategories.allIds.includes(category.id.toString())) {
        state.shiftCategories.allIds.push(category.id.toString());
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Shifts ---
      .addCase(fetchShiftTrunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
       .addCase(fetchShiftTrunk.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true; // mark as loaded
        const normalizedData = normalizeShiftsData(action.payload);
        state.shifts.byId = normalizedData.shifts;
        state.shifts.allIds = normalizedData.shiftIds;
        state.shiftCategories.byId = normalizedData.shiftCategories;
        state.shiftCategories.allIds = Object.keys(normalizedData.shiftCategories);
      })

      .addCase(fetchShiftTrunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch shifts";
      })

      // --- Create Shift ---
      .addCase(createShiftTrunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShiftTrunk.fulfilled, (state, action) => {
        state.loading = false;
        const shift = action.payload;
        if (shift && shift.shift_id) {
          state.shifts.byId[shift.shift_id] = shift;
          if (!state.shifts.allIds.includes(shift.shift_id)) {
            state.shifts.allIds.push(shift.shift_id);
          }
        }
      })
      .addCase(createShiftTrunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create shift";
      })

    // --- Toggle Shift Status ---
      .addCase(toggleShiftStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        })
        .addCase(toggleShiftStatus.fulfilled, (state, action) => {
          state.loading = false;
          const updatedShift = action.payload.data; // <-- use .data here
          if (updatedShift && state.shifts.byId[updatedShift.shift_id]) {
            state.shifts.byId[updatedShift.shift_id] = {
              ...state.shifts.byId[updatedShift.shift_id],
              ...updatedShift,
            };
          }
        })
        .addCase(toggleShiftStatus.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || "Failed to toggle shift status";
        })
          // --- Update Shift ---
      .addCase(updateShiftTrunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShiftTrunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedShift = action.payload;
        if (updatedShift && state.shifts.byId[updatedShift.shift_id]) {
          state.shifts.byId[updatedShift.shift_id] = {
            ...state.shifts.byId[updatedShift.shift_id],
            ...updatedShift,
            shiftCategoryId: updatedShift.shiftCategoryId || null,
          };
        }
      })
      .addCase(updateShiftTrunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update shift";
      });
  },
});

// --- Actions ---
export const {
  addSelectedShift,
  removeSelectedShift,
  clearSelectedShifts,
  addShift,
  updateShift,
  deleteShift,
  addShiftCategory,
  setLoading,
  setError,
  clearError,
} = shiftSlice.actions;

// --- Selectors ---
const selectShiftEntities = (state) => state.shift.shifts.byId;
const selectShiftIds = (state) => state.shift.shifts.allIds;
const selectShiftCategoryEntities = (state) => state.shift.shiftCategories.byId;
const selectShiftCategoryIds = (state) => state.shift.shiftCategories.allIds;

export const selectAllShifts = createSelector(
  [selectShiftEntities, selectShiftIds],
  (byId, allIds) => allIds.map((id) => byId[id])
);

export const selectShiftById = (state, shiftId) =>
  state.shift.shifts.byId[shiftId];

export const selectAllShiftCategories = createSelector(
  [selectShiftCategoryEntities, selectShiftCategoryIds],
  (byId, allIds) => allIds.map((id) => byId[id])
);

export const selectLoading = (state) => state.shift.loading;
export const selectError = (state) => state.shift.error;

export default shiftSlice.reducer;
