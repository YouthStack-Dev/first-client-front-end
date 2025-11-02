import { createSlice } from "@reduxjs/toolkit";

const routeSlice = createSlice({
  name: "route",
  initialState: {
    // Selected date
    selectedDate: null,

    // Shifts data
    shifts: {
      byId: {},
      allIds: [],
    },

    // Suggested routes with clusters
    suggestedRoutes: {
      byId: {},
      allIds: [],
    },

    // Saved routes
    savedRoutes: {
      byId: {},
      allIds: [],
    },

    // All bookings normalized
    bookings: {
      byId: {},
      allIds: [],
    },

    // Pending bookings (bookings not in saved routes)
    pendingBookings: {
      byId: {},
      allIds: [],
    },

    loading: false,
    loaded: false,
    error: null,
  },
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set selected date
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },

    // Add shifts from API response
    addShiftsFromAPI: (state, action) => {
      const { date, shifts } = action.payload;

      // Set selected date
      state.selectedDate = date;

      // Clear existing shifts for this date first
      state.shifts = { byId: {}, allIds: [] };
      state.bookings = { byId: {}, allIds: [] };
      state.suggestedRoutes = { byId: {}, allIds: [] };
      state.savedRoutes = { byId: {}, allIds: [] };
      state.pendingBookings = { byId: {}, allIds: [] };

      shifts.forEach((shift) => {
        // Store shift data
        state.shifts.byId[shift.shift_id] = {
          id: shift.shift_id,
          shift_id: shift.shift_id,
          shift_code: shift.shift_code,
          shift_time: shift.shift_time,
          log_type: shift.log_type,
          bookings: shift.bookings
            ? shift.bookings.map((booking) => booking.booking_id)
            : [],
          booking_date: date,
        };

        // Add to allIds if not exists
        if (!state.shifts.allIds.includes(shift.shift_id)) {
          state.shifts.allIds.push(shift.shift_id);
        }

        // Normalize and store bookings
        if (shift.bookings && Array.isArray(shift.bookings)) {
          shift.bookings.forEach((booking) => {
            state.bookings.byId[booking.booking_id] = {
              ...booking,
              shift_id: shift.shift_id,
              is_saved: false,
              suggested_route_id: null,
              saved_route_id: null,
            };

            if (!state.bookings.allIds.includes(booking.booking_id)) {
              state.bookings.allIds.push(booking.booking_id);
            }
          });
        }
      });

      state.loaded = true;
      state.loading = false;

      // Update pending bookings
      state.pendingBookings = getPendingBookings(state);
    },

    // Add suggested routes with clusters
    addSuggestedRoutes: (state, action) => {
      const { shiftId, routes } = action.payload;

      routes.forEach((route) => {
        const routeId = `suggested_${shiftId}_${route.route_id}`;

        // Normalize route data
        state.suggestedRoutes.byId[routeId] = {
          id: routeId,
          route_id: route.route_id,
          shift_id: shiftId,
          cluster_id: route.cluster_id || `cluster_${route.route_id}`,
          bookings: route.bookings
            ? route.bookings.map((booking) => booking.booking_id)
            : [],
          estimations: route.estimations || {},
          created_at: new Date().toISOString(),
        };

        // Add to allIds if not exists
        if (!state.suggestedRoutes.allIds.includes(routeId)) {
          state.suggestedRoutes.allIds.push(routeId);
        }

        // Update bookings to mark them as being in a suggested route
        if (route.bookings) {
          route.bookings.forEach((booking) => {
            if (state.bookings.byId[booking.booking_id]) {
              state.bookings.byId[booking.booking_id].suggested_route_id =
                routeId;
            }
          });
        }
      });
    },

    // Add saved routes
    addSavedRoutes: (state, action) => {
      const { shiftId, routes } = action.payload;

      routes.forEach((route) => {
        const routeId = `saved_${shiftId}_${route.route_id}`;

        // Normalize saved route data
        state.savedRoutes.byId[routeId] = {
          id: routeId,
          route_id: route.route_id,
          shift_id: shiftId,
          cluster_id: route.cluster_id || `cluster_${route.route_id}`,
          bookings: route.bookings
            ? route.bookings.map((booking) => booking.booking_id)
            : [],
          estimations: route.estimations || {},
          saved_at: new Date().toISOString(),
        };

        // Add to allIds if not exists
        if (!state.savedRoutes.allIds.includes(routeId)) {
          state.savedRoutes.allIds.push(routeId);
        }

        // Update bookings to mark as saved
        if (route.bookings) {
          route.bookings.forEach((booking) => {
            if (state.bookings.byId[booking.booking_id]) {
              state.bookings.byId[booking.booking_id].is_saved = true;
              state.bookings.byId[booking.booking_id].saved_route_id = routeId;
              state.bookings.byId[booking.booking_id].suggested_route_id = null;
            }
          });
        }
      });

      // Update pending bookings after adding saved routes
      state.pendingBookings = getPendingBookings(state);
    },

    // Save a suggested route (move from suggested to saved)
    saveSuggestedRoute: (state, action) => {
      const { suggestedRouteId } = action.payload;
      const suggestedRoute = state.suggestedRoutes.byId[suggestedRouteId];

      if (suggestedRoute) {
        // Create saved route entry
        const savedRouteId = `saved_${suggestedRoute.shift_id}_${suggestedRoute.route_id}`;

        state.savedRoutes.byId[savedRouteId] = {
          ...suggestedRoute,
          id: savedRouteId,
          saved_at: new Date().toISOString(),
        };

        if (!state.savedRoutes.allIds.includes(savedRouteId)) {
          state.savedRoutes.allIds.push(savedRouteId);
        }

        // Remove from suggested routes
        delete state.suggestedRoutes.byId[suggestedRouteId];
        state.suggestedRoutes.allIds = state.suggestedRoutes.allIds.filter(
          (id) => id !== suggestedRouteId
        );

        // Update bookings to mark as saved
        suggestedRoute.bookings.forEach((bookingId) => {
          if (state.bookings.byId[bookingId]) {
            state.bookings.byId[bookingId].is_saved = true;
            state.bookings.byId[bookingId].saved_route_id = savedRouteId;
            state.bookings.byId[bookingId].suggested_route_id = undefined;
          }
        });

        // Update pending bookings
        state.pendingBookings = getPendingBookings(state);
      }
    },

    // Remove saved route
    removeSavedRoute: (state, action) => {
      const { savedRouteId } = action.payload;
      const savedRoute = state.savedRoutes.byId[savedRouteId];

      if (savedRoute) {
        // Update bookings to mark as unsaved
        savedRoute.bookings.forEach((bookingId) => {
          if (state.bookings.byId[bookingId]) {
            state.bookings.byId[bookingId].is_saved = false;
            state.bookings.byId[bookingId].saved_route_id = undefined;
          }
        });

        // Remove from saved routes
        delete state.savedRoutes.byId[savedRouteId];
        state.savedRoutes.allIds = state.savedRoutes.allIds.filter(
          (id) => id !== savedRouteId
        );

        // Update pending bookings
        state.pendingBookings = getPendingBookings(state);
      }
    },

    // Add individual booking to shift
    addBookingToShift: (state, action) => {
      const { shiftId, booking } = action.payload;

      state.bookings.byId[booking.booking_id] = {
        ...booking,
        shift_id: shiftId,
        is_saved: false,
        suggested_route_id: null,
        saved_route_id: null,
      };

      if (!state.bookings.allIds.includes(booking.booking_id)) {
        state.bookings.allIds.push(booking.booking_id);
      }

      // Add booking to shift's bookings array
      if (state.shifts.byId[shiftId]) {
        if (!state.shifts.byId[shiftId].bookings.includes(booking.booking_id)) {
          state.shifts.byId[shiftId].bookings.push(booking.booking_id);
        }
      }

      // Update pending bookings
      state.pendingBookings = getPendingBookings(state);
    },

    // Remove booking from shift
    removeBookingFromShift: (state, action) => {
      const { bookingId, shiftId } = action.payload;

      // Remove from bookings
      delete state.bookings.byId[bookingId];
      state.bookings.allIds = state.bookings.allIds.filter(
        (id) => id !== bookingId
      );

      // Remove from shift's bookings array
      if (state.shifts.byId[shiftId]) {
        state.shifts.byId[shiftId].bookings = state.shifts.byId[
          shiftId
        ].bookings.filter((id) => id !== bookingId);
      }

      // Remove from any suggested routes
      Object.values(state.suggestedRoutes.byId).forEach((route) => {
        route.bookings = route.bookings.filter((id) => id !== bookingId);
      });

      // Remove from any saved routes
      Object.values(state.savedRoutes.byId).forEach((route) => {
        route.bookings = route.bookings.filter((id) => id !== bookingId);
      });

      // Update pending bookings
      state.pendingBookings = getPendingBookings(state);
    },

    // Update shift data
    updateShift: (state, action) => {
      const { shiftId, shiftData } = action.payload;

      if (state.shifts.byId[shiftId]) {
        state.shifts.byId[shiftId] = {
          ...state.shifts.byId[shiftId],
          ...shiftData,
        };
      }
    },

    // Clear all data for a shift
    clearShiftData: (state, action) => {
      const { shiftId } = action.payload;

      // Clear shift
      delete state.shifts.byId[shiftId];
      state.shifts.allIds = state.shifts.allIds.filter((id) => id !== shiftId);

      // Clear suggested routes for shift
      Object.keys(state.suggestedRoutes.byId).forEach((routeId) => {
        if (state.suggestedRoutes.byId[routeId].shift_id === shiftId) {
          delete state.suggestedRoutes.byId[routeId];
        }
      });
      state.suggestedRoutes.allIds = state.suggestedRoutes.allIds.filter(
        (id) => !id.includes(`suggested_${shiftId}_`)
      );

      // Clear saved routes for shift
      Object.keys(state.savedRoutes.byId).forEach((routeId) => {
        if (state.savedRoutes.byId[routeId].shift_id === shiftId) {
          delete state.savedRoutes.byId[routeId];
        }
      });
      state.savedRoutes.allIds = state.savedRoutes.allIds.filter(
        (id) => !id.includes(`saved_${shiftId}_`)
      );

      // Clear bookings for shift
      Object.keys(state.bookings.byId).forEach((bookingId) => {
        if (state.bookings.byId[bookingId].shift_id === shiftId) {
          delete state.bookings.byId[bookingId];
        }
      });
      state.bookings.allIds = state.bookings.allIds.filter(
        (bookingId) => state.bookings.byId[bookingId]?.shift_id !== shiftId
      );

      // Update pending bookings
      state.pendingBookings = getPendingBookings(state);
    },

    // Clear all route data
    clearAllRouteData: (state) => {
      state.selectedDate = null;
      state.shifts = { byId: {}, allIds: [] };
      state.suggestedRoutes = { byId: {}, allIds: [] };
      state.savedRoutes = { byId: {}, allIds: [] };
      state.bookings = { byId: {}, allIds: [] };
      state.pendingBookings = { byId: {}, allIds: [] };
      state.error = null;
      state.loading = false;
      state.loaded = false;
    },
  },
});

