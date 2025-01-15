
// authContext.jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
 
    const login = (username, password) => {
        if (username === 'admin@123' && password === 'password') {
            setUser({ role: 'admin' });
             return true
        } else if (username === 'user' && password === 'password') {
            setUser({ role: 'user' });
            return true
        } else{
             return false
        }
    };

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
