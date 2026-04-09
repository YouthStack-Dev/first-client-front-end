import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import {
  getAlertConfigThunk,
  createAlertConfigThunk,
  updateAlertConfigThunk,
  acknowledgeAlertConfigThunk,
  escalateAlertConfigThunk,
  closeAlertThunk,
} from "./alertconfigTrunk";

const initialState = {
  byId: {},     // { [config_id]: config }
  allIds: [],   // [config_id]
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
        state.byId[config.config_id] = config;
        if (!state.allIds.includes(config.config_id)) {
          state.allIds.push(config.config_id);
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
        state.byId[updatedConfig.config_id] = {
          ...state.byId[updatedConfig.config_id],
          ...updatedConfig,
        };
      })
      .addCase(updateAlertConfigThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update config";
      })

      /* ========= ACKNOWLEDGE ========= */
      // Note: acknowledge/escalate/close operate on live alerts (not config store),
      // so we only track loading/error here. The page manages local alert state.
      .addCase(acknowledgeAlertConfigThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acknowledgeAlertConfigThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(acknowledgeAlertConfigThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to acknowledge alert";
      })

      /* ========= ESCALATE ========= */
      .addCase(escalateAlertConfigThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(escalateAlertConfigThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(escalateAlertConfigThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to escalate alert";
      })

      /* ========= CLOSE ========= */
      .addCase(closeAlertThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closeAlertThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(closeAlertThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to close alert";
      });
  },
});

export const { setConfig, removeConfig, clearConfigs } = alertconfigSlice.actions;
export default alertconfigSlice.reducer;