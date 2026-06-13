// contractsSlice.js
import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import {
  fetchContractsThunk,
  createContractThunk,
  updateContractThunk,
  deleteContractThunk,
  toggleContractStatusThunk,
  createSlabThunk,
  updateSlabThunk,
  deleteSlabThunk, 
} from "./contractsThunk";

const contractsAdapter = createEntityAdapter({
  selectId: (contract) => contract.contract_id ?? contract.id,
});

const slabsAdapter = createEntityAdapter({
  selectId: (slab) => slab.slab_id ?? slab.id,
});

const initialState = contractsAdapter.getInitialState({
  loading: false,
  error: null,

  saving: false,
  saveError: null,

  slabs: slabsAdapter.getInitialState(),
  slabIdsByContract: {},

  slabsLoading: false,
  slabError: null,
});

const contractsSlice = createSlice({
  name: "contracts",
  initialState,

  reducers: {
    clearContracts: () => initialState,

    clearError: (state) => {
      state.error = null;
      state.saveError = null;
      state.slabError = null;
    },

    clearSlabsByContract: (state, action) => {
      const contractId = action.payload;

      if (state.slabIdsByContract[contractId]) {
        state.slabIdsByContract[contractId].forEach((slabId) => {
          slabsAdapter.removeOne(state.slabs, slabId);
        });

        delete state.slabIdsByContract[contractId];
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // ===============================
      // Contracts
      // ===============================

      .addCase(fetchContractsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchContractsThunk.fulfilled, (state, action) => {
            state.loading = false;

            const { contracts } = action.payload;

            contractsAdapter.setAll(state, contracts);

            // Reset slab cache
            state.slabIdsByContract = {};

            const allSlabs = [];

            contracts.forEach((contract) => {
                const contractId = contract.contract_id ?? contract.id;
                const slabs = contract.slabs || [];

                state.slabIdsByContract[contractId] = slabs.map(
                (slab) => slab.slab_id ?? slab.id
                );

                allSlabs.push(...slabs);
            });

            slabsAdapter.setAll(state.slabs, allSlabs);
            })

      .addCase(fetchContractsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch contracts";
      })

      // ===============================
      // Create Contract
      // ===============================

      .addCase(createContractThunk.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })

      .addCase(createContractThunk.fulfilled, (state, action) => {
        state.saving = false;

        const contract = action.payload;

        if (contract && (contract.contract_id || contract.id)) {
          contractsAdapter.addOne(state, contract);
        }
      })

      .addCase(createContractThunk.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to create contract";
      })

      // ===============================
      // Update Contract
      // ===============================

      .addCase(updateContractThunk.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })

      .addCase(updateContractThunk.fulfilled, (state, action) => {
        state.saving = false;

        const contract = action.payload;
        const id = contract?.contract_id ?? contract?.id;

        if (id) {
          contractsAdapter.updateOne(state, {
            id,
            changes: contract,
          });
        }
      })

      .addCase(updateContractThunk.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to update contract";
      })

      // ===============================
      // Delete Contract
      // ===============================

      .addCase(deleteContractThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteContractThunk.fulfilled, (state, action) => {
        state.loading = false;

        const { contractId } = action.payload;

        contractsAdapter.removeOne(state, contractId);

        const slabIds = state.slabIdsByContract[contractId] || [];

        slabIds.forEach((slabId) => {
            slabsAdapter.removeOne(state.slabs, slabId);
        });

        delete state.slabIdsByContract[contractId];
        })

      .addCase(deleteContractThunk.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        // Don't show red banner for vehicle conflict — UI handles it with modal
        if (payload?.type !== "VEHICLE_CONFLICT") {
            state.error = payload?.message || "Failed to delete contract";
        }
        })

      // ===============================
      // Toggle Contract Status
      // ===============================

      .addCase(toggleContractStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(toggleContractStatusThunk.fulfilled, (state, action) => {
        state.loading = false;

        const { contractId, isActive } = action.payload;

        const contract = state.entities[contractId];

        if (contract) {
          contract.is_active = isActive;
          contract.status = isActive ? "active" : "inactive";
          contract.updated_at = new Date().toISOString();
        }
      })

      .addCase(toggleContractStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to toggle contract status";
      })

      // ===============================
      // Create Slab
      // ===============================

      .addCase(createSlabThunk.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })

      .addCase(createSlabThunk.fulfilled, (state, action) => {
        state.saving = false;

        const { contractId, slab } = action.payload;

        const slabId = slab?.slab_id ?? slab?.id;

        if (slabId) {
          slabsAdapter.addOne(state.slabs, slab);

          if (!state.slabIdsByContract[contractId]) {
            state.slabIdsByContract[contractId] = [];
          }

          state.slabIdsByContract[contractId].push(slabId);
        }
      })

      .addCase(createSlabThunk.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to create slab";
      })

      // ===============================
      // Update Slab
      // ===============================

      .addCase(updateSlabThunk.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })

      .addCase(updateSlabThunk.fulfilled, (state, action) => {
        state.saving = false;

        const { slab } = action.payload;

        const slabId = slab?.slab_id ?? slab?.id;

        if (slabId) {
          slabsAdapter.updateOne(state.slabs, {
            id: slabId,
            changes: slab,
          });
        }
      })

      .addCase(updateSlabThunk.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to update slab";
      })
      // ===============================
// Delete Slab
// ===============================

.addCase(deleteSlabThunk.pending, (state) => {
  state.saving = true;
  state.saveError = null;
})

.addCase(deleteSlabThunk.fulfilled, (state, action) => {
  state.saving = false;

  const { contractId, slabId } = action.payload;

  slabsAdapter.removeOne(state.slabs, slabId);

  if (state.slabIdsByContract[contractId]) {
    state.slabIdsByContract[contractId] =
      state.slabIdsByContract[contractId].filter(
        (id) => String(id) !== String(slabId)
      );
  }
})

.addCase(deleteSlabThunk.rejected, (state, action) => {
  state.saving = false;
  state.saveError = action.payload || "Failed to delete slab";
});

      
  },
});

export const {
  clearContracts,
  clearError,
  clearSlabsByContract,
} = contractsSlice.actions;

export const {
  selectAll: selectAllContracts,
  selectById: selectContractById,
  selectIds: selectContractIds,
  selectEntities: selectContractEntities,
  selectTotal: selectTotalContracts,
} = contractsAdapter.getSelectors((state) => state.contracts);

export const {
  selectAll: selectAllSlabs,
  selectById: selectSlabById,
  selectEntities: selectSlabEntities,
} = slabsAdapter.getSelectors((state) => state.contracts.slabs);

export default contractsSlice.reducer;