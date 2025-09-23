import { createSlice } from "@reduxjs/toolkit";

// Helper function to normalize the data
const normalizeShiftsData = (data) => {
  const shifts = {};
  const shiftCategories = {};
  const shiftIds = [];

  data.forEach((shift) => {
    // Extract shift category and remove it from the shift object
    const { shiftCategory, ...shiftWithoutCategory } = shift;
    
    // Normalize shift
    shifts[shift.id] = {
      ...shiftWithoutCategory,
      shiftCategoryId: shift.shiftCategoryId
    };
    shiftIds.push(shift.id);

    // Normalize shift category if it doesn't exist
    if (shiftCategory && !shiftCategories[shiftCategory.id]) {
      shiftCategories[shiftCategory.id] = shiftCategory;
    }
  });

  return { shifts, shiftCategories, shiftIds };
};

// Slice definition
const shiftSlice = createSlice({
  name: "shift",
  initialState: {
    // Normalized data structure
    shifts: {
      byId: {},
      allIds: [],
    },
    shiftCategories: {
      byId: {},
      allIds: [],
    },
    selectedShifts: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Add or remove selected shifts
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
    
    // New reducers for setting normalized data
    setShifts: (state, action) => {
      const normalizedData = normalizeShiftsData(action.payload);
      state.shifts.byId = normalizedData.shifts;
      state.shifts.allIds = normalizedData.shiftIds;
      state.shiftCategories.byId = normalizedData.shiftCategories;
      state.shiftCategories.allIds = Object.keys(normalizedData.shiftCategories);
    },
    
    // Additional reducers for managing shifts and categories
    addShift: (state, action) => {
      const shift = action.payload;
      state.shifts.byId[shift.id] = {
        ...shift,
        shiftCategoryId: shift.shiftCategoryId,
      };
      if (!state.shifts.allIds.includes(shift.id)) {
        state.shifts.allIds.push(shift.id);
      }
    },
    
    updateShift: (state, action) => {
      const shift = action.payload;
      if (state.shifts.byId[shift.id]) {
        state.shifts.byId[shift.id] = {
          ...state.shifts.byId[shift.id],
          ...shift,
          shiftCategoryId: shift.shiftCategoryId
        };
      }
    },
    
    deleteShift: (state, action) => {
      const shiftId = action.payload;
      delete state.shifts.byId[shiftId];
      state.shifts.allIds = state.shifts.allIds.filter(id => id !== shiftId);
      state.selectedShifts = state.selectedShifts.filter(id => id !== shiftId);
    },
    
    addShiftCategory: (state, action) => {
      const category = action.payload;
      state.shiftCategories.byId[category.id] = category;
      if (!state.shiftCategories.allIds.includes(category.id.toString())) {
        state.shiftCategories.allIds.push(category.id.toString());
      }
    },
    
    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
});

// Export actions and reducer
export const {
  addSelectedShift,
  removeSelectedShift,
  clearSelectedShifts,
  setShifts,
  addShift,
  updateShift,
  deleteShift,
  addShiftCategory,
  setLoading,
  setError,
  clearError,
} = shiftSlice.actions;

// Selectors for accessing normalized data
export const selectAllShifts = (state) => 
  state.shift.shifts.allIds.map(id => state.shift.shifts.byId[id]);

export const selectShiftById = (state, shiftId) => 
  state.shift.shifts.byId[shiftId];

export const selectShiftsByCategory = (state, categoryId) => 
  state.shift.shifts.allIds
    .map(id => state.shift.shifts.byId[id])
    .filter(shift => shift.shiftCategoryId === categoryId);

export const selectAllShiftCategories = (state) => 
  state.shift.shiftCategories.allIds.map(id => state.shift.shiftCategories.byId[id]);

export const selectShiftCategoryById = (state, categoryId) => 
  state.shift.shiftCategories.byId[categoryId];

export const selectSelectedShifts = (state) => 
  state.shift.selectedShifts.map(id => state.shift.shifts.byId[id]);

export const selectLoading = (state) => state.shift.loading;
export const selectError = (state) => state.shift.error;

export default shiftSlice.reducer;