// Helper function to get pending bookings (bookings not in saved routes)
const getPendingBookings = (state) => {
  const savedBookingIds = new Set();

  // Get all booking IDs from saved routes
  Object.values(state.savedRoutes.byId).forEach((route) => {
    route.bookings.forEach((bookingId) => {
      savedBookingIds.add(bookingId);
    });
  });

  // Filter bookings to get only pending ones
  const pendingBookings = { byId: {}, allIds: [] };

  state.bookings.allIds.forEach((bookingId) => {
    if (!savedBookingIds.has(bookingId)) {
      pendingBookings.byId[bookingId] = state.bookings.byId[bookingId];
      pendingBookings.allIds.push(bookingId);
    }
  });

  return pendingBookings;
};

// Selectors
export const selectSelectedDate = (state) => state.route.selectedDate;
export const selectShifts = (state) => state.route.shifts;
export const selectSuggestedRoutes = (state) => state.route.suggestedRoutes;
export const selectSavedRoutes = (state) => state.route.savedRoutes;
export const selectBookings = (state) => state.route.bookings;
export const selectPendingBookings = (state) => state.route.pendingBookings;
export const selectRouteLoading = (state) => state.route.loading;
export const selectRouteLoaded = (state) => state.route.loaded;
export const selectRouteError = (state) => state.route.error;

