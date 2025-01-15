// DashboardRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardContent, Profile, Settings } from '../Components/Sidebar';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../Components/Dashbord';

const DashboardRoutes = () => {
    return (
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<h1> this is login page </h1>} />
        <Route path="/login" element={<h1> THis is login page </h1>} />

        {/* Protected Route with Child Component */}
        <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
        </Route>
    </Routes>
    );
};

export default DashboardRoutes;
