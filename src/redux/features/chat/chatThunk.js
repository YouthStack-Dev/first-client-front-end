import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";
import { logDebug } from "../../../utils/logger";

// ---------------------------------------------------------------------------
// GET /chat/sessions
// Fetch paginated list of all chat sessions for the tenant (admin only)
// ---------------------------------------------------------------------------
export const fetchChatSessions = createAsyncThunk(
  "chat/fetchSessions",
  async ({ skip = 0, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await API_CLIENT.get("/chat/sessions", {
        params: { skip, limit },
      });
      return data; // { success, data: [...sessions], meta: { total, page, total_pages, ... } }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to fetch chat sessions"
      );
    }
  }
);

// ---------------------------------------------------------------------------
// GET /chat/sessions/{booking_id}
// Fetch session details for a specific booking
// ---------------------------------------------------------------------------
export const fetchChatSessionByBooking = createAsyncThunk(
  "chat/fetchSessionByBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const { data } = await API_CLIENT.get(`/chat/sessions/${bookingId}`);
      return data; // { success, data: { ...session } }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to fetch session details"
      );
    }
  }
);

// ---------------------------------------------------------------------------
// GET /chat/sessions/{booking_id}/messages
// Fetch paginated transcript for a booking (original + all translations)
// ---------------------------------------------------------------------------
export const fetchChatMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ bookingId, skip = 0, limit = 50 }, { rejectWithValue }) => {
    try {
      const { data } = await API_CLIENT.get(
        `/chat/sessions/${bookingId}/messages`,
        { params: { skip, limit } }
      );
      // Attach bookingId so the slice knows which transcript to update
      return { bookingId, ...data }; // { bookingId, success, data: { session, messages, total, page, per_page } }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to fetch messages"
      );
    }
  }
);

// ---------------------------------------------------------------------------
// GET /chat/supported-languages
// Public endpoint — no token required, but API_CLIENT works fine here too
// ---------------------------------------------------------------------------
export const fetchSupportedLanguages = createAsyncThunk(
  "chat/fetchSupportedLanguages",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API_CLIENT.get("/chat/supported-languages");
      return data; // { success, data: { languages: { en: "English", ... } } }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to fetch supported languages"
      );
    }
  }
);