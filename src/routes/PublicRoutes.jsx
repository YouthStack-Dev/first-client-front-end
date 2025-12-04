import { Route } from "react-router-dom";
import { PublicRoute } from "../middleware/PublicRoute";
import { Login } from "../pages/Login";

export const PublicRoutes = () => (
  <>
    <Route
      path="/"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />

    <Route
      path="/vendor"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/superadmin"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/docs"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
  </>
);