// Get shift by ID
export const selectShiftById = (shiftId) => (state) => {
  return state.route.shifts.byId[shiftId];
};

// Get all shifts with full booking data
export const selectShiftsWithBookings = (state) => {
  return state.route.shifts.allIds.map((shiftId) => {
    const shift = state.route.shifts.byId[shiftId];
    return {
      ...shift,
      bookings: shift.bookings
        .map((bookingId) => state.route.bookings.byId[bookingId] || null)
        .filter((booking) => booking !== null),
    };
  });
};

// Get suggested routes by shift ID
export const selectSuggestedRoutesByShift = (shiftId) => (state) => {
  return state.route.suggestedRoutes.allIds
    .filter(
      (routeId) =>
        state.route.suggestedRoutes.byId[routeId].shift_id === shiftId
    )
    .map((routeId) => {
      const route = state.route.suggestedRoutes.byId[routeId];
      return {
        ...route,
        bookings: route.bookings
          .map((bookingId) => state.route.bookings.byId[bookingId] || null)
          .filter((booking) => booking !== null),
      };
    });
};

// Get saved routes by shift ID
export const selectSavedRoutesByShift = (shiftId) => (state) => {
  return state.route.savedRoutes.allIds
    .filter(
      (routeId) => state.route.savedRoutes.byId[routeId].shift_id === shiftId
    )
    .map((routeId) => {
      const route = state.route.savedRoutes.byId[routeId];
      return {
        ...route,
        bookings: route.bookings
          .map((bookingId) => state.route.bookings.byId[bookingId] || null)
          .filter((booking) => booking !== null),
      };
    });
};

