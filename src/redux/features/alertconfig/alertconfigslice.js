import { createSlice } from "@reduxjs/toolkit";
import {
  getAlertConfigThunk,
  createAlertConfigThunk,
  updateAlertConfigThunk,
} from "./alertconfigTrunk";

/* =======================
   SLICE
======================= */
const initialState = {
  byId: {}, // { [config_id]: config }
  allIds: [], // [config_id]
  loading: false,
  error: null,
};

const alertconfigSlice = createSlice({
  name: "alertconfig",
  initialState,
  reducers: {
    setConfig(state, action) {
      const config = action.payload;
      const configId = config.config_id;

      state.byId[configId] = config;

      if (!state.allIds.includes(configId)) {
        state.allIds.push(configId);
      }
    },

    removeConfig(state, action) {
      const configId = action.payload;
      delete state.byId[configId];
      state.allIds = state.allIds.filter((id) => id !== configId);
    },

    clearConfigs(state) {
      state.byId = {};
      state.allIds = [];
      state.error = null;
    },
  },

  /* =======================
     EXTRA REDUCERS
  ======================= */
  extraReducers: (builder) => {
    builder
      /* ========= GET ========= */
      .addCase(getAlertConfigThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAlertConfigThunk.fulfilled, (state, action) => {
        state.loading = false;

        const configs = action.payload;
        if (!Array.isArray(configs)) return;

        state.byId = {};
        state.allIds = [];

        configs.forEach((config) => {
          if (!config.config_id) return;

          state.byId[config.config_id] = config;
          state.allIds.push(config.config_id);
        });
      })

      .addCase(getAlertConfigThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something went wrong";
      })

      /* ========= CREATE ========= */
      .addCase(createAlertConfigThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createAlertConfigThunk.fulfilled, (state, action) => {
        state.loading = false;

        const config = action.payload;
        if (!config?.config_id) return;

        const configId = config.config_id;
        state.byId[configId] = config;

        if (!state.allIds.includes(configId)) {
          state.allIds.push(configId);
        }
      })

      .addCase(createAlertConfigThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create config";
      })

      /* ========= UPDATE ========= */
      .addCase(updateAlertConfigThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateAlertConfigThunk.fulfilled, (state, action) => {
        state.loading = false;

        const updatedConfig = action.payload;
        if (!updatedConfig?.config_id) return;

        const configId = updatedConfig.config_id;

        state.byId[configId] = {
          ...state.byId[configId],
          ...updatedConfig,
        };
      })

      .addCase(updateAlertConfigThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update config";
      });
  },
});

export const { setConfig, removeConfig, clearConfigs } =
  alertconfigSlice.actions;

export default alertconfigSlice.reducer;
