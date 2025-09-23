import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_CLIENT } from "../../../Api/API_Client";

 export const fetchshiftTrunk =  createAsyncThunk(  
    "shift/fetchShiftTrunk",
    async (_, { rejectWithValue }) => {
        try {
        const response = await API_CLIENT.get("/shifts/categories");
        if (response.status === 200) {
            return response.data;
        } else {
            return rejectWithValue("Failed to fetch shift trunk data");
        }
        } catch (error) {
        return rejectWithValue(error.message);
        }
    }
    );