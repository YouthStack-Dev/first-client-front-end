const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
    modulePermissions: [],
    loading: true,
  };
  

 const permissionSlice = createSlice({
name:"permissions",
initialState:initialState,
reducers:{
    setPermissions:(action,state)=>{
        state.modulePermissions = action.payload;
        state.loading = false;
    }
}
 })