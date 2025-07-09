import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRouteAuth = ({ redirectPath = "/login" }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.user); // ✅ now from unified slice

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to={redirectPath} />;

  const user = useSelector((state) => state.user.user);
console.log("🧠 Redux User Object:", user);


  return <Outlet />;
};

export default ProtectedRouteAuth;
