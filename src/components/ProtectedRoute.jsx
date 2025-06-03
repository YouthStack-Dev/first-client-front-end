
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { hasPermission } from '../utils/auth';
import { useSelector } from 'react-redux';

// const ProtectedRoute = ({ roles }) => {
//   const user = useSelector((state) => state.user);
//   const location = useLocation();
// console.log(" the user in the Protected Route ",user);

//   if (!user) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   if (roles && !hasPermission(user.role, roles)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <Outlet />; // Allows rendering of nested routes
// };

// export default ProtectedRoute;


function ProtectedRoute({ roles }) {
  const user = useSelector((state) => state.user.user);

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}

export default ProtectedRoute;