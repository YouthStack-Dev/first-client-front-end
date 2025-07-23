const { createSlice } = require("@reduxjs/toolkit");

const  initialData={
    drivers:[],
    selectedDrivers:[],
    apiStatus:{
        
    }
}
 const driverSlice=createSlice({
    name:"driver"
 })