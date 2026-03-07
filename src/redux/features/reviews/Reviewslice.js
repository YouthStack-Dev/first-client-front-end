import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBookingsByDateThunk,
  fetchBookingReviewThunk,
  fetchDriverReviewsThunk,
  fetchVehicleReviewsThunk,
  fetchAllReviewsThunk,
} from "./Reviewthunk";

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {

  // ── Bookings tab ──────────────────────────────────────────────────────────
  // driver list  → state.newDriver     (driversSelectors from newDriverSlice)
  // vehicle list → state.vehicles      (selectVehicles from vehicleSelectors)
  // vendor list  → useVendorOptions()  (hook)
  bookings: {
    shifts:        null,   // { date, shifts: [{ shift_id, shift_code, shift_time, log_type, bookings[] }] }
    loading:       false,
    error:         null,
    reviewCache:   {},     // { [bookingId]: review | null }  — avoids re-fetching
    reviewLoading: false,
    reviewError:   null,
  },

  // ── Driver Reviews tab ────────────────────────────────────────────────────
  driverReviews: {
    data:    null,   // { summary: {}, reviews: [], pagination: {} }
    loading: false,
    error:   null,
    page:    1,
  },

  // ── Vehicle Reviews tab ───────────────────────────────────────────────────
  vehicleReviews: {
    data:    null,   // { summary: {}, reviews: [], pagination: {} }
    loading: false,
    error:   null,
    page:    1,
  },

  // ── All Reviews tab ───────────────────────────────────────────────────────
  allReviews: {
    data:    null,   // { data: [], meta: { total, page, per_page, total_pages } }
    loading: false,
    error:   null,
    page:    1,
  },
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const reviewSlice = createSlice({
  name: "reviews",
  initialState,

  reducers: {
    // ── Reset actions — call when user switches tabs or clears a selection ──
    resetBookings(state) {
      state.bookings = initialState.bookings;
    },
    resetDriverReviews(state) {
      state.driverReviews = initialState.driverReviews;
    },
    resetVehicleReviews(state) {
      state.vehicleReviews = initialState.vehicleReviews;
    },
    resetAllReviews(state) {
      state.allReviews = initialState.allReviews;
    },

    // ── Page setters ────────────────────────────────────────────────────────
    setDriverReviewPage(state, action) {
      state.driverReviews.page = action.payload;
    },
    setVehicleReviewPage(state, action) {
      state.vehicleReviews.page = action.payload;
    },
    setAllReviewsPage(state, action) {
      state.allReviews.page = action.payload;
    },
  },

  extraReducers: (builder) => {

    // ── fetchBookingsByDate ───────────────────────────────────────────────
    builder
      .addCase(fetchBookingsByDateThunk.pending, (state) => {
        state.bookings.loading = true;
        state.bookings.error   = null;
        state.bookings.shifts  = null;
      })
      .addCase(fetchBookingsByDateThunk.fulfilled, (state, action) => {
        state.bookings.loading = false;
        state.bookings.shifts  = action.payload;
      })
      .addCase(fetchBookingsByDateThunk.rejected, (state, action) => {
        state.bookings.loading = false;
        state.bookings.error   = action.payload;
      });

    // ── fetchBookingReview ────────────────────────────────────────────────
    // result cached in reviewCache[bookingId] to avoid re-fetching
    builder
      .addCase(fetchBookingReviewThunk.pending, (state) => {
        state.bookings.reviewLoading = true;
        state.bookings.reviewError   = null;
      })
      .addCase(fetchBookingReviewThunk.fulfilled, (state, action) => {
        const { bookingId, review } = action.payload;
        state.bookings.reviewLoading          = false;
        state.bookings.reviewCache[bookingId] = review; // null = no review submitted
      })
      .addCase(fetchBookingReviewThunk.rejected, (state, action) => {
        state.bookings.reviewLoading = false;
        state.bookings.reviewError   = action.payload;
      });

    // ── fetchDriverReviews ────────────────────────────────────────────────
    builder
      .addCase(fetchDriverReviewsThunk.pending, (state) => {
        state.driverReviews.loading = true;
        state.driverReviews.error   = null;
        state.driverReviews.data    = null;
      })
      .addCase(fetchDriverReviewsThunk.fulfilled, (state, action) => {
        const { page, data } = action.payload;
        state.driverReviews.loading = false;
        state.driverReviews.data    = data;
        state.driverReviews.page    = page;
      })
      .addCase(fetchDriverReviewsThunk.rejected, (state, action) => {
        state.driverReviews.loading = false;
        state.driverReviews.error   = action.payload;
      });

    // ── fetchVehicleReviews ───────────────────────────────────────────────
    builder
      .addCase(fetchVehicleReviewsThunk.pending, (state) => {
        state.vehicleReviews.loading = true;
        state.vehicleReviews.error   = null;
        state.vehicleReviews.data    = null;
      })
      .addCase(fetchVehicleReviewsThunk.fulfilled, (state, action) => {
        const { page, data } = action.payload;
        state.vehicleReviews.loading = false;
        state.vehicleReviews.data    = data;
        state.vehicleReviews.page    = page;
      })
      .addCase(fetchVehicleReviewsThunk.rejected, (state, action) => {
        state.vehicleReviews.loading = false;
        state.vehicleReviews.error   = action.payload;
      });

    // ── fetchAllReviews ───────────────────────────────────────────────────
    builder
      .addCase(fetchAllReviewsThunk.pending, (state) => {
        state.allReviews.loading = true;
        state.allReviews.error   = null;
      })
      .addCase(fetchAllReviewsThunk.fulfilled, (state, action) => {
        const { page, result } = action.payload;
        state.allReviews.loading = false;
        state.allReviews.data    = result;
        state.allReviews.page    = page;
      })
      .addCase(fetchAllReviewsThunk.rejected, (state, action) => {
        state.allReviews.loading = false;
        state.allReviews.error   = action.payload;
      });
  },
});

export const {
  resetBookings,
  resetDriverReviews,
  resetVehicleReviews,
  resetAllReviews,
  setDriverReviewPage,
  setVehicleReviewPage,
  setAllReviewsPage,
} = reviewSlice.actions;

export default reviewSlice.reducer;