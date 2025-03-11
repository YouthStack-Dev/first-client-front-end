// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { hasPermission } from '../utils/auth';

// const ProtectedRoute = ({ children, roles }) => {
//   const { user } = useAuth();
//   const location = useLocation();

//   if (!user) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   if (roles && !hasPermission(user.role, roles)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/auth';

const ProtectedRoute = ({ roles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasPermission(user.role, roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />; // Allows rendering of nested routes
};

export default ProtectedRoute;
