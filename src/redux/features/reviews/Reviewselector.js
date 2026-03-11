// ─── Bookings tab ─────────────────────────────────────────────────────────────
export const selectBookingShifts        = (state) => state.reviews.bookings.shifts;
export const selectBookingsLoading      = (state) => state.reviews.bookings.loading;
export const selectBookingsError        = (state) => state.reviews.bookings.error;
export const selectBookingReviewCache   = (state) => state.reviews.bookings.reviewCache;
export const selectBookingReviewLoading = (state) => state.reviews.bookings.reviewLoading;
export const selectBookingReviewError   = (state) => state.reviews.bookings.reviewError;

// Get a single booking's cached review
// Usage: useSelector(selectBookingReview(bookingId))
export const selectBookingReview = (bookingId) => (state) =>
  state.reviews.bookings.reviewCache[bookingId];

// ─── Driver Reviews tab ───────────────────────────────────────────────────────
// NOTE: driver list → driversSelectors.selectAll(state) from newDriverSlice
export const selectDriverReviewData    = (state) => state.reviews.driverReviews.data;
export const selectDriverReviewLoading = (state) => state.reviews.driverReviews.loading;
export const selectDriverReviewError   = (state) => state.reviews.driverReviews.error;
export const selectDriverReviewPage    = (state) => state.reviews.driverReviews.page;

// ─── Vehicle Reviews tab ──────────────────────────────────────────────────────
// NOTE: vehicle list → selectVehicles(state) from manageVehicles/vehicleSelectors
export const selectVehicleReviewData    = (state) => state.reviews.vehicleReviews.data;
export const selectVehicleReviewLoading = (state) => state.reviews.vehicleReviews.loading;
export const selectVehicleReviewError   = (state) => state.reviews.vehicleReviews.error;
export const selectVehicleReviewPage    = (state) => state.reviews.vehicleReviews.page;

// ─── All Reviews tab ──────────────────────────────────────────────────────────
export const selectAllReviewsData    = (state) => state.reviews.allReviews.data;
export const selectAllReviewsLoading = (state) => state.reviews.allReviews.loading;
export const selectAllReviewsError   = (state) => state.reviews.allReviews.error;
export const selectAllReviewsPage    = (state) => state.reviews.allReviews.page;