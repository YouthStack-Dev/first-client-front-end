import { createSlice } from "@reduxjs/toolkit";

const driverSlice = createSlice({
    name: "drivers",
    initialState: {
        drivers: [],
        selectedDrivers: [],
        loading: false,
        error: null,
    },
    reducers:{
        setDrivers:(state,action) => {
            state.drivers = action.payload;
        },
        addSelecteedDriver:(state,action) => {
            if (!state.selectedDrivers.includes(action.payload)) {
                state.selectedDrivers.push(action.payload);
            }
        },
        removeSelectedDriver:(state,action) => {
            state.selectedDrivers = state.selectedDrivers.filter(
                (id) => id !== action.payload
            );
        },
        clearSelectedDrivers:(state) => {
            state.selectedDrivers = [];
        }
    }


})
export const {
    setDrivers,
    addSelecteedDriver,
    removeSelectedDriver,
    clearSelectedDrivers
} = driverSlice.actions;

export default driverSlice.reducer;