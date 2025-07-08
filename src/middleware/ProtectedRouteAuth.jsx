import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { createSelector } from "@reduxjs/toolkit";

const selectUser = createSelector(
  [(state) => state.auth], // ✅ was state.user
  (auth) => auth || { isAuthenticated: false, loading: false }
);

const ProtectedRouteAuth = ({ redirectPath = "/login" }) => {
  const { isAuthenticated, loading } = useSelector(selectUser);
  console.log("ProtectedRouteAuth state:", { isAuthenticated, loading });

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    console.log("Redirecting to login: isAuthenticated is false");
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRouteAuth;
