// authContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode'; // Ensure you install this library for decoding JWTs
import { axiosClient } from '../Api/API_Client';
import { LOGIN } from '../Api/Endpoints';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setAuthenticated] = useState(false);

    // Check for token in cookies on app load
    useEffect(() => {
        const token = Cookies.get('authtoken'); // Retrieve the token from cookies
        if (token) {
            try {
                const decodedToken = jwtDecode(token); // Decode the token
                setAuthenticated(true); // Set authentication to true
            } catch (error) {
                console.error('Invalid token:', error);
                Cookies.remove('authtoken'); // Clear invalid token
                setAuthenticated(false);
            }
        }
    }, []);

    // Login function
    const login = async (username, password) => {
        try {
            const response = await axiosClient.post(LOGIN, { email: username, password: password });
            if (response.status === 200) {
                const jwtToken = response.data.token;

                const expirationTime = new Date();
                expirationTime.setMinutes(expirationTime.getMinutes() + 9000); // Add 3 minutes to the current time
                
                Cookies.set('authtoken', jwtToken, {
                  expires: expirationTime,  // Passing the Date object directly
                  secure: true,
                  sameSite: 'Strict'
                });
                setUser({role:"admin"}); // Set user details from the decoded token
                
                  

                // Decode the token to extract user details
                const decodedToken = jwtDecode(jwtToken);

                // Update state
                // setUser(decodedToken);
                setAuthenticated(true);

                return true;
            }
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setAuthenticated(false);
        Cookies.remove('authtoken'); // Clear the token from cookies
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
