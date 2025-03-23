import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LocalClient } from "../../Api/API_Client";


// Async Thunk for fetching drivers
export const fetchDrivers = createAsyncThunk(
    "drivers/fetchDrivers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await LocalClient.get("getDrivers"); // API call using LocalClient
            console.log(" this is  the fetched drivers ",response.data);
            
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    list: [],
    loading: false,
    error: null,
};

const driverSlice = createSlice({
    name: "driver",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDrivers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDrivers.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchDrivers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default driverSlice.reducer;
