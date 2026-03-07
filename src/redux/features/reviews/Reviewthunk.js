import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

// ─── 1. Fetch bookings by date (Bookings tab) ─────────────────────────────────
// GET /bookings/tenant/{tenantId}/shifts/bookings
export const fetchBookingsByDateThunk = createAsyncThunk(
  "reviews/fetchBookingsByDate",
  async ({ tenantId, bookingDate, fromDate = "", toDate = "" }, { rejectWithValue }) => {
    try {
      const params = { booking_date: bookingDate };
      if (fromDate) params.from_date = fromDate;
      if (toDate)   params.to_date   = toDate;

      const response = await API_CLIENT.get(
        `/bookings/tenant/${tenantId}/shifts/bookings`,
        { params }
      );
      return response.data?.data ?? null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── 2. Fetch review for a single booking ────────────────────────────────────
// GET /bookings/{bookingId}/review
export const fetchBookingReviewThunk = createAsyncThunk(
  "reviews/fetchBookingReview",
  async ({ bookingId }, { rejectWithValue }) => {
    try {
      const response = await API_CLIENT.get(`/bookings/${bookingId}/review`);
      return {
        bookingId,
        review: response.data?.data ?? null,
      };
    } catch (err) {
      // 404 means no review submitted yet — not a real error
      if (err.response?.status === 404) {
        return { bookingId, review: null };
      }
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── 3. Fetch reviews for a driver ───────────────────────────────────────────
// GET /drivers/{driverId}/reviews
export const fetchDriverReviewsThunk = createAsyncThunk(
  "reviews/fetchDriverReviews",
  async ({ driverId, page = 1, startDate = "", endDate = "" }, { rejectWithValue }) => {
    try {
      const params = { page, per_page: 20 };
      if (startDate) params.start_date = startDate;
      if (endDate)   params.end_date   = endDate;

      const response = await API_CLIENT.get(
        `/drivers/${driverId}/reviews`,
        { params }
      );
      return {
        driverId,
        page,
        data: response.data?.data ?? null,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── 4. Fetch reviews for a vehicle ──────────────────────────────────────────
// GET /vehicles/{vehicleId}/reviews
export const fetchVehicleReviewsThunk = createAsyncThunk(
  "reviews/fetchVehicleReviews",
  async ({ vehicleId, page = 1, startDate = "", endDate = "" }, { rejectWithValue }) => {
    try {
      const params = { page, per_page: 10 };
      if (startDate) params.start_date = startDate;
      if (endDate)   params.end_date   = endDate;

      const response = await API_CLIENT.get(
        `/vehicles/${vehicleId}/reviews`,
        { params }
      );
      return {
        vehicleId,
        page,
        data: response.data?.data ?? null,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── 5. Fetch all reviews — global search (All Reviews tab) ──────────────────
// GET /reviews
export const fetchAllReviewsThunk = createAsyncThunk(
  "reviews/fetchAllReviews",
  async (
    {
      page       = 1,
      fromDate   = "",
      toDate     = "",
      driverId   = "",
      employeeId = "",
      routeId    = "",
      minRating  = "",
      maxRating  = "",
    },
    { rejectWithValue }
  ) => {
    try {
      const params = { page, per_page: 20 };
      if (fromDate)   params.from_date   = fromDate;
      if (toDate)     params.to_date     = toDate;
      if (driverId)   params.driver_id   = driverId;
      if (employeeId) params.employee_id = employeeId;
      if (routeId)    params.route_id    = routeId;
      if (minRating)  params.min_rating  = minRating;
      if (maxRating)  params.max_rating  = maxRating;

      const response = await API_CLIENT.get("/reviews", { params });
      return {
        page,
        result: response.data ?? null,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);