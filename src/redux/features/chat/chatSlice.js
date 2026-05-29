import { createSlice, createSelector } from "@reduxjs/toolkit";
import {
  fetchChatSessions,
  fetchChatSessionByBooking,
  fetchChatMessages,
  fetchSupportedLanguages,
} from "./chatThunk"; // adjust path if needed

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
const initialState = {
  // ── Sessions list ──────────────────────────────────────────────────────────
  sessions: [],          // array of session objects from GET /chat/sessions
  sessionsMeta: {        // pagination meta from the API response
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
  sessionsLoading: false,
  sessionsError: null,

  // ── Active session detail ──────────────────────────────────────────────────
  // Keyed by booking_id so multiple can be cached without overwriting each other
  // { [booking_id]: { ...sessionObject } }
  sessionDetails: {},
  sessionDetailLoading: false,
  sessionDetailError: null,

  // ── Transcripts ───────────────────────────────────────────────────────────
  // Keyed by booking_id: { messages: [], total: 0, page: 1, per_page: 50, loading, error }
  transcripts: {},

  // ── Supported languages ───────────────────────────────────────────────────
  // { en: "English", hi: "Hindi", ... }
  languages: {},
  languagesLoading: false,
  languagesError: null,

  // ── UI state ──────────────────────────────────────────────────────────────
  currentPage: 1,          // current page of the sessions table
  pageSize: 10,            // rows per page: 10 | 20 | 50
  searchQuery: "",
  statusFilter: "",        // "" | "active" | "closed"
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
    // ── UI actions ───────────────────────────────────────────────────────────
setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },

    setPageSize(state, action) {
      state.pageSize = action.payload;
      state.currentPage = 1; // reset to page 1 when page size changes
    },

    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
      state.currentPage = 1; // reset to page 1 on new search
    },

    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },

    // Clears the transcript cache for a booking (useful after refresh)
    clearTranscript(state, action) {
      delete state.transcripts[action.payload];
    },

    // Full reset (e.g. on logout or leaving the page)
    resetChatState() {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    // ── fetchChatSessions ────────────────────────────────────────────────────
    builder
      .addCase(fetchChatSessions.pending, (state) => {
        state.sessionsLoading = true;
        state.sessionsError = null;
      })
      .addCase(fetchChatSessions.fulfilled, (state, action) => {
        state.sessionsLoading = false;
        state.sessions = action.payload.data ?? [];
        state.sessionsMeta = action.payload.meta ?? initialState.sessionsMeta;
      })
      .addCase(fetchChatSessions.rejected, (state, action) => {
        state.sessionsLoading = false;
        state.sessionsError = action.payload ?? "Failed to load sessions";
      });

    // ── fetchChatSessionByBooking ────────────────────────────────────────────
    builder
      .addCase(fetchChatSessionByBooking.pending, (state) => {
        state.sessionDetailLoading = true;
        state.sessionDetailError = null;
      })
      .addCase(fetchChatSessionByBooking.fulfilled, (state, action) => {
        state.sessionDetailLoading = false;
        const session = action.payload.data;
        if (session?.booking_id) {
          state.sessionDetails[session.booking_id] = session;
        }
      })
      .addCase(fetchChatSessionByBooking.rejected, (state, action) => {
        state.sessionDetailLoading = false;
        state.sessionDetailError = action.payload ?? "Failed to load session";
      });

    // ── fetchChatMessages ────────────────────────────────────────────────────
    builder
      .addCase(fetchChatMessages.pending, (state, action) => {
        const { bookingId } = action.meta.arg;
        if (!state.transcripts[bookingId]) {
          state.transcripts[bookingId] = {
            messages: [],
            total: 0,
            page: 1,
            per_page: 50,
            loading: true,
            error: null,
          };
        } else {
          state.transcripts[bookingId].loading = true;
          state.transcripts[bookingId].error = null;
        }
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        const { bookingId } = action.payload;
        const d = action.payload.data ?? {};
        state.transcripts[bookingId] = {
          messages: d.messages ?? [],
          total: d.total ?? 0,
          page: d.page ?? 1,
          per_page: d.per_page ?? 50,
          loading: false,
          error: null,
        };
        // Also cache the session detail if the API returned it
        if (d.session?.booking_id) {
          state.sessionDetails[d.session.booking_id] = d.session;
        }
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        const { bookingId } = action.meta.arg;
        if (state.transcripts[bookingId]) {
          state.transcripts[bookingId].loading = false;
          state.transcripts[bookingId].error =
            action.payload ?? "Failed to load messages";
        }
      });

    // ── fetchSupportedLanguages ──────────────────────────────────────────────
    builder
      .addCase(fetchSupportedLanguages.pending, (state) => {
        state.languagesLoading = true;
        state.languagesError = null;
      })
      .addCase(fetchSupportedLanguages.fulfilled, (state, action) => {
        state.languagesLoading = false;
        state.languages = action.payload.data?.languages ?? {};
      })
      .addCase(fetchSupportedLanguages.rejected, (state, action) => {
        state.languagesLoading = false;
        state.languagesError = action.payload ?? "Failed to load languages";
      });
  },
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
export const {
  setCurrentPage,
  setPageSize,
  setSearchQuery,
  setStatusFilter,
  clearTranscript,
  resetChatState,
} = chatSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

