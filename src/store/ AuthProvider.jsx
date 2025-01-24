
// authContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { axiosClient } from '../Api/API_Client';
import { LOGIN } from '../Api/Endpoints';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
 
    // const login = (username, password) => {
    //     if (username === 'admin@123' && password === 'password') {
    //         setUser({ role: 'admin' });
    //          return true
    //     } else if (username === 'user' && password === 'password') {
    //         setUser({ role: 'user' });
    //         return true
    //     } else{
    //          return false
    //     }
    // };

 const login = async(username, password)=>{
    try {
      const responce= await axiosClient.post(LOGIN,{email:username, password:password})
        if (responce.status===200) {

            console.log(responce.data);
            
            
        }
    } catch (error) {
        console.log(" no responce  or nothing ");
        
    }
 } 

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
