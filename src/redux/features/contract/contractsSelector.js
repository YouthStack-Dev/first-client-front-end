import { createSelector } from "@reduxjs/toolkit";
import {
  selectAllContracts,
  selectContractById,
  selectSlabEntities,
} from "./contractsSlice";

// --------------------------------------
// Contracts State
// --------------------------------------

export const selectContractsLoading = (state) =>
  state.contracts.loading;

export const selectContractsError = (state) =>
  state.contracts.error;

export const selectContractsSaving = (state) =>
  state.contracts.saving;

export const selectContractsSaveError = (state) =>
  state.contracts.saveError;

// --------------------------------------
// Contracts Data
// --------------------------------------

export const selectContracts = selectAllContracts;

// --------------------------------------
// Slabs State
// --------------------------------------

export const selectSlabsLoading = (state) =>
  state.contracts.slabsLoading;

export const selectSlabsError = (state) =>
  state.contracts.slabError;

export const selectSlabIdsByContract = (state) =>
  state.contracts.slabIdsByContract;

// --------------------------------------
// Slabs By Contract
// --------------------------------------

export const selectSlabsByContractId = createSelector(
  [
    selectSlabEntities,
    (_, contractId) => contractId,
    selectSlabIdsByContract,
  ],
  (slabEntities, contractId, slabIdsByContract) =>
    (slabIdsByContract[contractId] || [])
      .map((id) => slabEntities[id])
      .filter(Boolean)
);

// --------------------------------------
// Re-exports
// --------------------------------------

export { selectContractById };