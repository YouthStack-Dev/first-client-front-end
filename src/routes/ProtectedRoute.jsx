// ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Simulating a simple auth check function
const useAuth = () => {
    const token = localStorage.getItem('token'); // Example using localStorage
    return true
};

const ProtectedRoute = () => {
    const isAuthenticated = useAuth();

    // If authenticated, render child routes; else redirect to login
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
