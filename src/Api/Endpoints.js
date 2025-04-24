export  const LOGIN="login"
export const  Companys="companys"
export const CreateDriver="createDriver"
export const CreatVehicle="create-vehicle"
export const Create_ADMIN="create-admin"

const api= 'api/'
const client ="client/"
export const API ={

    //  CLIENT APIS 
    CLIENT_API:{
     GET_CLIENTS:client+"get-clients"
    },

   

    getAdmins:"fetchAdmins",
    createCategory:"createCategory",
    createCompany:"createCompany",
    getCategory:"fetchCategory",
    pendingTrips:"get-pendingTrips",
    approvedTrips:"get-approvedTrips",
    rejectedTrips:"get-rejectedTrips",
    createDriver:"createDriver",
    login:"login",
    companys:"companys",
    creatVehicle:"create-vehicle",
    create_ADMIN:"create-admin",
    editField:"editField",
    updateStatus:"updateStatus",
    updateSignature:"updateSignature",
    getCustomers:"getCustomers",
    createCustomer:"createCustomer",
    deleteCustomer:"deleteCustomer",
    deleteDriver:"delete-driver",

    //  the prifex api

    LOGIN:api+"login",
    GET_DRIVERS:api+"get-drivers",
    GET_VEHICLES:api+"get-vehicles"
    
     
}
