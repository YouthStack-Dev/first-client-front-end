// src/middleware/ProtectedRouteLogin.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useContext } from 'react';
import { ModulePermissionContext } from '../context/ModulePermissionContext';

const ProtectedRouteLogin = () => {
  const { user } = useSelector((state) => state.user); 
  const { loading: permissionLoading } = useContext(ModulePermissionContext);

  const isAuthenticated = !!user;

  if (permissionLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default ProtectedRouteLogin;