// Sessions list
export const selectSessions = (state) => state.chat.sessions;
export const selectSessionsMeta = (state) => state.chat.sessionsMeta;
export const selectSessionsLoading = (state) => state.chat.sessionsLoading;
export const selectSessionsError = (state) => state.chat.sessionsError;

// Session detail by booking id
export const selectSessionDetail = (bookingId) => (state) =>
  state.chat.sessionDetails[bookingId] ?? null;
export const selectSessionDetailLoading = (state) =>
  state.chat.sessionDetailLoading;
export const selectSessionDetailError = (state) =>
  state.chat.sessionDetailError;

// Transcript by booking id
export const selectTranscript = (bookingId) => (state) =>
  state.chat.transcripts[bookingId] ?? {
    messages: [],
    total: 0,
    page: 1,
    per_page: 50,
    loading: false,
    error: null,
  };

// Languages
export const selectLanguages = (state) => state.chat.languages;
export const selectLanguagesLoading = (state) => state.chat.languagesLoading;

// UI
export const selectCurrentPage = (state) => state.chat.currentPage;
export const selectPageSize = (state) => state.chat.pageSize;
export const selectSearchQuery = (state) => state.chat.searchQuery;
export const selectStatusFilter = (state) => state.chat.statusFilter;

// Derived — client-side filtered sessions (memoized to prevent rerender warnings)
export const selectFilteredSessions = createSelector(
  (state) => state.chat.sessions,
  (state) => state.chat.searchQuery,
  (state) => state.chat.statusFilter,
  (sessions, searchQuery, statusFilter) => {
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) => {
      const matchSearch =
        !q ||
        String(s.booking_id).includes(q) ||
        (s.employee_name ?? "").toLowerCase().includes(q) ||
        (s.driver_name ?? "").toLowerCase().includes(q);
      const matchStatus =
        !statusFilter ||
        (statusFilter === "active" ? s.is_active : !s.is_active);
      return matchSearch && matchStatus;
    });
  }
);

// Derived — quick stats from current page (memoized)
export const selectSessionStats = createSelector(
  (state) => state.chat.sessions,
  (state) => state.chat.sessionsMeta,
  (sessions, sessionsMeta) => ({
    total: sessionsMeta.total,
    active: sessions.filter((s) => s.is_active).length,
    totalMessages: sessions.reduce((acc, s) => acc + (s.message_count ?? 0), 0),
    uniqueLangs: new Set(
      sessions.flatMap((s) =>
        [s.employee_language, s.driver_language].filter(Boolean)
      )
    ).size,
  })
);

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
export default chatSlice.reducer;