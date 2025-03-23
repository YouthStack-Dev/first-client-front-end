import { configureStore } from "@reduxjs/toolkit";
import driverReducer from "../redux/slices/driverSlice"; // Adjust the path if needed

const store = configureStore({
    reducer: {
        driver: driverReducer, // Register driver slice reducer
    },
});

export default store;
