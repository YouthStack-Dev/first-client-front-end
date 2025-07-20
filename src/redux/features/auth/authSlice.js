// import { createSlice } from "@reduxjs/toolkit";
// import { loginUser, logoutUser } from "./authThunk";

// // Initial state
// const initialState = {
//   user: null,
//   isAuthenticated: false,
//   loading: false,
//   error: null,
// };

// // Auth slice
// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     setUser(state, action) {
//       state.user = action.payload;
//       state.isAuthenticated = !!action.payload;
//       state.loading = false;
//     },
//     resetAuthState(state) {
//       state.user = null;
//       state.isAuthenticated = false;
//       state.loading = false;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder

//       // ✅ loginUser
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.user = action.payload.user || action.payload;
//         state.isAuthenticated = true;
//       })

//       // ✅ logoutUser
//       .addCase(logoutUser.fulfilled, (state) => {
//         state.user = null;
//         state.isAuthenticated = false;
//       })

//       // ✅ pending matcher
//       .addMatcher(
//         (action) => action.type.endsWith('/pending'),
//         (state) => {
//           state.loading = true;
//           state.error = null;
//         }
//       )

//       // ✅ fulfilled matcher
//       .addMatcher(
//         (action) => action.type.endsWith('/fulfilled'),
//         (state) => {
//           state.loading = false;
//         }
//       )

//       // ✅ rejected matcher
//       .addMatcher(
//         (action) => action.type.endsWith('/rejected'),
//         (state, action) => {
//           state.loading = false;
//           state.error = action.payload || action.error?.message || "Something went wrong";
//         }
//       );
//   },
// });

// // ✅ Export actions
// export const { setUser, resetAuthState } = authSlice.actions;

// // ✅ Export reducer
// export default authSlice.reducer;


// authSlice.js


import { createSlice } from "@reduxjs/toolkit";
import { loginUser, logoutUser } from "./authTrunk";

// 🔰 Initial state for auth
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// 🔐 Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    resetAuthState(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ loginUser
      .addCase(loginUser.fulfilled, (state, action) => {
        const userData = action.payload.user || action.payload;

        // 🛠️ Ensure vendor_id exists (fallback to tenant_id if necessary)
        const finalUser = {
          ...userData,
          vendor_id: userData.vendor_id || userData.tenant_id || null,
        };

        state.user = finalUser;
        state.isAuthenticated = true;
        state.loading = false;

        // ✅ Debug log
        console.log("✅ User set in auth state:", finalUser);
      })

      // ✅ logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;

        console.log("🚪 Logged out successfully.");
      })

      // ⏳ Any async thunk is pending
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      // ✅ Any async thunk is fulfilled
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        }
      )

      // ❌ Any async thunk is rejected
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error?.message || "Something went wrong";

          console.error("⛔ Auth error:", state.error);
        }
      );
  },
});

// 🔁 Export actions
export const { setUser, resetAuthState } = authSlice.actions;

// 📦 Export reducer
export default authSlice.reducer;
