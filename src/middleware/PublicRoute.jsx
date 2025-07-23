import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');

  // If logged in, redirect to dashboard
  return token ? <Navigate to="/dashboard" /> : children;
};

export default PublicRoute;
