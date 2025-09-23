// src/redux/features/companies/companySlice.js
import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchCompaniesThunk, 
  createCompanyThunk, 
  updateCompanyThunk 
} from "./companyThunks";

const initialState = {
  data: [],          // list of companies
  loading: false,    // for fetching companies
  creating: false,   // for creating a company
  updating: false,   // for updating a company
  error: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch companies
    builder
      .addCase(fetchCompaniesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompaniesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCompaniesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create company
    builder
      .addCase(createCompanyThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createCompanyThunk.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) state.data.push(action.payload);
      })
      .addCase(createCompanyThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      });

    // Update company
    builder
      .addCase(updateCompanyThunk.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
     .addCase(updateCompanyThunk.fulfilled, (state, action) => {
    state.updating = false;
    const index = state.data.findIndex(c => c.id === action.payload.id);
    if (index !== -1) state.data[index] = action.payload;
  })
      .addCase(updateCompanyThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      });
  },
});

export default companySlice.reducer;