// Get bookings for a specific shift
export const selectBookingsByShift = (shiftId) => (state) => {
  const shift = state.route.shifts.byId[shiftId];
  if (!shift) return [];

  return shift.bookings
    .map((bookingId) => state.route.bookings.byId[bookingId] || null)
    .filter((booking) => booking !== null);
};

// Get pending bookings by shift
export const selectPendingBookingsByShift = (shiftId) => (state) => {
  return state.route.pendingBookings.allIds
    .map((bookingId) => state.route.pendingBookings.byId[bookingId])
    .filter((booking) => booking.shift_id === shiftId);
};

// Get total counts for dashboard
export const selectShiftCounts = (state) => {
  const shifts = selectShiftsWithBookings(state);
  return {
    totalShifts: shifts.length,
    totalBookings: shifts.reduce(
      (total, shift) => total + shift.bookings.length,
      0
    ),
    totalPendingBookings: state.route.pendingBookings.allIds.length,
    totalSavedRoutes: state.route.savedRoutes.allIds.length,
  };
};

export const {
  setLoading,
  setError,
  clearError,
  setSelectedDate,
  addShiftsFromAPI,
  addSuggestedRoutes,
  addSavedRoutes,
  saveSuggestedRoute,
  removeSavedRoute,
  addBookingToShift,
  removeBookingFromShift,
  updateShift,
  clearShiftData,
  clearAllRouteData,
} = routeSlice.actions;

export default routeSlice.reducer;
